# Wedding HQ — Product Requirements Document

**Version:** 1.1  
**Status:** Locked V1 Baseline — Revised  
**Product Name:** Wedding HQ  
**Product Name Status:** Placeholder only  
**Platform:** Web-first prototype  
**Primary Market:** India-first  
**Document Purpose:** Define the approved functional scope of Wedding HQ V1.

---

## 1. Revision History

### V1.0

Initial locked Wedding HQ V1 product requirements.

### V1.1

Approved revisions:

- Wedding Planner and Additional Admins can create and manage guest households.
- Guest management is not primarily the Bride/Groom's operational responsibility.
- Added guest import from CSV/XLSX.
- Added guest export to CSV/XLSX.
- Removed complete wedding ZIP export from V1.
- Removed bulk photo/media export from V1.
- Individual photo downloads remain permitted.
- Updated post-wedding retention workflow.
- Confirmed Wedding HQ V1 as a web-first modular monolith.
- Confirmed Vercel, MongoDB Atlas, Cloudflare R2 and Resend as V1 infrastructure choices.
- Confirmed explicit versioned REST API design as an architectural requirement.

---

# 2. Product Overview

Wedding HQ is a private, web-based wedding planning and operations platform designed initially for Indian weddings.

The product exists to reduce the coordination problems that arise when wedding information is distributed across:

- WhatsApp
- Spreadsheets
- Calls
- Emails
- Photo-sharing platforms
- Individual family members
- Wedding planners
- Vendors

Wedding HQ provides one central operational location for:

- Bride
- Groom
- Wedding Planner
- Additional Admins
- Collaborators
- Guests

The core product principle is:

> **Powerful for organisers. Extremely simple for guests.**

Wedding HQ V1 is intentionally not designed to handle every possible part of wedding planning.

Its purpose is to reduce coordination friction.

---

# 3. Problem Statement

Indian weddings frequently involve multiple events, large guest lists, several family members, multiple vendors and different people responsible for different activities.

Common problems include:

- Guest lists maintained manually in spreadsheets.
- Multiple versions of the same guest list.
- Invitations distributed separately.
- Missing invitations.
- Guests repeatedly calling for event information.
- Elderly guests having difficulty finding venues.
- RSVP responses being tracked manually.
- Different guests being invited to different events.
- Tasks having unclear ownership.
- Family members not knowing who is responsible for an activity.
- Vendor information scattered across calls and messages.
- Expenses stored separately.
- Wedding planners manually coordinating information across many stakeholders.
- Photos becoming fragmented across dozens or hundreds of phones.
- Valuable guest photos being lost after the wedding.
- Organisers switching constantly between WhatsApp, Excel, Google Sheets, photo platforms and calls.

Wedding HQ aims to replace much of this fragmentation with one coordinated system.

---

# 4. Product Vision

Wedding HQ should become the operational headquarters of a wedding.

The long-term product may support two major modes.

## 4.1 Personal Wedding Management

For:

- Bride
- Groom
- Family
- Friends
- Wedding Planner

## 4.2 Professional Wedding Management

For:

- Independent wedding planners
- Event organisers
- Event-management companies

A planner may eventually manage multiple weddings through one account.

The V1 architecture should support this future direction without exposing unnecessary professional-management complexity in the V1 user interface.

---

# 5. V1 Objective

The goal of V1 is to validate whether Wedding HQ can meaningfully reduce wedding-management friction.

The prototype should specifically validate:

1. Guest management
2. Event-specific invitations
3. RSVP management
4. Task coordination
5. Vendor tracking
6. Expense visibility
7. Guest communication
8. Wedding information access
9. Photo collection and moderation

The prototype may later be validated through a live wedding.

---

# 6. Primary Users

## 6.1 Bride

Wedding Owner.

Has full wedding access.

## 6.2 Groom

Wedding Owner.

Has full wedding access.

## 6.3 Wedding Planner

Operational wedding manager.

Can assist with:

- Events
- Guests
- Invitations
- Tasks
- Vendors
- Expenses
- Communications
- Photo moderation

The planner does not own the wedding.

## 6.4 Additional Admin

A trusted family member, friend, proxy or organiser.

Can assist with general wedding operations.

Additional Admins may create and manage guest households.

## 6.5 Collaborator

A lightweight operational role.

Examples:

- Cousin responsible for decoration
- Sibling coordinating photography
- Friend handling an event-specific responsibility

Collaborators primarily interact with tasks assigned to them.

## 6.6 Guest

Does not require a Wedding HQ account.

Guests receive a secure personalised invitation link.

Guests can:

- View invited events
- RSVP
- Access venue information
- View invitations
- Access livestream links
- Upload photos
- View approved photos
- Access designated help contacts

---

# 7. Ownership Model

The Bride and Groom are the permanent Wedding Owners.

Wedding Planner, Admins and Collaborators cannot remove Wedding Owners.

Highly sensitive actions such as permanent wedding deletion should remain restricted to Wedding Owners.

The system should not use fixed concepts such as:

- Bride Proxy
- Groom Proxy

Instead, owners can appoint flexible Additional Admins.

Operational work does not need to be performed personally by the Bride or Groom.

---

# 8. Wedding Structure

Conceptually:

```text
Organisation / Account
        ↓
      Wedding
        ↓
      Events
```

One person may eventually participate in multiple weddings.

Example:

```text
User
├── Owner — Wedding A
├── Planner — Wedding B
└── Admin — Wedding C
```

The system must not assume:

```text
One user = one wedding
```

---

# 9. Wedding Setup

A wedding may contain:

- Bride name
- Groom name
- Wedding title
- Wedding description
- Wedding start date
- Wedding end date
- Wedding timezone
- Primary contacts
- Owners
- Planner
- Additional Admins

Wedding Owners initially create/configure the wedding.

Operational administration may then be delegated.

---

# 10. Events

One wedding may contain multiple events.

Wedding HQ should provide common templates such as:

- Engagement
- Haldi
- Mehendi
- Sangeet
- Wedding
- Reception

These are templates only.

Wedding HQ must support custom events for weddings across religions, communities and traditions.

Examples:

- Church Ceremony
- Nikah
- Anand Karaj
- Cocktail Night
- Welcome Dinner
- Custom Ceremony

Users must be able to:

- Create event
- Rename event
- Delete event
- Reorder events
- Create custom event

---

# 11. Event Fields

Each event may contain:

- Event name
- Event type
- Custom event type
- Date
- Start time
- Optional end time
- Timezone
- Venue name
- Venue address
- Google Maps link
- Description
- Dress code
- Invitation graphic
- Optional YouTube Live link

Events inherit the wedding timezone by default.

An event may override the timezone where required, such as for destination weddings.

---

# 12. Guest Management

Guests are primarily organised as households.

Example:

```text
Reddy Family

Primary Contact: Ravi Reddy
Adults Invited: 4
Children Invited: 2
```

Individual household member names are optional.

Bride and Groom have permission to manage guest households but are not expected to perform this operational work themselves.

Wedding Planner and Additional Admins may:

- Create households
- Edit households
- Delete/archive households
- Assign households to events
- Manage invitations
- Import households
- Export households

---

# 13. Guest Household Fields

A household may contain:

- Household/family name
- Primary contact name
- Primary email
- Optional phone number
- Number of adults invited
- Number of children invited
- Optional household-member names
- Internal notes
- Invited events
- RSVP information

---

# 14. Guest Import

V1 supports bulk guest import.

Supported formats:

- CSV
- XLSX

The import workflow should allow an Admin/Planner to:

1. Upload the file.
2. Validate columns and data.
3. Review invalid rows.
4. Preview import results.
5. Confirm the import.
6. Create guest households.

Importing must not silently create invalid or malformed guest records.

---

# 15. Guest Export

V1 supports lightweight structured guest export.

Supported formats:

- CSV
- XLSX

Guest export may contain:

- Household details
- Contact information
- Invited events
- RSVP information
- Attendance counts

This is separate from media export.

---

# 16. Event-Specific Invitations

Invitations are event-specific.

Example:

```text
Household A
└── Reception

Household B
├── Sangeet
├── Wedding
└── Reception
```

Guests must see only events they are invited to.

Private events must not be exposed to uninvited guests.

---

# 17. Guest Access

Guests do not need to:

- Register
- Create passwords
- Install an application

Each household receives a secure personalised link.

The secure link provides access only to information authorised for that household.

V1 does not require an additional wedding password.

---

# 18. RSVP

RSVP responses are event-specific.

Available responses:

- Yes
- No
- Maybe

Guests may provide:

- Number of adults attending
- Number of children attending

V1 does not collect:

- Food preferences
- Accommodation information
- Flight information
- Train information
- Travel plans

---

# 19. RSVP Editing Rules

Before the RSVP deadline:

- Guest may update RSVP.
- Guest may update attendance counts.
- Guest may switch between Yes, No and Maybe.

Admins may enter a response on behalf of a guest if the guest communicates outside Wedding HQ.

Admin-entered responses must be auditable.

After the RSVP deadline:

- Guest editing is locked.
- Admins should not silently modify a guest-submitted response.
- Admins may add an internal note.
- Owner/Admin may extend or reopen the RSVP deadline.

---

# 20. Invitation Graphics

Wedding HQ does not design invitation graphics in V1.

Invitation artwork is produced externally.

Possible formats:

- JPG
- PNG
- PDF

An Admin uploads the relevant invitation to each event.

---

# 21. Communication

V1 communication is email-only.

Wedding HQ does not include:

- WhatsApp communication
- SMS communication
- Guest chat
- Two-way messaging

Admins can target audiences such as:

- All Reception invitees
- All Sangeet guests
- Guests who have not RSVP'd
- Maybe responses
- Confirmed attendees

---

# 22. Scheduled Email Reminders

Admins can schedule email reminders.

Examples:

- 7 days before
- 2 days before
- 1 day before
- Custom date/time

Reminder fields may include:

- Event
- Audience
- Message
- Scheduled date/time

---

# 23. Task Management

Tasks contain:

- Task name
- Description/notes
- Assignee
- Related event
- Due date
- Priority
- Status

Statuses:

- To Do
- In Progress
- Done

Priorities:

- Low
- Medium
- High

---

# 24. Collaborator Role

When a task is assigned to a non-admin user, that person may receive Collaborator access.

Collaborators may:

- View their tasks
- Update task status
- Add task notes

Collaborators should not automatically gain access to:

- Guest database
- Complete vendor database
- Financial information
- Wedding settings
- Other users' tasks

---

# 25. Vendor Management

Vendor management is internal only.

Vendors do not have Wedding HQ accounts in V1.

Vendor fields may contain:

- Vendor name
- Category
- Contact person
- Phone
- Email
- Related event
- Estimated cost
- Actual cost
- Responsible team member
- Status
- Notes

No vendor marketplace or vendor discovery is included.

---

# 26. Expense Tracking

Expense records contain:

- Expense name
- Category
- Related event
- Estimated amount
- Actual amount
- Notes

Dashboard calculations:

- Total estimated
- Total actual
- Variance

V1 does not contain:

- GST accounting
- Invoices
- Payment gateway
- Family expense splitting
- Financial approvals
- Reconciliation
- Full accounting

---

# 27. Photo Collection

Guests may upload wedding photos through:

- Personalised guest link
- Event-specific QR code

Guest accounts are not required.

V1 supports images only.

Guest-uploaded videos are excluded.

V1 deliberately does not perform image compression or advanced media processing.

---

# 28. Photo Upload Rules

V1 should keep photo handling simple.

Wedding HQ may validate:

- Supported image type
- Maximum individual file size
- Upload authorisation

Wedding HQ V1 does not require:

- Image compression
- Automatic resizing
- Thumbnail-generation pipeline
- Multiple image variants
- Advanced storage quotas
- AI image analysis

---

# 29. QR Photo Upload

Each event may expose a QR code for photo upload.

The QR upload experience must not expose:

- Guest database
- RSVP information
- Admin information
- Private management data

Its access should be limited to the relevant upload workflow.

---

# 30. Photo Moderation

Guest-uploaded photos follow:

```text
Pending Approval
      ↓
Approved
```

or:

```text
Pending Approval
      ↓
Rejected
```

Only approved photos appear in guest-visible galleries.

---

# 31. Photo Galleries

Photos may be grouped by event.

Examples:

- Haldi Gallery
- Sangeet Gallery
- Wedding Gallery
- Reception Gallery

Wedding HQ may additionally show:

- All Photos

---

# 32. Photo Download

V1 may allow individual photo download.

V1 does not include:

- Download entire wedding
- Download all photos
- Bulk media ZIP export
- Multi-gigabyte archive generation

Bulk media export is explicitly deferred.

---

# 33. Livestream

Wedding HQ does not host live video.

Admins may add a YouTube Live URL.

Invited guests can access the livestream through the relevant event page.

---

# 34. Guest Homepage

The guest experience should remain simple.

Guest homepage may show:

- Couple names
- Countdown
- Invited events
- Invitation graphic
- Date/time
- Venue
- Dress code
- Google Maps link
- RSVP
- YouTube Live
- Photo upload
- Approved gallery
- Help contact

Guests must not see events they are not invited to.

---

# 35. Guest Help Contact

Admins may configure one or more contacts.

Example:

```text
Need Help?

Rahul
Family Coordinator
+91 XXXXX XXXXX
```

The Bride/Groom's personal contact information is not automatically shown.

---

# 36. Admin Dashboard

The admin dashboard should immediately communicate wedding status.

## Guests

- Confirmed
- Maybe
- Declined
- Awaiting RSVP

## Tasks

- Completed
- Remaining
- Overdue

## Expenses

- Estimated
- Actual
- Variance

## Photos

- Approved
- Pending Approval

Additional dashboard sections may include:

- Upcoming events
- Upcoming tasks
- Recent RSVPs
- Recent activity
- Pending photo moderation

---

# 37. Privacy

Wedding HQ is private by design.

Wedding data should not be publicly discoverable.

The product should minimise unnecessary exposure of:

- Guest identities
- Emails
- Phone numbers
- RSVP responses
- Private events
- Uploaded photos

---

# 38. Wedding Completion and Retention

After the final event:

```text
Active Wedding
      ↓
Wedding Complete
      ↓
Retention Period
      ↓
Archive
```

The retention period is calculated from the final wedding event date.

Owners should receive reminders before media/data scheduled for deletion reaches its retention deadline.

---

# 39. Post-Wedding Export Policy

V1 does not generate a complete wedding archive.

Structured exports remain available for supported data such as:

- Guests
- RSVP information

Photos may be downloaded individually.

Bulk photo/media export is deferred to a later version.

The V1 retention process must not depend on successful ZIP archive generation.

---

# 40. Archiving

After the applicable retention period:

- Photos may be deleted.
- Guest personal information may be deleted/anonymised.
- Minimal wedding metadata may remain.

Retained metadata may include:

- Wedding ID
- Dates
- Planner relationship
- Completion status
- Event count

Wedding HQ is not intended to permanently host wedding memories.

---

# 41. Platform

V1 is:

> **Responsive web application**

Supported form factors:

- Desktop
- Tablet
- Mobile browser

No native application is included in V1.

---

# 42. Accessibility and Simplicity

The guest experience should work for users with limited technical familiarity.

Important information should require minimal navigation.

Special consideration should be given to elderly guests.

---

# 43. Language

V1 supports:

> **English**

Multilingual support is future scope.

---

# 44. Approved V1 Technical Constraints

The following technical direction has been approved for V1:

- Next.js full-stack application
- TypeScript
- Node.js runtime
- Modular monolith
- No separate Express backend
- Vercel deployment
- MongoDB Atlas
- Mongoose
- Auth.js
- Google sign-in
- Email magic-link sign-in
- Cloudflare R2
- Resend
- Tailwind CSS
- Zod
- OpenAPI 3.1
- Versioned REST APIs
- IANA timezone support
- Simple scheduled/background processing
- No advanced media-processing pipeline

These implementation decisions may evolve in later versions without changing the underlying product concept.

---

# 45. Explicitly Out of Scope for V1

- Accommodation management
- Hotel room allocation
- Transportation management
- Airport pickup
- Railway pickup
- Driver assignment
- Vendor marketplace
- Vendor discovery
- Vendor portal
- Vendor login
- WhatsApp integration
- SMS
- Native mobile application
- Multilingual support
- QR guest check-in
- Seating/table management
- Gifts
- Cash-envelope tracking
- Food preferences
- Travel information
- Guest chat
- Two-way communication
- Payment gateway
- Advanced accounting
- Expense splitting
- Guest video upload
- Image compression pipeline
- Image transformation pipeline
- Permanent photo hosting
- Bulk media download
- Full wedding ZIP export
- Built-in invitation designer
- Elaborate website builder
- Public wedding websites
- Matrimony functionality
- Wedding social network
- Microservices
- Realtime/WebSocket infrastructure

---

# 46. Core V1 User Journeys

## Journey A — Create and Set Up Wedding

Bride/Groom creates the wedding.

→ Basic wedding information configured.

→ Planner/Admins added.

→ Wedding events created.

→ Planner/Admins create or import guest households.

→ Households assigned to relevant events.

→ Invitations distributed.

Bride/Groom retain permission to manage guests but are not expected to perform the operational work themselves.

---

## Journey B — Import Guests

Planner/Admin selects Import Guests.

→ Uploads CSV/XLSX.

→ System validates file.

→ Invalid rows are highlighted.

→ Import preview displayed.

→ Admin confirms.

→ Valid households created.

---

## Journey C — Invite Household

Planner/Admin creates or selects household.

→ Assigns invited events.

→ Secure personalised link generated.

→ Invitation email sent.

→ Guest opens link.

→ Guest sees invited events only.

→ Guest submits RSVP.

---

## Journey D — Manage Tasks

Admin creates task.

→ Assigns responsible person.

→ Collaborator access provided when necessary.

→ Collaborator updates status.

→ Dashboard updates.

---

## Journey E — Track Vendors

Admin creates vendor.

→ Assigns event.

→ Adds contact/cost/responsibility.

→ Updates status/notes.

---

## Journey F — Track Expenses

Admin creates expense.

→ Records estimated amount.

→ Records actual amount when known.

→ Dashboard recalculates totals.

---

## Journey G — Send Reminder

Admin selects event/audience.

→ Writes email.

→ Schedules date/time.

→ Wedding HQ sends automatically.

---

## Journey H — Upload Photos

Guest scans QR or uses guest link.

→ Selects image.

→ Uploads image.

→ Photo enters Pending Approval.

→ Admin approves/rejects.

→ Approved photo appears in gallery.

---

## Journey I — Export Guests

Planner/Admin selects guest export.

→ Selects CSV or XLSX.

→ Structured guest/RSVP file is generated.

→ File is downloaded.

---

## Journey J — Wedding Completion

Final event finishes.

→ Wedding marked complete.

→ Retention period begins.

→ Owners receive retention notifications.

→ Individual photos remain accessible during retention.

→ Expired media/personal data may later be removed.

→ Minimal wedding metadata remains archived.

---

# 47. Success Criteria

A successful Wedding HQ V1 pilot should demonstrate reduced reliance on separate tools for:

- Guest management
- RSVP tracking
- Event information
- Task ownership
- Vendor records
- Expenses
- Guest reminders
- Venue information
- Photo sharing

Qualitative validation should include reductions in:

- Calls
- Confusion
- Missed invitations
- Coordination problems
- Lost photos
- Manual spreadsheet work

---

# 48. Product Decision Principle

Any new proposed V1 capability must answer:

> **Does this directly reduce wedding coordination friction?**

If the answer is no, it should generally be deferred.

---

# 49. Final V1 Product Definition

> **Wedding HQ V1 is a private, web-based wedding operations platform that allows couples, planners and trusted organisers to coordinate events, households, RSVPs, tasks, vendors, basic expenses, email communication, livestream access and guest photos from one place, while giving guests an account-free personalised experience.**

---

# 50. PRD Status

**Wedding HQ PRD V1.1 — LOCKED BASELINE**

Future additions should be documented as explicit PRD revisions.

Examples:

```text
V1.2
V1.3
V2.0
```

New requirements should not silently expand V1.
