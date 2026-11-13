import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { eventTypes } from "../types/wedding";
import { isTimezone } from "../lib/validation";

const venueSchema = new Schema({ name: { type: String, trim: true }, address: { type: String, trim: true }, googleMapsUrl: String }, { _id: false, strict: "throw" });
const assetSchema = new Schema({ objectKey: { type: String, required: true }, filename: { type: String, required: true }, mimeType: { type: String, required: true } }, { _id: false, strict: "throw" });
const eventSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: eventTypes, required: true },
  customType: { type: String, trim: true, required(this: { type: string }) { return this.type === "CUSTOM"; } },
  description: { type: String, trim: true },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, validate: { validator(this: { startsAt: Date }, value: Date | null) { return !value || value >= this.startsAt; }, message: "End time cannot be before start time." } },
  timezone: { type: String, required: true, trim: true, validate: { validator: isTimezone, message: "Enter a valid IANA timezone." } },
  venue: { type: venueSchema, default: () => ({}) },
  dressCode: { type: String, trim: true }, invitationAsset: assetSchema,
  youtubeLiveUrl: String, rsvpDeadline: Date,
  order: { type: Number, required: true, default: 0, min: 0 },
}, { collection: "events", timestamps: true, strict: "throw", bufferCommands: false });
// Database Design §53: no speculative indexes.
eventSchema.index({ weddingId: 1, startsAt: 1 });
eventSchema.index({ weddingId: 1, order: 1 });
export type WeddingEventRecord = InferSchemaType<typeof eventSchema>;
export const EventModel: Model<WeddingEventRecord> = (mongoose.models.Event as Model<WeddingEventRecord> | undefined)
  ?? mongoose.model<WeddingEventRecord>("Event", eventSchema);
