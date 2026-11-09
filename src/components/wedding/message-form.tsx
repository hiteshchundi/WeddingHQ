"use client";

import { useRef, useState, type FormEvent } from "react";
import { messageAudienceLabels, weddingFixture, type MessageAudience, type WeddingEvent, type WeddingMessage } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { audienceCount, parseSchedule, scheduleInputs } from "./message-display";

export function MessageForm({ message, events, onSave, onCancel }: {
  message?: WeddingMessage;
  events: WeddingEvent[];
  onSave: (message: WeddingMessage) => void;
  onCancel: () => void;
}) {
  const [eventId, setEventId] = useState(message?.audience.eventId ?? "");
  const [segment, setSegment] = useState<MessageAudience["type"]>(message?.audience.type ?? "EVENT_ALL");
  const [error, setError] = useState("");
  const subjectInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLTextAreaElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const timeInput = useRef<HTMLInputElement>(null);
  const schedule = scheduleInputs(message?.scheduledAt ?? null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const subject = read("subject");
    const body = read("body");
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const action = submitter instanceof HTMLButtonElement ? submitter.value : "DRAFT";
    if (!subject || !body) { setError("Enter a subject and message."); (subject ? bodyInput : subjectInput).current?.focus(); return; }
    if (!events.some((item) => item.id === eventId) || !Object.hasOwn(messageAudienceLabels, segment)) { setError("Choose an event and an audience segment."); return; }
    if (action !== "DRAFT" && action !== "SENT" && action !== "SCHEDULED") return;
    let scheduledAt: string | null = null;
    if (action === "SCHEDULED") {
      try { scheduledAt = parseSchedule(read("scheduleDate"), read("scheduleTime")); }
      catch (error) {
        setError(error instanceof Error ? error.message : "Choose a schedule date and time.");
        (read("scheduleDate") && !read("scheduleTime") ? timeInput : dateInput).current?.focus();
        return;
      }
    }
    const now = new Date().toISOString();
    onSave({ id: message?.id ?? crypto.randomUUID(), subject, body, audience: { type: segment, eventId }, status: action,
      scheduledAt, sentAt: action === "SENT" ? now : null, createdAt: message?.createdAt ?? now });
  }

  const fieldClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Email preview only; nothing is delivered.</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Audience *</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid min-w-0 gap-2"><label htmlFor="message-event" className="text-sm font-medium">Event *</label><select id="message-event" required value={eventId} onChange={(event) => setEventId(event.target.value)} className={fieldClass}><option value="">Choose event</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>
          <div className="grid min-w-0 gap-2"><label htmlFor="message-segment" className="text-sm font-medium">RSVP segment *</label><select id="message-segment" required value={segment} onChange={(event) => setSegment(event.target.value as MessageAudience["type"])} className={fieldClass}>{Object.entries(messageAudienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        </div>
        <p aria-live="polite" className="text-sm text-secondary-text">{eventId ? `${audienceCount({ type: segment, eventId }, weddingFixture.households)} sample households match. This is not a recipient or delivery count.` : "Choose an event to preview the sample household count."}</p>
      </fieldset>
      <Input ref={subjectInput} id="message-subject" name="subject" label="Subject *" required autoComplete="off" maxLength={200} defaultValue={message?.subject ?? ""} />
      <div className="grid gap-2"><label htmlFor="message-body" className="text-sm font-medium">Message *</label><textarea ref={bodyInput} id="message-body" name="body" required defaultValue={message?.body ?? ""} className={`${fieldClass} min-h-[180px] resize-y py-3`} /></div>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Schedule</legend>
        <p id="message-schedule-help" className="text-sm text-secondary-text">Date and time are required only for Schedule. Times use your browser’s local timezone. Scheduling here will not send automatically.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input ref={dateInput} id="message-date" name="scheduleDate" label="Schedule date" type="date" aria-describedby="message-schedule-help" defaultValue={schedule.date} />
          <Input ref={timeInput} id="message-time" name="scheduleTime" label="Schedule time" type="time" aria-describedby="message-schedule-help" defaultValue={schedule.time} />
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" value="DRAFT" variant="secondary">Save draft</Button>
        <Button type="submit" value="SENT">Send now</Button>
        <Button type="submit" value="SCHEDULED" variant="secondary">Schedule</Button>
        <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
