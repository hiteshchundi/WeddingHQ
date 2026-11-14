import "server-only";
import mongoose, { type ClientSession } from "mongoose";
import { ApiError, assertId } from "../lib/api";
import type { RsvpInput } from "../lib/guest-validation";
import { EventModel } from "../models/event";
import { EventInvitationModel } from "../models/event-invitation";
import { HouseholdModel } from "../models/household";
import { GuestSessionModel } from "../models/guest-session";
import { RsvpModel } from "../models/rsvp";
import { AuditLogModel } from "../models/audit-log";
import { requireGuestSession } from "./guest-access";
import { accessWedding } from "./weddings";
import { rsvpDTO, adminRsvpDTO } from "../lib/rsvp-view";
import type { z } from "zod";
import type { rsvpQuerySchema } from "../lib/guest-validation";

export async function invitedEvent(weddingId: string, householdId: string, eventId: string, session?: ClientSession, lock = false) {
  assertId(eventId);
  const filter = { weddingId, householdId, eventId, status: "ACTIVE" as const };
  const invitation = lock ? await EventInvitationModel.findOneAndUpdate(filter, { $inc: { __v: 1 } }, { session, timestamps: false }) : await EventInvitationModel.findOne(filter).session(session ?? null);
  if (!invitation) throw new ApiError(404, "NOT_FOUND", "Event not found.");
  const event = lock ? await EventModel.findOneAndUpdate({ _id: eventId, weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false, returnDocument: "after" }) : await EventModel.findOne({ _id: eventId, weddingId }).session(session ?? null);
  if (!event) throw new ApiError(404, "NOT_FOUND", "Event not found.");
  return event;
}
export async function getGuestRsvp(eventId: string, request?: Request) {
  const { household, wedding } = await requireGuestSession(request);
  await invitedEvent(String(wedding._id), String(household._id), eventId);
  const record = await RsvpModel.findOne({ weddingId: wedding._id, householdId: household._id, eventId });
  return record ? rsvpDTO(record) : null;
}
async function persistRsvp(weddingId: string, householdId: string, eventId: string, input: RsvpInput, actor: { membershipId?: string; guestSessionId?: string }) {
  await Promise.all([RsvpModel.init(), AuditLogModel.init()]);
  // Attendance + required audit entry are one operation. Scoped reference
  // writes serialize this transaction with deadline/count/access changes.
  return mongoose.connection.transaction(async (session) => {
    const household = await HouseholdModel.findOneAndUpdate({ _id: householdId, weddingId, ...(actor.guestSessionId ? { "guestAccess.status": "ACTIVE" } : {}) }, { $inc: { __v: 1 } }, { session, timestamps: false, returnDocument: "after" });
    if (!household) throw new ApiError(404, "NOT_FOUND", "Household not found.");
    if (actor.guestSessionId) {
      const valid = await GuestSessionModel.updateOne({ _id: actor.guestSessionId, weddingId, householdId, revokedAt: null, expiresAt: { $gt: new Date() } }, { $inc: { __v: 1 } }, { session, timestamps: false });
      if (!valid.matchedCount) throw new ApiError(401, "INVALID_SESSION", "Open your private invitation to continue.");
    }
    const event = await invitedEvent(weddingId, householdId, eventId, session, true);
    const { WeddingModel } = await import("../models/wedding");
    const wedding = await WeddingModel.findOne({ _id: weddingId }).session(session);
    if (!wedding) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
    const deadline = event.rsvpDeadline ?? wedding.rsvpDefaultDeadline;
    if (deadline && deadline.getTime() <= Date.now()) throw new ApiError(422, "RSVP_DEADLINE_PASSED", "The RSVP deadline for this event has passed.");
    if (input.adultsAttending > household.adultsInvited || input.childrenAttending > household.childrenInvited) throw new ApiError(422, "ATTENDANCE_EXCEEDS_INVITATION", "Attendance cannot exceed this household’s invitation.");
    const source = actor.membershipId ? "ADMIN" : "GUEST";
    const result = await RsvpModel.findOneAndUpdate({ weddingId, householdId, eventId }, {
      $set: { response: input.response, adultsAttending: input.response === "YES" ? input.adultsAttending : 0, childrenAttending: input.response === "YES" ? input.childrenAttending : 0, source, submittedAt: new Date(), ...(actor.membershipId ? { recordedByMembershipId: actor.membershipId } : {}) },
      ...(!actor.membershipId ? { $unset: { recordedByMembershipId: "" } } : {}),
    }, { upsert: true, returnDocument: "after", includeResultMetadata: true, runValidators: true, session });
    const record = result.value!;
    await AuditLogModel.create([{ weddingId, householdId, actorType: source === "ADMIN" ? "USER" : "GUEST", ...(actor.membershipId ? { actorMembershipId: actor.membershipId } : {}),
      action: source === "ADMIN" ? "RSVP_RECORDED_BY_ADMIN" : result.lastErrorObject?.updatedExisting ? "RSVP_UPDATED" : "RSVP_CREATED", entityType: "RSVP", entityId: record._id,
      metadata: { response: record.response, adultsAttending: record.adultsAttending, childrenAttending: record.childrenAttending, source } }], { session });
    return actor.membershipId ? adminRsvpDTO(record) : rsvpDTO(record);
  });
}
export async function updateGuestRsvp(eventId: string, input: RsvpInput, request: Request) {
  const { session, household, wedding } = await requireGuestSession(request);
  return persistRsvp(String(wedding._id), String(household._id), eventId, input, { guestSessionId: String(session._id) });
}
export async function updateAdminRsvp(weddingId: string, householdId: string, eventId: string, input: RsvpInput) {
  const { membership } = await accessWedding(weddingId, true); assertId(householdId);
  return persistRsvp(weddingId, householdId, eventId, input, { membershipId: String(membership._id) });
}
export async function updateRsvpNote(weddingId: string, householdId: string, eventId: string, internalNote: string) {
  const { membership } = await accessWedding(weddingId, true); assertId(householdId);
  await invitedEvent(weddingId, householdId, eventId); await AuditLogModel.init();
  return mongoose.connection.transaction(async (session) => {
    const record = await RsvpModel.findOneAndUpdate({ weddingId, householdId, eventId }, { $set: { internalNote } }, { session, runValidators: true, returnDocument: "after" });
    if (!record) throw new ApiError(404, "NOT_FOUND", "No RSVP has been submitted for this event yet.");
    await AuditLogModel.create([{ weddingId, householdId, actorType: "USER", actorMembershipId: membership._id, action: "RSVP_NOTE_UPDATED", entityType: "RSVP", entityId: record._id }], { session });
    return adminRsvpDTO(record);
  });
}
export async function listRsvps(weddingId: string, query: z.infer<typeof rsvpQuerySchema>) {
  await accessWedding(weddingId, true);
  if (query.eventId && !await EventModel.exists({ _id: query.eventId, weddingId })) throw new ApiError(404, "NOT_FOUND", "Event not found.");
  const filter = { weddingId, ...(query.eventId ? { eventId: query.eventId } : {}), ...(query.householdId ? { householdId: query.householdId } : {}), ...(query.response ? { response: query.response } : {}) };
  const invitations = await EventInvitationModel.find({ weddingId, status: "ACTIVE", ...(query.eventId ? { eventId: query.eventId } : {}), ...(query.householdId ? { householdId: query.householdId } : {}) });
  const scopedFilter = { ...filter, ...(invitations.length ? { $or: invitations.map((invitation) => ({ eventId: invitation.eventId, householdId: invitation.householdId })) } : { _id: { $in: [] } }) };
  const [rows, total] = await Promise.all([RsvpModel.find(scopedFilter).sort({ updatedAt: -1, _id: 1 }).skip((query.page - 1) * query.limit).limit(query.limit), RsvpModel.countDocuments(scopedFilter)]);
  return { data: rows.map(adminRsvpDTO), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
export async function eventRsvpSummary(weddingId: string, eventId: string) {
  await accessWedding(weddingId, true); assertId(eventId);
  if (!await EventModel.exists({ _id: eventId, weddingId })) throw new ApiError(404, "NOT_FOUND", "Event not found.");
  const households = await EventInvitationModel.distinct("householdId", { weddingId, eventId, status: "ACTIVE" });
  const replies = await RsvpModel.find({ weddingId, eventId, householdId: { $in: households } }).select("response");
  return { YES: replies.filter((reply) => reply.response === "YES").length, NO: replies.filter((reply) => reply.response === "NO").length, MAYBE: replies.filter((reply) => reply.response === "MAYBE").length, AWAITING: households.length - replies.length };
}
