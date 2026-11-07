# Wedding HQ — Prototype Core Flows & Remaining Screens

**Version:** 1.0  
**Status:** Approved  
**Goal:** Complete only the UI needed to build and test the Wedding HQ prototype.

---

# 1. Prototype Success Question

The prototype should help us answer:

> **Can Wedding HQ meaningfully reduce wedding coordination friction for a couple and their family?**

We do not need every future feature designed before answering that.

# 2. What We Already Have

The current UI already covers:

- Public homepage
- Sign in
- Initial wedding onboarding
- Organiser Overview
- Events list
- Guests list
- Tasks list
- Guest wedding page
- Guest RSVP
- QR photo upload
- Desktop and mobile application shells
- Light / Dark / Comfort direction

We should build on these rather than regenerate them.

# 3. Core Prototype Journey

```text
Couple discovers Wedding HQ
        ↓
Signs in
        ↓
Creates their wedding
        ↓
Adds wedding events
        ↓
Adds/imports guests
        ↓
Invites households
        ↓
Guest opens private link
        ↓
Guest sees only invited events
        ↓
Guest RSVPs
        ↓
Couple sees RSVP update
        ↓
Couple manages tasks
        ↓
Couple tracks vendor + expense
        ↓
Couple sends an RSVP reminder
        ↓
Guest uploads wedding photos
        ↓
Couple approves photos
```

If this flow works smoothly, we have enough product to begin meaningful testing.

# 4. Remaining Screen 1 — Event Detail / Edit

We already have the Events list.

We now need one event-detail experience.

Example:

> **Sangeet**

Show:

- Date
- Start time
- End time
- Venue
- Google Maps link
- Dress code
- Invitation asset
- RSVP deadline
- YouTube Live link
- Invited household count

Actions:

```text
Edit event
View guests
```

Editing can use a simple drawer or form page. We do not need a separate sophisticated event-management workspace.

# 5. Remaining Screen 2 — Add / Edit Household

From Guests:

> **+ Add household**

Open a drawer.

Fields:

- Household name
- Primary contact name
- Email
- Phone
- Adults invited
- Children invited
- Optional member names
- Internal notes

Then select invited events:

```text
☑ Sangeet
☑ Wedding
☑ Reception
```

Action:

> **Save household**

This same form can handle editing. No separate Add and Edit screen designs are necessary.

# 6. Remaining Screen 3 — Household Detail

Clicking a household opens a drawer or full page.

Example:

> **Reddy Family**

Show:

- Primary contact
- Invite counts
- Invited events
- RSVP per event
- Guest-link status
- Notes

Actions:

```text
Edit
Send invitation
Regenerate guest link
```

For the prototype, this is enough.

# 7. Remaining Screen 4 — Guest Import

Flow:

```text
Import guest list
      ↓
Upload CSV / Excel
      ↓
Preview
      ↓
Fix / understand problems
      ↓
Confirm import
```

Preview screen:

```text
400 rows found

390 ready
6 need attention
4 possible duplicates
```

Show a small preview table.

Actions:

```text
Cancel
Import 390 households
```

For prototype purposes, we do not need an elaborate spreadsheet editor.

# 8. Remaining Screen 5 — Task Create / Edit

The Tasks list already exists.

Click:

> **+ New task**

Open drawer.

Fields:

- Task name
- Description
- Assigned person
- Related event
- Due date
- Priority
- Status
- Notes

Action:

> **Create task**

Editing uses the same drawer.

# 9. Remaining Screen 6 — Vendors

We need one simple Vendors screen.

Header:

```text
Vendors                         + Add vendor
```

Each vendor shows:

- Name
- Category
- Contact
- Related events
- Estimated cost
- Actual cost
- Responsible person
- Status

Example:

```text
Royal Caterers
Catering

Wedding · Reception

Ramesh
+91 ...

₹3.2L estimated
Confirmed
```

Clicking a vendor opens a detail/edit drawer.

No vendor portal. No marketplace.

# 10. Remaining Screen 7 — Expenses

Create one simple Expenses screen.

Top:

```text
Estimated      ₹14.5L
Actual         ₹13.8L
Variance       ₹70K under
```

Below:

```text
Venue
₹4.0L

Catering
₹3.5L

Photography
₹2.0L
```

Primary action:

> **+ Add expense**

Expense form:

- Name
- Category
- Event
- Vendor
- Estimated amount
- Actual amount
- Notes

No complex financial charts.

# 11. Remaining Screen 8 — Messages

Create one Messages page.

Tabs:

```text
Scheduled
Sent
Drafts
```

Primary action:

> **New message**

For the prototype, this page can remain very simple.

# 12. Remaining Screen 9 — Message Composer

Fields:

```text
Audience

Reception guests who haven't RSVP'd

Subject

Reception RSVP reminder

Message

...

Send now
Schedule
```

Audience options only need to demonstrate:

- Event invitees
- Awaiting RSVP
- Confirmed
- Maybe
- Declined

Email only. No WhatsApp. No SMS.

# 13. Remaining Screen 10 — Photo Moderation

The QR upload side already exists.

Now complete the organiser side.

Tabs:

```text
Pending review
Approved
```

Show photo grid.

Click image:

```text
Reception
Uploaded by guest

Reject
Approve
```

This completes the core photo loop:

```text
Guest uploads
      ↓
Pending
      ↓
Organiser approves
      ↓
Visible in gallery
```

# 14. Minimal Settings

For prototype testing, Settings needs only:

```text
Wedding details
Team
Appearance
```

## Wedding Details

Edit couple names, dates, timezone, and help contacts.

## Team

Display owners, planner, admins, and collaborators. Allow simple invite/remove actions.

## Appearance

```text
Light
Dark
System

Eye comfort
Off
On
Auto
```

Privacy/retention configuration can remain minimal or deferred during prototype testing.

# 15. Collaborator Experience

Create one simple collaborator mobile/desktop screen:

```text
Ravi & Priya

Your tasks

1 overdue
2 upcoming
4 completed
```

Then assigned tasks only.

Actions:

```text
Start task
Mark complete
```

That is sufficient to validate collaborator usefulness.

# 16. What We Do NOT Need Before Prototype Testing

Do not design yet:

- Advanced Planner dashboard
- Planner company hierarchy
- Multi-wedding planner portal
- Analytics dashboards
- Complex expense reporting
- Accounting
- Vendor portal
- Hotel management
- Transportation
- Seating
- Food preferences
- Guest chat
- WhatsApp
- SMS
- Invitation builder
- Multiple guest themes
- Advanced retention UI
- Full audit-log explorer
- Sophisticated activity filters
- Elaborate customisation
- Animation library

None of these are required to prove the main concept.

# 17. Prototype Screen Set After This Phase

## Acquisition

Homepage  
Sign in

## Setup

Onboarding  
Events  
Event detail

## Guests

Guest list  
Add household  
Household detail  
Guest import  
Guest private page  
Guest RSVP

## Coordination

Overview  
Tasks  
Task create/edit  
Collaborator tasks

## Operations

Vendors  
Expenses  
Messages

## Photos

Guest QR upload  
Photo moderation

## Configuration

Minimal Settings

That is enough.

# 18. Priority Order

```text
1. Add/Edit Household
2. Household Detail
3. Guest Import
4. Event Detail/Edit
5. Task Create/Edit
6. Vendors
7. Expenses
8. Messages + Composer
9. Photo Moderation
10. Minimal Settings
11. Collaborator View
```

Events + Guests + Tasks are the strongest core coordination loop. Vendors, expenses, communication and photos then complete the broader Wedding HQ value proposition.

# 19. UX State Coverage

For the prototype, do not design every possible state.

For each important workflow, support only:

```text
Normal
Loading
Empty
Success
Basic error
```

Add special states only when product logic genuinely needs them.

Examples:

Guest RSVP:

```text
Normal
Saved
Deadline passed
```

Guest import:

```text
Uploading
Preview ready
Validation problems
Imported
```

Photos:

```text
Uploading
Pending
Approved
Rejected
```

That is enough for V1.

# 20. Prototype Completion Point

UI/UX design work should stop when we can walk through this scenario without encountering a missing screen:

> Priya creates Ravi & Priya's wedding, adds their events, imports their guest list, sends an invitation, a guest opens the private link and RSVPs, Priya sees the response, assigns Rahul a task, adds Royal Caterers and its expense, sends an RSVP reminder, a guest uploads Reception photos, and Priya approves those photos.

At that point:

> **Stop designing and start building/testing.**

Do not continue polishing the UI simply because more things could be designed.

# 21. Final Prototype Rule

The UI does not need to prove that Wedding HQ can eventually do everything.

It needs to prove:

> **Wedding HQ makes coordinating a wedding meaningfully easier.**

Everything else can wait.
