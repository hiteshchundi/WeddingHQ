"use client";

import { useState } from "react";
import type { Household, WeddingEvent } from "../../fixtures/wedding";
import { Badge } from "../ui/badge";
import { HouseholdGuestActions } from "./household-guest-actions";
import { AdminRsvpForm } from "./admin-rsvp-form";
import { Button } from "../ui/button";

export function HouseholdDetail({ household, events, onEdit, persistent = false, onDelete, weddingId, defaultDeadline, onRefresh }: {
  household: Household;
  events: WeddingEvent[];
  onEdit: () => void;
  persistent?: boolean;
  onDelete?: () => Promise<void>;
  weddingId?: string; defaultDeadline?: string; onRefresh?: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-6">
      <dl className="grid gap-4 md:grid-cols-2">
        <div><dt className="text-sm text-secondary-text">Primary contact</dt><dd className="break-words">{household.primaryContactName || "Not added"}</dd></div>
        <div><dt className="text-sm text-secondary-text">Email</dt><dd className="break-words">{household.email || "Not added"}</dd></div>
        <div><dt className="text-sm text-secondary-text">Phone</dt><dd className="break-words">{household.phone || "Not added"}</dd></div>
        <div><dt className="text-sm text-secondary-text">Guests invited</dt><dd>{household.adultsInvited} {household.adultsInvited === 1 ? "adult" : "adults"} · {household.childrenInvited} {household.childrenInvited === 1 ? "child" : "children"}</dd></div>
        <div className="md:col-span-2"><dt className="text-sm text-secondary-text">Member names</dt><dd className="break-words">{household.memberNames.join(", ") || "Not added"}</dd></div>
      </dl>
      <section aria-labelledby="household-events-title" className="space-y-3">
        <h3 id="household-events-title" className="text-lg font-semibold">Invited events</h3>
        <p className="text-sm text-secondary-text">{persistent ? "Responses below are saved per invited Event." : "RSVP summary · fixture replies only"}</p>
        <dl className="space-y-3">
          {events.filter((event) => household.invitedEventIds.includes(event.id)).map((event) => (
            <div key={event.id} className="space-y-3 border-b border-border pb-4">
              <dt className="min-w-0 break-words">{event.name}</dt>
              <dd className="space-y-3"><Badge>{household.rsvpSummary[event.id] ?? "Awaiting"}</Badge>{weddingId && onRefresh ? <AdminRsvpForm weddingId={weddingId} householdId={household.id} eventId={event.id} value={household.rsvps?.find((item) => item.eventId === event.id)} deadline={event.rsvpDeadline || defaultDeadline} adultsInvited={household.adultsInvited} childrenInvited={household.childrenInvited} onRefresh={onRefresh} /> : null}</dd>
            </div>
          ))}
        </dl>
      </section>
      <dl className="space-y-4">
        <div><dt className="mb-2 text-sm text-secondary-text">Guest link status</dt><dd><Badge>{household.guestLinkStatus}</Badge></dd></div>
        <div><dt className="mb-2 text-sm text-secondary-text">Internal notes</dt><dd className="whitespace-pre-wrap break-words">{household.notes || "No internal notes added."}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onEdit}>Edit</Button>
        {!persistent ? <Button variant="secondary" disabled>Send invitation</Button> : null}
        {!persistent ? <Button variant="secondary" disabled>Regenerate guest link</Button> : null}
      </div>
      {weddingId && onRefresh ? <HouseholdGuestActions weddingId={weddingId} householdId={household.id} email={household.email} onRefresh={onRefresh} /> : null}
      {onDelete ? <section aria-label="Delete household" className="space-y-3">
        {error ? <p role="alert">{error}</p> : null}
        {confirmDelete ? <><p>Delete this household and its unsent Event assignments? This cannot be undone. Households with history cannot be deleted yet.</p><div className="flex flex-wrap gap-3">
          <Button disabled={deleting} onClick={async () => { setDeleting(true); setError(""); try { await onDelete(); } catch (error) { setError(error instanceof Error ? error.message : "The household could not be deleted."); setDeleting(false); } }}>{deleting ? "Deleting…" : "Confirm delete"}</Button>
          <Button variant="secondary" disabled={deleting} onClick={() => setConfirmDelete(false)}>Cancel</Button>
        </div></> : <Button variant="secondary" onClick={() => setConfirmDelete(true)}>Delete household</Button>}
      </section> : null}
    </div>
  );
}
