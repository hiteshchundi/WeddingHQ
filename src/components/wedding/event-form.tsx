"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { weddingFixture, type WeddingEvent } from "../../fixtures/wedding";
import { localDateTime, zonedInstant } from "../../lib/datetime";
import { eventTypes } from "../../types/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useWeddingEvents } from "./events-context";

export function EventForm({ initialEvent, onSave, onCancel }: {
  initialEvent?: WeddingEvent;
  onSave: (event: WeddingEvent) => Promise<void>;
  onCancel: () => void;
}) {
  const { wedding, persistent } = useWeddingEvents();
  const nameInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<WeddingEvent["type"]>(initialEvent?.type ?? "CUSTOM");
  const timezone = initialEvent?.timezone ?? wedding?.timezone ?? weddingFixture.timezone;
  const start = initialEvent ? localDateTime(initialEvent.startsAt, timezone) : "";
  const end = initialEvent?.endsAt ? localDateTime(initialEvent.endsAt, timezone) : "";
  useEffect(() => { nameInput.current?.focus(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    setError(""); setSaving(true);
    try {
      const zone = read("timezone");
      const startsAt = zonedInstant(`${read("date")}T${read("startTime")}`, zone);
      const endsAt = read("endTime") ? zonedInstant(`${read("endDate") || read("date")}T${read("endTime")}`, zone) : "";
      if (endsAt && Date.parse(endsAt) < Date.parse(startsAt)) throw new Error("End time cannot be before start time.");
      const filename = read("invitationFilename");
      await onSave({
        id: initialEvent?.id ?? crypto.randomUUID(), name: read("name"), type,
        customType: type === "CUSTOM" ? read("customType") : undefined, description: read("description"),
        startsAt, endsAt, timezone: zone,
        venue: { name: read("venue"), address: read("address"), googleMapsUrl: read("googleMapsUrl") },
        dressCode: read("dressCode"), invitationAsset: persistent ? initialEvent?.invitationAsset ?? null : filename ? { filename } : null,
        rsvpDeadline: read("rsvpDeadline") ? zonedInstant(read("rsvpDeadline"), zone) : "",
        youtubeLiveUrl: read("youtubeLiveUrl"), invitedHouseholds: initialEvent?.invitedHouseholds ?? 0,
        order: initialEvent?.order ?? 0,
      });
    } catch (error) { setError(error instanceof Error ? error.message : "We couldn’t save the event. Please try again."); }
    finally { setSaving(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-6" aria-busy={saving}>
      <p className="text-sm text-secondary-text">Fields marked * are required. Times use the selected timezone. {persistent ? "Changes are saved to your wedding." : "Demo changes reset on reload."}</p>
      {error ? <p role="alert" className="font-semibold">{error}</p> : null}
      <fieldset disabled={saving} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><Input ref={nameInput} id="event-name" name="name" label="Event name *" autoComplete="off" required maxLength={200} defaultValue={initialEvent?.name ?? ""} /></div>
        <div className="grid gap-2"><label htmlFor="event-type" className="text-sm font-medium">Event type *</label><select id="event-type" name="type" value={type} onChange={(event) => setType(event.target.value as WeddingEvent["type"])} className="min-h-[44px] rounded-md border border-border bg-surface px-3">{eventTypes.map((value) => <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>)}</select></div>
        {type === "CUSTOM" ? <Input id="event-custom-type" name="customType" label="Custom type *" required maxLength={100} defaultValue={initialEvent?.customType ?? ""} /> : null}
        <Input id="event-timezone" name="timezone" label="Timezone *" required maxLength={100} defaultValue={timezone} helperText="IANA timezone, for example Asia/Kolkata." />
        <Input id="event-date" name="date" label="Date *" type="date" required defaultValue={start.slice(0, 10) || (wedding ? localDateTime(wedding.startDate, timezone).slice(0, 10) : weddingFixture.identity.startDate)} />
        <Input id="event-start" name="startTime" label="Start time *" type="time" required defaultValue={start.slice(11, 16)} />
        <Input id="event-end-date" name="endDate" label="End date" type="date" defaultValue={end.slice(0, 10)} helperText="Leave blank to use the start date." />
        <Input id="event-end" name="endTime" label="End time" type="time" defaultValue={end.slice(11, 16)} />
        <Input id="event-description" name="description" label="Description" maxLength={5000} defaultValue={initialEvent?.description ?? ""} />
        <Input id="event-venue" name="venue" label="Venue" maxLength={300} defaultValue={initialEvent?.venue.name ?? ""} />
        <Input id="event-address" name="address" label="Venue address" maxLength={1000} defaultValue={initialEvent?.venue.address ?? ""} />
        <Input id="event-map" name="googleMapsUrl" label="Google Maps link" type="url" pattern="https?://.+" maxLength={2048} defaultValue={initialEvent?.venue.googleMapsUrl ?? ""} />
        <Input id="event-dress" name="dressCode" label="Dress code" maxLength={500} defaultValue={initialEvent?.dressCode ?? ""} />
        <Input id="event-rsvp" name="rsvpDeadline" label="RSVP deadline" type="datetime-local" defaultValue={initialEvent?.rsvpDeadline ? localDateTime(initialEvent.rsvpDeadline, timezone).slice(0, 16) : ""} helperText="Leave blank to use the wedding default, if set." />
        <Input id="event-live" name="youtubeLiveUrl" label="YouTube Live link" type="url" pattern="https?://.+" maxLength={2048} defaultValue={initialEvent?.youtubeLiveUrl ?? ""} />
        <div className="md:col-span-2"><Input id="event-invitation" name="invitationFilename" label="Invitation filename" disabled={persistent} defaultValue={initialEvent?.invitationAsset?.filename ?? ""} helperText={persistent ? "Invitation uploads are not connected yet." : "Filename preview only; no file is uploaded."} /></div>
      </fieldset>
      <div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving}>{saving ? "Saving…" : initialEvent ? "Save changes" : "Add event"}</Button><Button variant="secondary" disabled={saving} onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
