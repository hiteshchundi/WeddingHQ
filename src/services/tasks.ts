import "server-only";
import mongoose from "mongoose";
import { ApiError, assertId } from "../lib/api";
import { collaboratorTaskPatchSchema, type TaskInput, type TaskPatch, type TaskQuery } from "../lib/task-validation";
import { TaskModel, type TaskRecord } from "../models/task";
import { EventModel } from "../models/event";
import { WeddingMembershipModel } from "../models/wedding-membership";
import { AuditLogModel } from "../models/audit-log";
import { accessWedding } from "./weddings";
import type { TaskDTO } from "../types/task";

function taskDTO(task: TaskRecord & { _id: mongoose.Types.ObjectId }, collaborator = false): TaskDTO {
  return { id: String(task._id), title: task.title, description: task.description ?? null,
    eventId: task.eventId ? String(task.eventId) : null, assigneeMembershipId: task.assigneeMembershipId ? String(task.assigneeMembershipId) : null,
    dueAt: task.dueAt?.toISOString() ?? null, priority: task.priority, status: task.status,
    ...(!collaborator ? { notes: task.notes ?? null } : {}), completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() };
}
async function references(weddingId: string, input: TaskPatch) {
  if (input.assigneeMembershipId && !await WeddingMembershipModel.exists({ _id: input.assigneeMembershipId, weddingId, status: "ACTIVE", role: { $in: ["OWNER", "PLANNER", "ADMIN", "COLLABORATOR"] } })) throw new ApiError(422, "INVALID_ASSIGNEE", "Choose an active member of this wedding.");
  if (input.eventId && !await EventModel.exists({ _id: input.eventId, weddingId })) throw new ApiError(422, "INVALID_EVENT", "Choose an Event from this wedding.");
}
export async function listTasks(weddingId: string, query: TaskQuery, all = false) {
  const { membership } = await accessWedding(weddingId);
  const collaborator = membership.role === "COLLABORATOR";
  if (collaborator && query.assigneeMembershipId && query.assigneeMembershipId !== String(membership._id)) throw new ApiError(403, "FORBIDDEN", "You can view only your assigned tasks.");
  const filter = { weddingId,
    ...(query.status ? { status: query.status } : {}), ...(query.priority ? { priority: query.priority } : {}), ...(query.eventId ? { eventId: query.eventId } : {}),
    ...(collaborator ? { assigneeMembershipId: membership._id } : query.assigneeMembershipId ? { assigneeMembershipId: query.assigneeMembershipId } : {}),
    ...(query.overdue === "true" ? { dueAt: { $lt: new Date() }, status: query.status && query.status !== "DONE" ? query.status : { $ne: "DONE" as const } } : {}),
  };
  // A DONE + overdue request cannot accidentally broaden to other statuses.
  if (query.overdue === "true" && query.status === "DONE") return { data: [], meta: { page: query.page, limit: query.limit, total: 0, totalPages: 0 } };
  const cursor = TaskModel.find(filter).sort({ dueAt: 1, _id: 1 });
  const [rows, total] = await Promise.all([all ? cursor : cursor.skip((query.page - 1) * query.limit).limit(query.limit), TaskModel.countDocuments(filter)]);
  return { data: rows.map((row) => taskDTO(row, collaborator)), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
export async function getWeddingTasks(weddingId: string) { return (await listTasks(weddingId, { page: 1, limit: 100 }, true)).data; }
export async function getTaskSummary(weddingId: string) {
  await accessWedding(weddingId, true);
  const [remaining, overdue] = await Promise.all([TaskModel.countDocuments({ weddingId, status: { $ne: "DONE" } }), TaskModel.countDocuments({ weddingId, status: { $ne: "DONE" }, dueAt: { $lt: new Date() } })]);
  return { remaining, overdue };
}
export async function getTask(weddingId: string, taskId: string) {
  const { membership } = await accessWedding(weddingId); assertId(taskId);
  const collaborator = membership.role === "COLLABORATOR";
  const task = await TaskModel.findOne({ _id: taskId, weddingId, ...(collaborator ? { assigneeMembershipId: membership._id } : {}) });
  if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found.");
  return taskDTO(task, collaborator);
}
async function audit(weddingId: string, membershipId: mongoose.Types.ObjectId, taskId: mongoose.Types.ObjectId, action: string, metadata: Record<string, unknown>) {
  await AuditLogModel.create({ weddingId, actorType: "USER", actorMembershipId: membershipId, action, entityType: "TASK", entityId: taskId, metadata });
}
export async function createTask(weddingId: string, input: TaskInput) {
  const { membership } = await accessWedding(weddingId, true); await references(weddingId, input); await TaskModel.init();
  const task = await TaskModel.create({ ...input, weddingId, createdByMembershipId: membership._id, ...(input.status === "DONE" ? { completedAt: new Date() } : {}) });
  if (task.assigneeMembershipId) await audit(weddingId, membership._id, task._id, "TASK_ASSIGNED", { assigneeMembershipId: String(task.assigneeMembershipId) });
  if (task.status !== "TODO") await audit(weddingId, membership._id, task._id, "TASK_STATUS_CHANGED", { from: null, to: task.status });
  return taskDTO(task);
}
export async function updateTask(weddingId: string, taskId: string, input: TaskPatch) {
  const { membership } = await accessWedding(weddingId); assertId(taskId);
  const collaborator = membership.role === "COLLABORATOR";
  if (collaborator) collaboratorTaskPatchSchema.parse(input);
  const scope = { _id: taskId, weddingId, ...(collaborator ? { assigneeMembershipId: membership._id } : {}) };
  const previous = await TaskModel.findOne(scope);
  if (!previous) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found.");
  if (collaborator && input.status !== (previous.status === "TODO" ? "IN_PROGRESS" : previous.status === "IN_PROGRESS" ? "DONE" : undefined)) throw new ApiError(409, "INVALID_TASK_TRANSITION", "Start a to-do task, then mark an in-progress task complete.");
  await references(weddingId, input);
  const changes = { ...input, ...(input.status && input.status !== previous.status ? { completedAt: input.status === "DONE" ? new Date() : null } : {}) };
  // Compare-and-set prevents stale status/reassignment writes without a transaction.
  const task = await TaskModel.findOneAndUpdate({ ...scope, __v: previous.__v }, { $set: changes, $inc: { __v: 1 } }, { runValidators: true, returnDocument: "after" });
  if (!task) throw new ApiError(409, "TASK_CHANGED", "This task changed. Reload before trying again.");
  if (String(previous.assigneeMembershipId ?? "") !== String(task.assigneeMembershipId ?? "")) await audit(weddingId, membership._id, task._id, "TASK_ASSIGNED", { assigneeMembershipId: task.assigneeMembershipId ? String(task.assigneeMembershipId) : null });
  if (previous.status !== task.status) await audit(weddingId, membership._id, task._id, "TASK_STATUS_CHANGED", { from: previous.status, to: task.status });
  return taskDTO(task, collaborator);
}
export async function deleteTask(weddingId: string, taskId: string) {
  await accessWedding(weddingId, true); assertId(taskId);
  if (!(await TaskModel.deleteOne({ _id: taskId, weddingId })).deletedCount) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found.");
}
export async function getCollaboratorView(weddingId: string) {
  const { wedding, membership } = await accessWedding(weddingId);
  if (membership.role !== "COLLABORATOR") return null;
  const tasks = await getWeddingTasks(weddingId);
  const events = await EventModel.find({ weddingId, _id: { $in: tasks.flatMap((task) => task.eventId ? [task.eventId] : []) } }).select("name");
  return { coupleNames: `${wedding.groomName} & ${wedding.brideName}`, timezone: wedding.timezone, tasks, events: events.map((event) => ({ id: String(event._id), name: event.name })) };
}
