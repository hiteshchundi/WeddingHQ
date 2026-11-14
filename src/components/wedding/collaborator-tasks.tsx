"use client";

import { useRef, useState } from "react";
import type { WeddingTask } from "../../fixtures/wedding";
import type { TaskDTO } from "../../types/task";
import { saveResource } from "../../lib/api-client";
import { BrandMark } from "../brand/brand-mark";
import { AppearanceControl } from "../theme/appearance-control";
import { Card } from "../ui/card";
import { Metric } from "./metric";
import { overdueDays, taskStatusLabels, taskView } from "./task-display";
import { TaskRow } from "./task-row";

export function CollaboratorTasks({ weddingId, name, coupleNames, timezone, initialTasks, events }: {
  weddingId: string; name: string; coupleNames: string; timezone: string;
  initialTasks: TaskDTO[]; events: { id: string; name: string }[];
}) {
  const [tasks, setTasks] = useState(() => initialTasks.map(taskView));
  const [now] = useState(() => Date.now());
  const [notice, setNotice] = useState(""), [error, setError] = useState(""), [pending, setPending] = useState<string | null>(null);
  const listTitle = useRef<HTMLHeadingElement>(null);
  const overdue = tasks.filter((task) => overdueDays(task, now) > 0).length;
  const completed = tasks.filter((task) => task.status === "DONE").length;
  const ordered = [...tasks].sort((a, b) => Number(a.status === "DONE") - Number(b.status === "DONE") || (Date.parse(a.dueAt) || Infinity) - (Date.parse(b.dueAt) || Infinity));
  async function advanceTask(task: WeddingTask, status: WeddingTask["status"]) {
    if (pending) return;
    setPending(task.id); setError("");
    try {
      const saved = taskView(await saveResource<TaskDTO>(`/api/v1/weddings/${weddingId}/tasks/${task.id}`, "PATCH", { status }));
      setTasks((current) => current.map((item) => item.id === saved.id ? saved : item));
      setNotice(`${saved.title}: ${taskStatusLabels[saved.status]}.`);
      if (status === "DONE") requestAnimationFrame(() => listTitle.current?.focus());
    } catch (error) { setError(error instanceof Error ? error.message : "The task could not be updated."); }
    finally { setPending(null); }
  }
  return <div className="mx-auto w-full max-w-[800px] space-y-6 px-4 py-6 md:px-6">
    <header className="flex items-center justify-between gap-4"><BrandMark /><AppearanceControl /></header>
    <main className="space-y-6">
      <div className="space-y-2"><p className="break-words font-editorial text-3xl">{coupleNames}</p><p className="text-sm text-secondary-text">{name} · Collaborator</p><h1 className="text-2xl font-semibold">Your tasks</h1><p className="text-sm text-secondary-text">Only your assigned tasks are shown. Changes are saved to the wedding. Dates use {timezone}.</p></div>
      <Card><dl className="grid grid-cols-3 gap-4"><Metric value={overdue} label="Overdue" detail="Assigned tasks" /><Metric value={tasks.length - overdue - completed} label="Upcoming" detail="Assigned tasks" /><Metric value={completed} label="Completed" detail="Assigned tasks" /></dl></Card>
      {error ? <p role="alert">{error}</p> : null}{notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
      <h2 ref={listTitle} tabIndex={-1} className="sr-only">Assigned tasks</h2>
      {tasks.length ? <ul className="space-y-4">{ordered.map((task) => <TaskRow key={task.id} now={now} timezone={timezone} pending={pending !== null} task={task} assigneeName={name} eventName={events.find((event) => event.id === task.eventId)?.name ?? "Not linked"} onStatusChange={(next) => advanceTask(task, next)} />)}</ul> : <Card className="space-y-3"><h2 className="text-lg font-semibold">You&apos;re all caught up</h2><p>No tasks are assigned to you right now.</p></Card>}
    </main>
  </div>;
}
