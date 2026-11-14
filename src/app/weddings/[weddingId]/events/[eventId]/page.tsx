import { EventDetails } from "../../../../../components/wedding/event-details";
import { getEvent } from "../../../../../services/events";
import { pageData } from "../../../../../lib/page-access";
import { listHouseholds } from "../../../../../services/households";

export default async function EventPage({ params }: { params: Promise<{ weddingId: string; eventId: string }> }) {
  const { weddingId, eventId } = await params;
  const event = weddingId === "demo" ? undefined : await pageData(() => getEvent(weddingId, eventId));
  const households = weddingId === "demo" ? undefined : await pageData(() => listHouseholds(weddingId, { eventId, page: 1, limit: 1 }));
  return <EventDetails key={eventId} weddingId={weddingId} eventId={eventId} initialEvent={event} invitedHouseholds={households?.meta.total} />;
}
