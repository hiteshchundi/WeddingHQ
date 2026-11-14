import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { vendorStatuses } from "../types/finance";
const money = { type: Number, min: 0, max: Number.MAX_SAFE_INTEGER, validate: { validator: (value: number | null) => value == null || Number.isSafeInteger(value), message: "Use integer minor units." } };
const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  name: { type: String, required: true, trim: true, maxlength: 200 }, category: { type: String, required: true, trim: true, maxlength: 100 },
  contact: { type: new Schema({ person: { type: String, maxlength: 200 }, phone: { type: String, maxlength: 50 }, email: { type: String, maxlength: 254 } }, { _id: false, strict: "throw" }), default: {} },
  eventIds: { type: [{ type: Schema.Types.ObjectId, ref: "Event" }], default: [] },
  estimatedCostMinor: money, actualCostMinor: money, currency: { type: String, required: true, uppercase: true },
  responsibleMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership" },
  status: { type: String, enum: vendorStatuses, required: true, default: "PROSPECT" }, notes: { type: String, maxlength: 5000 },
}, { collection: "vendors", timestamps: true, strict: "throw", bufferCommands: false });
schema.index({ weddingId: 1 }); schema.index({ weddingId: 1, category: 1 });
export type VendorRecord = InferSchemaType<typeof schema>;
export const VendorModel: Model<VendorRecord> = (mongoose.models.Vendor as Model<VendorRecord> | undefined) ?? mongoose.model("Vendor", schema);
