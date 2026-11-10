import "server-only";

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const helpContactSchema = new Schema({
  name: { type: String, required: true, trim: true },
  label: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
}, { _id: false, strict: "throw" });

const weddingSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true, ref: "Organization" },
  title: { type: String, required: true, trim: true },
  brideName: { type: String, required: true, trim: true },
  groomName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  timezone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator(value: string) {
        if (/^[+-]/.test(value)) return false;
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      },
      message: "timezone must be a valid IANA timezone.",
    },
  },
  currency: { type: String, required: true, trim: true, uppercase: true },
  // BSON Date stores UTC instants; timezone is kept separately for presentation.
  startDate: { type: Date, required: true },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator(this: { startDate?: Date }, value: Date) {
        return !this.startDate || value >= this.startDate;
      },
      message: "endDate must be on or after startDate.",
    },
  },
  status: { type: String, enum: ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"], required: true, default: "DRAFT" },
  rsvpDefaultDeadline: Date,
  retentionEndsAt: Date,
  helpContacts: { type: [helpContactSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
}, {
  collection: "weddings",
  timestamps: true,
  strict: "throw",
  bufferCommands: false,
  toJSON: {
    versionKey: false,
    transform(_document, result: Record<string, unknown>) {
      const { _id, ...fields } = result;
      return { id: String(_id), ...fields };
    },
  },
});

// Database Design §53: organisation lookup and lifecycle filtering only.
weddingSchema.index({ organizationId: 1 });
weddingSchema.index({ status: 1 });

// Future owned collections carry weddingId and require membership-scoped queries.
// These ObjectId references do not create Organization/User models or permissions.
export type Wedding = InferSchemaType<typeof weddingSchema>;
export const WeddingModel: Model<Wedding> = (mongoose.models.Wedding as Model<Wedding> | undefined)
  ?? mongoose.model<Wedding>("Wedding", weddingSchema);
