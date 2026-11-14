export type RsvpDTO = { eventId: string; householdId: string; response: "YES" | "NO" | "MAYBE"; adultsAttending: number; childrenAttending: number; source: "GUEST" | "ADMIN"; submittedAt: string; updatedAt: string };
export type AdminRsvpDTO = RsvpDTO & { internalNote: string | null };
export type GuestEventDTO = { id: string; name: string; startsAt: string; endsAt: string; timezone: string; dressCode: string; rsvpDeadline: string; rsvpClosed: boolean; youtubeLiveUrl: string; venue: { name: string; address: string; googleMapsUrl: string }; invitationFilename: string | null };
export type GuestWeddingDTO = {
  title: string; brideName: string; groomName: string; timezone: string;
  identity: { coupleNames: string; dateRange: string; location: string };
  household: { householdName: string; adultsInvited: number; childrenInvited: number };
  helpContacts: { name: string; label?: string; phone?: string; email?: string }[];
  events: GuestEventDTO[]; responses: Record<string, RsvpDTO>;
  photos: { id: string; eventId: string; originalFilename: string; previewUrl: string | null }[]; uploadHref: string | null;
};
