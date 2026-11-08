import { EventsList } from "../../../../components/wedding/events-list";

export default async function EventsPage({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  return <EventsList weddingId={weddingId} />;
}
