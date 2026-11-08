const summary = {
  guestsConfirmed: 342,
  householdsAwaiting: 25,
  tasksRemaining: 12,
  tasksOverdue: 4,
  actualSpend: "₹13.8L",
  estimatedSpend: "₹14.5L",
  photosAwaitingReview: 83,
};

// Approved presentation snapshot. Relative labels are fixed prototype copy,
// not calculated against today's date or inferred from the event dates.
export const weddingFixture = {
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
  upcomingEvents: [
    {
      id: "sangeet",
      name: "Sangeet",
      startsAt: "2026-12-18T19:00:00+05:30",
      date: "December 18",
      time: "7:00 PM",
      relativeTime: "2 days away",
    },
    {
      id: "wedding",
      name: "Wedding",
      startsAt: "2026-12-19T09:00:00+05:30",
      date: "December 19",
      time: "9:00 AM",
      relativeTime: "3 days away",
    },
    {
      id: "reception",
      name: "Reception",
      startsAt: "2026-12-20T19:30:00+05:30",
      date: "December 20",
      time: "7:30 PM",
      relativeTime: "4 days away",
    },
  ],
  recentActivity: [
    { id: "reception-rsvp", description: "Reddy Family confirmed Reception" },
    { id: "decorator-task", description: 'Rahul completed "Confirm decorator"' },
    { id: "vendor-added", description: "Royal Caterers was added" },
    { id: "photos-uploaded", description: "12 new photos were uploaded" },
  ],
};
