# Wedding HQ — Product Requirements Document

**Version:** 1.0  
**Status:** Locked for V1 Prototype  
**Product Name:** Wedding HQ  
**Name Status:** Placeholder only; final branding will be decided closer to market launch.

---

## 1. Product Overview

Wedding HQ is a private, web-based wedding planning and operations platform designed initially for Indian weddings.

The product exists to reduce the coordination problems that arise when wedding information is scattered across WhatsApp, spreadsheets, calls, email, photo-sharing tools, and individual family members.

Wedding HQ provides one central place for couples, wedding planners, family admins, collaborators, and guests to access or manage the information relevant to them.

The V1 product focuses on simplicity rather than covering every aspect of wedding planning.

The core principle is:

**Powerful for organisers. Extremely simple for guests.**

---

## 2. Problem Statement

Wedding planning commonly involves fragmented information and communication across multiple tools.

Common problems include:

- Guest lists stored in spreadsheets.
- Invitations distributed separately.
- RSVP responses tracked manually.
- Guests repeatedly calling for venue details.
- Different people handling different responsibilities without clear task ownership.
- Vendor information spread across calls, notes, and messages.
- Expenses tracked separately.
- Important wedding photos being lost across different phones and groups.
- Elderly guests struggling to locate event details.
- Family members not knowing who is responsible for which task.
- Wedding planners coordinating the same information manually across many stakeholders.

Wedding HQ aims to reduce this fragmentation by creating a single operational hub for the wedding.

---

## 3. Product Vision

Wedding HQ should become the central operating system for managing a wedding.

The product should eventually serve two major use cases:

### Personal Wedding Management

Used by:

- Bride
- Groom
- Family members
- Friends
- Wedding planner

### Professional Wedding Management

Used by:

- Independent wedding planners
- Event organisers
- Event-management companies

A professional planner may eventually manage multiple weddings through the same account.

The underlying architecture should support this future model even if V1 exposes only limited multi-wedding functionality.

---

## 4. V1 Objective

The objective of V1 is to validate whether a single platform can meaningfully reduce wedding-management friction.

The prototype should prove that Wedding HQ can improve:

1. Guest management
2. Task coordination
3. Vendor tracking
4. Expense visibility
5. Event communication
6. Photo collection
7. Access to essential wedding information

The prototype will eventually be tested during a real wedding.

---

## 5. Primary Users

### 5.1 Bride

One of the wedding owners.

Can manage the complete wedding.

### 5.2 Groom

One of the wedding owners.

Can manage the complete wedding.

### 5.3 Wedding Planner

Operational user who helps manage the wedding.

The planner may have broad operational access but does not own the wedding.

The planner may create, edit, and manage guest households and invitations.

### 5.4 Additional Admin

Trusted family member, friend, proxy, or organiser appointed by the couple.

Can assist with general wedding management.

Additional admins may create, edit, and manage guest households and invitations.

### 5.5 Collaborator

A lightweight role intended for people responsible for specific tasks.

Examples:

- Cousin handling decoration
- Sibling responsible for photographer coordination
- Friend coordinating a specific event

Collaborators should not receive access to the complete wedding-management system.

### 5.6 Guest

Receives a personalised secure link.

No account or app installation is required.

Guests can:

- View invited events
- RSVP
- Access venue information
- View event invitations
- Access livestream links
- Upload photos
- View approved photos
- Access designated help contacts

---

## 6. Ownership Model

The Bride and Groom are the primary owners of the wedding.

Ownership cannot be removed by:

- Planner
- Additional admin
- Collaborator

Only wedding owners should have authority over highly sensitive actions such as permanent wedding deletion.

The system should avoid hard-coded roles such as:

- Bride Proxy
- Groom Proxy

Instead, owners may appoint flexible additional admins.

Operational responsibilities such as guest household management do not need to sit with the Bride and Groom. Wedding Planners and Additional Admins should be able to handle guest setup, invitations, and related coordination work on their behalf.

---

## 7. Wedding Structure

The basic hierarchy is:

**Account / Organisation**

→ **Wedding**

→ **Events**

A user such as a professional planner may eventually belong to or manage multiple weddings.

The database architecture should therefore avoid assuming:

**One user = one wedding**

---

## 8. Wedding Setup

A new wedding should contain basic information including:

- Bride name
- Groom name
- Wedding title
- Wedding start/end dates
- Wedding description
- Primary wedding contacts
- Owners
- Planner
- Additional admins

The system should allow additional wedding settings where required.

---

## 9. Events

A wedding may contain multiple events.

Wedding HQ should provide default templates commonly useful for Indian weddings while supporting fully custom events.

Example templates:

- Engagement
- Haldi
- Mehendi
- Sangeet
- Wedding
- Reception

These templates are convenience options only.

The system must support:

- Christian weddings
- Muslim weddings
- Sikh weddings
- Regional weddings
- Interfaith weddings
- Civil ceremonies
- Custom celebrations

Users must be able to:

- Create events
- Rename events
- Delete events
- Add custom events
- Reorder events

---

## 10. Event Fields

Each event should support:

- Event name
- Event type
- Custom event type
- Date
- Start time
- Optional end time
- Venue name
- Venue address
- Google Maps link
- Event description
- Dress code
- Invitation graphic
- Optional YouTube Live link

---

## 11. Guest Management

Guests are primarily organised by household or family.

Example:

**Reddy Family**

Primary contact: Ravi Reddy  
Adults invited: 4  
Children invited: 2

Individual names within a household are optional.

The product should not require every individual guest to have their own account.

Guest household management is an operational admin responsibility in V1. The Bride and Groom retain permission to add or edit households, but the Wedding Planner and Additional Admins should also be able to create, edit, and manage them so the couple is not required to perform this work themselves.

---

## 12. Guest Household Fields

A household may include:

- Household/family name
- Primary contact name
- Primary email
- Optional phone number
- Number of adults invited
- Number of children invited
- Optional household-member names
- Internal admin notes
- Invited events
- RSVP status per event

---

## 13. Event-Specific Invitations

Invitations must be event-specific.

A household may be invited to:

- Reception only

while another household may be invited to:

- Sangeet
- Wedding
- Reception

Guests must only see events to which they have been invited.

The existence of private events should not be exposed to uninvited guests.

Wedding Planners and Additional Admins may assign households to events and manage invitation distribution.

---

## 14. Guest Access

Guests should not be required to:

- Register
- Create passwords
- Install an app

Each household receives a secure personalised link.

The personalised link acts as the guest's access mechanism.

V1 should not require an additional password.

---

## 15. RSVP

RSVP responses are stored separately for each event.

Available responses:

- Yes
- No
- Maybe

Guests may also provide:

- Number of adults attending
- Number of children attending

V1 will not collect:

- Food preferences
- Travel information
- Flight details
- Train details
- Hotel requirements
- Accommodation preferences

---

## 16. RSVP Editing Rules

Before the RSVP deadline:

- Guests may update their RSVP.
- Guests may update attendance numbers.
- Guests may change Yes/No/Maybe responses.
- Admins may record an RSVP on behalf of a guest if the response was received outside the platform.

Any admin-entered response should be visibly identified as being recorded on behalf of the guest.

After the RSVP deadline:

- Guest RSVP editing is locked.
- Admins should not silently modify the submitted response.
- Admins may add an internal note explaining a later change.
- An owner/admin may reopen or extend the RSVP deadline if required.

This maintains an auditable distinction between:

**Guest-submitted response**

and

**Admin-recorded information**

---

## 17. Invitation Graphics

Wedding HQ does not create invitations in V1.

Invitations will be designed externally by:

- Graphic designer
- Wedding designer
- Family
- Planner

Admins upload the resulting invitation artwork.

Supported invitation assets may include common formats such as:

- JPG
- PNG
- PDF

Each event may have its own invitation.

---

## 18. Communication

V1 supports email communication only.

No WhatsApp or SMS integration is required.

Admins should be able to target communication by audience.

Examples:

- All Reception guests
- All Sangeet invitees
- Guests who have not RSVP'd
- Guests who replied Maybe
- Confirmed Wedding attendees

---

## 19. Scheduled Email Reminders

Admins should be able to schedule reminders.

Examples:

- 7 days before event
- 2 days before event
- 1 day before event
- Custom date/time

Reminder configuration should allow selection of:

- Event
- Audience
- Delivery time
- Message

Communication is one-way in V1.

Guests do not reply through Wedding HQ.

---

## 20. Task Management

Task management is one of the core V1 features.

A task should contain:

- Task name
- Description/notes
- Assigned person
- Related event
- Due date
- Priority
- Status

Statuses:

- To Do
- In Progress
- Done

Priority may include:

- Low
- Medium
- High

---

## 21. Collaborator Role

When a task is assigned to someone who is not an admin, that person may be given Collaborator access.

A Collaborator should be able to:

- View tasks assigned to them
- Update task status
- Add task notes

A Collaborator should not automatically receive access to:

- Guest database
- Complete expense data
- All vendors
- Wedding settings
- Other private admin areas

The Collaborator role should remain deliberately lightweight.

---

## 22. Vendor Management

V1 includes internal vendor management only.

Vendors do not receive accounts.

There is no marketplace.

There is no vendor discovery.

There is no vendor-facing dashboard.

Vendor records may include:

- Vendor name
- Category
- Contact person
- Phone
- Email
- Related event
- Estimated cost
- Actual cost if required
- Responsible team member
- Status
- Notes

Example vendor categories:

- Photographer
- Decorator
- DJ
- Caterer
- Makeup artist
- Venue
- Entertainment
- Invitation designer

---

## 23. Expense Tracking

Expense tracking should remain simple.

Each expense contains:

- Expense name
- Category
- Related event
- Estimated amount
- Actual amount
- Notes

The dashboard should calculate:

- Total estimated cost
- Total actual cost
- Difference / variance

V1 does not include:

- Accounting
- Tax calculations
- GST handling
- Family expense splitting
- Approval chains
- Payment gateways
- Invoice workflows
- Financial reconciliation

---

## 24. Photo Collection

Wedding HQ should allow guests to upload photographs.

Guests may upload through:

- Their personalised wedding link
- An event-specific QR code

Guest accounts are not required.

V1 supports photographs only.

Guest video uploads are excluded.

---

## 25. QR Photo Upload

Each event may have its own QR code.

Scanning the QR should open the event's photo-upload experience.

The QR interface must not expose:

- Guest lists
- Private RSVP data
- Admin settings
- Internal wedding information

---

## 26. Photo Moderation

Guest-uploaded photographs must not automatically appear publicly within the wedding site.

Photo workflow:

**Pending Approval**

→ **Approved**

or

→ **Rejected**

Admins or authorised wedding operators may moderate photos.

---

## 27. Photo Galleries

Photos should be organised by event.

Example:

- Haldi Gallery
- Sangeet Gallery
- Wedding Gallery
- Reception Gallery

The platform may additionally provide:

**All Photos**

Only approved photographs appear in guest-visible galleries.

---

## 28. Livestream

Wedding HQ will not host or stream video directly.

Admins may add a YouTube Live link to an event.

Guests invited to that event may access:

**Watch Live**

from the guest interface.

---

## 29. Guest Homepage

The guest experience should remain extremely simple.

The guest homepage may display:

- Couple names
- Countdown to relevant wedding/event
- Invited events
- Event invitation
- Event date/time
- Venue
- Dress code
- Google Maps link
- RSVP controls
- YouTube Live link
- Approved photo gallery
- Photo upload
- Help contact

The page should avoid unnecessary complexity and deep navigation.

---

## 30. Guest Help Contact

Admins may assign one or more designated help contacts.

Examples:

- Cousin
- Wedding planner
- Family coordinator
- Event organiser

The contact may include:

- Name
- Phone number
- Email

Bride and Groom contact information should not be automatically exposed.

---

## 31. Admin Dashboard

The dashboard is the operational command centre.

The dashboard should answer:

1. How many guests are attending?
2. How many RSVPs remain unresolved?
3. How many tasks remain?
4. How many tasks are completed?
5. How much is being spent?
6. How many photos require approval?

Suggested dashboard metrics:

### Guests

- Confirmed
- Maybe
- Declined
- Awaiting response

### Tasks

- Completed
- Remaining
- Overdue

### Expenses

- Estimated total
- Actual total
- Variance

### Photos

- Approved
- Pending approval

The dashboard may additionally show:

- Upcoming events
- Upcoming tasks
- Recent RSVPs
- Pending photo approvals

---

## 32. Privacy

Wedding HQ is private by design.

Wedding information should not be publicly discoverable.

Guest access is through secure personalised links.

The product should minimise unnecessary exposure of:

- Guest names
- Phone numbers
- RSVP details
- Wedding information
- Private events
- Uploaded photographs

---

## 33. Wedding Completion

The wedding lifecycle does not end with permanent hosting.

After the final event:

**Wedding Active**

→ **Wedding Complete**

→ **Retention Period**

→ **Export**

→ **Archive**

The media-retention period should be calculated automatically from the final wedding event date.

---

## 34. Data Export

Owners should be able to export the wedding.

Export should include:

- Wedding information
- Event data
- Household/guest list
- RSVP data
- Task records
- Vendor records
- Expense records
- Approved photographs

The exact file formats can be determined during technical design.

---

## 35. Retention and Archiving

Wedding HQ is not intended to become a permanent digital wedding-memory site.

After the configured retention period:

- Uploaded media may be deleted.
- Guest personal information may be deleted according to retention policy.
- The owners should receive reminders to export their data before removal.

Minimal wedding metadata may remain archived.

Examples of retained metadata could include:

- Wedding ID
- Wedding dates
- Wedding status
- Planner relationship
- Event count
- Completion status

This allows future planner dashboards to retain operational history without permanently storing guest data or wedding media.

---

## 36. V1 Platform

V1 is web-first.

The product should be responsive and usable on:

- Desktop
- Tablet
- Mobile browser

No native mobile application is required.

A native application may be considered in V2 or later.

---

## 37. Accessibility and Simplicity

The guest experience must be usable by people with limited technical familiarity.

This is especially important for:

- Elderly guests
- Users unfamiliar with mobile apps
- Guests who only need venue and event information

Key information should require minimal navigation.

---

## 38. Language

V1 supports:

**English only**

Regional-language support may be considered in later versions.

---

## 39. Explicitly Out of Scope for V1

The following features are deliberately excluded:

- Accommodation management
- Hotel room allocation
- Airport pickup
- Railway pickup
- Driver assignment
- Transportation management
- Vendor marketplace
- Vendor discovery
- Vendor login
- Vendor portal
- WhatsApp integration
- SMS notifications
- Native mobile application
- Multilingual support
- QR guest check-in
- Seating plans
- Table management
- Gift tracking
- Cash-envelope tracking
- Food preferences
- Meal selection
- Travel information
- Flight information
- Train information
- Guest chat
- Two-way messaging
- Payment gateway
- Complex accounting
- Expense splitting
- Advanced invoicing
- Guest video uploads
- Permanent photo storage
- Built-in invitation designer
- Elaborate wedding-site themes
- Public wedding websites
- Full event-management ERP
- Matrimony functionality
- Wedding social network

---

## 40. Long-Term Product Direction

Wedding HQ may eventually support a professional planner model.

Example:

**Event Management Company**

→ Wedding A  
→ Wedding B  
→ Wedding C  
→ Wedding D

Potential later capabilities may include:

- Planner organisation accounts
- Multi-wedding dashboard
- Team management
- Reusable workflows
- Planner analytics
- Vendor workflows
- Mobile application
- WhatsApp integration
- Operational automation

These are not V1 requirements.

---

## 41. Core V1 User Journeys

### Journey A — Create and Set Up Wedding

Bride/Groom creates the wedding and remains the owner.

→ Adds basic wedding details.

→ Adds planner and/or additional admins.

→ Owners, planner, or admins create the wedding events.

→ Planner/admins may create and manage guest households.

→ Planner/admins assign households to the appropriate events.

→ Personalised invitation links are generated and distributed.

The Bride and Groom retain permission to add or edit households if they wish, but this is not intended to be their primary operational responsibility.

### Journey B — Invite Household

Admin or planner creates household.

→ Selects invited events.

→ Personalised link generated.

→ Guest receives invitation email.

→ Guest opens secure link.

→ Guest sees only invited events.

→ Guest submits RSVP.

### Journey C — Manage Tasks

Admin creates task.

→ Assigns responsible person.

→ Collaborator receives access if required.

→ Collaborator updates progress.

→ Dashboard reflects completion.

### Journey D — Track Vendors

Admin creates vendor record.

→ Links vendor to event.

→ Adds contact/cost/responsible person.

→ Updates vendor status and notes.

### Journey E — Track Expenses

Admin records estimated expense.

→ Updates actual expense.

→ Dashboard recalculates totals.

### Journey F — Send Reminder

Admin selects event/audience.

→ Creates email reminder.

→ Selects delivery date/time.

→ System sends reminder automatically.

### Journey G — Upload Photos

Guest scans event QR or uses wedding link.

→ Uploads photos.

→ Photos enter Pending Approval.

→ Admin approves/rejects.

→ Approved photos appear in event gallery.

### Journey H — Wedding Completion

Final event ends.

→ Retention countdown begins.

→ Owners receive reminders.

→ Owners export wedding.

→ Media and eligible personal data are removed after retention period.

→ Wedding metadata becomes archived.

---

## 42. Core V1 Success Criteria

The prototype should demonstrate that Wedding HQ can reduce operational fragmentation.

A successful pilot should show that organisers can manage the majority of the following without relying heavily on separate tools:

- Guest list
- RSVP status
- Wedding-event information
- Task ownership
- Vendor details
- Basic expense tracking
- Guest reminders
- Venue information
- Photo collection

The strongest validation signal will be feedback from a real wedding where organisers report reduced:

- Calls
- Confusion
- Missed invitations
- Coordination problems
- Lost photos
- Manual spreadsheet work

---

## 43. Product Decision Principle

Any proposed V1 feature should pass this test:

**Does this reduce wedding coordination friction?**

If it does not directly improve:

- coordination,
- visibility,
- communication,
- responsibility,
- guest access,
- or information management,

it should probably not enter V1.

---

## 44. Final V1 Product Definition

Wedding HQ V1 is:

> **A private, web-based wedding operations platform that allows couples and planners to manage events, guests, RSVPs, tasks, vendors, expenses, communication, livestream access, and guest photos from one central place, while giving guests a simple account-free experience through personalised links.**

The product is deliberately not intended to manage every possible wedding activity.

Its job is to make weddings easier to coordinate.

---

## 45. PRD Status

**Wedding HQ V1 PRD: LOCKED**

Any feature not included in this document is considered:

**Future scope**

unless formally approved as a V1 revision.

Future changes should be recorded as:

**PRD v1.x revision**

rather than silently expanding the original scope.
