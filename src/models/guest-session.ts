import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
// Explicit H5 decision: separate opaque, hash-only, 24-hour guest sessions.
const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" },
  householdId: { type: Schema.Types.ObjectId, required: true, ref: "Household" },
  tokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true }, revokedAt: Date,
}, { collection: "guest_sessions", timestamps: true, strict: "throw", bufferCommands: false });
schema.index({ tokenHash: 1 }, { unique: true });
schema.index({ householdId: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export type GuestSession = InferSchemaType<typeof schema>;
export const GuestSessionModel: Model<GuestSession> = (mongoose.models.GuestSession as Model<GuestSession> | undefined) ?? mongoose.model("GuestSession", schema);
