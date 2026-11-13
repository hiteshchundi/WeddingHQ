import { EventDetails } from "../../../../../components/wedding/event-details";
import { getEvent } from "../../../../../services/events";
import { pageData } from "../../../../../lib/page-access";

export default async function EventPage({ params }: { params: Promise<{ weddingId: string; eventId: string }> }) {
  const { weddingId, eventId } = await params;
  const event = weddingId === "demo" ? undefined : await pageData(() => getEvent(weddingId, eventId));
  return <EventDetails key={eventId} weddingId={weddingId} eventId={eventId} initialEvent={event} />;
}
