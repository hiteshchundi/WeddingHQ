"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { weddingFixture } from "../../fixtures/wedding";
import { PageHeader } from "../layout/page-header";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IconButton } from "../ui/icon-button";
import { useWeddingEvents } from "./events-context";
import { PhotoPreview } from "./photo-preview";

const views = ["PENDING", "APPROVED"] as const;
const labels = { PENDING: "Pending review", APPROVED: "Approved", REJECTED: "Rejected" };
const uploadTime = new Intl.DateTimeFormat("en-US", { timeZone: weddingFixture.timezone, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

export function PhotosPage() {
  const { events } = useWeddingEvents();
  const [photos, setPhotos] = useState(weddingFixture.photos);
  const [view, setView] = useState<(typeof views)[number]>("PENDING");
  const [eventFilter, setEventFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = photos.find((photo) => photo.id === selectedId);
  const visible = photos.filter((photo) => photo.status === view && (!eventFilter || photo.eventId === eventFilter));
  const eventName = (id: string) => events.find((event) => event.id === id)?.name ?? "Unavailable event";

  useEffect(() => {
    if (selectedId) {
      if (!drawer.current?.open) drawer.current?.showModal();
      drawer.current?.querySelector<HTMLElement>("h2")?.focus();
    } else drawer.current?.close();
  }, [selectedId]);

  function moderate(status: "APPROVED" | "REJECTED") {
    if (!selected || selected.status !== "PENDING") return;
    setPhotos((current) => current.map((photo) => photo.id === selected.id ? { ...photo, status } : photo));
    setNotice(`${selected.originalFilename} ${status === "APPROVED" ? "approved. It is now in the Approved gallery preview" : "rejected and removed from Pending review"}.`);
    setSelectedId(null);
    requestAnimationFrame(() => tabs.current[views.indexOf(view)]?.focus());
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" || event.key === "ArrowLeft" ? 1 - index : event.key === "Home" ? 0 : event.key === "End" ? 1 : null;
    if (next === null) return;
    event.preventDefault(); setView(views[next]); tabs.current[next]?.focus();
  }
  return (
    <>
      <PageHeader title="Photos" />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <p className="text-sm text-secondary-text">These {weddingFixture.photos.length} sample photos represent a subset of the collection. Overview keeps its demo total of {weddingFixture.summary.photosAwaitingReview} awaiting review. Changes reset when you leave this page or reload.</p>
        <div role="tablist" aria-label="Photo views" className="flex flex-wrap gap-2">
          {views.map((status, index) => <Button key={status} ref={(element) => { tabs.current[index] = element; }} id={`photo-tab-${status}`} role="tab" aria-selected={view === status} aria-controls="photo-panel" tabIndex={view === status ? 0 : -1} variant="tertiary" className="aria-selected:bg-sage-soft" onClick={() => setView(status)} onKeyDown={(event) => tabKey(event, index)}>{labels[status]} · {photos.filter((photo) => photo.status === status).length}</Button>)}
        </div>
        <div className="grid max-w-sm gap-2"><label htmlFor="photo-event-filter" className="text-sm font-medium">Event</label><select id="photo-event-filter" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className="min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text"><option value="">All events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select><p className="text-xs text-secondary-text">Tab counts include all events. Times use {weddingFixture.timezone}.</p></div>
        {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
        <section id="photo-panel" role="tabpanel" aria-labelledby={`photo-tab-${view}`} tabIndex={0} className="space-y-4">
          <h2 className="text-lg font-semibold">{view === "APPROVED" ? "Approved gallery preview" : "Pending review"} · {visible.length}</h2>
          {view === "APPROVED" ? <p className="text-sm text-secondary-text">Only approved photos appear in this gallery preview. Moderation changes stay in this view; the guest demo keeps its original sample gallery.</p> : null}
          {!visible.length ? <Card className="space-y-3"><h3 className="text-lg font-semibold">{view === "PENDING" ? "No photos awaiting review" : "No approved photos yet"}{eventFilter ? " for this event" : ""}</h3><p className="text-sm text-secondary-text">{view === "PENDING" ? "New photos will appear here for review." : "Photos you approve will appear here."}</p>{eventFilter ? <Button variant="secondary" onClick={() => setEventFilter("")}>Show all events</Button> : null}</Card>
            : <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">{visible.map((photo) => <li key={photo.id} className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
              <button className="block w-full text-left" aria-label={`${photo.status === "PENDING" ? "Review" : "View"} ${photo.originalFilename} · ${eventName(photo.eventId)}`} onClick={() => { setNotice(""); setSelectedId(photo.id); }}>
                <PhotoPreview previewUrl={photo.previewUrl} filename={photo.originalFilename} />
                <div className="space-y-2 p-3"><p className="break-words text-sm font-semibold">{eventName(photo.eventId)}</p><Badge>{labels[photo.status]}</Badge><p className="break-words text-xs text-secondary-text">Uploaded by {photo.uploaderLabel}</p><p className="break-words text-xs text-secondary-text"><time dateTime={photo.uploadedAt}>{uploadTime.format(new Date(photo.uploadedAt))}</time></p></div>
              </button>
            </li>)}</ul>}
        </section>
      </main>
      <dialog ref={drawer} aria-labelledby="photo-drawer-title" className="shell-dialog photo-drawer" onClose={() => setSelectedId(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface p-4 md:p-6"><h2 id="photo-drawer-title" tabIndex={-1} className="text-2xl font-semibold">Photo details</h2><IconButton aria-label="Close photo" onClick={() => setSelectedId(null)}><X size={20} /></IconButton></header>
        {selected ? <div className="space-y-6 p-4 md:p-6">
          <PhotoPreview previewUrl={selected.previewUrl} filename={selected.originalFilename} />
          <Badge>{labels[selected.status]}</Badge>
          <dl className="grid gap-4 text-sm md:grid-cols-2"><div><dt className="text-secondary-text">Event</dt><dd>{eventName(selected.eventId)}</dd></div><div><dt className="text-secondary-text">Uploaded by</dt><dd>{selected.uploaderLabel}</dd></div><div><dt className="text-secondary-text">Uploaded at</dt><dd>{uploadTime.format(new Date(selected.uploadedAt))} · {weddingFixture.timezone}</dd></div><div className="min-w-0"><dt className="text-secondary-text">File</dt><dd className="break-words">{selected.originalFilename}</dd></div></dl>
          {selected.status === "PENDING" ? <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => moderate("REJECTED")}>Reject</Button><Button onClick={() => moderate("APPROVED")}>Approve</Button></div> : <Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button>}
        </div> : null}
      </dialog>
    </>
  );
}
