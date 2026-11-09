import { messageAudienceLabels, type Household, type MessageAudience, type WeddingEvent } from "../../fixtures/wedding";

export function audienceLabel(audience: MessageAudience, events: WeddingEvent[]) {
  const name = events.find((event) => event.id === audience.eventId)?.name ?? "Unavailable event";
  return audience.type === "EVENT_ALL" ? `All ${name} invitees` : `${name} · ${messageAudienceLabels[audience.type]}`;
}

// A sample household count, not email recipients or the whole-wedding snapshot.
export function audienceCount(audience: MessageAudience, households: Household[]) {
  const responses = { EVENT_NO_RSVP: "Awaiting", EVENT_RSVP_YES: "Confirmed", EVENT_RSVP_MAYBE: "Maybe", EVENT_RSVP_NO: "Declined" };
  return households.filter((household) => household.invitedEventIds.includes(audience.eventId)
    && (audience.type === "EVENT_ALL" || (household.rsvpSummary[audience.eventId] ?? "Awaiting") === responses[audience.type])).length;
}

export function messageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(value));
}

export function scheduleInputs(value: string | null) {
  if (!value) return { date: "", time: "" };
  const date = new Date(value);
  const pad = (value: number) => String(value).padStart(2, "0");
  return { date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, time: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
}

export function parseSchedule(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error("Choose a schedule date and time.");
  const scheduled = new Date(`${date}T${time}:00`);
  // Round-trip catches impossible dates and browser-local times skipped by DST.
  const roundTrip = Number.isFinite(scheduled.getTime()) ? scheduleInputs(scheduled.toISOString()) : null;
  if (!roundTrip || roundTrip.date !== date || roundTrip.time !== time) throw new Error("Choose a valid date and time in your browser’s local timezone.");
  return scheduled.toISOString();
}
