"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { weddingFixture, type WeddingTask } from "../../fixtures/wedding";
import type { MemberDTO, TaskDTO } from "../../types/task";
import { saveResource } from "../../lib/api-client";
import { taskView } from "./task-display";
import { PageHeader } from "../layout/page-header";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/input";
import { useDemoTasks } from "./demo-tasks";
import { useWeddingEvents } from "./events-context";
import { overdueDays, taskDate, taskPriorityLabels, taskStatusLabels } from "./task-display";
import { TaskForm } from "./task-form";
import { TaskRow } from "./task-row";

const views = { all: "All", overdue: "Overdue", upcoming: "Upcoming", completed: "Completed" } as const;

export function TasksPage({ weddingId, initialTasks, members = [] }: { weddingId: string; initialTasks?: TaskDTO[]; members?: MemberDTO[] }) {
  const [tasks, setTasks] = useState(() => initialTasks?.map(taskView) ?? []);
  return initialTasks ? <TaskBoard weddingId={weddingId} tasks={tasks} setTasks={setTasks} members={members} /> : <DemoTaskBoard weddingId={weddingId} />;
}
function DemoTaskBoard({ weddingId }: { weddingId: string }) {
  const [tasks, setTasks] = useDemoTasks(weddingId);
  return <TaskBoard weddingId={weddingId} tasks={tasks} setTasks={setTasks} members={weddingFixture.team} />;
}
function TaskBoard({ weddingId, tasks, setTasks, members }: { weddingId: string; tasks: WeddingTask[]; setTasks: Dispatch<SetStateAction<WeddingTask[]>> | ((update: (current: WeddingTask[]) => WeddingTask[]) => void); members: { id: string; name: string; status?: string }[] }) {
  const { events, persistent, wedding } = useWeddingEvents();
  const [now] = useState(() => persistent ? Date.now() : undefined);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const assignable = members.filter((member) => !member.status || member.status === "ACTIVE");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<keyof typeof views>("all");
  const [assignee, setAssignee] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const selected = tasks.find((task) => task.id === editing);

  useEffect(() => {
    if (editing) {
      if (!drawer.current?.open) drawer.current?.showModal();
      drawer.current?.querySelector<HTMLInputElement>("input")?.focus();
    } else drawer.current?.close();
  }, [editing]);

  const memberName = (id: string | null) => members.find((member) => member.id === id)?.name ?? "Unassigned";
  const eventName = (id: string | null) => events.find((event) => event.id === id)?.name ?? "Not linked";
  const query = search.trim().toLowerCase();
  const visible = tasks.filter((task) => {
    const matchesSearch = [task.title, task.description, memberName(task.assigneeMembershipId), eventName(task.eventId)].some((value) => value.toLowerCase().includes(query));
    const overdue = overdueDays(task, now) > 0;
    const matchesView = view === "all" || (view === "overdue" && overdue) || (view === "upcoming" && !overdue && task.status !== "DONE") || (view === "completed" && task.status === "DONE");
    return matchesSearch && matchesView && (!assignee || (task.assigneeMembershipId ?? "unassigned") === assignee)
      && (!eventFilter || (task.eventId ?? "none") === eventFilter) && (!priority || task.priority === priority) && (!status || task.status === status);
  }).sort((a, b) => (Date.parse(a.dueAt) || Infinity) - (Date.parse(b.dueAt) || Infinity));
  const sections = [
    { title: "Needs attention", items: visible.filter((task) => overdueDays(task, now) > 0) },
    { title: "Upcoming", items: visible.filter((task) => task.status !== "DONE" && overdueDays(task, now) === 0) },
    { title: "Completed", items: visible.filter((task) => task.status === "DONE") },
  ];

  function clearFilters() { setSearch(""); setView("all"); setAssignee(""); setEventFilter(""); setPriority(""); setStatus(""); }
  function openForm(id: string) { setNotice(""); setEditing(id); }
  async function saveTask(task: WeddingTask) {
    if (persistent) {
      const fields = { title: task.title, description: task.description, assigneeMembershipId: task.assigneeMembershipId, eventId: task.eventId, priority: task.priority, status: task.status, notes: task.notes };
      task = taskView(await saveResource<TaskDTO>(`/api/v1/weddings/${weddingId}/tasks${editing === "new" ? "" : `/${task.id}`}`, editing === "new" ? "POST" : "PATCH", { ...fields, dueAt: task.dueAt || null }));
    }
    setTasks((current) => current.some((item) => item.id === task.id) ? current.map((item) => item.id === task.id ? task : item) : [task, ...current]);
    setNotice(`${task.title} ${editing === "new" ? "created" : "updated"}${persistent ? "." : " for this demo."}`);
    setEditing(null);
    clearFilters();
  }
  async function handleStatusChange(task: WeddingTask, next: WeddingTask["status"]) {
    if (pending) return;
    setPending(task.id); setError("");
    try {
      const saved = persistent ? taskView(await saveResource<TaskDTO>(`/api/v1/weddings/${weddingId}/tasks/${task.id}`, "PATCH", { status: next })) : { ...task, status: next };
      setTasks((current) => current.map((item) => item.id === task.id ? saved : item));
      setNotice(`${task.title}: ${taskStatusLabels[next]}.`);
    } catch (error) { setError(error instanceof Error ? error.message : "The task could not be updated."); }
    finally { setPending(null); }
    requestAnimationFrame(() => (document.getElementById(`status-${task.id}`) ?? document.getElementById("tasks-list-title"))?.focus());
  }
  const selectClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <>
      <PageHeader title="Tasks" action={<Button onClick={() => openForm("new")} className="gap-2"><Plus size={18} aria-hidden="true" />New task</Button>} />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <p className="text-sm text-secondary-text">{persistent ? "Tasks and assignments are saved to your wedding." : <>Sample tasks · as of {taskDate(`${weddingFixture.taskReferenceDate}T12:00:00+05:30`)}. Changes reset when the tab closes. Collaborator access requires a real wedding membership.</>}</p>
        <section aria-label="Search and filter tasks" className="space-y-4">
          <Input id="task-search" label="Search tasks" type="search" autoComplete="off" placeholder="Task, description, person or event" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Task views">
            {Object.entries(views).map(([value, label]) => <Button key={value} variant="tertiary" aria-pressed={view === value} className="aria-pressed:bg-sage-soft" onClick={() => setView(value as keyof typeof views)}>{label}</Button>)}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid min-w-0 gap-2"><label htmlFor="task-filter-status" className="text-sm font-medium">Status</label><select id="task-filter-status" className={selectClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="task-filter-assignee" className="text-sm font-medium">Assigned to</label><select id="task-filter-assignee" className={selectClass} value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="">All people</option><option value="unassigned">Unassigned</option>{assignable.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="task-filter-event" className="text-sm font-medium">Related event</label><select id="task-filter-event" className={selectClass} value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}><option value="">All events</option><option value="none">Not linked</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="task-filter-priority" className="text-sm font-medium">Priority</label><select id="task-filter-priority" className={selectClass} value={priority} onChange={(event) => setPriority(event.target.value)}><option value="">All priorities</option>{Object.entries(taskPriorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          </div>
          {search || view !== "all" || assignee || eventFilter || priority || status ? <Button variant="tertiary" onClick={clearFilters}>Clear filters</Button> : null}
        </section>
        {error ? <p role="alert">{error}</p> : null}
        {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
        <h2 id="tasks-list-title" tabIndex={-1} className="text-lg font-semibold">Tasks · {visible.length} of {tasks.length}</h2>
        {!tasks.length ? <Card className="space-y-4"><h3 className="text-lg font-semibold">No tasks yet</h3><p>Create your first task to start coordinating the wedding.</p><Button onClick={() => openForm("new")}>Create task</Button></Card>
          : !visible.length ? <Card className="space-y-3"><h3 className="text-lg font-semibold">No tasks match</h3><p>Try a different search or clear your filters.</p><Button variant="secondary" onClick={clearFilters}>Clear filters</Button></Card>
          : sections.map((section) => section.items.length ? (
            <section key={section.title} aria-label={section.title} className="space-y-4">
              <h2 className="text-2xl font-semibold">{section.title} · {section.items.length}</h2>
              <ul className="space-y-4">{section.items.map((task) => <TaskRow now={now} timezone={wedding?.timezone} pending={pending === task.id} key={task.id} task={task} assigneeName={memberName(task.assigneeMembershipId)} eventName={eventName(task.eventId)} onEdit={() => openForm(task.id)} onStatusChange={(next) => handleStatusChange(task, next)} />)}</ul>
            </section>
          ) : null)}
      </main>
      <dialog ref={drawer} aria-labelledby="task-drawer-title" className="shell-dialog task-drawer" onClose={() => setEditing(null)} onClick={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface p-4 md:p-6">
          <h2 id="task-drawer-title" className="text-2xl font-semibold">{selected ? "Edit task" : "New task"}</h2>
          <IconButton aria-label="Close task" onClick={() => setEditing(null)}><X size={20} /></IconButton>
        </header>
        <div className="p-4 md:p-6">{editing ? <TaskForm key={editing} task={selected} events={events} members={assignable} persistent={persistent} timezone={wedding?.timezone} onSave={saveTask} onCancel={() => setEditing(null)} /> : null}</div>
      </dialog>
    </>
  );
}
