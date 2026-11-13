const summary = {
  guestsConfirmed: 342,
  householdsAwaiting: 25,
  tasksRemaining: 12,
  tasksOverdue: 4,
  photosAwaitingReview: 83,
};

export type TeamMember = {
  id: string; // Fixture wedding-membership ID, not a global user ID.
  name: string;
  role: "OWNER" | "PLANNER" | "ADMIN" | "COLLABORATOR";
  email?: string;
};

export type WeddingTask = {
  id: string;
  title: string;
  description: string;
  assigneeMembershipId: string | null;
  eventId: string | null;
  dueAt: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  notes: string;
};

const team: TeamMember[] = [
  { id: "priya", name: "Priya", role: "OWNER" },
  { id: "ravi", name: "Ravi", role: "OWNER" },
  { id: "rahul", name: "Rahul", role: "COLLABORATOR" },
  { id: "ananya", name: "Ananya", role: "ADMIN" },
];

export type WeddingPhoto = {
  id: string;
  eventId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  uploaderLabel: string;
  originalFilename: string;
  previewUrl: string | null;
  uploadedAt: string;
};

// A representative subset, not the Overview's aggregate of 83 awaiting review.
// Null preview URLs deliberately render neutral blocks, not stock photography.
const photos: WeddingPhoto[] = [
  { id: "photo-01", eventId: "reception", status: "PENDING", uploaderLabel: "Guest", originalFilename: "reception-01.jpg", previewUrl: null, uploadedAt: "2026-12-06T10:05:00+05:30" },
  { id: "photo-02", eventId: "wedding", status: "PENDING", uploaderLabel: "Guest", originalFilename: "wedding-01.jpg", previewUrl: null, uploadedAt: "2026-12-06T09:50:00+05:30" },
  { id: "photo-03", eventId: "sangeet", status: "PENDING", uploaderLabel: "Guest", originalFilename: "sangeet-01.jpg", previewUrl: null, uploadedAt: "2026-12-06T09:30:00+05:30" },
  { id: "photo-04", eventId: "reception", status: "PENDING", uploaderLabel: "Guest", originalFilename: "reception-02.png", previewUrl: null, uploadedAt: "2026-12-06T09:10:00+05:30" },
  { id: "photo-05", eventId: "wedding", status: "PENDING", uploaderLabel: "Guest", originalFilename: "wedding-02.jpg", previewUrl: null, uploadedAt: "2026-12-06T08:50:00+05:30" },
  { id: "photo-06", eventId: "sangeet", status: "PENDING", uploaderLabel: "Guest", originalFilename: "sangeet-02.webp", previewUrl: null, uploadedAt: "2026-12-06T08:30:00+05:30" },
  { id: "photo-07", eventId: "reception", status: "APPROVED", uploaderLabel: "Guest", originalFilename: "reception-03.jpg", previewUrl: null, uploadedAt: "2026-12-05T16:30:00+05:30" },
  { id: "photo-08", eventId: "wedding", status: "APPROVED", uploaderLabel: "Guest", originalFilename: "wedding-03.jpg", previewUrl: null, uploadedAt: "2026-12-05T16:00:00+05:30" },
  { id: "photo-09", eventId: "sangeet", status: "APPROVED", uploaderLabel: "Guest", originalFilename: "sangeet-03.png", previewUrl: null, uploadedAt: "2026-12-05T15:30:00+05:30" },
  { id: "photo-10", eventId: "reception", status: "APPROVED", uploaderLabel: "Guest", originalFilename: "reception-04.jpg", previewUrl: null, uploadedAt: "2026-12-05T15:00:00+05:30" },
];

export const messageAudienceLabels = {
  EVENT_ALL: "All event invitees",
  EVENT_NO_RSVP: "Awaiting RSVP",
  EVENT_RSVP_YES: "Confirmed",
  EVENT_RSVP_MAYBE: "Maybe",
  EVENT_RSVP_NO: "Declined",
} as const;
export const messageStatusLabels = { SCHEDULED: "Scheduled", SENT: "Sent", DRAFT: "Draft" } as const;

// Presentation-only Communication fields. No recipient lists or delivery state.
export type MessageAudience = { type: keyof typeof messageAudienceLabels; eventId: string };
export type WeddingMessage = {
  id: string;
  subject: string;
  body: string;
  audience: MessageAudience;
  status: keyof typeof messageStatusLabels;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
};

const messages: WeddingMessage[] = [
  { id: "reception-rsvp-reminder", subject: "Reception RSVP reminder", body: "Please let us know whether your household can join the Reception. You can update your response through your guest link. We look forward to celebrating together.", audience: { type: "EVENT_NO_RSVP", eventId: "reception" }, status: "SCHEDULED", scheduledAt: "2026-12-08T10:00:00+05:30", sentAt: null, createdAt: "2026-12-04T09:00:00+05:30" },
  { id: "wedding-ceremony-details", subject: "Wedding ceremony details", body: "The Wedding ceremony starts at 9:00 AM. Please arrive a little early so we can welcome you before the ceremony. Traditional attire is welcome.", audience: { type: "EVENT_RSVP_YES", eventId: "wedding" }, status: "SCHEDULED", scheduledAt: "2026-12-18T10:00:00+05:30", sentAt: null, createdAt: "2026-12-05T11:30:00+05:30" },
  { id: "sangeet-timing-update", subject: "Sangeet timing update", body: "Sangeet begins at 7:00 PM. Please check your guest page for the event details. We cannot wait to enjoy the evening with you!", audience: { type: "EVENT_ALL", eventId: "sangeet" }, status: "SENT", scheduledAt: null, sentAt: "2026-12-04T16:00:00+05:30", createdAt: "2026-12-04T15:45:00+05:30" },
  { id: "reception-welcome", subject: "A welcome from Ravi and Priya", body: "Thank you for being part of our celebration. The latest event details are available on your guest page.", audience: { type: "EVENT_ALL", eventId: "reception" }, status: "SENT", scheduledAt: null, sentAt: "2026-12-03T12:00:00+05:30", createdAt: "2026-12-03T11:45:00+05:30" },
  { id: "reception-maybe-followup", subject: "Can you join us at the Reception?", body: "If your plans are clearer now, please update your Reception response through your guest link. We would love to see you.", audience: { type: "EVENT_RSVP_MAYBE", eventId: "reception" }, status: "DRAFT", scheduledAt: null, sentAt: null, createdAt: "2026-12-06T09:00:00+05:30" },
  { id: "wedding-family-note", subject: "A note before the Wedding", body: "We are grateful for your good wishes and look forward to sharing this special day with our family and friends.", audience: { type: "EVENT_ALL", eventId: "wedding" }, status: "DRAFT", scheduledAt: null, sentAt: null, createdAt: "2026-12-06T10:00:00+05:30" },
];

export const vendorCategories = ["Catering", "Photography", "Decoration", "Venue", "Makeup", "Music", "Other"] as const;
export const expenseCategories = ["Venue", "Catering", "Photography", "Decoration", "Music", "Other"] as const;
export const vendorStatusLabels = { PROSPECT: "Considering", CONFIRMED: "Confirmed", COMPLETED: "Completed", CANCELLED: "Cancelled" } as const;

export type WeddingVendor = {
  id: string;
  name: string;
  category: string;
  contact: { person: string; phone: string; email: string };
  eventIds: string[];
  estimatedCostMinor: number | null;
  actualCostMinor: number | null;
  currency: "INR";
  responsibleMembershipId: string | null;
  status: keyof typeof vendorStatusLabels;
  notes: string;
};

export type WeddingExpense = {
  id: string;
  name: string;
  category: string;
  eventId: string | null;
  vendorId: string | null;
  estimatedAmountMinor: number | null;
  actualAmountMinor: number | null;
  currency: "INR";
  notes: string;
  createdByMembershipId: string;
};

// All monetary values are integer paise. Vendor costs are reference information
// only; the expense records below supply the wedding's financial totals.
const vendors: WeddingVendor[] = [
  { id: "royal-caterers", name: "Royal Caterers", category: "Catering", contact: { person: "Ramesh", phone: "+91 90000 00101", email: "ramesh@example.com" }, eventIds: ["wedding", "reception"], estimatedCostMinor: 32000000, actualCostMinor: 30000000, currency: "INR", responsibleMembershipId: "ravi", status: "CONFIRMED", notes: "Reference quote for the Wedding and Reception." },
  { id: "frame-story", name: "Frame Story Photography", category: "Photography", contact: { person: "Asha", phone: "+91 90000 00102", email: "asha@example.com" }, eventIds: ["sangeet", "wedding", "reception"], estimatedCostMinor: 20000000, actualCostMinor: 19000000, currency: "INR", responsibleMembershipId: "priya", status: "CONFIRMED", notes: "Family photo list to be confirmed." },
  { id: "dream-decorators", name: "Dream Decorators", category: "Decoration", contact: { person: "Suresh", phone: "+91 90000 00103", email: "suresh@example.com" }, eventIds: ["wedding", "reception"], estimatedCostMinor: 18000000, actualCostMinor: 17000000, currency: "INR", responsibleMembershipId: "rahul", status: "CONFIRMED", notes: "Decoration plan confirmed with Rahul." },
  { id: "convention-centre", name: "Example Convention Centre", category: "Venue", contact: { person: "Meera", phone: "+91 90000 00104", email: "meera.venue@example.com" }, eventIds: ["sangeet", "wedding"], estimatedCostMinor: 40000000, actualCostMinor: 40000000, currency: "INR", responsibleMembershipId: "priya", status: "CONFIRMED", notes: "Venue contact for Sangeet and Wedding." },
  { id: "mira-makeup", name: "Mira Makeup", category: "Makeup", contact: { person: "Mira", phone: "+91 90000 00105", email: "mira@example.com" }, eventIds: ["wedding"], estimatedCostMinor: 7000000, actualCostMinor: 6500000, currency: "INR", responsibleMembershipId: "priya", status: "CONFIRMED", notes: "Getting-ready time to be shared with the family." },
  { id: "evening-notes", name: "Evening Notes Music", category: "Music", contact: { person: "Arjun", phone: "+91 90000 00106", email: "arjun@example.com" }, eventIds: ["sangeet"], estimatedCostMinor: 10000000, actualCostMinor: 9500000, currency: "INR", responsibleMembershipId: "ananya", status: "CONFIRMED", notes: "Sangeet playlist coordinated with Rahul." },
  { id: "celebration-ensemble", name: "Celebration Ensemble", category: "Music", contact: { person: "Nikhil", phone: "", email: "nikhil@example.com" }, eventIds: ["reception"], estimatedCostMinor: 4500000, actualCostMinor: null, currency: "INR", responsibleMembershipId: null, status: "PROSPECT", notes: "An optional performance being considered." },
];

// These seven records total ₹14.5L estimated / ₹13.8L actual.
const expenses: WeddingExpense[] = [
  { id: "venue-booking", name: "Venue booking", category: "Venue", eventId: null, vendorId: "convention-centre", estimatedAmountMinor: 40000000, actualAmountMinor: 40000000, currency: "INR", notes: "Sangeet and Wedding venue costs.", createdByMembershipId: "priya" },
  { id: "catering", name: "Wedding and Reception catering", category: "Catering", eventId: null, vendorId: "royal-caterers", estimatedAmountMinor: 35000000, actualAmountMinor: 33000000, currency: "INR", notes: "Total catering costs recorded for the wedding; vendor quote fields are references only.", createdByMembershipId: "ravi" },
  { id: "photography", name: "Wedding photography", category: "Photography", eventId: null, vendorId: "frame-story", estimatedAmountMinor: 20000000, actualAmountMinor: 19000000, currency: "INR", notes: "Photography across the three events.", createdByMembershipId: "priya" },
  { id: "decoration", name: "Wedding and Reception decoration", category: "Decoration", eventId: null, vendorId: "dream-decorators", estimatedAmountMinor: 18000000, actualAmountMinor: 17000000, currency: "INR", notes: "", createdByMembershipId: "priya" },
  { id: "sangeet-music", name: "Sangeet music", category: "Music", eventId: "sangeet", vendorId: "evening-notes", estimatedAmountMinor: 10000000, actualAmountMinor: 9500000, currency: "INR", notes: "", createdByMembershipId: "priya" },
  { id: "makeup", name: "Wedding makeup", category: "Other", eventId: "wedding", vendorId: "mira-makeup", estimatedAmountMinor: 7000000, actualAmountMinor: 6500000, currency: "INR", notes: "", createdByMembershipId: "priya" },
  { id: "other-celebration-costs", name: "Other celebration costs", category: "Other", eventId: null, vendorId: null, estimatedAmountMinor: 15000000, actualAmountMinor: 13000000, currency: "INR", notes: "Aggregate of invitations, stationery and other small celebration costs.", createdByMembershipId: "priya" },
];

// Representative sample, not the full wedding task list. Overview retains its
// approved 12 remaining / 4 overdue snapshot. Dates use the fixed demo day below.
const tasks: WeddingTask[] = [
  { id: "confirm-decorator", title: "Confirm decorator", description: "Confirm the final Wedding decoration plan.", assigneeMembershipId: "rahul", eventId: "wedding", dueAt: "2026-12-04T23:59:00+05:30", priority: "HIGH", status: "DONE", notes: "Final decoration plan confirmed." },
  { id: "sangeet-playlist", title: "Finalize Sangeet playlist", description: "Review the family’s song selections with the DJ.", assigneeMembershipId: "rahul", eventId: "sangeet", dueAt: "2026-12-04T23:59:00+05:30", priority: "HIGH", status: "TODO", notes: "Include the couple’s entrance song." },
  { id: "reception-stage", title: "Confirm Reception stage setup", description: "Review the stage layout and microphone positions.", assigneeMembershipId: "priya", eventId: "reception", dueAt: "2026-12-01T23:59:00+05:30", priority: "HIGH", status: "IN_PROGRESS", notes: "" },
  { id: "invitation-family", title: "Share Wedding invitation with close family", description: "Check the invitation wording with both families.", assigneeMembershipId: "priya", eventId: "wedding", dueAt: "2026-12-02T23:59:00+05:30", priority: "MEDIUM", status: "TODO", notes: "This task does not send invitations from the prototype." },
  { id: "caterer-headcount", title: "Confirm caterer headcount", description: "Review the latest household counts with the caterer.", assigneeMembershipId: "ravi", eventId: "reception", dueAt: "2026-12-05T23:59:00+05:30", priority: "HIGH", status: "TODO", notes: "" },
  { id: "photography-schedule", title: "Review photography schedule", description: "Confirm the key family photo moments.", assigneeMembershipId: "rahul", eventId: null, dueAt: "2026-12-10T23:59:00+05:30", priority: "MEDIUM", status: "IN_PROGRESS", notes: "" },
  { id: "invitation-proof", title: "Review Wedding invitation proof", description: "Check names, date and venue details on the final proof.", assigneeMembershipId: "rahul", eventId: "wedding", dueAt: "2026-12-08T23:59:00+05:30", priority: "LOW", status: "TODO", notes: "" },
  { id: "sangeet-entrance", title: "Confirm Sangeet entrance order", description: "Share the entrance order with the family.", assigneeMembershipId: "ananya", eventId: "sangeet", dueAt: "2026-12-12T23:59:00+05:30", priority: "MEDIUM", status: "TODO", notes: "" },
  { id: "ceremony-timing", title: "Review Wedding ceremony timing", description: "Confirm the ceremony start time with the family.", assigneeMembershipId: "priya", eventId: "wedding", dueAt: "2026-12-15T23:59:00+05:30", priority: "HIGH", status: "TODO", notes: "" },
  { id: "welcome-note", title: "Write a welcome note", description: "Prepare a short welcome for the Reception.", assigneeMembershipId: null, eventId: "reception", dueAt: "2026-12-16T23:59:00+05:30", priority: "LOW", status: "TODO", notes: "" },
];

export type WeddingEvent = {
  id: string;
  name: string;
  type: "ENGAGEMENT" | "HALDI" | "MEHENDI" | "SANGEET" | "WEDDING" | "RECEPTION" | "CUSTOM";
  customType?: string;
  description?: string;
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

// Presentation-only household fields; event assignments and RSVP responses
// remain separate resources when real API integration begins.
export type Household = {
  id: string;
  householdName: string;
  primaryContactName: string;
  email: string;
  phone: string;
  adultsInvited: number;
  childrenInvited: number;
  memberNames: string[];
  notes: string;
  invitedEventIds: string[];
  rsvpSummary: Record<string, "Confirmed" | "Awaiting" | "Declined">;
  guestLinkStatus: "Active" | "Not sent" | "Revoked";
};

const households: Household[] = [
  {
    id: "reddy", householdName: "Reddy Family", primaryContactName: "Ravi Reddy",
    email: "ravi@example.com", phone: "+91 90000 00001", adultsInvited: 4, childrenInvited: 2,
    memberNames: ["Ravi Reddy", "Lakshmi Reddy"], notes: "Bride’s maternal uncle and family.",
    invitedEventIds: ["sangeet", "wedding", "reception"],
    rsvpSummary: { sangeet: "Awaiting", wedding: "Confirmed", reception: "Confirmed" }, guestLinkStatus: "Active",
  },
  {
    id: "sharma", householdName: "Sharma Family", primaryContactName: "Neha Sharma",
    email: "neha@example.com", phone: "+91 90000 00002", adultsInvited: 2, childrenInvited: 1,
    memberNames: ["Neha Sharma", "Amit Sharma", "Aarav Sharma"], notes: "Family friends.",
    invitedEventIds: ["wedding", "reception"],
    rsvpSummary: { wedding: "Confirmed", reception: "Confirmed" }, guestLinkStatus: "Active",
  },
  {
    id: "iyer", householdName: "Iyer Family", primaryContactName: "Meera Iyer",
    email: "meera@example.com", phone: "+91 90000 00003", adultsInvited: 2, childrenInvited: 0,
    memberNames: ["Meera Iyer", "Arun Iyer"], notes: "",
    invitedEventIds: ["sangeet", "wedding", "reception"], rsvpSummary: {}, guestLinkStatus: "Not sent",
  },
  {
    id: "patel", householdName: "Patel Family", primaryContactName: "Kiran Patel",
    email: "kiran@example.com", phone: "+91 90000 00004", adultsInvited: 3, childrenInvited: 1,
    memberNames: ["Kiran Patel"], notes: "Contact Kiran for the family’s updates.",
    invitedEventIds: ["reception"], rsvpSummary: { reception: "Confirmed" }, guestLinkStatus: "Active",
  },
  {
    id: "rao", householdName: "Rao Family", primaryContactName: "Suresh Rao",
    email: "suresh@example.com", phone: "+91 90000 00005", adultsInvited: 2, childrenInvited: 0,
    memberNames: [], notes: "",
    invitedEventIds: ["wedding", "reception"],
    rsvpSummary: { wedding: "Awaiting", reception: "Declined" }, guestLinkStatus: "Active",
  },
  {
    id: "mehta", householdName: "Mehta Family", primaryContactName: "Pooja Mehta",
    email: "pooja@example.com", phone: "+91 90000 00006", adultsInvited: 2, childrenInvited: 2,
    memberNames: ["Pooja Mehta", "Vikram Mehta"], notes: "",
    invitedEventIds: ["sangeet", "reception"], rsvpSummary: {}, guestLinkStatus: "Not sent",
  },
  {
    id: "verma", householdName: "Verma Family", primaryContactName: "Anita Verma",
    email: "anita@example.com", phone: "+91 90000 00007", adultsInvited: 1, childrenInvited: 0,
    memberNames: ["Anita Verma"], notes: "Guest link is revoked in this fixture example.",
    invitedEventIds: ["wedding"], rsvpSummary: { wedding: "Declined" }, guestLinkStatus: "Revoked",
  },
  {
    id: "singh", householdName: "Singh Family", primaryContactName: "Harpreet Singh",
    email: "harpreet@example.com", phone: "+91 90000 00008", adultsInvited: 2, childrenInvited: 1,
    memberNames: ["Harpreet Singh", "Simran Singh"], notes: "College friends of Ravi.",
    invitedEventIds: ["sangeet", "wedding", "reception"],
    rsvpSummary: { sangeet: "Confirmed", wedding: "Confirmed", reception: "Confirmed" }, guestLinkStatus: "Active",
  },
];

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
    relativeTime: "12 days away",
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
    relativeTime: "13 days away",
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
    relativeTime: "14 days away",
  },
];

const partners = { brideName: "Priya", groomName: "Ravi" };
const familyContact = households.find((household) => household.id === "reddy")!;

// Approved presentation snapshot. Relative labels are fixed prototype copy,
// not calculated against today's date or inferred from the event dates.
export const weddingFixture = {
  timezone: "Asia/Kolkata",
  taskReferenceDate: "2026-12-06",
  demoCollaboratorMembershipId: "rahul",
  demoOrganiserMembershipId: "priya",
  team,
  tasks,
  vendors,
  expenses,
  messages,
  photos,
  photoUploadEventId: "reception",
  helpContact: { name: familyContact.primaryContactName, phone: familyContact.phone, email: familyContact.email },
  identity: {
    ...partners,
    coupleNames: `${partners.groomName} & ${partners.brideName}`,
    weddingTitle: `${partners.groomName} & ${partners.brideName}'s Wedding`,
    startDate: events[0].startsAt.slice(0, 10),
    endDate: events[events.length - 1].startsAt.slice(0, 10),
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
      available: true,
    },
    {
      id: "awaiting-rsvp",
      issue: `${summary.householdsAwaiting} households haven't replied`,
      action: "Send reminder",
      destination: "messages",
      available: true,
    },
    {
      id: "reception-venue",
      issue: "Reception venue details aren't complete",
      action: "Add venue",
      destination: "events/reception",
      available: true,
    },
    {
      id: "photo-review",
      issue: `${summary.photosAwaitingReview} photos are waiting for approval`,
      action: "Review photos",
      destination: "photos",
      available: true,
    },
  ],
  events,
  households,
  recentActivity: [
    { id: "reception-rsvp", description: "Reddy Family confirmed Reception" },
    { id: "decorator-task", description: 'Rahul completed "Confirm decorator"' },
    { id: "vendor-added", description: "Royal Caterers was added" },
    { id: "photos-uploaded", description: "12 new photos were uploaded" },
  ],
};
