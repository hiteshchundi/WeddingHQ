"use client";

import { useRef, useState } from "react";
import { weddingFixture, type WeddingTask } from "../../fixtures/wedding";
import { BrandMark } from "../brand/brand-mark";
import { AppearanceControl } from "../theme/appearance-control";
import { Card } from "../ui/card";
import { Metric } from "./metric";
import { overdueDays, taskDate, taskStatusLabels } from "./task-display";
import { TaskRow } from "./task-row";

export function CollaboratorTasks() {
  const collaborator = weddingFixture.team.find((member) => member.id === weddingFixture.demoCollaboratorMembershipId)!;
  const [tasks, setTasks] = useState(() => weddingFixture.tasks.filter((task) => task.assigneeMembershipId === collaborator.id));
  const [notice, setNotice] = useState("");
  const listTitle = useRef<HTMLHeadingElement>(null);
  const overdue = tasks.filter((task) => overdueDays(task) > 0).length;
  const completed = tasks.filter((task) => task.status === "DONE").length;
  const ordered = [...tasks].sort((a, b) => Number(a.status === "DONE") - Number(b.status === "DONE") || Date.parse(a.dueAt) - Date.parse(b.dueAt));

  function advanceTask(task: WeddingTask, next: WeddingTask["status"]) {
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: next } : item));
    setNotice(`${task.title}: ${taskStatusLabels[next]}.`);
    if (next === "DONE") requestAnimationFrame(() => listTitle.current?.focus());
  }

  return (
    <div className="mx-auto w-full max-w-[800px] space-y-6 px-4 py-6 md:px-6">
      <header className="flex items-center justify-between gap-4"><BrandMark /><AppearanceControl /></header>
      <main className="space-y-6">
        <div className="space-y-2">
          <p className="break-words font-editorial text-3xl">{weddingFixture.identity.coupleNames}</p>
          <p className="text-sm text-secondary-text">{collaborator.name} · Demo collaborator</p>
          <h1 className="text-2xl font-semibold">Your tasks</h1>
          <p className="text-sm text-secondary-text">As of {taskDate(`${weddingFixture.taskReferenceDate}T12:00:00+05:30`)}. Changes here are local to this view, independent of the organiser view, and reset on reload.</p>
        </div>
        <Card>
          <dl className="grid grid-cols-3 gap-4">
            <Metric value={overdue} label="Overdue" detail="Assigned tasks" />
            <Metric value={tasks.length - overdue - completed} label="Upcoming" detail="Assigned tasks" />
            <Metric value={completed} label="Completed" detail="Assigned tasks" />
          </dl>
        </Card>
        {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
        <h2 ref={listTitle} tabIndex={-1} className="sr-only">Assigned tasks</h2>
        {tasks.length ? <ul className="space-y-4">{ordered.map((task) => <TaskRow key={task.id} task={task} assigneeName={collaborator.name} eventName={weddingFixture.events.find((event) => event.id === task.eventId)?.name ?? "Not linked"} onStatusChange={(next) => advanceTask(task, next)} />)}</ul>
          : <Card className="space-y-3"><h2 className="text-lg font-semibold">You&apos;re all caught up</h2><p>No tasks are assigned to you right now.</p></Card>}
      </main>
    </div>
  );
}
