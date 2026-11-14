import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { taskPriorities, taskStatuses } from "../types/task";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, required: true, ref: "Wedding" },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 5000 },
  assigneeMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership" },
  dueAt: Date,
  priority: { type: String, enum: taskPriorities, required: true },
  status: { type: String, enum: taskStatuses, required: true, default: "TODO" },
  notes: { type: String, maxlength: 5000 },
  createdByMembershipId: { type: Schema.Types.ObjectId, ref: "WeddingMembership", required: true },
  completedAt: Date,
}, { collection: "tasks", timestamps: true, strict: "throw", bufferCommands: false });
schema.index({ weddingId: 1, status: 1 });
schema.index({ weddingId: 1, assigneeMembershipId: 1 });
schema.index({ weddingId: 1, dueAt: 1 });
export type TaskRecord = InferSchemaType<typeof schema>;
export const TaskModel: Model<TaskRecord> = (mongoose.models.Task as Model<TaskRecord> | undefined) ?? mongoose.model("Task", schema);
