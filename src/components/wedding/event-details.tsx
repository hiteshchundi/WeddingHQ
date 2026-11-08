"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { PageHeader } from "../layout/page-header";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EventForm } from "./event-form";
import { eventDate, eventTime } from "./event-format";
import { useWeddingEvents } from "./events-context";

export function EventDetails({ weddingId, eventId }: { weddingId: string; eventId: string }) {
  const { events, saveEvent } = useWeddingEvents();
  const event = events.find((item) => item.id === eventId);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
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
              onSave={(updated) => { saveEvent(updated); setSaved(true); finishEditing(); }}
            />
          </Card>
        ) : (
          <>
            {saved ? <p role="status" className="text-sm font-semibold">Event updated for this session.</p> : null}
            <p className="text-secondary-text">
              <time dateTime={event.startsAt}>{eventDate(event.startsAt, event.timezone, true)} · {eventTime(event.startsAt, event.timezone)}</time>
            </p>
            <Link href={`${basePath}/guests?eventId=${encodeURIComponent(event.id)}`} prefetch={false} className={linkClass}>View guests</Link>
            <div className="grid gap-6 md:grid-cols-2">
              <section aria-labelledby="event-core-title" className="md:col-span-2">
                <Card className="space-y-4">
                  <h2 id="event-core-title" className="text-2xl font-semibold">Event details</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <div><dt className="text-sm text-secondary-text">Date</dt><dd>{eventDate(event.startsAt, event.timezone, true)}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Start time</dt><dd>{eventTime(event.startsAt, event.timezone)}</dd></div>
                    {event.endsAt ? <div><dt className="text-sm text-secondary-text">End time</dt><dd>{eventTime(event.endsAt, event.timezone)}</dd></div> : null}
                    <div><dt className="text-sm text-secondary-text">Venue</dt><dd className="break-words">{event.venue.name || "Not added"}</dd>{event.venue.name && event.venue.address ? <dd className="text-sm text-secondary-text">{event.venue.address}</dd> : null}</div>
                    <div><dt className="text-sm text-secondary-text">Google Maps</dt><dd>{event.venue.googleMapsUrl ? <a href={event.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Open in Maps</a> : "Not added"}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Dress code</dt><dd className="break-words">{event.dressCode || "Not added"}</dd></div>
                  </dl>
                </Card>
              </section>
              <section aria-labelledby="invitation-title">
                <Card className="h-full space-y-4">
                  <h2 id="invitation-title" className="text-2xl font-semibold">Invitation</h2>
                  <p className="break-words">{event.invitationAsset?.filename || "No invitation has been added."}</p>
                  {event.invitationAsset ? <p className="text-sm text-secondary-text">Added · filename preview only</p> : null}
                </Card>
              </section>
              <section aria-labelledby="rsvp-title">
                <Card className="h-full space-y-4">
                  <h2 id="rsvp-title" className="text-2xl font-semibold">RSVP</h2>
                  <dl className="space-y-4">
                    <div><dt className="text-sm text-secondary-text">RSVP deadline</dt><dd>{event.rsvpDeadline ? `${eventDate(event.rsvpDeadline, event.timezone, true)} · ${eventTime(event.rsvpDeadline, event.timezone)}` : "Not set"}</dd></div>
                    <div><dt className="text-sm text-secondary-text">Invited households</dt><dd>{event.invitedHouseholds}</dd></div>
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
          </>
        )}
      </main>
    </>
  );
}
