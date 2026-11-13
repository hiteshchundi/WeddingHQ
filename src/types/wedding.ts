export const eventTypes = ["ENGAGEMENT", "HALDI", "MEHENDI", "SANGEET", "WEDDING", "RECEPTION", "CUSTOM"] as const;
export const weddingStatuses = ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"] as const;

export type WeddingDTO = {
  id: string;
  organizationId: string;
  title: string;
  brideName: string;
  groomName: string;
  description: string | null;
  timezone: string;
  currency: string;
  startDate: string;
  endDate: string;
  status: typeof weddingStatuses[number];
  rsvpDefaultDeadline: string | null;
  retentionEndsAt: string | null;
  helpContacts: { name: string; label?: string; phone?: string; email?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type EventDTO = {
  id: string;
  weddingId: string;
  name: string;
  type: typeof eventTypes[number];
  customType: string | null;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  venue: { name: string | null; address: string | null; googleMapsUrl: string | null };
  dressCode: string | null;
  invitationAsset: { filename: string; mimeType: string } | null;
  youtubeLiveUrl: string | null;
  rsvpDeadline: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};
