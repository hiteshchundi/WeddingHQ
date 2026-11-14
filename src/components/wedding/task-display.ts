import { weddingFixture, type WeddingTask } from "../../fixtures/wedding";
import type { TaskDTO } from "../../types/task";

export function taskView(task: TaskDTO): WeddingTask {
  return { ...task, description: task.description ?? "", notes: task.notes ?? "", dueAt: task.dueAt ?? "" };
}

export const taskStatusLabels = { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" } as const;
export const taskPriorityLabels = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" } as const;

export function taskDate(value: string, timezone = weddingFixture.timezone) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function overdueDays(task: WeddingTask, now?: number) {
  if (task.status === "DONE" || !task.dueAt) return 0;
  if (now !== undefined) return Math.max(0, Math.ceil((now - Date.parse(task.dueAt)) / 86400000));
  // This prototype stores Hyderabad dates with an explicit +05:30 offset.
  // Compare calendar days, so a task due on the reference day isn't overdue.
  const reference = Date.parse(`${weddingFixture.taskReferenceDate}T00:00:00Z`);
  const dueDay = Date.parse(`${task.dueAt.slice(0, 10)}T00:00:00Z`);
  return Math.max(0, Math.round((reference - dueDay) / 86400000));
}
