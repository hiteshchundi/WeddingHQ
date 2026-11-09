import type { Household, WeddingEvent } from "../../fixtures/wedding";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function HouseholdDetail({ household, events, onEdit }: {
  household: Household;
  events: WeddingEvent[];
  onEdit: () => void;
}) {
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
        <p className="text-sm text-secondary-text">RSVP summary · fixture replies only</p>
        <dl className="space-y-3">
          {events.filter((event) => household.invitedEventIds.includes(event.id)).map((event) => (
            <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <dt className="min-w-0 break-words">{event.name}</dt>
              <dd><Badge>{household.rsvpSummary[event.id] ?? "Awaiting"}</Badge></dd>
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
        <Button variant="secondary" disabled>Send invitation</Button>
        <Button variant="secondary" disabled>Regenerate guest link</Button>
      </div>
      <p className="text-sm text-secondary-text">Invitations and guest links will be available in a later phase. Link status is display data only.</p>
    </div>
  );
}
