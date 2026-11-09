import type { WeddingTask } from "../../fixtures/wedding";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { overdueDays, taskDate, taskPriorityLabels, taskStatusLabels } from "./task-display";

export function TaskRow({ task, assigneeName, eventName, onEdit, onStatusChange }: {
  task: WeddingTask;
  assigneeName: string;
  eventName: string;
  onEdit?: () => void;
  onStatusChange: (status: WeddingTask["status"]) => void;
}) {
  const days = overdueDays(task);
  return (
    <li>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 break-words text-lg font-semibold">
            {onEdit ? <button type="button" onClick={onEdit} aria-haspopup="dialog" className="min-h-[44px] max-w-full break-words rounded-md text-left underline underline-offset-4">{task.title}</button> : task.title}
          </h3>
          <Badge>{taskStatusLabels[task.status]}</Badge>
        </div>
        {task.description ? <p className="break-words text-sm text-secondary-text">{task.description}</p> : null}
        <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
          <div className="min-w-0"><dt className="mb-1 text-secondary-text">Assigned to</dt><dd className="break-words">{assigneeName}</dd></div>
          <div className="min-w-0"><dt className="mb-1 text-secondary-text">Related event</dt><dd className="break-words">{eventName}</dd></div>
          <div><dt className="mb-1 text-secondary-text">Due date</dt><dd><time dateTime={task.dueAt}>{taskDate(task.dueAt)}</time></dd></div>
          <div><dt className="mb-1 text-secondary-text">Priority</dt><dd><Badge>{taskPriorityLabels[task.priority]}</Badge></dd></div>
        </dl>
        {days > 0 ? <p className="text-sm font-semibold">{days} {days === 1 ? "day" : "days"} overdue</p> : null}
        {onEdit ? (
          <div className="grid max-w-[240px] gap-2">
            <label htmlFor={`status-${task.id}`} className="text-sm font-medium">Status</label>
            <select id={`status-${task.id}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onStatusChange(event.target.value as WeddingTask["status"])} className="min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text">
              {Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        ) : task.status !== "DONE" ? (
          <Button aria-label={`${task.status === "TODO" ? "Start task" : "Mark complete"}: ${task.title}`} onClick={() => onStatusChange(task.status === "TODO" ? "IN_PROGRESS" : "DONE")}>
            {task.status === "TODO" ? "Start task" : "Mark complete"}
          </Button>
        ) : null}
      </Card>
    </li>
  );
}
