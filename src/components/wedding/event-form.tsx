"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { weddingFixture, type WeddingEvent } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function EventForm({
  initialEvent,
  onSave,
  onCancel,
}: {
  initialEvent?: WeddingEvent;
  onSave: (event: WeddingEvent) => void;
  onCancel: () => void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    nameInput.current?.focus();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const name = read("name");
    // This fixture wedding uses Asia/Kolkata (+05:30). General timezone
    // conversion belongs to integration, not this local form.
    const startsAt = `${read("date")}T${read("startTime")}:00+05:30`;
    const endsAt = read("endTime") ? `${read("date")}T${read("endTime")}:00+05:30` : "";
    if (!name || !Number.isFinite(Date.parse(startsAt))) {
      setError("Enter an event name and a valid date and start time.");
      return;
    }
    if (endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
      setError("End time must be after the start time on the selected date.");
      form.querySelector<HTMLInputElement>('[name="endTime"]')?.focus();
      return;
    }
    const filename = read("invitationFilename");
    onSave({
      id: initialEvent?.id ?? crypto.randomUUID(),
      name,
      type: initialEvent?.type ?? "CUSTOM",
      customType: !initialEvent || initialEvent.type === "CUSTOM" ? name : undefined,
      startsAt,
      endsAt,
      timezone: initialEvent?.timezone ?? weddingFixture.timezone,
      venue: {
        name: read("venue"),
        address: read("venue") ? weddingFixture.identity.location : "",
        googleMapsUrl: read("googleMapsUrl"),
      },
      dressCode: read("dressCode"),
      invitationAsset: filename ? { filename } : null,
      rsvpDeadline: read("rsvpDeadline") ? `${read("rsvpDeadline")}:00+05:30` : "",
      youtubeLiveUrl: read("youtubeLiveUrl"),
      invitedHouseholds: initialEvent?.invitedHouseholds ?? 0,
      order: initialEvent?.order ?? 0,
      relativeTime: startsAt === initialEvent?.startsAt ? initialEvent.relativeTime : undefined,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-secondary-text">Times are shown for Hyderabad. Prototype changes reset on reload.</p>
      {error ? <p role="alert" className="font-semibold">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input ref={nameInput} id="event-name" name="name" label="Event name" required maxLength={200} defaultValue={initialEvent?.name ?? ""} />
        </div>
        <Input id="event-date" name="date" label="Date" type="date" required defaultValue={initialEvent?.startsAt.slice(0, 10) ?? weddingFixture.events[0]?.startsAt.slice(0, 10)} />
        <Input id="event-start" name="startTime" label="Start time" type="time" required defaultValue={initialEvent?.startsAt.slice(11, 16) ?? ""} />
        <Input id="event-end" name="endTime" label="End time" type="time" defaultValue={initialEvent?.endsAt.slice(11, 16) ?? ""} helperText="Optional; on the selected event date." />
        <Input id="event-venue" name="venue" label="Venue" defaultValue={initialEvent?.venue.name ?? ""} />
        <Input id="event-map" name="googleMapsUrl" label="Google Maps link" type="url" pattern="https?://.+" defaultValue={initialEvent?.venue.googleMapsUrl ?? ""} helperText="Optional; use an http:// or https:// link." />
        <Input id="event-dress" name="dressCode" label="Dress code" defaultValue={initialEvent?.dressCode ?? ""} />
        <Input id="event-rsvp" name="rsvpDeadline" label="RSVP deadline" type="datetime-local" defaultValue={initialEvent?.rsvpDeadline.slice(0, 16) ?? ""} />
        <Input id="event-live" name="youtubeLiveUrl" label="YouTube Live link" type="url" pattern="https?://.+" defaultValue={initialEvent?.youtubeLiveUrl ?? ""} />
        <div className="md:col-span-2">
          <Input id="event-invitation" name="invitationFilename" label="Invitation filename" defaultValue={initialEvent?.invitationAsset?.filename ?? ""} helperText="Filename only for this prototype; no file is uploaded. Leave blank if not added." />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{initialEvent ? "Save changes" : "Add event"}</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
