"use client";

import { useRef, useState, type FormEvent } from "react";
import { weddingFixture, type WeddingEvent, type WeddingTask } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { taskPriorityLabels, taskStatusLabels } from "./task-display";

export function TaskForm({ task, events, onSave, onCancel }: {
  task?: WeddingTask;
  events: WeddingEvent[];
  onSave: (task: WeddingTask) => void;
  onCancel: () => void;
}) {
  const titleInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const title = read("title");
    const date = read("dueDate");
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (!title) { setError("Enter a task name."); titleInput.current?.focus(); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
      setError("Enter a valid due date."); return;
    }
    const assignee = read("assigneeMembershipId");
    const eventId = read("eventId");
    if ((assignee && !weddingFixture.team.some((member) => member.id === assignee)) || (eventId && !events.some((event) => event.id === eventId))) {
      setError("Choose a listed person and event, or leave them unassigned."); return;
    }
    const priority = read("priority");
    const status = read("status");
    if (!Object.hasOwn(taskPriorityLabels, priority) || !Object.hasOwn(taskStatusLabels, status)) { setError("Choose a listed priority and status."); return; }
    onSave({ id: task?.id ?? crypto.randomUUID(), title, description: read("description"), assigneeMembershipId: assignee || null,
      eventId: eventId || null, dueAt: `${date}T23:59:00+05:30`, priority: priority as WeddingTask["priority"], status: status as WeddingTask["status"], notes: read("notes") });
  }
  const fieldClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text focus:border-sage";
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Due dates use Hyderabad time. Task changes stay in this browser tab until it closes.</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <Input ref={titleInput} id="task-title" name="title" label="Task name *" required maxLength={200} autoComplete="off" defaultValue={task?.title ?? ""} />
      <div className="grid gap-2">
        <label htmlFor="task-description" className="text-sm font-medium">Description</label>
        <textarea id="task-description" name="description" defaultValue={task?.description ?? ""} className={`${fieldClass} min-h-[96px] resize-y py-3`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid min-w-0 gap-2">
          <label htmlFor="task-assignee" className="text-sm font-medium">Assigned person</label>
          <select id="task-assignee" name="assigneeMembershipId" defaultValue={task?.assigneeMembershipId ?? ""} className={fieldClass}>
            <option value="">Unassigned</option>
            {weddingFixture.team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </div>
        <div className="grid min-w-0 gap-2">
          <label htmlFor="task-event" className="text-sm font-medium">Related event</label>
          <select id="task-event" name="eventId" defaultValue={task?.eventId ?? ""} className={fieldClass}>
            <option value="">Not linked</option>
            {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
          </select>
        </div>
        <Input id="task-date" name="dueDate" label="Due date *" type="date" required defaultValue={task?.dueAt.slice(0, 10) ?? ""} />
        <div className="grid gap-2">
          <label htmlFor="task-priority" className="text-sm font-medium">Priority</label>
          <select id="task-priority" name="priority" defaultValue={task?.priority ?? "MEDIUM"} className={fieldClass}>{Object.entries(taskPriorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="task-status" className="text-sm font-medium">Status</label>
          <select id="task-status" name="status" defaultValue={task?.status ?? "TODO"} className={fieldClass}>{Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="task-notes" className="text-sm font-medium">Notes</label>
        <textarea id="task-notes" name="notes" defaultValue={task?.notes ?? ""} className={`${fieldClass} min-h-[96px] resize-y py-3`} />
      </div>
      <div className="flex flex-wrap gap-3"><Button type="submit">{task ? "Save changes" : "Create task"}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
