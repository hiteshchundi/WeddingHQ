import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const money = { type: Number, min: 0, max: Number.MAX_SAFE_INTEGER, validate: { validator: (value: number | null) => value == null || Number.isSafeInteger(value), message: "Use integer minor units." } };
const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" }, vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
  name: { type: String, required: true, trim: true, maxlength: 200 }, category: { type: String, required: true, trim: true, maxlength: 100 },
  estimatedAmountMinor: money, actualAmountMinor: money, currency: { type: String, required: true, uppercase: true },
  notes: { type: String, maxlength: 5000 }, createdByMembershipId: { type: Schema.Types.ObjectId, required: true, ref: "WeddingMembership" },
}, { collection: "expenses", timestamps: true, strict: "throw", bufferCommands: false });
schema.index({ weddingId: 1 }); schema.index({ weddingId: 1, eventId: 1 }); schema.index({ weddingId: 1, vendorId: 1 });
export type ExpenseRecord = InferSchemaType<typeof schema>;
export const ExpenseModel: Model<ExpenseRecord> = (mongoose.models.Expense as Model<ExpenseRecord> | undefined) ?? mongoose.model("Expense", schema);
