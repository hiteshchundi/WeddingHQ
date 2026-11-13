"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { weddingFixture, type WeddingEvent } from "../../fixtures/wedding";
import { saveResource } from "../../lib/api-client";
import type { EventDTO, WeddingDTO } from "../../types/wedding";

export function eventView(event: EventDTO): WeddingEvent {
  return { ...event, customType: event.customType ?? undefined, description: event.description ?? undefined,
    endsAt: event.endsAt ?? "", venue: { name: event.venue.name ?? "", address: event.venue.address ?? "", googleMapsUrl: event.venue.googleMapsUrl ?? "" },
    dressCode: event.dressCode ?? "", rsvpDeadline: event.rsvpDeadline ?? "", youtubeLiveUrl: event.youtubeLiveUrl ?? "", invitedHouseholds: 0 };
}

const EventsContext = createContext<{
  events: WeddingEvent[];
  wedding?: WeddingDTO;
  persistent: boolean;
  saveEvent: (event: WeddingEvent) => Promise<WeddingEvent>;
  deleteEvent: (id: string) => Promise<void>;
} | null>(null);

export function WeddingEventsProvider({ children, wedding, initialEvents }: { children: ReactNode; wedding?: WeddingDTO; initialEvents?: EventDTO[] }) {
  const [events, setEvents] = useState(() => initialEvents ? initialEvents.map(eventView) : weddingFixture.events);

  async function saveEvent(event: WeddingEvent) {
    let saved = event;
    if (wedding) {
      const existing = events.some((item) => item.id === event.id);
      const body = { name: event.name, type: event.type, customType: event.customType || null, description: event.description || null,
        startsAt: event.startsAt, endsAt: event.endsAt || null, timezone: event.timezone,
        venue: { name: event.venue.name || null, address: event.venue.address || null, googleMapsUrl: event.venue.googleMapsUrl || null },
        dressCode: event.dressCode || null, rsvpDeadline: event.rsvpDeadline || null, youtubeLiveUrl: event.youtubeLiveUrl || null,
        order: existing ? event.order : events.length,
      };
      saved = eventView(await saveResource<EventDTO>(`/api/v1/weddings/${wedding.id}/events${existing ? `/${event.id}` : ""}`, existing ? "PATCH" : "POST", body));
    }
    setEvents((current) =>
      current.some((item) => item.id === saved.id)
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved],
    );
    return saved;
  }
  async function deleteEvent(id: string) {
    if (wedding) await saveResource(`/api/v1/weddings/${wedding.id}/events/${id}`, "DELETE");
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  return (
    <EventsContext.Provider value={{
      events: [...events].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
      saveEvent,
      deleteEvent, wedding, persistent: Boolean(wedding),
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
