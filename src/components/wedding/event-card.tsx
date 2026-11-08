import Link from "next/link";
import type { WeddingEvent } from "../../fixtures/wedding";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { eventDate, eventTime } from "./event-format";

type EventCardProps = {
  event: WeddingEvent;
  href: string;
  compact?: boolean;
};

export function EventCard({ event, href, compact = false }: EventCardProps) {
  return (
    <li>
      <Link href={href} prefetch={false} className="block rounded-lg hover:underline">
        <Card className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="min-w-0 break-words text-lg font-semibold">{event.name}</h3>
            {event.relativeTime ? <p className="shrink-0 text-right text-sm text-secondary-text">{event.relativeTime}</p> : null}
          </div>
          <time dateTime={event.startsAt} className="block text-sm text-secondary-text">
            {eventDate(event.startsAt, event.timezone, !compact)} · {eventTime(event.startsAt, event.timezone)}
          </time>
          {!compact ? (
            <>
              <p className="break-words text-sm">{event.venue.name || "Venue not added"}</p>
              <p className="text-sm text-secondary-text">{event.invitedHouseholds} households invited</p>
              <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm md:grid-cols-4">
                <div><dt className="mb-1 text-secondary-text">Venue</dt><dd><Badge>{event.venue.name ? "Complete" : "Not added"}</Badge></dd></div>
                <div><dt className="mb-1 text-secondary-text">Invitation</dt><dd><Badge>{event.invitationAsset ? "Added" : "Not added"}</Badge></dd></div>
                <div><dt className="mb-1 text-secondary-text">RSVP deadline</dt><dd><Badge>{event.rsvpDeadline ? "Set" : "Not set"}</Badge></dd></div>
                <div><dt className="mb-1 text-secondary-text">Livestream</dt><dd><Badge>{event.youtubeLiveUrl ? "Added" : "Not added"}</Badge></dd></div>
              </dl>
            </>
          ) : null}
        </Card>
      </Link>
    </li>
  );
}
