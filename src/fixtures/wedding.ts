const summary = {
  guestsConfirmed: 342,
  householdsAwaiting: 25,
  tasksRemaining: 12,
  tasksOverdue: 4,
  actualSpend: "₹13.8L",
  estimatedSpend: "₹14.5L",
  photosAwaitingReview: 83,
};

export type WeddingEvent = {
  id: string;
  name: string;
  type: "SANGEET" | "WEDDING" | "RECEPTION" | "CUSTOM";
  customType?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  venue: { name: string; address: string; googleMapsUrl: string };
  dressCode: string;
  invitationAsset: { filename: string } | null;
  rsvpDeadline: string;
  youtubeLiveUrl: string;
  invitedHouseholds: number;
  order: number;
  relativeTime?: string;
};

const events: WeddingEvent[] = [
  {
    id: "sangeet",
    name: "Sangeet",
    type: "SANGEET",
    startsAt: "2026-12-18T19:00:00+05:30",
    endsAt: "2026-12-18T23:00:00+05:30",
    timezone: "Asia/Kolkata",
    venue: {
      name: "Example Convention Centre",
      address: "Hyderabad",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Example+Convention+Centre+Hyderabad",
    },
    dressCode: "Indo-Western",
    invitationAsset: { filename: "sangeet-invitation.pdf" },
    rsvpDeadline: "2026-12-01T23:59:00+05:30",
    youtubeLiveUrl: "",
    invitedHouseholds: 126,
    order: 1,
    relativeTime: "2 days away",
  },
  {
    id: "wedding",
    name: "Wedding",
    type: "WEDDING",
    startsAt: "2026-12-19T09:00:00+05:30",
    endsAt: "",
    timezone: "Asia/Kolkata",
    venue: {
      name: "Example Convention Centre",
      address: "Hyderabad",
      googleMapsUrl: "",
    },
    dressCode: "Traditional",
    invitationAsset: { filename: "wedding-invitation.pdf" },
    rsvpDeadline: "2026-12-05T23:59:00+05:30",
    youtubeLiveUrl: "",
    invitedHouseholds: 180,
    order: 2,
    relativeTime: "3 days away",
  },
  {
    id: "reception",
    name: "Reception",
    type: "RECEPTION",
    startsAt: "2026-12-20T19:30:00+05:30",
    endsAt: "",
    timezone: "Asia/Kolkata",
    venue: { name: "", address: "", googleMapsUrl: "" },
    dressCode: "",
    invitationAsset: null,
    rsvpDeadline: "2026-12-10T23:59:00+05:30",
    youtubeLiveUrl: "",
    invitedHouseholds: 180,
    order: 3,
    relativeTime: "4 days away",
  },
];

// Approved presentation snapshot. Relative labels are fixed prototype copy,
// not calculated against today's date or inferred from the event dates.
export const weddingFixture = {
  timezone: "Asia/Kolkata",
  identity: {
    coupleNames: "Ravi & Priya",
    monogram: "R+P",
    location: "Hyderabad",
    dateRange: "December 18–20, 2026",
    countdown: "12 days to go",
    greeting: "Good morning, Priya",
  },
  summary,
  attention: [
    {
      id: "overdue-tasks",
      issue: `${summary.tasksOverdue} tasks are overdue`,
      action: "View tasks",
      destination: "tasks",
    },
    {
      id: "awaiting-rsvp",
      issue: `${summary.householdsAwaiting} households haven't replied`,
      action: "Send reminder",
      destination: "messages",
    },
    {
      id: "reception-venue",
      issue: "Reception venue details aren't complete",
      action: "Add venue",
      destination: "events",
    },
    {
      id: "photo-review",
      issue: `${summary.photosAwaitingReview} photos are waiting for approval`,
      action: "Review photos",
      destination: "photos",
    },
  ],
  events,
  recentActivity: [
    { id: "reception-rsvp", description: "Reddy Family confirmed Reception" },
    { id: "decorator-task", description: 'Rahul completed "Confirm decorator"' },
    { id: "vendor-added", description: "Royal Caterers was added" },
    { id: "photos-uploaded", description: "12 new photos were uploaded" },
  ],
};
