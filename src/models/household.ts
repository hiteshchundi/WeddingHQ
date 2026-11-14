import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const contactSchema = new Schema({ name: { type: String, trim: true }, email: { type: String, trim: true, lowercase: true }, phone: { type: String, trim: true } }, { _id: false, versionKey: false, strict: "throw" });
const memberSchema = new Schema({ name: { type: String, required: true, trim: true } }, { _id: false, versionKey: false, strict: "throw" });
const guestAccessSchema = new Schema({
  tokenHash: { type: String, required: true, select: false },
  status: { type: String, enum: ["ACTIVE", "REVOKED"], required: true },
  createdAt: { type: Date, required: true }, lastUsedAt: Date,
}, { _id: false, versionKey: false, strict: "throw" });
const count = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };
const householdSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  householdName: { type: String, required: true, trim: true },
  primaryContact: { type: contactSchema, default: () => ({}) },
  adultsInvited: count, childrenInvited: count,
  members: { type: [memberSchema], default: [] }, notes: { type: String, trim: true },
  // H4 preserves the approved optional metadata, without generating guest access.
  guestAccess: { type: guestAccessSchema, default: undefined, select: false },
}, { collection: "households", timestamps: true, strict: "throw", bufferCommands: false });
householdSchema.index({ weddingId: 1, householdName: 1 });
householdSchema.index({ weddingId: 1, "primaryContact.email": 1 });
export type HouseholdRecord = InferSchemaType<typeof householdSchema>;
export const HouseholdModel: Model<HouseholdRecord> = (mongoose.models.Household as Model<HouseholdRecord> | undefined)
  ?? mongoose.model<HouseholdRecord>("Household", householdSchema);
