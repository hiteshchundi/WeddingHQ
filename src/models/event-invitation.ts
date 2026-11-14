import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const invitationSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  householdId: { type: Schema.Types.ObjectId, ref: "Household", required: true },
  status: { type: String, enum: ["ACTIVE", "REVOKED"], required: true, default: "ACTIVE" },
  invitationSentAt: Date,
}, { collection: "event_invitations", timestamps: true, strict: "throw", bufferCommands: false });
invitationSchema.index({ eventId: 1, householdId: 1 }, { unique: true });
invitationSchema.index({ householdId: 1 });
invitationSchema.index({ weddingId: 1, eventId: 1 });
export type EventInvitation = InferSchemaType<typeof invitationSchema>;
export const EventInvitationModel: Model<EventInvitation> = (mongoose.models.EventInvitation as Model<EventInvitation> | undefined)
  ?? mongoose.model<EventInvitation>("EventInvitation", invitationSchema);
