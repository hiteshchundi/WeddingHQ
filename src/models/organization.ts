import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const organizationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ["PERSONAL", "PLANNER", "EVENT_COMPANY"], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { collection: "organizations", timestamps: true, strict: "throw", bufferCommands: false });
organizationSchema.index({ createdBy: 1 });

export type Organization = InferSchemaType<typeof organizationSchema>;
export const OrganizationModel: Model<Organization> = (mongoose.models.Organization as Model<Organization> | undefined)
  ?? mongoose.model<Organization>("Organization", organizationSchema);
