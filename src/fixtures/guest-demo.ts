import { weddingFixture, type WeddingEvent } from "./wedding";
import type { GuestRsvp } from "../components/wedding/guest-rsvp";

export type GuestEvent = Pick<WeddingEvent, "id" | "name" | "startsAt" | "endsAt" | "timezone" | "dressCode" | "rsvpDeadline" | "youtubeLiveUrl"> & {
  venue: { name: string; address: string; googleMapsUrl: string };
  invitationFilename: string | null;
  rsvpClosed: boolean;
};

// Called by the route, never imported at runtime by guest client components.
// Explicitly project public fields so organiser notes/data aren't serialized.
export function guestDemo({ householdId = "reddy", closed = false, empty = false } = {}) {
  const household = weddingFixture.households.find((item) => item.id === householdId) ?? weddingFixture.households[0];
  const coordinator = weddingFixture.households.find((item) => item.id === "reddy")!;
  // Fixed demo clock keeps RSVP usable after the real calendar passes 2026.
  // The closed preview is only selectable in development, at the route boundary.
  const referenceNow = closed ? "2026-12-11T12:00:00+05:30" : "2026-11-30T12:00:00+05:30";
  const invitedEvents = weddingFixture.events.filter((event) => !empty && household.invitedEventIds.includes(event.id));
  const events: GuestEvent[] = invitedEvents.map((event) => ({
    id: event.id, name: event.name, startsAt: event.startsAt, endsAt: event.endsAt,
    timezone: event.timezone, dressCode: event.dressCode, rsvpDeadline: event.rsvpDeadline,
    youtubeLiveUrl: event.youtubeLiveUrl,
    venue: { name: event.venue.name, address: event.venue.address, googleMapsUrl: event.venue.googleMapsUrl },
    invitationFilename: event.invitationAsset?.filename ?? null,
    rsvpClosed: Boolean(event.rsvpDeadline && Date.parse(referenceNow) >= Date.parse(event.rsvpDeadline)),
  }));
  const responses: Record<string, GuestRsvp> = {};
  for (const event of events) {
    const summary = household.rsvpSummary[event.id];
    // Summaries don't carry attendance counts. Confirmed demo responses use the
    // household's invited allocation; these are fixtures, not persisted RSVPs.
    if (summary === "Confirmed") responses[event.id] = { response: "YES", adultsAttending: household.adultsInvited, childrenAttending: household.childrenInvited };
    if (summary === "Declined") responses[event.id] = { response: "NO", adultsAttending: 0, childrenAttending: 0 };
  }
  return {
    identity: { coupleNames: weddingFixture.identity.coupleNames, dateRange: weddingFixture.identity.dateRange, location: weddingFixture.identity.location },
    household: { id: household.id, householdName: household.householdName, adultsInvited: household.adultsInvited, childrenInvited: household.childrenInvited },
    events,
    responses,
    photos: weddingFixture.photos.filter((photo) => photo.status === "APPROVED" && events.some((event) => event.id === photo.eventId)).map((photo) => ({ id: photo.id, eventId: photo.eventId, originalFilename: photo.originalFilename, previewUrl: photo.previewUrl })),
    uploadHref: events.some((event) => event.id === weddingFixture.photoUploadEventId) ? "/upload/demo" : null,
    help: { name: coordinator.primaryContactName, phone: coordinator.phone },
  };
}

export type GuestDemo = ReturnType<typeof guestDemo>;
