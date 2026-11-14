import "server-only";
import mongoose from "mongoose";
import { ApiError, assertId } from "../lib/api";
import { EventModel, type WeddingEventRecord } from "../models/event";
import { eventCreateSchema, type EventCreate, type EventPatch, type ListQuery } from "../lib/validation";
import type { EventDTO } from "../types/wedding";
import { accessWedding } from "./weddings";

function eventDTO(record: WeddingEventRecord & { _id: mongoose.Types.ObjectId }): EventDTO {
  return {
    id: String(record._id), weddingId: String(record.weddingId), name: record.name, type: record.type,
    customType: record.customType ?? null, description: record.description ?? null,
    startsAt: record.startsAt.toISOString(), endsAt: record.endsAt?.toISOString() ?? null, timezone: record.timezone,
    venue: { name: record.venue?.name ?? null, address: record.venue?.address ?? null, googleMapsUrl: record.venue?.googleMapsUrl ?? null },
    dressCode: record.dressCode ?? null,
    invitationAsset: record.invitationAsset ? { filename: record.invitationAsset.filename, mimeType: record.invitationAsset.mimeType } : null,
    youtubeLiveUrl: record.youtubeLiveUrl ?? null, rsvpDeadline: record.rsvpDeadline?.toISOString() ?? null,
    order: record.order, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(),
  };
}
export async function listEvents(weddingId: string, query: ListQuery) {
  await accessWedding(weddingId, true);
  const [events, total] = await Promise.all([
    EventModel.find({ weddingId }).sort({ startsAt: 1, order: 1, _id: 1 }).skip((query.page - 1) * query.limit).limit(query.limit),
    EventModel.countDocuments({ weddingId }),
  ]);
  return { data: events.map(eventDTO), meta: { ...query, total, totalPages: Math.ceil(total / query.limit) } };
}
// Server-rendered schedule: normally a handful of ceremonies. Paginated REST
// remains available to clients without requiring server-to-self HTTP requests.
export async function getWeddingEvents(weddingId: string) {
  await accessWedding(weddingId, true);
  return (await EventModel.find({ weddingId }).sort({ startsAt: 1, order: 1, _id: 1 })).map(eventDTO);
}
async function scopedEvent(weddingId: string, eventId: string) {
  await accessWedding(weddingId, true);
  assertId(eventId);
  const event = await EventModel.findOne({ _id: eventId, weddingId });
  if (!event) throw new ApiError(404, "NOT_FOUND", "Event not found.");
  return event;
}
export async function getEvent(weddingId: string, eventId: string) { return eventDTO(await scopedEvent(weddingId, eventId)); }
export async function createEvent(weddingId: string, input: EventCreate) {
  const { wedding } = await accessWedding(weddingId, true);
  const event = await EventModel.create({ ...input, weddingId: wedding._id });
  return eventDTO(event);
}
export async function updateEvent(weddingId: string, eventId: string, input: EventPatch) {
  const event = await scopedEvent(weddingId, eventId);
  const previous = eventDTO(event);
  const changes = { ...input, ...(input.venue ? { venue: { ...previous.venue, ...input.venue } } : {}) };
  // Validate merged values: PATCH may change just one side of a date range,
  // or switch to CUSTOM while its required customType is still absent.
  eventCreateSchema.parse({
    name: previous.name, type: previous.type, customType: previous.customType, description: previous.description,
    startsAt: previous.startsAt, endsAt: previous.endsAt, timezone: previous.timezone, venue: previous.venue,
    dressCode: previous.dressCode, youtubeLiveUrl: previous.youtubeLiveUrl, rsvpDeadline: previous.rsvpDeadline, order: previous.order,
    ...changes,
  });
  event.set(changes);
  await event.save();
  return eventDTO(event);
}
export async function deleteEvent(weddingId: string, eventId: string) {
  await accessWedding(weddingId, true); assertId(eventId);
  // H4 assignments now write the referenced Event's internal version in their
  // transaction. Read dependencies and delete atomically to prevent write skew.
  await mongoose.connection.transaction(async (session) => {
    const event = await EventModel.findOne({ _id: eventId, weddingId }).session(session);
    if (!event) throw new ApiError(404, "NOT_FOUND", "Event not found.");
    const filter = { weddingId: event.weddingId, eventId: event._id };
    for (const name of ["event_invitations", "rsvps", "tasks", "expenses", "photos"]) {
      if (await mongoose.connection.db!.collection(name).findOne(filter, { session, projection: { _id: 1 } })) throw new ApiError(409, "EVENT_HAS_DEPENDENCIES", "This event has related records and cannot be deleted yet.");
    }
    if (await mongoose.connection.db!.collection("vendors").findOne({ weddingId: event.weddingId, eventIds: event._id }, { session, projection: { _id: 1 } })) throw new ApiError(409, "EVENT_HAS_DEPENDENCIES", "This event has related Vendors and cannot be deleted yet.");
    if (event.invitationAsset) throw new ApiError(409, "EVENT_HAS_DEPENDENCIES", "This event has an invitation asset and cannot be deleted yet.");
    await EventModel.deleteOne({ _id: event._id, weddingId: event.weddingId }, { session });
  });
}
