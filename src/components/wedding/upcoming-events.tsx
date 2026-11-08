"use client";

import { EventCard } from "./event-card";
import { useWeddingEvents } from "./events-context";

export function UpcomingEvents({ basePath }: { basePath: string }) {
  const { events } = useWeddingEvents();
  return (
    <ul className="space-y-4">
      {events.slice(0, 3).map((event) => (
        <EventCard key={event.id} event={event} href={`${basePath}/events/${event.id}`} compact />
      ))}
    </ul>
  );
}
