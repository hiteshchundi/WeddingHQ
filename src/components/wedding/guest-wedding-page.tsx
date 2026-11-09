"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { GuestDemo } from "../../fixtures/guest-demo";
import { AppearanceControl } from "../theme/appearance-control";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { eventDate, eventTime } from "./event-format";
import { GuestRsvpPanel } from "./guest-rsvp-panel";
import { guestRsvpLabels } from "./guest-rsvp";
import { PhotoPreview } from "./photo-preview";

const actionClass = "inline-flex min-h-[44px] items-center rounded-md font-semibold underline underline-offset-4";

export function GuestWeddingPage({ data }: { data: GuestDemo }) {
  const [responses, setResponses] = useState(data.responses);
  const [eventId, setEventId] = useState<string | null>(null);
  const [photoEvent, setPhotoEvent] = useState("");
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const eventButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const selected = data.events.find((event) => event.id === eventId);
  const photos = data.photos.filter((photo) => !photoEvent || photo.eventId === photoEvent);

  function openEvent(id: string) {
    setEventId(id);
    requestAnimationFrame(() => { detailTitle.current?.focus(); detailTitle.current?.scrollIntoView({ block: "start" }); });
  }
  function closeEvent() {
    setEventId(null);
    requestAnimationFrame(() => eventId && eventButtons.current[eventId]?.focus());
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-6 md:px-8 md:py-12">
      <a href="#guest-events" className="organiser-skip-link">Skip to your events</a>
      <header id="guest-home" className="space-y-6">
        <div className="flex items-start justify-between gap-4"><div className="min-w-0 space-y-3"><h1 className="break-words font-editorial text-4xl md:text-5xl">{data.identity.coupleNames}</h1><p>{data.identity.dateRange}<br />{data.identity.location}</p></div><AppearanceControl /></div>
        <p className="max-w-xl font-editorial text-2xl">We&apos;re so glad you&apos;re part of our celebration.</p>
        <p>Welcome, {data.household.householdName}.</p>
        <nav aria-label="Wedding sections" className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-2"><a href="#guest-home" className={actionClass}>Home</a><a href="#guest-events" className={actionClass}>Events</a><a href="#guest-photos" className={actionClass}>Photos</a><a href="#guest-help" className={actionClass}>Help</a></nav>
      </header>
      <main className="space-y-8">
        <section id="guest-events" aria-labelledby="guest-events-title" className="scroll-mt-6 space-y-6">
          <h2 id="guest-events-title" className="text-2xl font-semibold">Your events</h2>
          <p className="text-secondary-text">These events are included in your household&apos;s invitation. Times are in India Standard Time.</p>
          {!data.events.length ? <Card><p>No events are available for this invitation.</p></Card> : <ul className="grid gap-4 md:grid-cols-3">{data.events.map((event) => <li key={event.id} className="min-w-0"><button ref={(button) => { eventButtons.current[event.id] = button; }} onClick={() => openEvent(event.id)} aria-expanded={selected?.id === event.id} aria-controls="guest-event-detail" className="flex h-full w-full flex-col items-start gap-4 rounded-lg border border-border bg-surface p-6 text-left hover:border-sage">
            <h3 className="font-editorial text-2xl">{event.name}</h3>
            <p><time dateTime={event.startsAt}>{eventDate(event.startsAt, event.timezone, true)}<br />{eventTime(event.startsAt, event.timezone)}</time></p>
            <p className="break-words">{event.venue.name || "Venue details to follow"}</p>
            <Badge className="text-sm">{responses[event.id] ? guestRsvpLabels[responses[event.id].response] : "Awaiting RSVP"}</Badge>
            <span className="mt-auto min-h-[44px] content-center font-semibold underline underline-offset-4">View event &amp; RSVP</span>
          </button></li>)}</ul>}
          <div id="guest-event-detail">
            {selected ? <Card className="space-y-6">
              <Button variant="tertiary" className="text-base" onClick={closeEvent}>Back to your events</Button>
              <h2 ref={detailTitle} tabIndex={-1} className="scroll-mt-6 font-editorial text-3xl">{selected.name}</h2>
              <p><time dateTime={selected.startsAt}>{eventDate(selected.startsAt, selected.timezone, true)} · {eventTime(selected.startsAt, selected.timezone)}{selected.endsAt ? `–${eventTime(selected.endsAt, selected.timezone)}` : ""}</time><br /><span className="text-secondary-text">India Standard Time</span></p>
              <div className="grid gap-6 md:grid-cols-2">
                <section className="space-y-3" aria-labelledby="guest-venue-title"><h3 id="guest-venue-title" className="text-lg font-semibold">Venue</h3><p className="break-words">{selected.venue.name || "Venue details to follow"}</p>{selected.venue.address ? <p>{selected.venue.address}</p> : null}{selected.venue.googleMapsUrl ? <a href={selected.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>Open in Maps</a> : null}</section>
                {selected.dressCode ? <section className="space-y-3" aria-labelledby="guest-dress-title"><h3 id="guest-dress-title" className="text-lg font-semibold">Dress code</h3><p>{selected.dressCode}</p></section> : null}
                <section className="space-y-3" aria-labelledby="guest-invitation-title"><h3 id="guest-invitation-title" className="text-lg font-semibold">Invitation</h3>{selected.invitationFilename ? <><p className="break-words">{selected.invitationFilename}</p><p className="text-secondary-text">Invitation added · file preview unavailable in this prototype.</p></> : <p>The invitation will be shared here when it&apos;s ready.</p>}</section>
                {selected.youtubeLiveUrl ? <section className="space-y-3" aria-labelledby="guest-live-title"><h3 id="guest-live-title" className="text-lg font-semibold">Livestream</h3><a href={selected.youtubeLiveUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>Watch livestream</a></section> : null}
              </div>
              <div className="border-t border-border pt-6"><GuestRsvpPanel key={selected.id} event={selected} household={data.household} value={responses[selected.id]} onSave={(value) => setResponses((current) => ({ ...current, [selected.id]: value }))} /></div>
            </Card> : null}
          </div>
        </section>
        <section id="guest-photos" aria-labelledby="guest-photos-title" className="scroll-mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="guest-photos-title" className="text-2xl font-semibold">Photos</h2>{data.uploadHref ? <Link href={data.uploadHref} className={actionClass}>Share photos</Link> : null}</div>
          <p className="text-secondary-text">A few moments from your invited events, shared with the couple&apos;s approval.</p>
          {data.photos.length ? <div className="grid max-w-sm gap-2"><label htmlFor="guest-photo-event" className="font-medium">Event</label><select id="guest-photo-event" value={photoEvent} onChange={(event) => setPhotoEvent(event.target.value)} className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-base"><option value="">All events</option>{data.events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div> : null}
          {photos.length ? <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">{photos.map((photo) => <li key={photo.id} className="min-w-0 space-y-3 rounded-lg border border-border bg-surface p-3"><PhotoPreview previewUrl={photo.previewUrl} filename={photo.originalFilename} /><p className="break-words">{data.events.find((event) => event.id === photo.eventId)?.name}</p><Badge className="text-sm">Approved</Badge></li>)}</ul> : <Card><p>No photos have been shared yet.</p></Card>}
        </section>
        <section id="guest-help" aria-labelledby="guest-help-title" className="scroll-mt-6"><Card className="space-y-4"><h2 id="guest-help-title" className="text-2xl font-semibold">Need help?</h2><p>For questions about the celebration or your RSVP, contact the family.</p><p>{data.help.name} · Family contact</p><a href={`tel:${data.help.phone.replace(/\s/g, "")}`} className={actionClass}>{data.help.phone}</a></Card></section>
      </main>
      <footer className="space-y-3 border-t border-border pt-6 text-sm text-secondary-text"><p>Powered by Wedding HQ</p><p>Prototype invitation · responses stay on this page and reset on reload. Organiser summaries and photos do not update across routes.</p></footer>
    </div>
  );
}
