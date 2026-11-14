import "server-only";
import mongoose from "mongoose";
import { ApiError } from "../lib/api";
import { bearerHash, guestBearer, guestSessionSeconds, newBearer } from "../lib/guest-security";
import { bearerPattern } from "../lib/guest-validation";
import { connectToDatabase } from "../lib/db";
import { HouseholdModel } from "../models/household";
import { WeddingModel, type Wedding } from "../models/wedding";
import { GuestSessionModel } from "../models/guest-session";
import { AuditLogModel } from "../models/audit-log";
import { EventInvitationModel } from "../models/event-invitation";
import { accessWedding } from "./weddings";
import { scopedHousehold } from "./households";

export function weddingAvailable(wedding: Pick<Wedding, "status" | "retentionEndsAt">) {
  return wedding.status !== "ARCHIVED" && (!wedding.retentionEndsAt || wedding.retentionEndsAt > new Date());
}
function invalidSession() { return new ApiError(401, "INVALID_SESSION", "Open your private invitation to continue."); }
export async function requireGuestSession(request?: Request) {
  const bearer = await guestBearer(request);
  if (!bearer || !bearerPattern.test(bearer)) throw invalidSession();
  await connectToDatabase();
  const session = await GuestSessionModel.findOne({ tokenHash: bearerHash(bearer), revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) throw invalidSession();
  const household = await HouseholdModel.findOne({ _id: session.householdId, weddingId: session.weddingId, "guestAccess.status": "ACTIVE" });
  const wedding = await WeddingModel.findOne({ _id: session.weddingId });
  if (!household || !wedding || !weddingAvailable(wedding)) throw invalidSession();
  return { session, household, wedding };
}
export async function createGuestSession(token: string) {
  await connectToDatabase();
  await GuestSessionModel.init();
  const tokenHash = bearerHash(token);
  const bearer = newBearer(); const expiresAt = new Date(Date.now() + guestSessionSeconds * 1000);
  await mongoose.connection.transaction(async (session) => {
    // The Household write serializes session creation with token replacement.
    const household = await HouseholdModel.findOneAndUpdate({ "guestAccess.tokenHash": tokenHash, "guestAccess.status": "ACTIVE" }, { $set: { "guestAccess.lastUsedAt": new Date() } }, { session, returnDocument: "after" });
    if (!household) throw new ApiError(401, "INVALID_INVITATION", "This invitation is invalid or no longer available.");
    const wedding = await WeddingModel.findOne({ _id: household.weddingId }).session(session);
    if (!wedding || !weddingAvailable(wedding)) throw new ApiError(403, "WEDDING_NOT_AVAILABLE", "This wedding invitation is no longer available.");
    await GuestSessionModel.create([{ weddingId: wedding._id, householdId: household._id, tokenHash: bearerHash(bearer), expiresAt }], { session });
  });
  return { bearer, expiresAt };
}
export function applicationOrigin() {
  const value = process.env.APP_BASE_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
  if (!value) throw new ApiError(500, "CONFIGURATION_ERROR", "The application URL is not configured.");
  const url = new URL(value);
  if ((process.env.NODE_ENV === "production" && url.protocol !== "https:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new ApiError(500, "CONFIGURATION_ERROR", "The application URL is not configured correctly.");
  return url.origin;
}
export async function regenerateGuestLink(weddingId: string, householdId: string, input: { sendEmail: boolean; showLink: boolean }) {
  const { wedding, membership } = await accessWedding(weddingId, true);
  const household = await scopedHousehold(weddingId, householdId);
  if (!weddingAvailable(wedding)) throw new ApiError(409, "WEDDING_NOT_AVAILABLE", "This wedding is not accepting guest access.");
  if (!input.sendEmail && !input.showLink) throw new ApiError(422, "VALIDATION_ERROR", "Choose email delivery or a development link.");
  if (input.showLink && process.env.NODE_ENV === "production") throw new ApiError(403, "FORBIDDEN", "Private links are delivered by email.");
  if (input.sendEmail && (!household.primaryContact?.email || !process.env.AUTH_RESEND_KEY || !process.env.AUTH_EMAIL_FROM)) throw new ApiError(422, "EMAIL_NOT_CONFIGURED", "Add a household email and configure invitation sending first.");
  const raw = newBearer(), hash = bearerHash(raw), link = `${applicationOrigin()}/invite/${raw}`;
  await Promise.all([GuestSessionModel.init(), AuditLogModel.init()]);
  await mongoose.connection.transaction(async (session) => {
    const changed = await HouseholdModel.updateOne({ _id: householdId, weddingId }, { $set: { guestAccess: { tokenHash: hash, status: "ACTIVE", createdAt: new Date() } } }, { session, runValidators: true });
    if (!changed.matchedCount) throw new ApiError(404, "NOT_FOUND", "Household not found.");
    await GuestSessionModel.updateMany({ weddingId, householdId, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session });
    await AuditLogModel.create([{ weddingId, householdId, actorType: "USER", actorMembershipId: membership._id, action: "GUEST_LINK_REGENERATED", entityType: "Household", entityId: householdId }], { session });
  });
  if (input.sendEmail) {
    let delivered = false;
    try {
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.AUTH_EMAIL_FROM, to: [household.primaryContact!.email], subject: `${wedding.title} — your private invitation`, text: `${wedding.groomName} & ${wedding.brideName} invite your household to their celebration.\n\nOpen your private invitation:\n${link}\n\nPlease keep this link private. It opens only your household's invited Events.` }), signal: AbortSignal.timeout(15_000) });
      delivered = response.ok;
    } catch { /* Never log provider errors, payloads or bearer URLs. */ }
    if (!delivered) {
      await mongoose.connection.transaction(async (session) => {
        const changed = await HouseholdModel.updateOne({ _id: householdId, weddingId, "guestAccess.tokenHash": hash }, { $set: { "guestAccess.status": "REVOKED" } }, { session });
        if (changed.matchedCount) await GuestSessionModel.updateMany({ weddingId, householdId, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session });
      });
      throw new ApiError(502, "INVITATION_DELIVERY_FAILED", "Delivery could not be confirmed. The new link was revoked; send a new invitation. The development sender can email only the Resend account owner.");
    }
    await EventInvitationModel.updateMany({ weddingId, householdId, status: "ACTIVE" }, { invitationSentAt: new Date() });
  }
  return { status: "ACTIVE", emailSent: input.sendEmail, ...(input.showLink ? { guestUrl: link } : {}) };
}
export async function revokeGuestLink(weddingId: string, householdId: string) {
  const { membership } = await accessWedding(weddingId, true);
  await scopedHousehold(weddingId, householdId);
  await Promise.all([GuestSessionModel.init(), AuditLogModel.init()]);
  await mongoose.connection.transaction(async (session) => {
    await HouseholdModel.updateOne({ _id: householdId, weddingId, "guestAccess.tokenHash": { $exists: true } }, { $set: { "guestAccess.status": "REVOKED" } }, { session });
    await GuestSessionModel.updateMany({ weddingId, householdId, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session });
    await AuditLogModel.create([{ weddingId, householdId, actorType: "USER", actorMembershipId: membership._id, action: "GUEST_LINK_REVOKED", entityType: "Household", entityId: householdId }], { session });
  });
  return { revoked: true };
}
