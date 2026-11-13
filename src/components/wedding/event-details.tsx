"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDTO } from "../../types/wedding";
import { PageHeader } from "../layout/page-header";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EventForm } from "./event-form";
import { eventDate, eventTime } from "./event-format";
import { eventView, useWeddingEvents } from "./events-context";

export function EventDetails({ weddingId, eventId, initialEvent }: { weddingId: string; eventId: string; initialEvent?: EventDTO }) {
  const { events, saveEvent, deleteEvent, persistent, wedding } = useWeddingEvents();
  const event = events.find((item) => item.id === eventId) ?? (initialEvent ? eventView(initialEvent) : undefined);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();
  const editButton = useRef<HTMLButtonElement>(null);
  const basePath = `/weddings/${encodeURIComponent(weddingId)}`;
  const linkClass = "inline-flex min-h-[44px] items-center rounded-md text-sm font-semibold underline underline-offset-4";

  function finishEditing() {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus());
  }

  return (
    <>
      <PageHeader
        title={!event ? "Event not found" : editing ? "Edit event" : event.name}
        action={event && !editing ? <Button ref={editButton} onClick={() => { setSaved(false); setEditing(true); }}>Edit event</Button> : undefined}
      />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <Link href={`${basePath}/events`} className={linkClass}>Back to events</Link>
        {!event ? (
          <Card><p>This event isn&apos;t available in this prototype session.</p></Card>
        ) : editing ? (
          <Card>
            <EventForm
              initialEvent={event}
              onCancel={finishEditing}
              onSave={async (updated) => { await saveEvent(updated); setSaved(true); finishEditing(); }}
            />
          </Card>
        ) : (
          <>
            {saved ? <p role="status" className="text-sm font-semibold">{persistent ? "Event saved." : "Event updated for this demo session."}</p> : null}
            <p className="text-secondary-text">
              <time dateTime={event.startsAt}>{eventDate(event.startsAt, event.timezone, true)} · {eventTime(event.startsAt, event.timezone)}</time>
            </p>
            {persistent ? <p className="text-sm text-secondary-text">Guest invitations are not connected yet.</p> : <Link href={`${basePath}/guests?eventId=${encodeURIComponent(event.id)}`} prefetch={false} className={linkClass}>View guests</Link>}
            <div className="grid gap-6 md:grid-cols-2">
              <section aria-labelledby="event-core-title" className="md:col-span-2">
                <Card className="space-y-4">
                  <h2 id="event-core-title" className="text-2xl font-semibold">Event details</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <div><dt className="text-sm text-secondary-text">Type</dt><dd>{event.type === "CUSTOM" ? event.customType : event.type}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Timezone</dt><dd>{event.timezone}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Date</dt><dd>{eventDate(event.startsAt, event.timezone, true)}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Start time</dt><dd>{eventTime(event.startsAt, event.timezone)}</dd></div>
                    {event.endsAt ? <div><dt className="text-sm text-secondary-text">End time</dt><dd>{eventTime(event.endsAt, event.timezone)}</dd></div> : null}
                    <div><dt className="text-sm text-secondary-text">Venue</dt><dd className="break-words">{event.venue.name || "Not added"}</dd>{event.venue.name && event.venue.address ? <dd className="text-sm text-secondary-text">{event.venue.address}</dd> : null}</div>
                    <div><dt className="text-sm text-secondary-text">Google Maps</dt><dd>{event.venue.googleMapsUrl ? <a href={event.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Open in Maps</a> : "Not added"}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Dress code</dt><dd className="break-words">{event.dressCode || "Not added"}</dd></div>
                  </dl>
                  {event.description ? <p className="break-words">{event.description}</p> : null}
                </Card>
              </section>
              <section aria-labelledby="invitation-title">
                <Card className="h-full space-y-4">
                  <h2 id="invitation-title" className="text-2xl font-semibold">Invitation</h2>
                  <p className="break-words">{event.invitationAsset?.filename || "No invitation has been added."}</p>
                  <p className="text-sm text-secondary-text">{persistent ? "Invitation uploads are not connected yet." : event.invitationAsset ? "Added · filename preview only" : ""}</p>
                </Card>
              </section>
              <section aria-labelledby="rsvp-title">
                <Card className="h-full space-y-4">
                  <h2 id="rsvp-title" className="text-2xl font-semibold">RSVP</h2>
                  <dl className="space-y-4">
                    <div><dt className="text-sm text-secondary-text">RSVP deadline</dt><dd>{event.rsvpDeadline || wedding?.rsvpDefaultDeadline ? `${eventDate(event.rsvpDeadline || wedding!.rsvpDefaultDeadline!, event.timezone, true)} · ${eventTime(event.rsvpDeadline || wedding!.rsvpDefaultDeadline!, event.timezone)}${!event.rsvpDeadline ? " (wedding default)" : ""}` : "Not set"}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Invited households</dt><dd>{persistent ? "Not connected yet" : event.invitedHouseholds}</dd></div>
                  </dl>
                </Card>
              </section>
              <section aria-labelledby="livestream-title" className="md:col-span-2">
                <Card className="space-y-4">
                  <h2 id="livestream-title" className="text-2xl font-semibold">Livestream</h2>
                  {event.youtubeLiveUrl ? <a href={event.youtubeLiveUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Open YouTube Live</a> : <p className="text-secondary-text">No livestream link has been added.</p>}
                </Card>
              </section>
            </div>
            {persistent ? <section aria-label="Delete event" className="space-y-4">
              {deleteError ? <p role="alert">{deleteError}</p> : null}
              {confirmDelete ? <><p>Delete this event? This cannot be undone. Events with related records cannot be deleted yet.</p><div className="flex flex-wrap gap-3">
                <Button disabled={deleting} onClick={async () => {
                  setDeleting(true); setDeleteError("");
                  try { await deleteEvent(event.id); router.push(`${basePath}/events`); }
                  catch (error) { setDeleteError(error instanceof Error ? error.message : "We couldn’t delete this event."); setDeleting(false); }
                }}>{deleting ? "Deleting…" : "Confirm delete"}</Button><Button variant="secondary" disabled={deleting} onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div></> : <Button variant="secondary" onClick={() => setConfirmDelete(true)}>Delete event</Button>}
            </section> : null}
          </>
        )}
      </main>
    </>
  );
}
