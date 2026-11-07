# Wedding HQ — System Design & Architecture

**Version:** 1.0  
**Status:** Proposed for Approval  
**Product:** Wedding HQ V1  
**Architecture Style:** Modular Monolith  
**Deployment Platform:** Vercel

---

# 1. Purpose

This document defines the V1 system architecture for Wedding HQ.

It describes:

- Application architecture
- Deployment model
- Module boundaries
- Authentication
- Authorisation
- MongoDB data model
- REST API structure
- Cloudflare R2 integration
- Email architecture
- Background jobs
- Guest invitation security
- Photo upload architecture
- CSV/XLSX import/export
- Audit logging
- Security considerations
- Timezone handling
- Deployment environments
- Future scalability boundaries

The primary architectural principle is:

> **Build a clean foundation without overengineering the prototype.**

---

# 2. Architecture Goals

Wedding HQ V1 should be:

- Simple to build
- Simple to deploy
- Simple to understand
- Secure by default
- Modular internally
- Suitable for real wedding testing
- Capable of supporting multiple weddings
- Capable of supporting professional planners later
- Easy to evolve into future versions

Wedding HQ V1 should not prematurely introduce:

- Microservices
- Kubernetes
- Kafka
- RabbitMQ
- Redis
- Dedicated media-processing services
- Complex event-driven architecture
- WebSockets
- Multi-region infrastructure

---

# 3. Technology Stack

| Layer | Technology |
|---|---|
| Application Framework | Next.js |
| UI Runtime | React through Next.js |
| Language | TypeScript |
| Server Runtime | Node.js |
| Architecture | Modular Monolith |
| Hosting | Vercel |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Validation | Zod |
| Authentication | Auth.js |
| OAuth | Google |
| Passwordless Authentication | Email Magic Link |
| Email | Resend |
| Object Storage | Cloudflare R2 |
| Styling | Tailwind CSS |
| API Style | REST |
| API Version | `/api/v1` |
| API Specification | OpenAPI 3.1 |
| Scheduled Processing | Vercel Cron + MongoDB persisted jobs |
| Spreadsheet Processing | CSV/XLSX parser library |
| Timezone Standard | IANA timezone identifiers |

Next.js replaces the need for a separate React SPA and separate Express backend.

React exists internally because Next.js is built on React, but Wedding HQ will not maintain a separate React frontend project.

---

# 4. Architectural Style

Wedding HQ uses a:

> **Full-stack Next.js modular monolith**

Everything belongs to one primary application and repository.

```text
Wedding HQ
│
├── UI
├── REST API
├── Authentication
├── Business Logic
├── Database Access
├── Background Jobs
└── External Integrations
```

The application remains internally separated into business modules.

---

# 5. High-Level Architecture

```text
                           USERS

        ┌───────────────┬───────────────┐
        │ Organisers    │ Guests        │
        │               │               │
        │ Bride/Groom   │ Invite Link   │
        │ Planner       │ QR Upload     │
        │ Admin         │               │
        │ Collaborator  │               │
        └───────┬───────┴───────┬───────┘
                │               │
                └────── HTTPS ──┘
                        │
                        ▼
              ┌───────────────────┐
              │      Vercel       │
              │                   │
              │ Next.js Monolith  │
              │                   │
              │ UI                │
              │ REST API          │
              │ Auth.js           │
              │ Domain Services   │
              │ Cron Endpoints    │
              └───┬─────┬─────┬─┘
                  │     │     │
        ┌─────────┘     │     └───────────┐
        ▼               ▼                 ▼
 MongoDB Atlas    Cloudflare R2        Resend
 Metadata/Data       Photos             Email
```

---

# 6. Monolith Module Boundaries

The application should be organised into modules.

```text
modules/
│
├── auth/
├── organisations/
├── weddings/
├── memberships/
├── events/
├── guests/
├── invitations/
├── rsvps/
├── tasks/
├── vendors/
├── expenses/
├── photos/
├── communications/
├── imports/
├── exports/
├── jobs/
└── audit/
```

Each module should generally contain:

```text
schema
model
validation
service/business logic
repository/data access
API handlers
types
```

Modules should communicate through service interfaces rather than importing database internals from each other indiscriminately.

---

# 7. Suggested Project Structure

```text
src/
│
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── admin/
│   ├── guest/
│   └── api/
│       └── v1/
│
├── modules/
│   ├── auth/
│   ├── organisations/
│   ├── weddings/
│   ├── events/
│   ├── guests/
│   ├── rsvps/
│   ├── tasks/
│   ├── vendors/
│   ├── expenses/
│   ├── photos/
│   ├── communications/
│   ├── jobs/
│   └── audit/
│
├── lib/
│   ├── mongodb/
│   ├── auth/
│   ├── r2/
│   ├── resend/
│   ├── validation/
│   ├── permissions/
│   └── errors/
│
├── components/
├── types/
└── config/
```

---

# 8. Frontend Architecture

Wedding HQ uses the Next.js App Router.

Prefer Server Components for:

- Dashboard rendering
- Guest information
- Events
- Lists
- Read-heavy pages

Use Client Components only where browser interaction is required.

Examples:

- RSVP form
- Drag/drop upload
- Photo selector
- Interactive table filtering
- Form state
- Modal workflows

The goal is not to eliminate React but to avoid making Wedding HQ an unnecessarily client-heavy SPA.

---

# 9. Backend Architecture

There is no separate Express server.

Backend functionality lives inside the same Next.js application.

The backend consists of:

```text
Route Handler
      ↓
Validation
      ↓
Authentication
      ↓
Authorisation
      ↓
Domain Service
      ↓
Repository / Mongoose
      ↓
MongoDB
```

External systems are accessed through adapters:

```text
EmailService → Resend
StorageService → Cloudflare R2
```

---

# 10. REST API Philosophy

All externally meaningful backend operations should have explicit REST API contracts.

Base path:

```text
/api/v1
```

Example:

```text
GET    /api/v1/weddings/:weddingId/events
POST   /api/v1/weddings/:weddingId/events
PATCH  /api/v1/weddings/:weddingId/events/:eventId
DELETE /api/v1/weddings/:weddingId/events/:eventId
```

OpenAPI 3.1 should document the API contract.

---

# 11. REST Response Convention

Successful response:

```json
{
  "data": {}
}
```

Successful collection:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 120
  }
}
```

Error:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

---

# 12. Standard HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 202 | Accepted for background processing |
| 204 | Successful request with no body |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Conflict |
| 413 | File/request too large |
| 422 | Validation failure |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

---

# 13. Authentication Model

## 13.1 Organisers

The following users authenticate through Auth.js:

- Bride
- Groom
- Planner
- Admin
- Collaborator

Supported authentication methods:

### Google OAuth

```text
Continue with Google
```

### Email Magic Link

```text
Enter email
      ↓
Resend sends magic link
      ↓
User opens link
      ↓
Auth.js creates session
```

No Wedding HQ password database is required.

---

# 14. Guest Authentication

Guests do not create user accounts.

An invitation contains a high-entropy random token.

Example:

```text
/invite/<token>
```

Recommended flow:

```text
Guest opens link
      ↓
Server hashes received token
      ↓
Hash matched against stored invitation token
      ↓
Invitation validated
      ↓
Short-lived guest session created
      ↓
Secure HttpOnly cookie issued
      ↓
Guest redirected to clean URL
```

The raw invitation token should not be stored in MongoDB.

Store only its cryptographic hash.

---

# 15. Role Model

Recommended roles:

```text
OWNER
PLANNER
ADMIN
COLLABORATOR
```

Guest permissions use invitation/session scopes rather than normal membership roles.

---

# 16. Permission Matrix

| Capability | Owner | Planner | Admin | Collaborator | Guest |
|---|---:|---:|---:|---:|---:|
| Manage wedding | ✓ | ✓* | ✓* |  |  |
| Delete wedding | ✓ |  |  |  |  |
| Manage events | ✓ | ✓ | ✓ |  |  |
| Manage guests | ✓ | ✓ | ✓ |  |  |
| Import guests | ✓ | ✓ | ✓ |  |  |
| Export guests | ✓ | ✓ | ✓ |  |  |
| Manage RSVP | ✓ | ✓ | ✓ |  | Own only |
| Manage tasks | ✓ | ✓ | ✓ | Assigned only |  |
| Manage vendors | ✓ | ✓ | ✓ |  |  |
| Manage expenses | ✓ | ✓ | ✓ |  |  |
| Schedule email | ✓ | ✓ | ✓ |  |  |
| Moderate photos | ✓ | ✓ | ✓ |  |  |
| Upload photo | ✓ | ✓ | ✓ | ✓ | ✓ |
| View private event | ✓ | ✓ | ✓ | If relevant | If invited |

`*` Subject to owner-controlled administrative restrictions.

---

# 17. Multi-Tenant Data Model

Wedding HQ should use wedding-level tenancy.

Most domain records contain:

```text
weddingId
```

This includes:

- Events
- Households
- Tasks
- Vendors
- Expenses
- Photos
- Communications
- Audit records

This provides a consistent security boundary.

Every query involving wedding-owned data must verify the requesting user's access to the referenced `weddingId`.

---

# 18. Organisation Model

An Organisation concept should exist from V1 even if it remains mostly invisible.

Example:

```text
Organisation
└── Weddings
    ├── Wedding A
    ├── Wedding B
    └── Wedding C
```

Possible organisation types:

```text
PERSONAL
PLANNER
EVENT_COMPANY
```

For V1, most weddings may simply belong to a personal/default organisation.

---

# 19. Core MongoDB Collections

Recommended collections:

```text
users
accounts
sessions
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
jobs
imports
audit_logs
```

---

# 20. User Model

Example conceptual schema:

```typescript
User {
  _id
  name
  email
  image?
  createdAt
  updatedAt
}
```

Authentication-provider details should remain separated where required by Auth.js.

---

# 21. Wedding Model

```typescript
Wedding {
  _id
  organizationId

  title

  brideName
  groomName

  description?

  startDate
  endDate

  timezone

  status:
    "DRAFT" |
    "ACTIVE" |
    "COMPLETED" |
    "ARCHIVED"

  retentionEndsAt?

  createdBy

  createdAt
  updatedAt
}
```

---

# 22. Wedding Membership Model

```typescript
WeddingMembership {
  _id
  weddingId
  userId

  role:
    "OWNER" |
    "PLANNER" |
    "ADMIN" |
    "COLLABORATOR"

  status:
    "ACTIVE" |
    "INVITED" |
    "REVOKED"

  createdAt
  updatedAt
}
```

Recommended unique index:

```text
weddingId + userId
```

---

# 23. Event Model

```typescript
Event {
  _id
  weddingId

  name
  type
  customType?

  description?

  date
  startTime
  endTime?

  timezone

  venueName?
  venueAddress?
  googleMapsUrl?

  dressCode?

  invitationAssetKey?
  youtubeLiveUrl?

  order

  createdAt
  updatedAt
}
```

---

# 24. Household Model

```typescript
Household {
  _id
  weddingId

  householdName

  primaryContactName?
  primaryEmail?
  primaryPhone?

  adultsInvited
  childrenInvited

  members?: [
    {
      name
    }
  ]

  notes?

  createdAt
  updatedAt
}
```

---

# 25. Event Invitation Model

Event invitations map households to events.

```typescript
EventInvitation {
  _id

  weddingId
  householdId
  eventId

  tokenHash

  status:
    "ACTIVE" |
    "REVOKED"

  createdAt
  updatedAt
}
```

Depending on implementation, one household-level token may also grant scoped access to all invited events.

---

# 26. RSVP Model

```typescript
RSVP {
  _id

  weddingId
  eventId
  householdId

  response:
    "YES" |
    "NO" |
    "MAYBE"

  adultsAttending
  childrenAttending

  source:
    "GUEST" |
    "ADMIN"

  recordedByUserId?

  submittedAt
  updatedAt
}
```

Recommended unique constraint:

```text
eventId + householdId
```

---

# 27. Task Model

```typescript
Task {
  _id
  weddingId

  title
  description?

  eventId?
  assigneeUserId?

  dueDate?

  priority:
    "LOW" |
    "MEDIUM" |
    "HIGH"

  status:
    "TODO" |
    "IN_PROGRESS" |
    "DONE"

  createdBy

  createdAt
  updatedAt
}
```

---

# 28. Vendor Model

```typescript
Vendor {
  _id
  weddingId

  name
  category

  contactPerson?
  phone?
  email?

  eventId?

  estimatedCost?
  actualCost?

  responsibleUserId?

  status?
  notes?

  createdAt
  updatedAt
}
```

---

# 29. Expense Model

```typescript
Expense {
  _id
  weddingId

  name
  category

  eventId?

  estimatedAmount?
  actualAmount?

  notes?

  createdBy

  createdAt
  updatedAt
}
```

All money should use explicit currency fields or wedding-level currency configuration.

Default may initially be:

```text
INR
```

but currency should not be hard-coded into storage design.

---

# 30. Photo Model

```typescript
Photo {
  _id

  weddingId
  eventId

  objectKey

  originalFilename
  mimeType
  sizeBytes

  uploaderType:
    "GUEST" |
    "USER"

  uploaderUserId?
  householdId?

  status:
    "PENDING" |
    "APPROVED" |
    "REJECTED"

  uploadedAt
  approvedAt?
  approvedBy?
}
```

MongoDB stores metadata only.

Actual image bytes live in Cloudflare R2.

---

# 31. Cloudflare R2 Architecture

Use one private R2 bucket or environment-specific buckets.

Example object-key structure:

```text
weddings/
  <weddingId>/
    events/
      <eventId>/
        photos/
          <uuid>-photo.jpg
```

Invitation assets may use:

```text
weddings/
  <weddingId>/
    events/
      <eventId>/
        invitation/
          invitation.pdf
```

---

# 32. Photo Upload Flow

Wedding HQ V1 deliberately does not perform image compression.

```text
Guest selects photo
      ↓
Browser validates basic file information
      ↓
POST upload-authorisation request
      ↓
Wedding HQ validates guest/session/event
      ↓
Wedding HQ generates temporary R2 presigned PUT URL
      ↓
Browser uploads directly to R2
      ↓
Browser confirms upload to Wedding HQ
      ↓
Photo metadata saved in MongoDB
      ↓
Status = PENDING
```

The image does not need to pass through the Next.js server.

---

# 33. Photo Upload Security

Before issuing a signed upload URL, verify:

- Valid wedding
- Valid event
- Valid guest/user access
- Allowed MIME type
- Maximum file-size policy
- Generated object key belongs to authorised wedding/event

The R2 bucket must remain private.

Users must never be allowed to choose arbitrary object paths.

---

# 34. Photo Viewing

When displaying an approved private photo:

```text
Browser
   ↓
Wedding HQ validates access
   ↓
Temporary signed GET URL
   ↓
Cloudflare R2
```

Alternative delivery mechanisms can be introduced later if necessary.

---

# 35. Photo Moderation Flow

```text
Upload
  ↓
PENDING
  ↓
Admin Review
 ┌──────────────┐
 ↓              ↓
APPROVED      REJECTED
```

Only `APPROVED` photos should appear in guest-facing galleries.

---

# 36. Photo Deletion

Deletion should remove:

1. R2 object
2. MongoDB photo metadata, or transition metadata into an appropriate deleted state

Where important, deletion should create an audit event.

---

# 37. Email Architecture

Resend is the V1 email provider.

```text
Wedding HQ
    ↓
EmailService
    ↓
Resend
```

EmailService should be an internal abstraction.

Conceptual interface:

```typescript
interface EmailService {
  sendMagicLink(...)
  sendInvitation(...)
  sendReminder(...)
  sendRetentionNotice(...)
}
```

This prevents business logic from becoming tightly coupled to Resend.

---

# 38. Email Types

V1 email use cases:

- Auth.js magic link
- Guest invitation
- RSVP reminder
- Event reminder
- Wedding update
- Retention warning

---

# 39. Scheduled Jobs

Avoid introducing a dedicated queue infrastructure in V1.

Use:

```text
MongoDB jobs collection
        +
Vercel Cron
```

Conceptual architecture:

```text
Vercel Cron
    ↓
/api/internal/jobs/process
    ↓
Find due MongoDB jobs
    ↓
Claim job
    ↓
Execute
    ↓
Mark complete/failed
```

---

# 40. Job Model

```typescript
Job {
  _id

  type

  weddingId?

  payload

  scheduledAt

  status:
    "PENDING" |
    "PROCESSING" |
    "COMPLETED" |
    "FAILED"

  attempts

  lockedAt?
  completedAt?
  lastError?

  createdAt
}
```

---

# 41. V1 Job Types

Possible job types:

```text
SEND_INVITATION
SEND_REMINDER
SEND_RETENTION_WARNING
DELETE_EXPIRED_MEDIA
```

Complete wedding ZIP generation is not included.

---

# 42. Timezone Architecture

Each wedding stores an IANA timezone.

Example:

```text
Asia/Kolkata
```

Event schedules inherit the wedding timezone unless explicitly overridden.

Store actual timestamps in UTC where appropriate.

Convert for presentation/scheduling using the event/wedding timezone.

Never rely on the Vercel server's local timezone.

---

# 43. Guest CSV/XLSX Import Architecture

Import endpoint receives a spreadsheet.

Recommended flow:

```text
Upload spreadsheet
      ↓
Parse
      ↓
Normalize headers
      ↓
Validate rows with Zod
      ↓
Split:
  valid rows
  invalid rows
      ↓
Return preview
      ↓
Admin confirms
      ↓
Bulk insert valid households
```

The initial upload should not immediately mutate production data.

Use a preview/confirmation step.

---

# 44. Import Validation

Validate fields such as:

- Household name
- Email format
- Phone format if provided
- Adults invited
- Children invited
- Event mapping

Duplicate handling should be explicit.

Recommended V1 behaviour:

```text
Flag duplicate candidates for review.
Do not silently overwrite existing households.
```

---

# 45. Guest Export Architecture

Supported formats:

- CSV
- XLSX

Because guest data is relatively small compared with media, export may be generated synchronously unless actual data volume proves otherwise.

No full wedding ZIP is generated.

---

# 46. Audit Logging

Record important business actions.

Examples:

```text
Wedding created
Admin added
Guest imported
RSVP recorded by admin
RSVP deadline changed
Task completed
Expense modified
Photo approved
Photo rejected
```

Do not attempt to log every UI click.

---

# 47. Audit Log Model

```typescript
AuditLog {
  _id

  weddingId

  actorType:
    "USER" |
    "GUEST" |
    "SYSTEM"

  actorId?

  action

  entityType
  entityId?

  metadata?

  createdAt
}
```

Sensitive values should not be blindly copied into audit metadata.

---

# 48. REST API — Authentication

Auth.js may own its internal authentication endpoints.

Wedding HQ application APIs require an Auth.js session unless specifically guest-facing.

---

# 49. REST API — Weddings

```text
POST   /api/v1/weddings
GET    /api/v1/weddings
GET    /api/v1/weddings/:weddingId
PATCH  /api/v1/weddings/:weddingId
DELETE /api/v1/weddings/:weddingId
```

`DELETE` requires Owner permission.

---

# 50. REST API — Memberships

```text
GET    /api/v1/weddings/:weddingId/members
POST   /api/v1/weddings/:weddingId/members
PATCH  /api/v1/weddings/:weddingId/members/:membershipId
DELETE /api/v1/weddings/:weddingId/members/:membershipId
```

Owner membership cannot be removed by non-owners.

---

# 51. REST API — Events

```text
GET    /api/v1/weddings/:weddingId/events
POST   /api/v1/weddings/:weddingId/events

GET    /api/v1/weddings/:weddingId/events/:eventId
PATCH  /api/v1/weddings/:weddingId/events/:eventId
DELETE /api/v1/weddings/:weddingId/events/:eventId
```

---

# 52. REST API — Households

```text
GET    /api/v1/weddings/:weddingId/households
POST   /api/v1/weddings/:weddingId/households

GET    /api/v1/weddings/:weddingId/households/:householdId
PATCH  /api/v1/weddings/:weddingId/households/:householdId
DELETE /api/v1/weddings/:weddingId/households/:householdId
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

---

# 53. REST API — Guest Import/Export

```text
POST /api/v1/weddings/:weddingId/guest-imports/preview

POST /api/v1/weddings/:weddingId/guest-imports/:importId/confirm

GET  /api/v1/weddings/:weddingId/guest-exports?format=csv

GET  /api/v1/weddings/:weddingId/guest-exports?format=xlsx
```

---

# 54. REST API — Event Invitations

```text
GET  /api/v1/weddings/:weddingId/households/:householdId/invitations

POST /api/v1/weddings/:weddingId/households/:householdId/invitations

DELETE /api/v1/weddings/:weddingId/households/:householdId/invitations/:eventId
```

---

# 55. REST API — Guest Session

Conceptually:

```text
POST /api/v1/guest/session
```

Input:

```json
{
  "token": "secure-invitation-token"
}
```

The API validates the token and establishes a secure guest session.

The implementation may perform this directly through the invite route rather than exposing the token exchange as a general public API.

---

# 56. REST API — Guest Wedding View

```text
GET /api/v1/guest/wedding
```

Returns only authorised information for the guest household.

No `weddingId` supplied by the guest should be blindly trusted.

Wedding identity should come from the guest session.

---

# 57. REST API — RSVP

Guest-facing:

```text
GET  /api/v1/guest/events/:eventId/rsvp

PUT  /api/v1/guest/events/:eventId/rsvp
```

Admin-facing:

```text
GET  /api/v1/weddings/:weddingId/rsvps

PUT  /api/v1/weddings/:weddingId/events/:eventId/households/:householdId/rsvp
```

Admin-entered RSVP must record:

```text
source = ADMIN
recordedByUserId
```

---

# 58. REST API — Tasks

```text
GET    /api/v1/weddings/:weddingId/tasks
POST   /api/v1/weddings/:weddingId/tasks

GET    /api/v1/weddings/:weddingId/tasks/:taskId
PATCH  /api/v1/weddings/:weddingId/tasks/:taskId
DELETE /api/v1/weddings/:weddingId/tasks/:taskId
```

Collaborator API may restrict results to tasks assigned to the current user.

---

# 59. REST API — Vendors

```text
GET    /api/v1/weddings/:weddingId/vendors
POST   /api/v1/weddings/:weddingId/vendors

GET    /api/v1/weddings/:weddingId/vendors/:vendorId
PATCH  /api/v1/weddings/:weddingId/vendors/:vendorId
DELETE /api/v1/weddings/:weddingId/vendors/:vendorId
```

---

# 60. REST API — Expenses

```text
GET    /api/v1/weddings/:weddingId/expenses
POST   /api/v1/weddings/:weddingId/expenses

GET    /api/v1/weddings/:weddingId/expenses/:expenseId
PATCH  /api/v1/weddings/:weddingId/expenses/:expenseId
DELETE /api/v1/weddings/:weddingId/expenses/:expenseId
```

Dashboard summaries may use:

```text
GET /api/v1/weddings/:weddingId/expenses/summary
```

---

# 61. REST API — Communication

```text
POST /api/v1/weddings/:weddingId/communications

GET  /api/v1/weddings/:weddingId/communications
```

Scheduled messages create persisted job records.

---

# 62. REST API — Photo Upload

Guest:

```text
POST /api/v1/guest/events/:eventId/photos/upload-url
POST /api/v1/guest/events/:eventId/photos/confirm
```

Admin/user:

```text
POST /api/v1/weddings/:weddingId/events/:eventId/photos/upload-url
POST /api/v1/weddings/:weddingId/events/:eventId/photos/confirm
```

The two-step process prevents MongoDB records from claiming files exist before upload succeeds.

---

# 63. REST API — Photo Gallery

Guest:

```text
GET /api/v1/guest/events/:eventId/photos
```

Only returns:

```text
APPROVED
```

photos.

Admin:

```text
GET /api/v1/weddings/:weddingId/photos
```

Supports filtering:

```text
?status=PENDING
?eventId=...
```

---

# 64. REST API — Photo Moderation

```text
POST /api/v1/weddings/:weddingId/photos/:photoId/approve

POST /api/v1/weddings/:weddingId/photos/:photoId/reject

DELETE /api/v1/weddings/:weddingId/photos/:photoId
```

---

# 65. REST API — Dashboard

```text
GET /api/v1/weddings/:weddingId/dashboard
```

Possible response:

```json
{
  "data": {
    "guests": {
      "confirmed": 320,
      "maybe": 40,
      "declined": 30,
      "awaiting": 100
    },
    "tasks": {
      "completed": 25,
      "remaining": 12,
      "overdue": 3
    },
    "expenses": {
      "estimated": 1500000,
      "actual": 1430000
    },
    "photos": {
      "approved": 430,
      "pending": 64
    }
  }
}
```

---

# 66. REST API — Audit Log

```text
GET /api/v1/weddings/:weddingId/audit-logs
```

Typically restricted to:

```text
OWNER
PLANNER
ADMIN
```

Pagination required.

---

# 67. Validation

All write APIs should validate input using Zod.

Flow:

```text
HTTP request
    ↓
Zod validation
    ↓
Authentication
    ↓
Authorisation
    ↓
Business rules
    ↓
Database mutation
```

Never rely solely on frontend validation.

---

# 68. Error Handling

Define application-specific error codes.

Examples:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
FORBIDDEN
WEDDING_NOT_FOUND
EVENT_NOT_FOUND
HOUSEHOLD_NOT_FOUND
RSVP_DEADLINE_PASSED
UPLOAD_NOT_ALLOWED
INVALID_INVITATION
INVITATION_REVOKED
PHOTO_TOO_LARGE
UNSUPPORTED_FILE_TYPE
```

---

# 69. Database Indexing

Initial useful indexes include:

```text
WeddingMembership:
  weddingId + userId

Event:
  weddingId + date

Household:
  weddingId + primaryEmail

RSVP:
  weddingId + eventId + householdId

Task:
  weddingId + status
  weddingId + assigneeUserId

Photo:
  weddingId + status
  weddingId + eventId

Job:
  status + scheduledAt

AuditLog:
  weddingId + createdAt
```

Indexes should be driven by actual query patterns.

---

# 70. Security Principles

V1 security requirements:

- HTTPS only
- Secure HttpOnly cookies
- SameSite cookie policy
- Private R2 bucket
- Signed upload/download URLs
- Token hashing
- Strong random invite tokens
- Role-based authorisation
- Wedding-level tenancy checks
- Zod server validation
- File-type validation
- File-size validation
- Rate limiting on sensitive endpoints
- Secrets stored only in environment configuration
- Audit important administrative changes
- Never trust client-provided role information

---

# 71. Rate Limiting

Prioritise rate limiting for:

- Guest invite token validation
- Magic-link requests
- RSVP mutations
- Photo upload URL generation
- Photo confirmation
- Email-triggering operations
- Import endpoints

A simple V1 implementation is sufficient.

Advanced distributed rate-limiting infrastructure is not required.

---

# 72. Secrets

Examples:

```text
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

MONGODB_URI

RESEND_API_KEY

R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ENDPOINT
```

Never expose server secrets through `NEXT_PUBLIC_*`.

---

# 73. Environment Strategy

Recommended:

```text
Local Development
Vercel Preview / Staging
Production
```

Each environment should preferably use logically separated:

- Databases
- Storage prefixes/buckets
- Resend configuration

At minimum, production wedding data must not be mixed with local development data.

---

# 74. Observability

Minimum V1:

- Vercel application logs
- Structured server-side error logs
- Audit logs for domain actions

Optional but recommended:

- Sentry for application error tracking

Observability should remain lightweight during prototype development.

---

# 75. OpenAPI 3.1

The REST API should have an OpenAPI specification.

OpenAPI should define:

- Paths
- HTTP methods
- Request bodies
- Query parameters
- Response schemas
- Authentication
- Status codes
- Error schemas

The OpenAPI file may live at:

```text
/openapi/wedding-hq-v1.yaml
```

Development environments may expose interactive API documentation later.

---

# 76. Deployment

Git-based deployment flow:

```text
Developer
   ↓
Git Repository
   ↓
Push / Pull Request
   ↓
Vercel Build
   ↓
Preview Deployment
   ↓
Production Deployment
```

V1 requires no container orchestration.

---

# 77. Build-Time Checks

Deployment should fail when critical checks fail.

Recommended:

```text
TypeScript type checking
Linting
Unit tests
Build verification
```

Integration/E2E tests may gradually be added.

---

# 78. Testing Strategy

## Unit Tests

Business logic such as:

- RSVP deadlines
- Permissions
- Expense calculations
- Guest import validation

## Integration Tests

Examples:

- API + MongoDB
- Auth permission checks
- R2 presign generation

## End-to-End Tests

Recommended important flows:

- Create wedding
- Add event
- Import household
- Guest RSVP
- Assign task
- Approve photo

Playwright is suitable for browser-level testing.

---

# 79. Performance Strategy

V1 does not need aggressive optimisation.

Use:

- Appropriate MongoDB indexes
- Server rendering
- Pagination
- Direct browser → R2 upload
- Query only required fields

Avoid:

- Premature caching systems
- Redis
- Complex CDN architecture
- Custom image-processing infrastructure

---

# 80. Pagination

Large collections should use pagination.

Examples:

- Guests
- Tasks
- Vendors
- Photos
- Audit logs

Initial implementation may use page/limit.

Cursor-based pagination can be introduced later if necessary.

---

# 81. Retention Jobs

When a wedding becomes complete:

```text
Final event date
      ↓
Calculate retentionEndsAt
      ↓
Create warning jobs
      ↓
Retention deadline
      ↓
Delete eligible media/data
```

Deletion policy must align with the final product privacy policy before production launch.

---

# 82. Bulk Media Export

Explicitly excluded from V1.

Wedding HQ will not attempt to:

- ZIP every photo
- Build 10–20 GB archives
- Stream large archives through Vercel
- Create dedicated export workers

This may be revisited in later versions.

---

# 83. Individual Photo Download

Individual approved photos may be downloaded through temporary signed R2 URLs.

Example:

```text
GET /api/v1/guest/photos/:photoId/download
```

or:

```text
GET /api/v1/weddings/:weddingId/photos/:photoId/download
```

The backend authorises access before generating the temporary URL.

---

# 84. Future Scalability Path

The modular monolith should be kept until a real scaling problem appears.

Possible future extraction candidates:

```text
Media service
Email service
Background worker
Import/export service
```

But only after evidence warrants separation.

---

# 85. Explicit V1 Non-Architecture

Wedding HQ V1 will not include:

```text
Microservices
Kubernetes
Kafka
RabbitMQ
Redis
WebSockets
Dedicated image processors
Image compression pipeline
Multiple photo variants
Complex distributed queues
Multi-region deployment
Dedicated search engine
GraphQL
Full event-driven architecture
```

---

# 86. Architecture Decision Summary

Wedding HQ V1 is:

> **A TypeScript-based Next.js modular monolith deployed on Vercel, using MongoDB Atlas and Mongoose for structured data, Auth.js for organiser authentication, secure invitation sessions for guests, Cloudflare R2 for private file storage, Resend for transactional email, Zod for server validation, Tailwind CSS for UI, Vercel Cron with MongoDB-backed jobs for scheduled operations, and explicit versioned REST APIs documented using OpenAPI 3.1.**

---

# 87. V1 Architecture Principle

The system should be:

> **Simple where complexity can wait, structured where future correction would be expensive.**

Therefore Wedding HQ V1 deliberately invests in:

- Correct tenancy
- Clear roles
- Secure authentication
- Explicit APIs
- Private storage
- Data validation
- Module boundaries
- Auditability
- Timezone correctness

while postponing:

- Infrastructure optimisation
- Media processing
- Distributed systems
- Microservices
- Advanced queues
- Realtime architecture

---

# 88. Document Status

**Wedding HQ System Design & Architecture V1.0**

**Status: Awaiting Approval**

Once approved, this document becomes the baseline architecture for Wedding HQ V1.

Future architecture changes should be recorded as explicit revisions:

```text
Architecture V1.1
Architecture V1.2
Architecture V2.0
```
