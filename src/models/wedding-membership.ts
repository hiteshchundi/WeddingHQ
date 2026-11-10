import "server-only";

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const weddingRoles = ["OWNER", "PLANNER", "ADMIN", "COLLABORATOR"] as const;
export type WeddingRole = typeof weddingRoles[number];

const weddingMembershipSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true, trim: true, lowercase: true },
  role: { type: String, enum: weddingRoles, required: true },
  status: { type: String, enum: ["INVITED", "ACTIVE", "REVOKED"], required: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
  invitedAt: Date,
  acceptedAt: Date,
}, {
  collection: "wedding_memberships",
  timestamps: true,
  strict: "throw",
  bufferCommands: false,
});

// Database Design §§12, 53. Email is required even before an invitee has a User.
weddingMembershipSchema.index({ weddingId: 1, email: 1 }, { unique: true });
weddingMembershipSchema.index({ userId: 1, status: 1 });
weddingMembershipSchema.index({ weddingId: 1, role: 1 });

// H3 will create ACTIVE OWNER membership for the authenticated wedding creator.
// No invitation acceptance, role mutation or owner removal is implemented here.
export type WeddingMembership = InferSchemaType<typeof weddingMembershipSchema>;
export const WeddingMembershipModel: Model<WeddingMembership> =
  (mongoose.models.WeddingMembership as Model<WeddingMembership> | undefined)
  ?? mongoose.model<WeddingMembership>("WeddingMembership", weddingMembershipSchema);
