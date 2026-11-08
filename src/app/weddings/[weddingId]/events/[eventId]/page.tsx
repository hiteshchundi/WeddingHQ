import { EventDetails } from "../../../../../components/wedding/event-details";

export default async function EventPage({ params }: { params: Promise<{ weddingId: string; eventId: string }> }) {
  const { weddingId, eventId } = await params;
  return <EventDetails key={eventId} weddingId={weddingId} eventId={eventId} />;
}
