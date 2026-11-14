import "server-only";
import mongoose from "mongoose";
import { ApiError, assertId } from "../lib/api";
import { AuthorizationError, requireAuthenticatedUser, requireWeddingMembership, requireWeddingRole } from "../lib/authorization";
import { connectToDatabase } from "../lib/db";
import { OrganizationModel } from "../models/organization";
import { WeddingModel, type Wedding } from "../models/wedding";
import { WeddingMembershipModel } from "../models/wedding-membership";
import { weddingStatuses, type WeddingDTO } from "../types/wedding";
import type { ListQuery, WeddingCreate, WeddingPatch } from "../lib/validation";

export const organiserRoles = ["OWNER", "PLANNER", "ADMIN"] as const;
function weddingDTO(record: Wedding & { _id: mongoose.Types.ObjectId }): WeddingDTO {
  return {
    id: String(record._id), organizationId: String(record.organizationId),
    title: record.title, brideName: record.brideName, groomName: record.groomName,
    description: record.description ?? null, timezone: record.timezone, currency: record.currency,
    startDate: record.startDate.toISOString(), endDate: record.endDate.toISOString(), status: record.status,
    rsvpDefaultDeadline: record.rsvpDefaultDeadline?.toISOString() ?? null,
    retentionEndsAt: record.retentionEndsAt?.toISOString() ?? null,
    helpContacts: record.helpContacts.map(({ name, label, phone, email }) => ({ name, ...(label ? { label } : {}), ...(phone ? { phone } : {}), ...(email ? { email } : {}) })),
    createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(),
  };
}
export async function accessWedding(weddingId: string, manage = false) {
  await requireAuthenticatedUser();
  assertId(weddingId);
  let membership;
  try { membership = await requireWeddingMembership(weddingId); }
  catch (error) {
    // An absent membership must not reveal whether another tenant exists.
    if (error instanceof AuthorizationError && error.status === 403) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
    throw error;
  }
  if (manage) await requireWeddingRole(weddingId, organiserRoles);
  const wedding = await WeddingModel.findOne({ _id: weddingId });
  if (!wedding) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
  return { wedding, membership };
}
export async function getWedding(weddingId: string) {
  const { wedding } = await accessWedding(weddingId);
  return weddingDTO(wedding);
}
export async function listWeddings(query: ListQuery & { status?: WeddingDTO["status"] }) {
  const user = await requireAuthenticatedUser();
  await connectToDatabase();
  const ids = await WeddingMembershipModel.distinct("weddingId", { userId: user.id, status: "ACTIVE" });
  const filter = { _id: { $in: ids }, ...(query.status ? { status: query.status } : {}) };
  const [rows, total] = await Promise.all([
    WeddingModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip((query.page - 1) * query.limit).limit(query.limit),
    WeddingModel.countDocuments(filter),
  ]);
  return { data: rows.map(weddingDTO), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
export async function createWedding(input: WeddingCreate) {
  const user = await requireAuthenticatedUser();
  if (!user.email) throw new AuthorizationError(401);
  const ownerEmail = user.email;
  await connectToDatabase();
  // Index/collection initialisation happens before, never inside, the transaction.
  await Promise.all([OrganizationModel.init(), WeddingModel.init(), WeddingMembershipModel.init()]);
  return mongoose.connection.transaction(async (session) => {
    const [organization] = await OrganizationModel.create([{ name: input.title, type: "PERSONAL", createdBy: user.id }], { session });
    const [wedding] = await WeddingModel.create([{ ...input, organizationId: organization._id, createdBy: user.id, status: "DRAFT" }], { session });
    await WeddingMembershipModel.create([{
      weddingId: wedding._id, userId: user.id, email: ownerEmail, role: "OWNER", status: "ACTIVE", acceptedAt: new Date(),
    }], { session });
    return weddingDTO(wedding);
  });
}
export async function updateWedding(weddingId: string, input: WeddingPatch) {
  const { wedding } = await accessWedding(weddingId, true);
  if (input.status && input.status !== wedding.status && weddingStatuses.indexOf(input.status) !== weddingStatuses.indexOf(wedding.status) + 1) {
    throw new ApiError(422, "INVALID_STATUS_TRANSITION", "Wedding status must move to the next lifecycle stage.");
  }
  if (input.currency && input.currency !== wedding.currency) {
    // Finance writes touch this same Wedding, preventing a currency-change race.
    return mongoose.connection.transaction(async (session) => {
      const locked = await WeddingModel.findOneAndUpdate({ _id: weddingId }, { $inc: { __v: 1 } }, { session, returnDocument: "after", timestamps: false });
      if (!locked) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
      for (const name of ["vendors", "expenses"]) if (await mongoose.connection.db!.collection(name).findOne({ weddingId: locked._id }, { session, projection: { _id: 1 } })) throw new ApiError(409, "CURRENCY_HAS_FINANCIAL_RECORDS", "Currency cannot change while Vendor or Expense records exist.");
      locked.set(input); await locked.save({ session }); return weddingDTO(locked);
    });
  }
  // Save a complete scoped document so cross-field Mongoose date validation runs.
  wedding.set(input);
  await wedding.save();
  return weddingDTO(wedding);
}
