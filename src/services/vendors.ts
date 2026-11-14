import "server-only";
import mongoose from "mongoose";
import { ApiError, assertId } from "../lib/api";
import type { VendorInput, VendorPatch, VendorQuery } from "../lib/finance-validation";
import { VendorModel, type VendorRecord } from "../models/vendor";
import { EventModel } from "../models/event";
import { WeddingMembershipModel } from "../models/wedding-membership";
import { WeddingModel } from "../models/wedding";
import { AuditLogModel } from "../models/audit-log";
import { accessWedding } from "./weddings";
import type { VendorDTO } from "../types/finance";
function vendorDTO(row: VendorRecord & { _id: mongoose.Types.ObjectId }): VendorDTO {
  return { id: String(row._id), name: row.name, category: row.category, contact: { person: row.contact?.person ?? null, phone: row.contact?.phone ?? null, email: row.contact?.email ?? null },
    eventIds: row.eventIds.map(String), estimatedCostMinor: row.estimatedCostMinor ?? null, actualCostMinor: row.actualCostMinor ?? null, currency: row.currency,
    responsibleMembershipId: row.responsibleMembershipId ? String(row.responsibleMembershipId) : null, status: row.status, notes: row.notes ?? null };
}
export async function listVendors(weddingId: string, query: VendorQuery, all = false) {
  await accessWedding(weddingId, true);
  const literal = query.q?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = { weddingId, ...(query.category ? { category: query.category } : {}), ...(query.status ? { status: query.status } : {}), ...(query.eventId ? { eventIds: query.eventId } : {}),
    ...(literal ? { $or: ["name", "category", "contact.person", "contact.email", "contact.phone"].map((key) => ({ [key]: { $regex: literal, $options: "i" } })) } : {}) };
  const cursor = VendorModel.find(filter).sort({ name: 1, _id: 1 });
  const [rows, total] = await Promise.all([all ? cursor : cursor.skip((query.page - 1) * query.limit).limit(query.limit), VendorModel.countDocuments(filter)]);
  return { data: rows.map(vendorDTO), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
export async function getWeddingVendors(weddingId: string) { return (await listVendors(weddingId, { page: 1, limit: 100 }, true)).data; }
export async function getVendor(weddingId: string, vendorId: string) {
  await accessWedding(weddingId, true); assertId(vendorId);
  const row = await VendorModel.findOne({ _id: vendorId, weddingId });
  if (!row) throw new ApiError(404, "VENDOR_NOT_FOUND", "Vendor not found.");
  return vendorDTO(row);
}
export async function saveVendor(weddingId: string, vendorId: string | null, input: VendorInput | VendorPatch) {
  const { membership } = await accessWedding(weddingId, true); if (vendorId) assertId(vendorId);
  await Promise.all([VendorModel.init(), AuditLogModel.init()]);
  // Reference writes coordinate Event deletion, currency changes and required audit.
  return mongoose.connection.transaction(async (session) => {
    const wedding = await WeddingModel.findOneAndUpdate({ _id: weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false, returnDocument: "after" });
    if (!wedding) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
    if (input.currency && input.currency !== wedding.currency) throw new ApiError(422, "CURRENCY_MISMATCH", "Use the wedding currency.");
    const row = vendorId ? await VendorModel.findOne({ _id: vendorId, weddingId }).session(session) : new VendorModel({ weddingId });
    if (!row) throw new ApiError(404, "VENDOR_NOT_FOUND", "Vendor not found.");
    if (input.responsibleMembershipId && !await WeddingMembershipModel.exists({ _id: input.responsibleMembershipId, weddingId, status: "ACTIVE" }).session(session)) throw new ApiError(422, "INVALID_MEMBER", "Choose an active member of this wedding.");
    const eventIds = [...new Set(input.eventIds ?? row.eventIds.map(String))];
    for (const eventId of eventIds) if (!await EventModel.findOneAndUpdate({ _id: eventId, weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false })) throw new ApiError(422, "INVALID_EVENT", "Choose Events from this wedding.");
    row.set({ ...input, contact: { person: row.contact?.person ?? null, phone: row.contact?.phone ?? null, email: row.contact?.email ?? null, ...input.contact }, eventIds, currency: wedding.currency });
    await row.save({ session });
    await AuditLogModel.create([{ weddingId, actorType: "USER", actorMembershipId: membership._id, action: vendorId ? "VENDOR_UPDATED" : "VENDOR_CREATED", entityType: "VENDOR", entityId: row._id }], { session });
    return vendorDTO(row);
  });
}
export async function deleteVendor(weddingId: string, vendorId: string) {
  await accessWedding(weddingId, true); assertId(vendorId);
  // Approved H7 policy: prevent deletion while referenced; never cascade Expenses.
  await mongoose.connection.transaction(async (session) => {
    const row = await VendorModel.findOne({ _id: vendorId, weddingId }).session(session);
    if (!row) throw new ApiError(404, "VENDOR_NOT_FOUND", "Vendor not found.");
    if (await mongoose.connection.db!.collection("expenses").findOne({ weddingId: row.weddingId, vendorId: row._id }, { session, projection: { _id: 1 } })) throw new ApiError(409, "VENDOR_HAS_EXPENSES", "This Vendor has linked Expenses. Remove the links before deleting it.");
    await VendorModel.deleteOne({ _id: row._id, weddingId: row.weddingId }, { session });
  });
}
