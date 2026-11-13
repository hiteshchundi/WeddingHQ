"use client";

import { EventCard } from "./event-card";
import { useWeddingEvents } from "./events-context";

export function UpcomingEvents({ basePath }: { basePath: string }) {
  const { events } = useWeddingEvents();
  if (!events.length) return <p className="text-sm text-secondary-text">No events yet. Add your first event from Events.</p>;
  return (
    <ul className="space-y-4">
      {events.slice(0, 3).map((event) => (
        <EventCard key={event.id} event={event} href={`${basePath}/events/${event.id}`} compact />
      ))}
    </ul>
  );
}
