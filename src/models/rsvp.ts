import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const count = { type: Number, min: 0, required: true, validate: Number.isSafeInteger };
const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" },
  eventId: { type: Schema.Types.ObjectId, required: true, ref: "Event" },
  householdId: { type: Schema.Types.ObjectId, required: true, ref: "Household" },
  response: { type: String, enum: ["YES", "NO", "MAYBE"], required: true },
  adultsAttending: count, childrenAttending: count,
  source: { type: String, enum: ["GUEST", "ADMIN"], required: true },
  recordedByMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership" },
  internalNote: String, submittedAt: { type: Date, required: true },
}, { collection: "rsvps", timestamps: { createdAt: false, updatedAt: true }, strict: "throw", bufferCommands: false });
schema.index({ eventId: 1, householdId: 1 }, { unique: true });
schema.index({ weddingId: 1, response: 1 });
schema.index({ weddingId: 1, eventId: 1, response: 1 });
export type RsvpRecord = InferSchemaType<typeof schema>;
export const RsvpModel: Model<RsvpRecord> = (mongoose.models.Rsvp as Model<RsvpRecord> | undefined) ?? mongoose.model("Rsvp", schema);
