import "server-only";
import mongoose, { type ClientSession, type HydratedDocument } from "mongoose";
import { ApiError, assertId } from "../lib/api";
import type { HouseholdCreate, HouseholdPatch, HouseholdQuery } from "../lib/household-validation";
import { EventModel } from "../models/event";
import { EventInvitationModel } from "../models/event-invitation";
import { HouseholdModel, type HouseholdRecord } from "../models/household";
import type { HouseholdDTO } from "../types/household";
import { accessWedding } from "./weddings";

export async function initHouseholds() { await Promise.all([HouseholdModel.init(), EventInvitationModel.init()]); }
export function householdDTO(record: HydratedDocument<HouseholdRecord>, ids: string[]): HouseholdDTO {
  return { id: String(record._id), householdName: record.householdName,
    primaryContact: { ...(record.primaryContact?.name ? { name: record.primaryContact.name } : {}), ...(record.primaryContact?.email ? { email: record.primaryContact.email } : {}), ...(record.primaryContact?.phone ? { phone: record.primaryContact.phone } : {}) },
    adultsInvited: record.adultsInvited, childrenInvited: record.childrenInvited,
    members: record.members.map(({ name }) => ({ name })), notes: record.notes ?? null, invitedEventIds: ids };
}
export async function scopedHousehold(weddingId: string, householdId: string, session?: ClientSession) {
  assertId(householdId);
  const household = await HouseholdModel.findOne({ _id: householdId, weddingId }).session(session ?? null);
  if (!household) throw new ApiError(404, "NOT_FOUND", "Household not found.");
  return household;
}
export async function validateEvents(weddingId: string, eventIds: string[], session: ClientSession) {
  if (!eventIds.length) return;
  const found = await EventModel.countDocuments({ _id: { $in: eventIds }, weddingId }).session(session);
  if (found !== eventIds.length) throw new ApiError(422, "INVALID_EVENT_ASSIGNMENT", "Every selected event must belong to this wedding.");
  // Serialize assignment against dependency-aware Event deletion, using only
  // Mongoose's existing internal version field, not a new locking collection.
  await EventModel.updateMany({ _id: { $in: eventIds }, weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false });
}
export async function setAssignments(weddingId: string, householdId: string, ids: string[], session: ClientSession, replace = true) {
  await validateEvents(weddingId, ids, session);
  if (replace) await EventInvitationModel.updateMany({ weddingId, householdId, eventId: { $nin: ids }, status: "ACTIVE" }, { status: "REVOKED" }, { session });
  for (const eventId of ids) {
    await EventInvitationModel.updateOne({ weddingId, householdId, eventId }, { $set: { status: "ACTIVE" } }, { upsert: true, session, runValidators: true });
  }
}
export async function getHousehold(weddingId: string, householdId: string) {
  await accessWedding(weddingId, true);
  const household = await scopedHousehold(weddingId, householdId);
  const invites = await EventInvitationModel.find({ weddingId, householdId, status: "ACTIVE" }).select("eventId");
  return householdDTO(household, invites.map((item) => String(item.eventId)));
}
async function householdFilter(weddingId: string, query: Partial<HouseholdQuery>) {
  if (query.rsvpResponse && query.rsvpResponse !== "AWAITING") throw new ApiError(422, "RSVP_NOT_CONNECTED", "RSVP response filtering is not connected yet.");
  let ids: mongoose.Types.ObjectId[] | undefined;
  if (query.eventId) {
    if (!await EventModel.exists({ _id: query.eventId, weddingId })) throw new ApiError(404, "NOT_FOUND", "Event not found.");
    ids = await EventInvitationModel.distinct("householdId", { weddingId, eventId: query.eventId, status: "ACTIVE" });
  }
  const literal = query.q?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { weddingId, ...(ids ? { _id: { $in: ids } } : {}), ...(literal ? { $or: ["householdName", "primaryContact.name", "primaryContact.email", "primaryContact.phone"].map((field) => ({ [field]: { $regex: literal, $options: "i" } })) } : {}) };
}
async function addAssignments(weddingId: string, records: HydratedDocument<HouseholdRecord>[]) {
  const invites = await EventInvitationModel.find({ weddingId, householdId: { $in: records.map((row) => row._id) }, status: "ACTIVE" }).select("eventId householdId");
  return records.map((row) => householdDTO(row, invites.filter((invitation) => String(invitation.householdId) === String(row._id)).map((invitation) => String(invitation.eventId))));
}
export async function listHouseholds(weddingId: string, query: HouseholdQuery) {
  await accessWedding(weddingId, true);
  const filter = await householdFilter(weddingId, query);
  const [records, total] = await Promise.all([
    HouseholdModel.find(filter).sort({ householdName: 1, _id: 1 }).skip((query.page - 1) * query.limit).limit(query.limit), HouseholdModel.countDocuments(filter),
  ]);
  return { data: await addAssignments(weddingId, records), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
export async function getWeddingHouseholds(weddingId: string, query: Partial<HouseholdQuery> = {}) {
  await accessWedding(weddingId, true);
  const records = await HouseholdModel.find(await householdFilter(weddingId, query)).sort({ householdName: 1, _id: 1 });
  return addAssignments(weddingId, records);
}
// Used inside both the ordinary save transaction and the import transaction.
export async function insertHousehold(weddingId: string, input: HouseholdCreate, session: ClientSession) {
  const { eventIds = [], ...fields } = input;
  const [household] = await HouseholdModel.create([{ ...fields, weddingId }], { session });
  await setAssignments(weddingId, String(household._id), eventIds, session);
  return householdDTO(household, eventIds);
}
export async function createHousehold(weddingId: string, input: HouseholdCreate) {
  await accessWedding(weddingId, true); await initHouseholds();
  return mongoose.connection.transaction((session) => insertHousehold(weddingId, input, session));
}
export async function updateHousehold(weddingId: string, householdId: string, input: HouseholdPatch) {
  await accessWedding(weddingId, true); await initHouseholds();
  await mongoose.connection.transaction(async (session) => {
    const household = await scopedHousehold(weddingId, householdId, session);
    const { eventIds, ...fields } = input;
    household.set({ ...fields, ...(fields.primaryContact ? { primaryContact: { name: household.primaryContact?.name, email: household.primaryContact?.email, phone: household.primaryContact?.phone, ...fields.primaryContact } } : {}) });
    household.increment();
    await household.save({ session });
    if (eventIds !== undefined) await setAssignments(weddingId, householdId, eventIds, session);
  });
  return getHousehold(weddingId, householdId);
}
export async function listInvitations(weddingId: string, householdId: string) {
  await accessWedding(weddingId, true); await scopedHousehold(weddingId, householdId);
  return (await EventInvitationModel.find({ weddingId, householdId })).map((item) => ({ id: String(item._id), weddingId, householdId, eventId: String(item.eventId), status: item.status, invitationSentAt: item.invitationSentAt?.toISOString() ?? null }));
}
export async function assignInvitations(weddingId: string, householdId: string, ids: string[]) {
  await accessWedding(weddingId, true); await initHouseholds();
  return mongoose.connection.transaction(async (session) => {
    const household = await scopedHousehold(weddingId, householdId, session);
    household.increment(); await household.save({ session });
    const existing = await EventInvitationModel.countDocuments({ weddingId, householdId, eventId: { $in: ids }, status: "ACTIVE" }).session(session);
    await setAssignments(weddingId, householdId, ids, session, false);
    return { created: ids.length - existing };
  });
}
export async function revokeInvitation(weddingId: string, householdId: string, eventId: string) {
  await accessWedding(weddingId, true); assertId(eventId);
  await mongoose.connection.transaction(async (session) => {
    const household = await scopedHousehold(weddingId, householdId, session);
    household.increment(); await household.save({ session });
    const result = await EventInvitationModel.updateOne({ weddingId, householdId, eventId }, { status: "REVOKED" }, { session });
    if (!result.matchedCount) throw new ApiError(404, "NOT_FOUND", "Invitation not found.");
  });
}
export async function deleteHousehold(weddingId: string, householdId: string) {
  await accessWedding(weddingId, true);
  await mongoose.connection.transaction(async (session) => {
    const household = await scopedHousehold(weddingId, householdId, session);
    const filter = { weddingId: household.weddingId, householdId: household._id };
    // No deletedAt/archive field exists in the approved schema. Preserve
    // referenced/history-bearing records instead of inventing lifecycle fields.
    for (const name of ["rsvps", "photos", "audit_logs"]) {
      const match = name === "audit_logs" ? { weddingId: household.weddingId, $or: [{ entityId: household._id }, { entityId: householdId }, { householdId: household._id }] } : filter;
      if (await mongoose.connection.db!.collection(name).findOne(match, { session, projection: { _id: 1 } })) throw new ApiError(409, "HOUSEHOLD_HAS_DEPENDENCIES", "This household has history or related records and cannot be deleted yet.");
    }
    if (await HouseholdModel.exists({ _id: household._id, weddingId, guestAccess: { $exists: true } }).session(session)
      || await EventInvitationModel.exists({ ...filter, invitationSentAt: { $ne: null } }).session(session)) throw new ApiError(409, "HOUSEHOLD_HAS_DEPENDENCIES", "This household has guest-access or invitation history and cannot be deleted yet.");
    await EventInvitationModel.deleteMany(filter, { session });
    await HouseholdModel.deleteOne({ _id: household._id, weddingId }, { session });
  });
}
