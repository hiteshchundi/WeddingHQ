import "server-only";
import { EventModel } from "../models/event";
import { EventInvitationModel } from "../models/event-invitation";
import { RsvpModel } from "../models/rsvp";
import { requireGuestSession } from "./guest-access";
import { invitedEvent } from "./rsvps";
import { rsvpDTO } from "../lib/rsvp-view";
import { eventDate } from "../components/wedding/event-format";
import type { GuestEventDTO, GuestWeddingDTO } from "../types/guest";
import type { WeddingEventRecord } from "../models/event";

function publicEvent(event: WeddingEventRecord & { _id: unknown }, weddingDeadline?: Date | null): GuestEventDTO {
  const deadline = event.rsvpDeadline ?? weddingDeadline;
  return { id: String(event._id), name: event.name, startsAt: event.startsAt.toISOString(), endsAt: event.endsAt?.toISOString() ?? "", timezone: event.timezone,
    venue: { name: event.venue?.name ?? "", address: event.venue?.address ?? "", googleMapsUrl: event.venue?.googleMapsUrl ?? "" }, dressCode: event.dressCode ?? "",
    invitationFilename: event.invitationAsset?.filename ?? null, youtubeLiveUrl: event.youtubeLiveUrl ?? "", rsvpDeadline: deadline?.toISOString() ?? "", rsvpClosed: Boolean(deadline && deadline.getTime() <= Date.now()) };
}
export async function getGuestWedding(request?: Request): Promise<GuestWeddingDTO> {
  const { household, wedding } = await requireGuestSession(request);
  const ids = await EventInvitationModel.distinct("eventId", { weddingId: wedding._id, householdId: household._id, status: "ACTIVE" });
  const events = await EventModel.find({ _id: { $in: ids }, weddingId: wedding._id }).sort({ startsAt: 1, order: 1 });
  const responses = await RsvpModel.find({ weddingId: wedding._id, householdId: household._id, eventId: { $in: events.map((event) => event._id) } });
  return {
    title: wedding.title, brideName: wedding.brideName, groomName: wedding.groomName, timezone: wedding.timezone,
    identity: { coupleNames: `${wedding.groomName} & ${wedding.brideName}`, dateRange: `${eventDate(wedding.startDate.toISOString(), wedding.timezone, true)} – ${eventDate(wedding.endDate.toISOString(), wedding.timezone, true)}`, location: [...new Set(events.map((event) => event.venue?.name).filter(Boolean))].join(" · ") },
    household: { householdName: household.householdName, adultsInvited: household.adultsInvited, childrenInvited: household.childrenInvited },
    helpContacts: wedding.helpContacts.map(({ name, label, phone, email }) => ({ name, ...(label ? { label } : {}), ...(phone ? { phone } : {}), ...(email ? { email } : {}) })),
    events: events.map((event) => publicEvent(event, wedding.rsvpDefaultDeadline)), responses: Object.fromEntries(responses.map((record) => { const dto = rsvpDTO(record); return [dto.eventId, dto]; })), photos: [], uploadHref: null,
  };
}
export async function getGuestEvent(eventId: string, request?: Request) {
  const { wedding, household } = await requireGuestSession(request);
  return publicEvent(await invitedEvent(String(wedding._id), String(household._id), eventId), wedding.rsvpDefaultDeadline);
}
