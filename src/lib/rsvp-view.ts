import "server-only";
import type { RsvpRecord } from "../models/rsvp";
import type { RsvpDTO, AdminRsvpDTO } from "../types/guest";
export function rsvpDTO(record: RsvpRecord): RsvpDTO {
  return { eventId: String(record.eventId), householdId: String(record.householdId), response: record.response,
    adultsAttending: record.adultsAttending, childrenAttending: record.childrenAttending, source: record.source,
    submittedAt: record.submittedAt.toISOString(), updatedAt: record.updatedAt.toISOString() };
}
export function adminRsvpDTO(record: RsvpRecord): AdminRsvpDTO { return { ...rsvpDTO(record), internalNote: record.internalNote ?? null }; }
