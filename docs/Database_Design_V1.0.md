# Wedding HQ — Database Design

**Version:** 1.0  
**Status:** Proposed for Approval  
**Product:** Wedding HQ V1  
**Database:** MongoDB Atlas  
**ODM:** Mongoose  
**Architecture:** Multi-tenant modular monolith

---

# 1. Purpose

This document defines the V1 database design for Wedding HQ.

It describes:

- Core collections
- Entity relationships
- Multi-tenant ownership
- Guest household modelling
- Wedding membership and roles
- Event-specific invitations
- RSVP storage
- Task assignment
- Vendor and expense data
- Photo metadata
- Communication records
- Background jobs
- Audit logging
- Guest import metadata
- Indexing
- Data integrity rules
- Retention and deletion behaviour
- MongoDB embedding vs referencing decisions

The goal is to create a database foundation that is:

- Simple enough for V1
- Secure across multiple weddings
- Suitable for planners managing multiple weddings later
- Efficient for the expected query patterns
- Easy to translate into Mongoose schemas

---

# 2. Locked Database Decisions

The following decisions are locked for Wedding HQ V1.

## 2.1 One guest link per household

Each household receives one secure guest-access link.

The household does not receive separate links for:

- Sangeet
- Wedding
- Reception
- Other events

The guest authenticates once through the household link.

Wedding HQ then determines which events are visible using `event_invitations`.

---

## 2.2 Household ↔ Event is many-to-many

One household may be invited to many events.

One event may contain many households.

This relationship is stored using:

```text
event_invitations
```

instead of embedding guest lists inside event documents.

---

## 2.3 Tasks reference WeddingMembership

Task assignment uses:

```text
assigneeMembershipId
```

rather than:

```text
assigneeUserId
```

This keeps responsibility specific to a particular wedding.

---

## 2.4 RSVP deadline hierarchy

Each wedding may define a default RSVP deadline.

Each event may override that deadline.

Resolution rule:

```text
Event RSVP deadline
        ↓
if absent
        ↓
Wedding default RSVP deadline
```

---

## 2.5 Wedding-level tenancy

Most business records contain:

```text
weddingId
```

This is the primary tenant boundary.

---

## 2.6 Money uses minor units

Money should not be stored as floating-point currency values.

Example:

```text
₹12,345.67
```

is stored as:

```text
1234567 paise
```

with:

```text
currency = INR
```

---

## 2.7 UTC timestamps + IANA timezone

Actual timestamps should be stored as UTC dates.

The wedding stores an IANA timezone such as:

```text
Asia/Kolkata
```

Events inherit this timezone unless explicitly overridden.

---

## 2.8 Photos remain outside MongoDB

MongoDB stores:

- File metadata
- R2 object key
- Moderation state

Cloudflare R2 stores the actual image bytes.

---

## 2.9 Important history belongs in AuditLog

Wedding HQ does not embed large change-history arrays inside RSVP, Task, Expense or other domain documents.

Significant changes are captured using:

```text
audit_logs
```

---

# 3. Database Design Principles

Wedding HQ follows these MongoDB design principles.

### Reference major growing entities

Examples:

- Events
- Households
- RSVPs
- Tasks
- Photos
- Expenses

These should be separate collections.

### Embed small bounded objects

Examples:

- Venue
- Primary contact
- Vendor contact
- Household member names
- Help contacts

These can safely exist inside parent documents.

### Do not create giant wedding documents

The `weddings` collection should not contain arrays containing:

- Every guest
- Every task
- Every photo
- Every RSVP

Those entities grow independently and require separate querying.

---

# 4. Collection Overview

Wedding HQ V1 uses the following logical collections.

## Authentication

```text
users
accounts
sessions
verification_tokens
```

These support Auth.js.

## Wedding HQ domain data

```text
organizations
weddings
wedding_memberships
events
households
event_invitations
rsvps
tasks
vendors
expenses
photos
communications
imports
jobs
audit_logs
```

---

# 5. High-Level Relationship Model

```text
Organization
     │
     └──────< Wedding
                   │
                   ├──────< WeddingMembership >────── User
                   │
                   ├──────< Event
                   │
                   ├──────< Household
                   │              │
                   │              │
                   │       EventInvitation
                   │              │
                   │              ▼
                   │            Event
                   │              │
                   │              ▼
                   │             RSVP
                   │
                   ├──────< Task
                   ├──────< Vendor
                   ├──────< Expense
                   ├──────< Photo
                   ├──────< Communication
                   ├──────< Import
                   ├──────< Job
                   └──────< AuditLog
```

---

# 6. `organizations`

An organisation provides the foundation for future planner and event-management-company use cases.

Most V1 users may never interact with this concept directly.

## Schema

```typescript
Organization {
  _id: ObjectId

  name: string

  type:
    "PERSONAL" |
    "PLANNER" |
    "EVENT_COMPANY"

  createdBy: ObjectId

  createdAt: Date
  updatedAt: Date
}
```

## Example

```text
name = "Ravi & Priya Wedding"
type = PERSONAL
```

Future example:

```text
name = "ABC Events Pvt Ltd"
type = EVENT_COMPANY
```

---

# 7. `users`

The User model represents an authenticated Wedding HQ user.

Possible users include:

- Bride
- Groom
- Planner
- Admin
- Collaborator

Guests are not normal User records in V1.

## Schema

```typescript
User {
  _id: ObjectId

  name?: string
  email: string
  emailVerified?: Date
  image?: string

  createdAt: Date
  updatedAt: Date
}
```

## Important Rule

Do not store:

```typescript
role: "ADMIN"
```

inside User.

Roles are wedding-specific.

---

# 8. `weddings`

Wedding is the root business entity.

## Schema

```typescript
Wedding {
  _id: ObjectId

  organizationId: ObjectId

  title: string

  brideName: string
  groomName: string

  description?: string

  timezone: string
  currency: string

  startDate: Date
  endDate: Date

  status:
    "DRAFT" |
    "ACTIVE" |
    "COMPLETED" |
    "ARCHIVED"

  rsvpDefaultDeadline?: Date

  retentionEndsAt?: Date

  helpContacts: [
    {
      name: string
      label?: string
      phone?: string
      email?: string
    }
  ]

  createdBy: ObjectId

  createdAt: Date
  updatedAt: Date
}
```

## Example

```text
title = "Ravi & Priya Wedding"

timezone = "Asia/Kolkata"

currency = "INR"

status = "ACTIVE"
```

---

# 9. Wedding Status Lifecycle

Recommended lifecycle:

```text
DRAFT
  ↓
ACTIVE
  ↓
COMPLETED
  ↓
ARCHIVED
```

### DRAFT

Wedding exists but is not operationally active.

### ACTIVE

Wedding planning/event execution is ongoing.

### COMPLETED

Final event has finished.

Retention countdown may now apply.

### ARCHIVED

Wedding operational data has moved into long-term archived state.

---

# 10. `wedding_memberships`

This collection connects authenticated users to weddings.

It is central to:

- Roles
- Permissions
- Collaborator assignments
- Planner access
- Admin access

## Schema

```typescript
WeddingMembership {
  _id: ObjectId

  weddingId: ObjectId

  userId?: ObjectId

  email: string

  role:
    "OWNER" |
    "PLANNER" |
    "ADMIN" |
    "COLLABORATOR"

  status:
    "INVITED" |
    "ACTIVE" |
    "REVOKED"

  invitedBy?: ObjectId

  invitedAt?: Date
  acceptedAt?: Date

  createdAt: Date
  updatedAt: Date
}
```

---

# 11. Membership Invitation Flow

A collaborator or admin does not need an existing account before being invited.

Example:

```text
email = rahul@example.com

role = COLLABORATOR

status = INVITED

userId = null
```

After Rahul signs in:

```text
userId = <Rahul User ID>

status = ACTIVE
```

This supports task assignment before registration.

---

# 12. Membership Integrity

Recommended unique index:

```javascript
{
  weddingId: 1,
  email: 1
}
```

with uniqueness enforced.

This prevents the same email from accidentally holding duplicate memberships in one wedding.

---

# 13. `events`

An Event represents one ceremony or wedding function.

## Schema

```typescript
Event {
  _id: ObjectId

  weddingId: ObjectId

  name: string

  type:
    "ENGAGEMENT" |
    "HALDI" |
    "MEHENDI" |
    "SANGEET" |
    "WEDDING" |
    "RECEPTION" |
    "CUSTOM"

  customType?: string

  description?: string

  startsAt: Date
  endsAt?: Date

  timezone: string

  venue: {
    name?: string
    address?: string
    googleMapsUrl?: string
  }

  dressCode?: string

  invitationAsset?: {
    objectKey: string
    filename: string
    mimeType: string
  }

  youtubeLiveUrl?: string

  rsvpDeadline?: Date

  order: number

  createdAt: Date
  updatedAt: Date
}
```

---

# 14. Event Time Storage

The UI may collect:

```text
December 20, 2026
9:00 AM
Asia/Kolkata
```

The database should store the actual instant as UTC.

The event retains:

```text
timezone = Asia/Kolkata
```

for correct display and scheduling.

---

# 15. Event RSVP Deadline

Example:

```text
Wedding default deadline = December 5

Sangeet deadline = December 1
Wedding deadline = null
Reception deadline = December 10
```

Resolved values:

```text
Sangeet → December 1
Wedding → December 5
Reception → December 10
```

---

# 16. `households`

Household is the primary guest unit.

## Schema

```typescript
Household {
  _id: ObjectId

  weddingId: ObjectId

  householdName: string

  primaryContact: {
    name?: string
    email?: string
    phone?: string
  }

  adultsInvited: number
  childrenInvited: number

  members?: [
    {
      name: string
    }
  ]

  notes?: string

  guestAccess: {
    tokenHash: string

    status:
      "ACTIVE" |
      "REVOKED"

    createdAt: Date
    lastUsedAt?: Date
  }

  createdAt: Date
  updatedAt: Date
}
```

---

# 17. Household Example

```text
Household:
Reddy Family

Primary Contact:
Ravi Reddy

Adults Invited:
4

Children Invited:
2

Members:
Optional
```

Wedding HQ does not require individual names for every person.

---

# 18. Guest Token Storage

The raw invitation token must not be stored.

Wedding HQ generates something similar to:

```text
7c224f...high-entropy-random-token...
```

The guest receives:

```text
https://weddinghq.example/invite/<token>
```

MongoDB stores only:

```text
SHA-256(token)
```

or another appropriate cryptographic hash.

If the database is leaked, raw guest-access links are therefore not directly exposed.

---

# 19. Guest Access Lifecycle

```text
Household Created
      ↓
Secure Token Generated
      ↓
Hash Stored
      ↓
Link Sent to Guest
      ↓
Guest Opens Link
      ↓
Token Validated
      ↓
Guest Session Created
```

The token may later be revoked.

---

# 20. `event_invitations`

This collection creates the many-to-many relationship between:

```text
Household
     ↕
Event
```

## Schema

```typescript
EventInvitation {
  _id: ObjectId

  weddingId: ObjectId

  eventId: ObjectId
  householdId: ObjectId

  status:
    "ACTIVE" |
    "REVOKED"

  invitationSentAt?: Date

  createdAt: Date
  updatedAt: Date
}
```

---

# 21. Event Invitation Example

Reddy Family is invited to:

```text
Sangeet
Wedding
Reception
```

MongoDB stores three records:

```text
Reddy Family → Sangeet

Reddy Family → Wedding

Reddy Family → Reception
```

---

# 22. Event Invitation Constraint

Recommended unique index:

```javascript
{
  eventId: 1,
  householdId: 1
}
```

Unique.

This prevents duplicate invitations for the same event/household pair.

---

# 23. Why Event Invitations Are Separate

This enables efficient queries such as:

### Which events can this household see?

```text
Find event invitations by householdId.
```

### Which households are invited to Reception?

```text
Find event invitations by eventId.
```

### How many households are invited to Sangeet?

```text
Count event invitations by eventId.
```

---

# 24. `rsvps`

RSVP represents the current response of one household to one event.

## Schema

```typescript
RSVP {
  _id: ObjectId

  weddingId: ObjectId
  eventId: ObjectId
  householdId: ObjectId

  response:
    "YES" |
    "NO" |
    "MAYBE"

  adultsAttending: number
  childrenAttending: number

  source:
    "GUEST" |
    "ADMIN"

  recordedByMembershipId?: ObjectId

  internalNote?: string

  submittedAt: Date
  updatedAt: Date
}
```

---

# 25. RSVP Constraint

Recommended unique index:

```javascript
{
  eventId: 1,
  householdId: 1
}
```

Unique.

One household has one current RSVP per event.


---

# 26. RSVP Business Rules

Attendance values must never exceed the invitation allocation unless Wedding HQ explicitly introduces an override later.

Example:

```text
Adults Invited = 4
Children Invited = 2
```

Valid:

```text
Adults Attending = 3
Children Attending = 2
```

Invalid:

```text
Adults Attending = 7
```

unless future product rules explicitly allow this.

---

# 27. RSVP History

Wedding HQ does not store:

```typescript
history: [...]
```

inside every RSVP document.

Instead:

```text
audit_logs
```

records important changes.

Example:

```text
Guest changed RSVP
MAYBE → YES
```

This keeps RSVP records small.

---

# 28. RSVP Source Tracking

Guest-submitted:

```text
source = GUEST
```

Admin-recorded:

```text
source = ADMIN
recordedByMembershipId = ...
```

This supports the product requirement that admin-entered responses remain identifiable.

---

# 29. `tasks`

Task represents wedding work assigned to a Wedding HQ member.

## Schema

```typescript
Task {
  _id: ObjectId

  weddingId: ObjectId

  eventId?: ObjectId

  title: string
  description?: string

  assigneeMembershipId?: ObjectId

  dueAt?: Date

  priority:
    "LOW" |
    "MEDIUM" |
    "HIGH"

  status:
    "TODO" |
    "IN_PROGRESS" |
    "DONE"

  notes?: string

  createdByMembershipId: ObjectId

  completedAt?: Date

  createdAt: Date
  updatedAt: Date
}
```

---

# 30. Why Task Uses Membership ID

Suppose Rahul is:

```text
Collaborator — Wedding A
Planner — Wedding B
```

A global User reference only tells us:

```text
Rahul
```

A WeddingMembership reference tells us:

```text
Rahul acting as Collaborator on Wedding A
```

That is the correct permission context.

---

# 31. Task Completion

When:

```text
status = DONE
```

Wedding HQ should set:

```text
completedAt
```

When a completed task is reopened:

```text
completedAt = null
```

and an audit event should be created.

---

# 32. `vendors`

Vendor records are internal.

Vendors do not authenticate in V1.

## Schema

```typescript
Vendor {
  _id: ObjectId

  weddingId: ObjectId

  name: string
  category: string

  contact: {
    person?: string
    phone?: string
    email?: string
  }

  eventIds: ObjectId[]

  estimatedCostMinor?: number
  actualCostMinor?: number

  currency: string

  responsibleMembershipId?: ObjectId

  status:
    "PROSPECT" |
    "CONFIRMED" |
    "COMPLETED" |
    "CANCELLED"

  notes?: string

  createdAt: Date
  updatedAt: Date
}
```

---

# 33. Vendor ↔ Event Design

Vendor uses:

```typescript
eventIds: ObjectId[]
```

because one vendor may support several wedding events.

Example:

```text
Photographer
├── Sangeet
├── Wedding
└── Reception
```

This small bounded array is appropriate to embed.

---

# 34. `expenses`

Expense represents a basic financial record.

## Schema

```typescript
Expense {
  _id: ObjectId

  weddingId: ObjectId

  eventId?: ObjectId
  vendorId?: ObjectId

  name: string
  category: string

  estimatedAmountMinor?: number
  actualAmountMinor?: number

  currency: string

  notes?: string

  createdByMembershipId: ObjectId

  createdAt: Date
  updatedAt: Date
}
```

---

# 35. Money Storage Example

Instead of:

```typescript
actualAmount = 125000.50
```

store:

```typescript
actualAmountMinor = 12500050
currency = "INR"
```

This avoids floating-point rounding problems.

---

# 36. Currency Rules

Wedding may define:

```text
currency = INR
```

Expenses normally inherit that currency.

The database design should still store explicit currency information where useful so that future international weddings remain possible.

---

# 37. `photos`

Photo represents metadata for an image stored in Cloudflare R2.

## Schema

```typescript
Photo {
  _id: ObjectId

  weddingId: ObjectId
  eventId: ObjectId

  objectKey: string

  originalFilename: string
  mimeType: string
  sizeBytes: number

  uploaderType:
    "GUEST" |
    "USER"

  householdId?: ObjectId
  uploaderMembershipId?: ObjectId

  status:
    "PENDING" |
    "APPROVED" |
    "REJECTED"

  uploadedAt: Date

  approvedAt?: Date
  approvedByMembershipId?: ObjectId

  rejectedAt?: Date
  rejectedByMembershipId?: ObjectId

  createdAt: Date
  updatedAt: Date
}
```

---

# 38. Photo Storage

MongoDB does not contain:

```text
image bytes
```

MongoDB contains:

```text
objectKey
metadata
moderation status
```

Cloudflare R2 contains the image.

---

# 39. Cloudflare R2 Object Structure

Recommended structure:

```text
weddings/
  <weddingId>/
    events/
      <eventId>/
        photos/
          <uuid>-<filename>
```

Example:

```text
weddings/
  67abc123/
    events/
      67event456/
        photos/
          f91c-photo.jpg
```

---

# 40. Invitation Asset Storage

Invitation images/PDFs may use:

```text
weddings/
  <weddingId>/
    events/
      <eventId>/
        invitation/
          invitation.pdf
```

The Event document stores the object key.

---

# 41. `communications`

Communication stores operational email messages.

## Schema

```typescript
Communication {
  _id: ObjectId

  weddingId: ObjectId

  eventId?: ObjectId

  type:
    "INVITATION" |
    "RSVP_REMINDER" |
    "EVENT_REMINDER" |
    "GENERAL_UPDATE" |
    "RETENTION_WARNING"

  subject: string
  body: string

  audience: {
    type: string
    filters?: object
  }

  status:
    "DRAFT" |
    "SCHEDULED" |
    "PROCESSING" |
    "SENT" |
    "FAILED"

  scheduledAt?: Date
  sentAt?: Date

  providerMessageId?: string

  createdByMembershipId: ObjectId

  createdAt: Date
  updatedAt: Date
}
```

---

# 42. Communication Audience

Example audience:

```text
All Reception Guests
```

or:

```text
Reception guests where RSVP = MAYBE
```

V1 may store the selected audience definition as structured filters.

Wedding HQ should avoid permanently duplicating complete guest lists into Communication documents unless required.

---

# 43. `jobs`

Jobs support scheduled server work.

## Schema

```typescript
Job {
  _id: ObjectId

  weddingId?: ObjectId

  type:
    "SEND_INVITATION" |
    "SEND_REMINDER" |
    "SEND_RETENTION_WARNING" |
    "DELETE_EXPIRED_MEDIA"

  payload: object

  scheduledAt: Date

  status:
    "PENDING" |
    "PROCESSING" |
    "COMPLETED" |
    "FAILED"

  attempts: number

  lockedAt?: Date
  completedAt?: Date

  lastError?: string

  createdAt: Date
  updatedAt: Date
}
```

---

# 44. Job Processing

Vercel Cron periodically searches:

```text
status = PENDING

scheduledAt <= current time
```

Eligible jobs are claimed and executed.

Recommended index:

```javascript
{
  status: 1,
  scheduledAt: 1
}
```

---

# 45. Job Locking

A job should be atomically moved from:

```text
PENDING
```

to:

```text
PROCESSING
```

before execution.

This prevents duplicate workers from processing the same email reminder simultaneously.

---

# 46. `imports`

Guest import requires a preview before confirmation.

## Schema

```typescript
Import {
  _id: ObjectId

  weddingId: ObjectId

  type:
    "GUESTS"

  filename: string

  format:
    "CSV" |
    "XLSX"

  status:
    "UPLOADED" |
    "VALIDATED" |
    "CONFIRMED" |
    "FAILED" |
    "EXPIRED"

  totalRows: number
  validRows: number
  invalidRows: number

  errors?: [
    {
      row: number
      field?: string
      message: string
    }
  ]

  createdByMembershipId: ObjectId

  expiresAt: Date

  createdAt: Date
  updatedAt: Date
}
```

---

# 47. Import Data Retention

Wedding HQ should not retain temporary spreadsheet-processing data forever.

Import records may expire after a reasonable period.

Example:

```text
7 days
```

The exact value can be configured later.

---

# 48. Import Workflow

```text
CSV/XLSX Upload
       ↓
Parse
       ↓
Validate
       ↓
Create Import Preview
       ↓
Admin Reviews Errors
       ↓
Confirm
       ↓
Create Households
       ↓
Import = CONFIRMED
```

No Household documents should be created during the preview phase.

---

# 49. Duplicate Guest Handling

Possible duplicate signals:

```text
Same email
Same household name
Same phone number
```

V1 should flag possible duplicates.

It should not silently overwrite existing households.

---

# 50. `audit_logs`

AuditLog records important actions.

## Schema

```typescript
AuditLog {
  _id: ObjectId

  weddingId: ObjectId

  actorType:
    "USER" |
    "GUEST" |
    "SYSTEM"

  actorMembershipId?: ObjectId
  householdId?: ObjectId

  action: string

  entityType: string
  entityId?: ObjectId

  metadata?: object

  createdAt: Date
}
```


---

# 51. Recommended Audit Actions

Examples:

```text
WEDDING_CREATED

MEMBER_INVITED
MEMBER_ROLE_CHANGED
MEMBER_REVOKED

EVENT_CREATED
EVENT_UPDATED
EVENT_DELETED

HOUSEHOLD_CREATED
HOUSEHOLD_UPDATED
HOUSEHOLD_IMPORTED

INVITATION_ASSIGNED
INVITATION_REVOKED

RSVP_CREATED
RSVP_UPDATED
RSVP_RECORDED_BY_ADMIN
RSVP_DEADLINE_CHANGED

TASK_ASSIGNED
TASK_STATUS_CHANGED

VENDOR_CREATED
VENDOR_UPDATED

EXPENSE_CREATED
EXPENSE_UPDATED

PHOTO_UPLOADED
PHOTO_APPROVED
PHOTO_REJECTED
PHOTO_DELETED
```

---

# 52. Audit Log Principles

Audit logs should record:

- Who
- What
- Which entity
- When

They should not blindly store:

- Complete guest records
- Secret tokens
- Full email content
- Sensitive authentication details

---

# 53. Recommended Indexes

## Organizations

```javascript
{ createdBy: 1 }
```

---

## Weddings

```javascript
{ organizationId: 1 }

{ status: 1 }
```

---

## WeddingMemberships

```javascript
{ weddingId: 1, email: 1 } // unique

{ userId: 1, status: 1 }

{ weddingId: 1, role: 1 }
```

---

## Events

```javascript
{ weddingId: 1, startsAt: 1 }

{ weddingId: 1, order: 1 }
```

---

## Households

```javascript
{ weddingId: 1, householdName: 1 }

{ weddingId: 1, "primaryContact.email": 1 }
```

Primary contact email should not necessarily be globally unique.

---

## EventInvitations

```javascript
{ eventId: 1, householdId: 1 } // unique

{ householdId: 1 }

{ weddingId: 1, eventId: 1 }
```

---

## RSVPs

```javascript
{ eventId: 1, householdId: 1 } // unique

{ weddingId: 1, response: 1 }

{ weddingId: 1, eventId: 1, response: 1 }
```

---

## Tasks

```javascript
{ weddingId: 1, status: 1 }

{ weddingId: 1, assigneeMembershipId: 1 }

{ weddingId: 1, dueAt: 1 }
```

---

## Vendors

```javascript
{ weddingId: 1 }

{ weddingId: 1, category: 1 }
```

---

## Expenses

```javascript
{ weddingId: 1 }

{ weddingId: 1, eventId: 1 }

{ weddingId: 1, vendorId: 1 }
```

---

## Photos

```javascript
{ weddingId: 1, status: 1 }

{ weddingId: 1, eventId: 1, status: 1 }

{ weddingId: 1, uploadedAt: -1 }
```

---

## Communications

```javascript
{ weddingId: 1, status: 1 }

{ status: 1, scheduledAt: 1 }
```

---

## Jobs

```javascript
{ status: 1, scheduledAt: 1 }
```

---

## Imports

```javascript
{ weddingId: 1, createdAt: -1 }

{ expiresAt: 1 }
```

A TTL index may eventually be used for expired temporary import data if appropriate.

---

## AuditLogs

```javascript
{ weddingId: 1, createdAt: -1 }

{ weddingId: 1, entityType: 1, entityId: 1 }
```

---

# 54. Tenant Isolation Rule

Every wedding-specific API operation must scope the query by `weddingId`.

Bad:

```typescript
Task.findById(taskId)
```

Preferred:

```typescript
Task.findOne({
  _id: taskId,
  weddingId
})
```

This prevents a user from manipulating a resource belonging to another wedding.

---

# 55. Membership Authorisation

Before accessing wedding-owned data:

```text
Authenticated User
       ↓
Find ACTIVE WeddingMembership
       ↓
Check role
       ↓
Perform wedding-scoped query
```

Example:

```typescript
WeddingMembership.findOne({
  weddingId,
  userId,
  status: "ACTIVE"
})
```

---

# 56. Guest Tenant Isolation

Guest requests should not trust arbitrary:

```text
weddingId
```

from the browser.

The server derives:

```text
householdId
weddingId
```

from the validated guest session.

Example:

```text
Guest Session
     ↓
Household
     ↓
Wedding
```

---

# 57. Event Visibility Rule

Guest-visible events are calculated using:

```text
householdId
       ↓
event_invitations
       ↓
ACTIVE invitations
       ↓
Events
```

The guest should never receive the full wedding event list and have the frontend hide unauthorised entries.

Filtering happens server-side.

---

# 58. RSVP Validation

Before accepting an RSVP:

1. Household must belong to the wedding.
2. Event must belong to the wedding.
3. Active EventInvitation must exist.
4. RSVP deadline must not have passed.
5. Attendance count must be valid.
6. Guest session or authorised admin membership must be valid.

---

# 59. Task Validation

Before assigning a task:

1. Task and membership must belong to the same wedding.
2. Assignee membership must not be revoked.
3. Related event, when supplied, must belong to the same wedding.

---

# 60. Vendor Validation

Every `eventId` in:

```typescript
eventIds[]
```

must belong to the same wedding as the Vendor.

Responsible membership must also belong to the same wedding.

---

# 61. Expense Validation

If an Expense references:

```text
eventId
vendorId
```

both referenced entities must belong to the same wedding.

MongoDB references do not automatically enforce this.

The service layer must.

---

# 62. Photo Validation

Before a Photo record is confirmed:

1. R2 upload must have succeeded.
2. Wedding must match upload authorisation.
3. Event must belong to wedding.
4. Guest or user must have upload permission.
5. MIME type must be supported.
6. Size must be within V1 limits.

---

# 63. Soft Delete vs Hard Delete

Not every entity requires soft deletion.

Recommended approach:

### Hard deletion may be acceptable for:

- Temporary imports
- Failed jobs after cleanup
- Rejected unused media metadata

### Consider retained state/revocation for:

- Memberships
- Invitations
- Weddings

Example:

```text
Membership → REVOKED
Invitation → REVOKED
Wedding → ARCHIVED
```

This preserves important historical context.

---

# 64. Household Deletion

If an Admin attempts to delete a Household that already has:

- RSVP responses
- Audit history
- Photo uploads

Wedding HQ should avoid blindly removing related records.

Possible V1 approach:

```text
Archive/remove operational access
+
retain required references until retention cleanup
```

The exact UI behaviour can be determined during implementation.

---

# 65. Event Deletion

An Event with related:

- Invitations
- RSVPs
- Tasks
- Expenses
- Photos

should not be silently deleted without warning.

Recommended service behaviour:

```text
Check dependencies
       ↓
If dependencies exist
       ↓
Require explicit confirmation
```

V1 may use controlled cascade cleanup where appropriate.

---

# 66. Wedding Deletion

Permanent wedding deletion is Owner-only.

A full deletion operation must consider:

```text
events
memberships
households
event invitations
RSVPs
tasks
vendors
expenses
photos
communications
jobs
imports
audit logs
R2 media
```

This should be implemented as a deliberate domain operation, not simply:

```typescript
Wedding.deleteOne(...)
```

---

# 67. Wedding Archival

Archive is different from delete.

Archived Wedding may retain:

- Wedding metadata
- Planner relationship
- Dates
- Event count
- Completion state

Personal guest data/media may later be removed according to retention policy.

---

# 68. Retention Data

Wedding stores:

```typescript
retentionEndsAt?: Date
```

This is calculated from the final event date according to configured retention policy.

Jobs can then be scheduled against this timestamp.

---

# 69. Embedding Decisions

The following structures should be embedded.

## Event venue

```typescript
venue: {
  name,
  address,
  googleMapsUrl
}
```

## Household primary contact

```typescript
primaryContact: {
  name,
  email,
  phone
}
```

## Household member names

```typescript
members: [
  { name }
]
```

## Vendor contact

```typescript
contact: {
  person,
  phone,
  email
}
```

## Wedding help contacts

Small bounded array.

---

# 70. Referencing Decisions

The following should remain separate collections.

```text
Wedding → Events

Wedding → Households

Wedding → Tasks

Wedding → Vendors

Wedding → Expenses

Wedding → Photos

Event ↔ Household

Event/Household → RSVP
```

These entities may grow and require independent queries.

---

# 71. Data Not Stored in Wedding

The Wedding document should not contain:

```text
events[]
guests[]
tasks[]
photos[]
vendors[]
expenses[]
rsvps[]
```

This keeps the root wedding record small and stable.

---

# 72. Auth.js Collections

Auth.js may require collections such as:

```text
users
accounts
sessions
verification_tokens
```

The exact schemas should follow the selected Auth.js MongoDB/Mongoose adapter strategy.

Wedding HQ domain logic should not duplicate OAuth provider data unnecessarily.

---

# 73. Guest vs User Distinction

A Guest household is not an Auth.js User.

```text
Bride/Groom/Planner/Admin/Collaborator
        ↓
       User
        ↓
WeddingMembership
```

Guests:

```text
Household
   ↓
Guest access token/session
```

This avoids creating hundreds or thousands of unnecessary User accounts.

---

# 74. Expected Query Patterns

The database should optimise around real operations.

## Dashboard

Queries:

```text
Count RSVP by response

Count Tasks by status

Aggregate Expenses

Count Photos by status
```

---

## Guest list

```text
Find Households by wedding

Filter by RSVP state

Filter by invited event

Search household/contact
```

---

## Collaborator view

```text
Find tasks where:
assigneeMembershipId = current membership
```

---

## Photo moderation

```text
Find Photos where:
weddingId = X
status = PENDING
```

---

## Event guest list

```text
Find EventInvitations by eventId
```

---

# 75. Dashboard Aggregation

Dashboard values should be computed from source collections rather than duplicated into Wedding unless performance later requires caching.

Example:

```text
RSVP counts
   ↓
aggregate RSVPs

Task counts
   ↓
aggregate Tasks

Expense totals
   ↓
aggregate Expenses

Photo counts
   ↓
aggregate Photos
```

V1 does not need precomputed dashboard counters.

---

# 76. Database Transactions

MongoDB transactions should not be used everywhere.

Use them only when a business operation genuinely requires multiple related writes to succeed together.

Potential examples:

```text
Create Wedding
+
Create Owner memberships
```

or:

```text
Confirm Guest Import
+
Create many Households
+
Create invitation mappings
```

Otherwise prefer simple atomic document writes.

---

# 77. Optimistic Concurrency

For highly contested data, Mongoose versioning may help prevent accidental overwrites.

However, V1 should not introduce complex distributed-locking infrastructure.

Most Wedding HQ operations are low-contention.

---

# 78. Data Validation Layers

Validation occurs at multiple levels.

```text
Frontend validation
       ↓
Zod request validation
       ↓
Domain/business validation
       ↓
Mongoose schema validation
       ↓
MongoDB indexes/constraints
```

Frontend validation is for user experience.

Server validation is authoritative.

---

# 79. Sensitive Data

Wedding HQ should treat the following carefully:

- Guest email
- Guest phone
- RSVP status
- Private event membership
- Invitation tokens
- User authentication information

Raw guest tokens must never appear in:

- Audit logs
- Application logs
- Database documents

except transiently during verification.

---

# 80. Application Logging

Avoid logging entire documents.

Bad:

```text
console.log(household)
```

Potentially safer:

```text
Household created:
householdId = ...
weddingId = ...
```

Do not log guest contact details unless required for debugging and appropriately controlled.

---

# 81. MongoDB Document Size

MongoDB documents have a size limit.

Wedding HQ's referenced design avoids approaching that limit for Wedding/Event documents.

Large-growing data such as:

- Guests
- Photos
- Tasks

remain independent documents.

---

# 82. Pagination

Collections expected to require pagination:

```text
households
tasks
vendors
photos
audit_logs
communications
```

Initial V1 may use:

```text
page
limit
```

Cursor pagination can be introduced later if necessary.

---

# 83. Search

V1 does not require a dedicated search engine.

Basic MongoDB queries are sufficient for:

- Household name
- Contact email
- Vendor name
- Task title

A dedicated search service should not be introduced unless real usage demonstrates a need.

---

# 84. Photo Metadata Retention

When an R2 image is permanently deleted, MongoDB should either:

1. Delete the corresponding Photo document, or
2. Retain only minimal tombstone/audit information.

V1 should avoid Photo records pointing indefinitely to non-existent R2 objects.

---

# 85. Import Expiration

Temporary import data may use:

```text
expiresAt
```

and optionally MongoDB TTL cleanup.

This prevents abandoned import previews from accumulating indefinitely.

---

# 86. Audit Log Retention

Audit logs may outlive operational guest data where legally and operationally appropriate.

However, audit metadata should be designed so it does not unnecessarily preserve deleted guest personal information.

---

# 87. Database Naming Convention

Recommended MongoDB collection naming:

```text
snake_case
```

Examples:

```text
wedding_memberships
event_invitations
audit_logs
```

Mongoose model names may use PascalCase:

```text
WeddingMembership
EventInvitation
AuditLog
```

---

# 88. Identifier Strategy

MongoDB ObjectId is sufficient for internal IDs.

Public-facing URLs should not rely solely on ObjectId where an opaque token is more appropriate.

Examples:

### Internal

```text
weddingId = ObjectId
```

### Guest invitation

```text
secure random token
```

### QR upload

```text
secure scoped token
```

---

# 89. Required Referential Checks

Because MongoDB does not enforce foreign keys, the service layer must verify references.

Examples:

```text
Event.weddingId == Wedding._id

Household.weddingId == Wedding._id

Task.assigneeMembership.weddingId == Task.weddingId

Photo.event.weddingId == Photo.weddingId

Expense.vendor.weddingId == Expense.weddingId
```

These checks are mandatory business rules.

---

# 90. Final Collection Map

```text
users
accounts
sessions
verification_tokens

organizations

weddings
wedding_memberships

events

households
event_invitations
rsvps

tasks

vendors
expenses

photos

communications

imports

jobs

audit_logs
```

---

# 91. Final Relationship Summary

```text
Organization
      │
      └── Wedding
            │
            ├── WeddingMembership ── User
            │
            ├── Event
            │
            ├── Household
            │      │
            │      ├── EventInvitation ── Event
            │      │
            │      └── RSVP ───────────── Event
            │
            ├── Task ── WeddingMembership
            │
            ├── Vendor ── WeddingMembership / Events
            │
            ├── Expense ── Event / Vendor
            │
            ├── Photo ── Event / Household / Membership
            │
            ├── Communication
            │
            ├── Import
            │
            ├── Job
            │
            └── AuditLog
```

---

# 92. V1 Database Non-Goals

The V1 database does not need to support:

- Vendor accounts
- Vendor marketplace
- Hotel allocation
- Transportation
- Seating
- Guest chat
- Gift tracking
- Video uploads
- Photo compression variants
- Permanent media archives
- Payment processing
- Full accounting
- Multi-region database replication strategy
- Dedicated analytics warehouse
- Event sourcing
- CQRS
- Redis caching
- Dedicated search database

---

# 93. Database Evolution Strategy

When V2/V3 introduces new functionality, extend existing domain boundaries rather than redesigning the entire database.

Possible future collections:

```text
planner_teams
vendor_accounts
transport_assignments
hotel_allocations
seating_plans
payments
notifications
```

These are deliberately excluded from V1.

---

# 94. Database Design Principle

Wedding HQ V1 follows this rule:

> **Embed what is small and owned by one document. Reference what grows, is shared, or needs independent querying.**

Combined with:

> **Every wedding-owned record must remain securely scoped to its wedding.**

---

# 95. Final V1 Database Definition

Wedding HQ V1 uses MongoDB Atlas with a referenced, wedding-scoped multi-tenant data model.

The core business hierarchy is:

```text
Organization
    ↓
Wedding
    ↓
Operational collections
```

Users participate in weddings through WeddingMembership.

Guests are represented by Households rather than Auth.js accounts.

Households receive one secure guest link.

Event access is controlled through EventInvitation records.

RSVP is event-specific.

Tasks are assigned to WeddingMembership.

Photo binaries are stored in Cloudflare R2.

MongoDB stores only application metadata and business state.

Important state changes are captured through AuditLog.

---

# 96. Document Status

**Wedding HQ Database Design V1.0**

**Status: Awaiting Approval**

Once approved, this document becomes the V1 database baseline.

The next implementation step should be:

> **Translate this logical model into actual Mongoose schemas, validators and indexes, beginning with Organization → User/Auth → Wedding → WeddingMembership → Event → Household → EventInvitation → RSVP.**

Future database changes should be recorded explicitly as:

```text
Database Design V1.1
Database Design V1.2
Database Design V2.0
```

rather than silently modifying the baseline.
