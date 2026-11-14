import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const importError = new Schema({ row: { type: Number, required: true }, field: String, message: { type: String, required: true } }, { _id: false, versionKey: false, strict: "throw" });
const importSchema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  type: { type: String, enum: ["GUESTS"], required: true }, filename: { type: String, required: true },
  format: { type: String, enum: ["CSV", "XLSX"], required: true },
  status: { type: String, enum: ["UPLOADED", "VALIDATED", "CONFIRMED", "FAILED", "EXPIRED"], required: true },
  totalRows: { type: Number, required: true }, validRows: { type: Number, required: true }, invalidRows: { type: Number, required: true },
  errors: { type: [importError], default: [] },
  createdByMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership", required: true },
  expiresAt: { type: Date, required: true },
}, { collection: "imports", timestamps: true, strict: "throw", bufferCommands: false });
importSchema.index({ weddingId: 1, createdAt: -1 });
importSchema.index({ expiresAt: 1 });
export type GuestImportRecord = InferSchemaType<typeof importSchema>;
export const GuestImportModel: Model<GuestImportRecord> = (mongoose.models.GuestImport as Model<GuestImportRecord> | undefined)
  ?? mongoose.model<GuestImportRecord>("GuestImport", importSchema);
