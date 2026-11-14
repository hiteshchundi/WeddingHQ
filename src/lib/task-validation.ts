import { z } from "zod";
import { taskPriorities, taskStatuses } from "../types/task";
import { listQuerySchema } from "./validation";
const id = z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid record.");
const instant = z.iso.datetime({ offset: true }).refine((value) => Number.isFinite(Date.parse(value)), "Enter a valid date.");
const fields = {
  title: z.string().trim().min(1).max(200), description: z.string().trim().max(5000).nullable().optional(),
  eventId: id.nullable().optional(), assigneeMembershipId: id.nullable().optional(),
  dueAt: instant.nullable().optional(), priority: z.enum(taskPriorities),
  status: z.enum(taskStatuses).optional(), notes: z.string().trim().max(5000).nullable().optional(),
};
export const taskCreateSchema = z.strictObject(fields);
export const taskPatchSchema = z.strictObject(fields).partial().refine((input) => Object.keys(input).length > 0, "Provide an editable field.");
export const collaboratorTaskPatchSchema = z.strictObject({ status: z.enum(taskStatuses) });
export const taskQuerySchema = listQuerySchema.extend({
  status: z.enum(taskStatuses).optional(), priority: z.enum(taskPriorities).optional(),
  eventId: id.optional(), assigneeMembershipId: id.optional(), overdue: z.enum(["true", "false"]).optional(),
});
export type TaskInput = z.infer<typeof taskCreateSchema>;
export type TaskPatch = z.infer<typeof taskPatchSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
