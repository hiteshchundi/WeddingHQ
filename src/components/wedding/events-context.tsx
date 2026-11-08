"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { weddingFixture, type WeddingEvent } from "../../fixtures/wedding";

const EventsContext = createContext<{
  events: WeddingEvent[];
  saveEvent: (event: WeddingEvent) => void;
} | null>(null);

export function WeddingEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState(weddingFixture.events);

  function saveEvent(event: WeddingEvent) {
    setEvents((current) =>
      current.some((item) => item.id === event.id)
        ? current.map((item) => item.id === event.id ? event : item)
        : [...current, { ...event, order: current.length + 1 }],
    );
  }

  return (
    <EventsContext.Provider value={{
      events: [...events].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
      saveEvent,
    }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useWeddingEvents() {
  const context = useContext(EventsContext);
  if (!context) throw new Error("WeddingEventsProvider is required.");
  return context;
}
