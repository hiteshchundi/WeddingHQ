import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, required: true },
  actorType: { type: String, enum: ["USER", "GUEST", "SYSTEM"], required: true },
  actorMembershipId: Schema.Types.ObjectId, householdId: Schema.Types.ObjectId,
  action: { type: String, required: true }, entityType: { type: String, required: true },
  entityId: Schema.Types.ObjectId, metadata: Schema.Types.Mixed,
}, { collection: "audit_logs", timestamps: { createdAt: true, updatedAt: false }, strict: "throw", bufferCommands: false });
schema.index({ weddingId: 1, createdAt: -1 });
schema.index({ weddingId: 1, entityType: 1, entityId: 1 });
export type AuditLog = InferSchemaType<typeof schema>;
export const AuditLogModel: Model<AuditLog> = (mongoose.models.AuditLog as Model<AuditLog> | undefined) ?? mongoose.model("AuditLog", schema);
