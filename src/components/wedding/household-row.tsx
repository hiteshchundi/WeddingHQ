import type { Household, WeddingEvent } from "../../fixtures/wedding";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export function HouseholdRow({ household, events, onOpen }: {
  household: Household;
  events: WeddingEvent[];
  onOpen: () => void;
}) {
  return (
    <li>
      <Card className="grid gap-4 lg:grid-cols-[2fr_1fr_1.5fr_1.5fr]">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">
            <button type="button" onClick={onOpen} aria-haspopup="dialog" className="min-h-[44px] max-w-full break-words rounded-md text-left underline underline-offset-4">{household.householdName}</button>
          </h3>
          <p className="break-words text-sm">{household.primaryContactName || "Contact not added"}</p>
          {household.email ? <p className="break-words text-sm text-secondary-text">{household.email}</p> : null}
        </div>
        <dl className="min-w-0 text-sm">
          <dt className="mb-2 text-secondary-text">Guests invited</dt>
          <dd>{household.adultsInvited} {household.adultsInvited === 1 ? "adult" : "adults"} · {household.childrenInvited} {household.childrenInvited === 1 ? "child" : "children"}</dd>
        </dl>
        <dl className="min-w-0 text-sm">
          <dt className="mb-2 text-secondary-text">Invited events</dt>
          <dd className="break-words">{events.filter((event) => household.invitedEventIds.includes(event.id)).map((event) => event.name).join(" · ")}</dd>
        </dl>
        <dl className="min-w-0 space-y-2 text-sm">
          <dt className="text-secondary-text">RSVP by event</dt>
          {events.filter((event) => household.invitedEventIds.includes(event.id)).map((event) => (
            <dd key={event.id} className="flex flex-wrap items-center gap-2"><span className="min-w-0 break-words">{event.name}</span><Badge>{household.rsvpSummary[event.id] ?? "Awaiting"}</Badge></dd>
          ))}
        </dl>
      </Card>
    </li>
  );
}
