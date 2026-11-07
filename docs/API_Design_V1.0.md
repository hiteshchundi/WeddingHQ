# Wedding HQ — API Design

**Version:** 1.0  
**Status:** Proposed for Approval  
**Product:** Wedding HQ V1  
**API Style:** REST  
**API Specification:** OpenAPI 3.1  
**Base Path:** `/api/v1`  
**Application:** Next.js Modular Monolith  
**Authentication:** Auth.js + Guest Sessions

---

# 1. Purpose

This document defines the REST API contract for Wedding HQ V1.

It defines:

- API conventions
- Authentication mechanisms
- Role-based authorisation
- Guest access
- Request and response formats
- Wedding APIs
- Membership APIs
- Event APIs
- Household APIs
- Guest import/export APIs
- Invitation APIs
- RSVP APIs
- Task APIs
- Vendor APIs
- Expense APIs
- Communication APIs
- Photo APIs
- QR photo-upload APIs
- Dashboard APIs
- Audit APIs
- Error contracts
- Pagination
- Filtering
- Validation
- Rate-limiting expectations
- OpenAPI requirements

The API should provide a stable contract between:

```text
Next.js UI
    ↕
Wedding HQ REST API
    ↕
Domain Services
    ↕
MongoDB / R2 / Resend
```

---

# 2. API Design Principles

Wedding HQ V1 follows these principles.

## 2.1 REST-oriented resources

Use resource-oriented URLs.

Preferred:

```text
GET /api/v1/weddings/:weddingId/events
```

Avoid action-heavy URLs such as:

```text
/api/getAllWeddingEvents
```

---

## 2.2 Explicit versioning

All Wedding HQ application APIs use:

```text
/api/v1
```

Future incompatible APIs may use:

```text
/api/v2
```

---

## 2.3 Server-side authorisation

Frontend visibility is not security.

Every protected endpoint must independently verify:

1. Authentication
2. Wedding membership
3. Role
4. Wedding ownership of referenced resources
5. Domain-specific permission

---

## 2.4 Wedding-scoped resources

Admin-facing business resources should normally be scoped through:

```text
/weddings/:weddingId/...
```

Example:

```text
/api/v1/weddings/:weddingId/tasks/:taskId
```

---

## 2.5 Guest APIs do not trust wedding IDs

Guest APIs derive:

```text
householdId
weddingId
```

from the authenticated guest session.

Guest-facing routes therefore use:

```text
/api/v1/guest/...
```

instead of allowing arbitrary wedding identifiers.

---

# 3. Transport

All production API traffic must use:

```text
HTTPS
```

Requests and responses use:

```text
application/json
```

except file upload/download endpoints.

---

# 4. URL Convention

Use plural resource names.

Examples:

```text
/weddings
/events
/households
/tasks
/vendors
/expenses
/photos
```

Identifiers are represented as URL parameters.

Example:

```text
/weddings/:weddingId/events/:eventId
```

---

# 5. ID Representation

MongoDB ObjectIds are returned as JSON strings.

Example:

```json
{
  "id": "690dc2ad18ba4f0bb8db1391"
}
```

External clients should treat IDs as opaque strings.

---

# 6. Date and Time Format

All API timestamps use ISO 8601.

Example:

```text
2026-12-20T03:30:00.000Z
```

When submitting event times, clients should include an explicit timezone offset.

Example:

```text
2026-12-20T09:00:00+05:30
```

The event also stores an IANA timezone:

```text
Asia/Kolkata
```

---

# 7. Currency Format

Money is represented using minor units.

Example:

```json
{
  "estimatedAmountMinor": 15000000,
  "currency": "INR"
}
```

means:

```text
₹150,000.00
```

The API must not use floating-point currency values.

---

# 8. Standard Success Envelope

Single resource:

```json
{
  "data": {
    "id": "..."
  }
}
```

---

# 9. Collection Envelope

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 350,
    "totalPages": 7
  }
}
```

---

# 10. Error Envelope

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": null
  }
}
```

Validation example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": {
        "primaryEmail": "Invalid email address."
      }
    }
  }
}
```

---

# 11. Standard HTTP Status Codes

| HTTP | Usage |
|---|---|
| `200` | Successful read/update |
| `201` | Resource created |
| `202` | Accepted for scheduled/background processing |
| `204` | Successful deletion/no response body |
| `400` | Malformed request |
| `401` | Authentication required |
| `403` | Authenticated but forbidden |
| `404` | Resource not found |
| `409` | Conflict/duplicate |
| `413` | Payload/file too large |
| `415` | Unsupported media type |
| `422` | Domain or validation failure |
| `429` | Rate limited |
| `500` | Unexpected server error |

---

# 12. Pagination

Initial V1 pagination uses:

```text
?page=1&limit=50
```

Default:

```text
page = 1
limit = 50
```

Recommended maximum:

```text
limit = 100
```

Example:

```text
GET /api/v1/weddings/:weddingId/households?page=2&limit=50
```

---

# 13. Sorting

Where supported:

```text
?sort=createdAt
&order=desc
```

Allowed sorting fields should be explicitly whitelisted per endpoint.

Clients must not be allowed to submit arbitrary MongoDB sort expressions.

---

# 14. Search

Text-searchable collection APIs may expose:

```text
?q=reddy
```

Examples:

```text
GET /households?q=reddy

GET /vendors?q=photography
```

V1 uses simple MongoDB-backed search.

---

# 15. Common Filtering

Examples:

```text
?status=ACTIVE

?eventId=...

?response=YES

?priority=HIGH
```

All filters must be explicitly supported.

Raw MongoDB filters must never be accepted from clients.

---

# 16. Organiser Authentication

Authenticated Wedding HQ users include:

- OWNER
- PLANNER
- ADMIN
- COLLABORATOR

Authentication uses Auth.js.

Supported login methods:

- Google OAuth
- Email Magic Link

Application APIs use the secure Auth.js session cookie.

---

# 17. Auth.js Routes

Auth.js manages its own framework-specific authentication endpoints.

They are not part of the Wedding HQ business REST contract.

Conceptually:

```text
/api/auth/*
```

Wedding HQ `/api/v1` endpoints consume the authenticated session.

---

# 18. Guest Authentication

Guests do not have Auth.js accounts.

Households receive one secure invitation link.

Conceptual entry URL:

```text
/invite/<secure-token>
```

The token is exchanged for a guest session.

---

# 19. Guest Session API

## `POST /api/v1/guest/session`

Creates a scoped guest session from a household invitation token.

### Authentication

None.

### Request

```json
{
  "token": "raw-secure-invitation-token"
}
```

### Processing

Server:

1. Hashes token.
2. Finds active Household guest-access record.
3. Verifies wedding is accessible.
4. Creates guest session.
5. Sets secure HttpOnly cookie.

### Response

```json
{
  "data": {
    "authenticated": true
  }
}
```

### Errors

```text
INVALID_INVITATION
INVITATION_REVOKED
WEDDING_NOT_AVAILABLE
```

---

# 20. Guest Session Cookie

Guest session cookie should be:

```text
HttpOnly
Secure
SameSite=Lax or stricter where practical
```

Guest APIs should never depend solely on client-provided household IDs.

---

# 21. Role Definitions

## OWNER

Bride/Groom.

Highest wedding-level authority.

## PLANNER

Operational wedding manager.

## ADMIN

Trusted wedding administrator.

## COLLABORATOR

Task-focused operational user.

## GUEST

Household-scoped guest session.

---

# 22. Permission Summary

| Operation | Owner | Planner | Admin | Collaborator | Guest |
|---|---:|---:|---:|---:|---:|
| View wedding management | ✓ | ✓ | ✓ | Limited | |
| Update wedding | ✓ | ✓ | ✓ | | |
| Delete wedding | ✓ | | | | |
| Manage members | ✓ | ✓* | ✓* | | |
| Manage events | ✓ | ✓ | ✓ | | |
| Manage households | ✓ | ✓ | ✓ | | |
| Import/export guests | ✓ | ✓ | ✓ | | |
| Manage invitations | ✓ | ✓ | ✓ | | |
| Manage RSVPs | ✓ | ✓ | ✓ | | Own |
| Manage all tasks | ✓ | ✓ | ✓ | | |
| Update assigned tasks | ✓ | ✓ | ✓ | ✓ | |
| Manage vendors | ✓ | ✓ | ✓ | | |
| Manage expenses | ✓ | ✓ | ✓ | | |
| Schedule email | ✓ | ✓ | ✓ | | |
| Moderate photos | ✓ | ✓ | ✓ | | |
| Upload photos | ✓ | ✓ | ✓ | ✓ | ✓ |

`*` Planner/Admin cannot remove owners or perform owner-only operations.

---

# 23. Wedding Resource Shape

```json
{
  "id": "weddingId",
  "organizationId": "organizationId",
  "title": "Ravi & Priya Wedding",
  "brideName": "Priya",
  "groomName": "Ravi",
  "description": null,
  "timezone": "Asia/Kolkata",
  "currency": "INR",
  "startDate": "2026-12-18T00:00:00.000Z",
  "endDate": "2026-12-20T00:00:00.000Z",
  "status": "ACTIVE",
  "rsvpDefaultDeadline": "2026-12-05T18:29:59.999Z",
  "retentionEndsAt": null,
  "helpContacts": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

# 24. Create Wedding

## `POST /api/v1/weddings`

Creates a wedding and initial owner membership.

### Authentication

Auth.js user.

### Request

```json
{
  "title": "Ravi & Priya Wedding",
  "brideName": "Priya",
  "groomName": "Ravi",
  "timezone": "Asia/Kolkata",
  "currency": "INR",
  "startDate": "2026-12-18T00:00:00+05:30",
  "endDate": "2026-12-20T23:59:59+05:30",
  "description": null
}
```

### Response

`201 Created`

```json
{
  "data": {
    "id": "...",
    "status": "DRAFT"
  }
}
```

---

# 25. Wedding Endpoints

| Method | Endpoint | Roles |
|---|---|---|
| POST | `/weddings` | Authenticated User |
| GET | `/weddings` | Authenticated User |
| GET | `/weddings/:weddingId` | Member |
| PATCH | `/weddings/:weddingId` | Owner/Planner/Admin |
| DELETE | `/weddings/:weddingId` | Owner |

---

# 26. List User Weddings

## `GET /api/v1/weddings`

Returns weddings where the authenticated user has an active membership.

Optional:

```text
?status=ACTIVE
```

---

# 27. Update Wedding

## `PATCH /api/v1/weddings/:weddingId`

Partial update.

Example:

```json
{
  "description": "Wedding celebrations",
  "rsvpDefaultDeadline": "2026-12-05T23:59:59+05:30",
  "helpContacts": [
    {
      "name": "Rahul",
      "label": "Family Coordinator",
      "phone": "+919999999999"
    }
  ]
}
```

---

# 28. Wedding Status Transition

Wedding status may be updated through the wedding PATCH API.

Allowed transitions:

```text
DRAFT → ACTIVE

ACTIVE → COMPLETED

COMPLETED → ARCHIVED
```

Invalid transitions should return:

```text
INVALID_STATUS_TRANSITION
```

---

# 29. Delete Wedding

## `DELETE /api/v1/weddings/:weddingId`

Owner-only.

This endpoint represents a domain deletion operation.

It must not simply delete the Wedding document.

It must account for dependent MongoDB records and R2 assets.

### Response

`204 No Content`

---

# 30. Member Resource

```json
{
  "id": "...",
  "userId": "...",
  "email": "rahul@example.com",
  "role": "COLLABORATOR",
  "status": "ACTIVE",
  "invitedAt": "...",
  "acceptedAt": "..."
}
```

---

# 31. Membership Endpoints

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/weddings/:weddingId/members` | Owner/Planner/Admin |
| POST | `/weddings/:weddingId/members` | Owner/Planner/Admin |
| PATCH | `/weddings/:weddingId/members/:membershipId` | Owner/Planner/Admin |
| DELETE | `/weddings/:weddingId/members/:membershipId` | Owner/Planner/Admin |

---

# 32. Invite Member

## `POST /api/v1/weddings/:weddingId/members`

### Request

```json
{
  "email": "rahul@example.com",
  "role": "COLLABORATOR"
}
```

### Response

`201 Created`

```json
{
  "data": {
    "id": "...",
    "email": "rahul@example.com",
    "role": "COLLABORATOR",
    "status": "INVITED"
  }
}
```

The service may trigger a Resend membership-invitation email.

---

# 33. Membership Rules

The API must prevent:

- Non-owner removing an Owner.
- Planner promoting themselves to Owner.
- Admin promoting themselves to Owner.
- Duplicate membership for same wedding/email.
- Assigning invalid roles.

---

# 34. Update Membership

## `PATCH /api/v1/weddings/:weddingId/members/:membershipId`

Example:

```json
{
  "role": "ADMIN"
}
```

or:

```json
{
  "status": "REVOKED"
}
```

---

# 35. Event Resource

```json
{
  "id": "...",
  "weddingId": "...",
  "name": "Sangeet",
  "type": "SANGEET",
  "customType": null,
  "description": "...",
  "startsAt": "2026-12-18T13:30:00.000Z",
  "endsAt": "2026-12-18T17:30:00.000Z",
  "timezone": "Asia/Kolkata",
  "venue": {
    "name": "Example Convention Centre",
    "address": "Hyderabad",
    "googleMapsUrl": "https://..."
  },
  "dressCode": "Indo-Western",
  "youtubeLiveUrl": null,
  "rsvpDeadline": "...",
  "order": 1
}
```

---

# 36. Event Endpoints

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/weddings/:weddingId/events` | Owner/Planner/Admin |
| POST | `/weddings/:weddingId/events` | Owner/Planner/Admin |
| GET | `/weddings/:weddingId/events/:eventId` | Owner/Planner/Admin |
| PATCH | `/weddings/:weddingId/events/:eventId` | Owner/Planner/Admin |
| DELETE | `/weddings/:weddingId/events/:eventId` | Owner/Planner/Admin |
| PATCH | `/weddings/:weddingId/events/reorder` | Owner/Planner/Admin |

---

# 37. Create Event

## `POST /api/v1/weddings/:weddingId/events`

```json
{
  "name": "Sangeet",
  "type": "SANGEET",
  "description": "Music and dance night",
  "startsAt": "2026-12-18T19:00:00+05:30",
  "endsAt": "2026-12-18T23:00:00+05:30",
  "timezone": "Asia/Kolkata",
  "venue": {
    "name": "Example Convention Centre",
    "address": "Hyderabad",
    "googleMapsUrl": "https://maps.google.com/..."
  },
  "dressCode": "Indo-Western",
  "rsvpDeadline": "2026-12-01T23:59:59+05:30"
}
```

---

# 38. Custom Event

If:

```json
{
  "type": "CUSTOM"
}
```

then:

```text
customType
```

must be supplied.

Example:

```json
{
  "name": "Church Ceremony",
  "type": "CUSTOM",
  "customType": "CHURCH_CEREMONY"
}
```

---

# 39. Reorder Events

## `PATCH /api/v1/weddings/:weddingId/events/reorder`

```json
{
  "events": [
    {
      "eventId": "eventA",
      "order": 1
    },
    {
      "eventId": "eventB",
      "order": 2
    }
  ]
}
```

---

# 40. Invitation Asset Upload

Invitation graphics are stored in Cloudflare R2.

## Request upload URL

```text
POST /api/v1/weddings/:weddingId/events/:eventId/invitation-asset/upload-url
```

Request:

```json
{
  "filename": "sangeet-invite.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 1234567
}
```

Response:

```json
{
  "data": {
    "uploadId": "opaque-upload-id",
    "uploadUrl": "temporary-r2-presigned-url",
    "expiresAt": "..."
  }
}
```

---

# 41. Confirm Invitation Asset

```text
POST /api/v1/weddings/:weddingId/events/:eventId/invitation-asset/confirm
```

```json
{
  "uploadId": "opaque-upload-id"
}
```

Server verifies the R2 object exists and updates the Event.

---

# 42. Remove Invitation Asset

```text
DELETE /api/v1/weddings/:weddingId/events/:eventId/invitation-asset
```

---

# 43. Household Resource

```json
{
  "id": "...",
  "householdName": "Reddy Family",
  "primaryContact": {
    "name": "Ravi Reddy",
    "email": "ravi@example.com",
    "phone": "+919999999999"
  },
  "adultsInvited": 4,
  "childrenInvited": 2,
  "members": [
    {
      "name": "Ravi Reddy"
    }
  ],
  "notes": null
}
```

Guest token hashes are never returned.

---

# 44. Household Endpoints

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/weddings/:weddingId/households` | Owner/Planner/Admin |
| POST | `/weddings/:weddingId/households` | Owner/Planner/Admin |
| GET | `/weddings/:weddingId/households/:householdId` | Owner/Planner/Admin |
| PATCH | `/weddings/:weddingId/households/:householdId` | Owner/Planner/Admin |
| DELETE | `/weddings/:weddingId/households/:householdId` | Owner/Planner/Admin |

---

# 45. List Households

## `GET /api/v1/weddings/:weddingId/households`

Supported query parameters:

```text
?page=
&limit=
&q=
&eventId=
&rsvpResponse=
```

Example:

```text
GET /api/v1/weddings/123/households?eventId=456&rsvpResponse=YES
```

---

# 46. Create Household

```json
{
  "householdName": "Reddy Family",
  "primaryContact": {
    "name": "Ravi Reddy",
    "email": "ravi@example.com",
    "phone": "+919999999999"
  },
  "adultsInvited": 4,
  "childrenInvited": 2,
  "members": []
}
```

The server generates a secure guest-access token.

The raw token should only be used when generating/sending the invitation URL.

It must not be returned in general household APIs.

---

# 47. Regenerate Guest Link

If required, provide:

```text
POST /api/v1/weddings/:weddingId/households/:householdId/guest-link/regenerate
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

This invalidates the previous token and generates a new secure guest link.

---

# 48. Revoke Guest Access

```text
POST /api/v1/weddings/:weddingId/households/:householdId/guest-link/revoke
```

---

# 49. Guest Import Preview

## `POST /api/v1/weddings/:weddingId/guest-imports/preview`

### Content Type

```text
multipart/form-data
```

### Input

```text
file = CSV or XLSX
```

Recommended V1 spreadsheet file-size limit:

```text
5 MB
```

Configurable.

---

# 50. Import Preview Response

```json
{
  "data": {
    "importId": "...",
    "format": "XLSX",
    "summary": {
      "totalRows": 400,
      "validRows": 390,
      "invalidRows": 6,
      "duplicateCandidates": 4
    },
    "errors": [
      {
        "row": 13,
        "field": "primaryEmail",
        "message": "Invalid email address."
      }
    ],
    "duplicates": [
      {
        "row": 42,
        "reason": "Existing household has the same primary email."
      }
    ]
  }
}
```

Preview must not create households.

---

# 51. Confirm Guest Import

## `POST /api/v1/weddings/:weddingId/guest-imports/:importId/confirm`

```json
{
  "duplicatePolicy": "FAIL"
}
```

Allowed policies:

```text
FAIL
SKIP
```

`FAIL` is the default.

Wedding HQ must never silently overwrite existing households.

---

# 52. Import Confirm Response

```json
{
  "data": {
    "created": 390,
    "skipped": 0
  }
}
```

---

# 53. Guest Export

## CSV

```text
GET /api/v1/weddings/:weddingId/guest-exports?format=csv
```

## XLSX

```text
GET /api/v1/weddings/:weddingId/guest-exports?format=xlsx
```

Response is a downloadable file.

Possible filters:

```text
?eventId=
&rsvpResponse=
```

---

# 54. Event Invitation Resource

EventInvitation represents:

```text
Household ↔ Event
```

It does not represent the graphic invitation file.

---

# 55. Event Invitation Endpoints

```text
GET
/api/v1/weddings/:weddingId/households/:householdId/invitations

POST
/api/v1/weddings/:weddingId/households/:householdId/invitations

DELETE
/api/v1/weddings/:weddingId/households/:householdId/invitations/:eventId
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

---

# 56. Assign Events to Household

## `POST /.../households/:householdId/invitations`

```json
{
  "eventIds": [
    "sangeetId",
    "weddingEventId",
    "receptionId"
  ]
}
```

### Response

```json
{
  "data": {
    "created": 3
  }
}
```

Duplicate mappings must not be created.

---

# 57. Guest Wedding View

## `GET /api/v1/guest/wedding`

Requires guest session.

Returns safe guest-facing wedding information.

Example:

```json
{
  "data": {
    "title": "Ravi & Priya Wedding",
    "brideName": "Priya",
    "groomName": "Ravi",
    "timezone": "Asia/Kolkata",
    "helpContacts": [
      {
        "name": "Rahul",
        "label": "Family Coordinator",
        "phone": "+919999999999"
      }
    ],
    "events": [
      {
        "id": "...",
        "name": "Reception",
        "startsAt": "...",
        "venue": {
          "name": "...",
          "googleMapsUrl": "..."
        },
        "dressCode": "Formal",
        "youtubeLiveUrl": null
      }
    ]
  }
}
```

Only invited events are returned.

---

# 58. Guest Event View

```text
GET /api/v1/guest/events/:eventId
```

Requires:

- Guest session
- Active EventInvitation for the event

Uninvited event:

```text
404
```

rather than revealing that a private event exists.

---

# 59. RSVP Resource

```json
{
  "eventId": "...",
  "householdId": "...",
  "response": "YES",
  "adultsAttending": 3,
  "childrenAttending": 1,
  "source": "GUEST",
  "submittedAt": "...",
  "updatedAt": "..."
}
```

---

# 60. Guest RSVP Endpoints

```text
GET /api/v1/guest/events/:eventId/rsvp

PUT /api/v1/guest/events/:eventId/rsvp
```

---

# 61. Submit Guest RSVP

```json
{
  "response": "YES",
  "adultsAttending": 3,
  "childrenAttending": 1
}
```

Business validation:

```text
adultsAttending <= adultsInvited

childrenAttending <= childrenInvited
```

For `NO`, attendance counts should normally be:

```text
0
```

---

# 62. RSVP Deadline

If resolved RSVP deadline has passed:

```text
PUT /guest/events/:eventId/rsvp
```

returns:

`422`

```json
{
  "error": {
    "code": "RSVP_DEADLINE_PASSED",
    "message": "The RSVP deadline for this event has passed."
  }
}
```

---

# 63. Admin RSVP Endpoints

```text
GET /api/v1/weddings/:weddingId/rsvps

GET /api/v1/weddings/:weddingId/events/:eventId/rsvps

PUT /api/v1/weddings/:weddingId/events/:eventId/households/:householdId/rsvp
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

---

# 64. Admin-Recorded RSVP

```json
{
  "response": "YES",
  "adultsAttending": 4,
  "childrenAttending": 0
}
```

Server automatically records:

```text
source = ADMIN
recordedByMembershipId = current membership
```

---

# 65. RSVP After Deadline

Admins may not silently alter attendance responses after the deadline.

Response mutation returns:

```text
RSVP_DEADLINE_PASSED
```

Admins may instead record an internal note.

---

# 66. RSVP Internal Note

```text
PATCH
/api/v1/weddings/:weddingId/events/:eventId/households/:householdId/rsvp/note
```

```json
{
  "internalNote": "Guest called after deadline and said they may not attend."
}
```

This does not alter the submitted RSVP.

---

# 67. Task Resource

```json
{
  "id": "...",
  "title": "Confirm decorator",
  "description": null,
  "eventId": "...",
  "assigneeMembershipId": "...",
  "dueAt": "...",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "notes": null,
  "completedAt": null
}
```

---

# 68. Task Endpoints

```text
GET    /api/v1/weddings/:weddingId/tasks
POST   /api/v1/weddings/:weddingId/tasks
GET    /api/v1/weddings/:weddingId/tasks/:taskId
PATCH  /api/v1/weddings/:weddingId/tasks/:taskId
DELETE /api/v1/weddings/:weddingId/tasks/:taskId
```

---

# 69. Task Filters

Supported:

```text
?status=
?priority=
?eventId=
?assigneeMembershipId=
?overdue=true
```

---

# 70. Create Task

```json
{
  "title": "Confirm decorator",
  "description": "Confirm final stage setup.",
  "eventId": "...",
  "assigneeMembershipId": "...",
  "dueAt": "2026-12-10T18:30:00.000Z",
  "priority": "HIGH"
}
```

---

# 71. Collaborator Task Access

Collaborators may use the same task APIs, but server-side filtering must restrict them to:

```text
assigneeMembershipId = current membership
```

A Collaborator must not retrieve arbitrary tasks by changing URL IDs.

---

# 72. Update Task

```json
{
  "status": "DONE"
}
```

When status becomes `DONE`:

```text
completedAt = now
```

If reopened:

```text
completedAt = null
```

---

# 73. Vendor Resource

```json
{
  "id": "...",
  "name": "Dream Decorators",
  "category": "DECORATOR",
  "contact": {
    "person": "Ramesh",
    "phone": "+919999999999",
    "email": null
  },
  "eventIds": ["..."],
  "estimatedCostMinor": 15000000,
  "actualCostMinor": null,
  "currency": "INR",
  "responsibleMembershipId": "...",
  "status": "CONFIRMED",
  "notes": null
}
```

---

# 74. Vendor Endpoints

```text
GET    /api/v1/weddings/:weddingId/vendors
POST   /api/v1/weddings/:weddingId/vendors
GET    /api/v1/weddings/:weddingId/vendors/:vendorId
PATCH  /api/v1/weddings/:weddingId/vendors/:vendorId
DELETE /api/v1/weddings/:weddingId/vendors/:vendorId
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

---

# 75. Vendor Filters

```text
?category=
?eventId=
?status=
?q=
```

---

# 76. Expense Resource

```json
{
  "id": "...",
  "name": "DJ",
  "category": "ENTERTAINMENT",
  "eventId": "...",
  "vendorId": "...",
  "estimatedAmountMinor": 10000000,
  "actualAmountMinor": 11000000,
  "currency": "INR",
  "notes": null
}
```

---

# 77. Expense Endpoints

```text
GET    /api/v1/weddings/:weddingId/expenses
POST   /api/v1/weddings/:weddingId/expenses
GET    /api/v1/weddings/:weddingId/expenses/:expenseId
PATCH  /api/v1/weddings/:weddingId/expenses/:expenseId
DELETE /api/v1/weddings/:weddingId/expenses/:expenseId
```

---

# 78. Expense Filters

```text
?eventId=
?vendorId=
?category=
```

---

# 79. Expense Summary

## `GET /api/v1/weddings/:weddingId/expenses/summary`

Response:

```json
{
  "data": {
    "currency": "INR",
    "estimatedTotalMinor": 150000000,
    "actualTotalMinor": 143000000,
    "varianceMinor": -7000000
  }
}
```

---

# 80. Communication Resource

```json
{
  "id": "...",
  "type": "RSVP_REMINDER",
  "eventId": "...",
  "subject": "RSVP Reminder",
  "body": "...",
  "audience": {
    "type": "EVENT_NO_RSVP",
    "eventId": "..."
  },
  "status": "SCHEDULED",
  "scheduledAt": "..."
}
```

---

# 81. Audience Types

Recommended V1 audience types:

```text
HOUSEHOLDS

EVENT_ALL

EVENT_NO_RSVP

EVENT_RSVP_YES

EVENT_RSVP_NO

EVENT_RSVP_MAYBE
```

---

# 82. Communication Endpoints

```text
GET    /api/v1/weddings/:weddingId/communications
POST   /api/v1/weddings/:weddingId/communications
GET    /api/v1/weddings/:weddingId/communications/:communicationId
PATCH  /api/v1/weddings/:weddingId/communications/:communicationId
DELETE /api/v1/weddings/:weddingId/communications/:communicationId
```

Deletion/cancellation is allowed only before sending.

---

# 83. Create Scheduled Communication

```json
{
  "type": "EVENT_REMINDER",
  "eventId": "...",
  "subject": "Sangeet Tomorrow",
  "body": "We look forward to seeing you tomorrow.",
  "audience": {
    "type": "EVENT_RSVP_YES",
    "eventId": "..."
  },
  "scheduledAt": "2026-12-17T04:30:00.000Z"
}
```

---

# 84. Immediate Communication

If:

```text
scheduledAt
```

is absent or in the immediate-send window, Wedding HQ may create a job scheduled for the current time.

Response:

```text
202 Accepted
```

---

# 85. Communication Processing

Creating a Communication should create a corresponding Job.

The API request itself should not synchronously send hundreds of emails.

---

# 86. Photo Resource

```json
{
  "id": "...",
  "eventId": "...",
  "originalFilename": "IMG_1234.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 8452234,
  "status": "PENDING",
  "uploadedAt": "..."
}
```

`objectKey` should normally not be exposed to guests.

---

# 87. Supported Photo Upload Types

V1 should permit explicitly configured image MIME types.

Suggested:

```text
image/jpeg
image/png
image/webp
```

Additional formats may be added deliberately.

---

# 88. Photo Upload Architecture

Photo bytes upload directly:

```text
Browser → Cloudflare R2
```

not:

```text
Browser → Next.js → R2
```

Wedding HQ only authorises and confirms uploads.

---

# 89. Authenticated User Photo Upload URL

```text
POST
/api/v1/weddings/:weddingId/events/:eventId/photos/upload-url
```

Request:

```json
{
  "filename": "IMG_1234.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 8452234
}
```

Response:

```json
{
  "data": {
    "uploadId": "opaque-upload-id",
    "uploadUrl": "temporary-r2-presigned-url",
    "expiresAt": "..."
  }
}
```

---

# 90. Authenticated User Photo Confirmation

```text
POST
/api/v1/weddings/:weddingId/events/:eventId/photos/confirm
```

```json
{
  "uploadId": "opaque-upload-id"
}
```

Server verifies object existence and creates Photo metadata.

---

# 91. Guest Photo Upload URL

```text
POST
/api/v1/guest/events/:eventId/photos/upload-url
```

Requires:

- Guest session
- Active EventInvitation for event

---

# 92. Guest Photo Confirmation

```text
POST
/api/v1/guest/events/:eventId/photos/confirm
```

Resulting photo:

```text
status = PENDING
uploaderType = GUEST
householdId = session household
```

---

# 93. Event QR Photo Upload

QR upload is intentionally separate from household guest access.

A QR code may represent a signed, event-scoped upload token.

It grants:

```text
UPLOAD_PHOTOS
```

for one event only.

It grants no access to:

- RSVP
- Guest information
- Other events
- Wedding admin data

---

# 94. QR Upload Session

## `POST /api/v1/photo-upload/session`

### Authentication

None.

### Request

```json
{
  "token": "signed-event-upload-token"
}
```

### Response

```json
{
  "data": {
    "event": {
      "id": "...",
      "name": "Reception"
    }
  }
}
```

The server sets a short-lived scoped upload-session cookie.

---

# 95. QR Photo Upload URL

```text
POST /api/v1/photo-upload/photos/upload-url
```

Request:

```json
{
  "filename": "photo.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 4000000
}
```

The event is derived from the upload session.

---

# 96. QR Photo Confirmation

```text
POST /api/v1/photo-upload/photos/confirm
```

```json
{
  "uploadId": "..."
}
```

Creates:

```text
status = PENDING
```

No guest household association is required for QR uploads.

---

# 97. Admin Photo List

```text
GET /api/v1/weddings/:weddingId/photos
```

Filters:

```text
?status=PENDING
&eventId=
&page=
&limit=
```

---

# 98. Guest Photo Gallery

```text
GET /api/v1/guest/events/:eventId/photos
```

Returns only:

```text
APPROVED
```

photos.

Guest must be invited to the event.

---

# 99. Guest All-Photos Gallery

Optional V1 endpoint:

```text
GET /api/v1/guest/photos
```

Returns approved photos only from events visible to the household.

---

# 100. Approve Photo

```text
POST
/api/v1/weddings/:weddingId/photos/:photoId/approve
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

---

# 101. Reject Photo

```text
POST
/api/v1/weddings/:weddingId/photos/:photoId/reject
```

---

# 102. Delete Photo

```text
DELETE
/api/v1/weddings/:weddingId/photos/:photoId
```

Must remove or schedule removal of the associated R2 object.

---

# 103. Guest Photo Download

```text
GET /api/v1/guest/photos/:photoId/download
```

Server verifies:

- Photo approved
- Photo event visible to guest

Then returns either:

```text
302/307 redirect
```

to a temporary R2 signed URL, or a JSON signed URL depending on implementation.

---

# 104. Admin Photo Download

```text
GET /api/v1/weddings/:weddingId/photos/:photoId/download
```

---

# 105. Dashboard Endpoint

```text
GET /api/v1/weddings/:weddingId/dashboard
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

---

# 106. Dashboard Response

```json
{
  "data": {
    "guests": {
      "households": {
        "invited": 180,
        "confirmed": 120,
        "maybe": 15,
        "declined": 20,
        "awaiting": 25
      },
      "people": {
        "adultsConfirmed": 300,
        "childrenConfirmed": 42,
        "totalConfirmed": 342
      }
    },
    "tasks": {
      "completed": 31,
      "remaining": 12,
      "overdue": 4
    },
    "expenses": {
      "currency": "INR",
      "estimatedTotalMinor": 145000000,
      "actualTotalMinor": 138000000,
      "varianceMinor": -7000000
    },
    "photos": {
      "approved": 647,
      "pending": 83
    },
    "upcomingEvents": [],
    "recentRsvps": []
  }
}
```

This avoids ambiguity between:

```text
households
```

and:

```text
individual attendees
```

---

# 107. Audit Log Endpoint

```text
GET /api/v1/weddings/:weddingId/audit-logs
```

Roles:

```text
OWNER
PLANNER
ADMIN
```

Query parameters:

```text
?page=
&limit=
&entityType=
&entityId=
&action=
```

---

# 108. Audit Response

```json
{
  "data": [
    {
      "id": "...",
      "actorType": "USER",
      "action": "TASK_STATUS_CHANGED",
      "entityType": "TASK",
      "entityId": "...",
      "createdAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 120
  }
}
```

---

# 109. Internal Job Endpoint

Internal scheduled-job processing is not a public `/api/v1` API.

Conceptually:

```text
/api/internal/jobs/process
```

This endpoint must be protected so ordinary users cannot trigger job processing.

Vercel Cron invokes it.

---

# 110. Internal Job Processing

The internal endpoint:

1. Finds due jobs.
2. Atomically claims jobs.
3. Executes jobs.
4. Records success/failure.
5. Increments retry counters.

---

# 111. RSVP Reminder Job

Example job payload:

```json
{
  "type": "SEND_REMINDER",
  "weddingId": "...",
  "communicationId": "..."
}
```

The job resolves the target audience at execution time.

---

# 112. Retention Warning

Retention notifications may use:

```text
SEND_RETENTION_WARNING
```

No bulk ZIP/media export is created.

---

# 113. Wedding Completion

Wedding completion may be triggered by:

- Admin/Owner update
- Future automated logic

V1 may simply update:

```text
status = COMPLETED
```

through:

```text
PATCH /api/v1/weddings/:weddingId
```

The domain service calculates:

```text
retentionEndsAt
```

when appropriate.

---

# 114. File Size Validation

File-size limits must be configurable.

The API should not hard-code limits into multiple route handlers.

Example configuration:

```text
MAX_PHOTO_UPLOAD_BYTES
MAX_INVITATION_UPLOAD_BYTES
MAX_GUEST_IMPORT_BYTES
```

---

# 115. Upload Security

Presigned-upload endpoints must validate:

- Auth/session
- Resource ownership
- MIME type
- Requested size
- Generated R2 object key
- Expiration

Clients must not submit their own R2 object paths.

---

# 116. Upload Confirmation

The server should verify the R2 object exists before creating persistent domain metadata.

This reduces orphaned MongoDB Photo records.

---

# 117. Validation Strategy

All mutation endpoints use Zod.

Example:

```typescript
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  eventId: ObjectIdSchema.optional(),
  assigneeMembershipId: ObjectIdSchema.optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"])
})
```

Mongoose validation remains a second defensive layer.

---

# 118. Unknown Fields

V1 APIs should reject or strip unexpected write fields consistently.

Preferred:

> Reject unknown write fields for important domain endpoints.

This prevents clients from attempting to manipulate protected properties such as:

```text
weddingId
createdBy
source
approvedBy
```

---

# 119. Protected Fields

Clients must not directly set server-controlled values such as:

```text
createdAt
updatedAt
createdBy
approvedByMembershipId
recordedByMembershipId
guestAccess.tokenHash
```

---

# 120. Resource Ownership Validation

For nested URLs such as:

```text
/weddings/A/tasks/B
```

the API must query:

```text
task._id = B
AND
task.weddingId = A
```

Never retrieve by ID alone.

---

# 121. Cross-Wedding Reference Validation

When creating a Task:

```text
assigneeMembershipId
```

must belong to the same `weddingId`.

When creating an Expense:

```text
vendorId
eventId
```

must belong to the same wedding.

The API service layer must enforce these rules.

---

# 122. Common Error Codes

```text
VALIDATION_ERROR

AUTHENTICATION_REQUIRED

INVALID_SESSION

FORBIDDEN

RESOURCE_NOT_FOUND

WEDDING_NOT_FOUND

EVENT_NOT_FOUND

HOUSEHOLD_NOT_FOUND

MEMBERSHIP_NOT_FOUND

TASK_NOT_FOUND

VENDOR_NOT_FOUND

EXPENSE_NOT_FOUND

PHOTO_NOT_FOUND

DUPLICATE_MEMBERSHIP

DUPLICATE_INVITATION

INVALID_INVITATION

INVITATION_REVOKED

RSVP_NOT_ALLOWED

RSVP_DEADLINE_PASSED

ATTENDANCE_EXCEEDS_INVITATION

INVALID_STATUS_TRANSITION

UNSUPPORTED_FILE_TYPE

FILE_TOO_LARGE

UPLOAD_NOT_ALLOWED

UPLOAD_NOT_FOUND

IMPORT_VALIDATION_FAILED

IMPORT_HAS_DUPLICATES

RATE_LIMITED

INTERNAL_ERROR
```

---

# 123. 404 vs 403 Privacy Rule

For guest-facing private events, Wedding HQ should generally return:

```text
404
```

if the guest is not authorised to know the resource exists.

This avoids revealing private wedding information.

---

# 124. Rate Limiting Priorities

Rate limit at minimum:

- Guest token validation
- QR upload token validation
- Magic-link generation
- RSVP submission
- Photo upload URL generation
- Guest import
- Email communication creation
- Guest-link regeneration

---

# 125. Rate Limit Response

```text
429 Too Many Requests
```

Example:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

Optional response header:

```text
Retry-After
```

---

# 126. Idempotency

Selected side-effect-heavy endpoints should accept:

```text
Idempotency-Key
```

Recommended for:

- Communication creation
- Guest import confirmation
- Photo confirmation
- Membership invitation

This protects against accidental duplicate requests caused by retries.

V1 implementation may introduce this incrementally.

---

# 127. CSRF and Origin Protection

Because organiser APIs use cookie-based Auth.js sessions, state-changing requests must be protected against cross-site request forgery.

Controls should include appropriate:

- SameSite cookies
- Origin verification
- Framework/Auth.js CSRF protections where applicable

---

# 128. CORS

Wedding HQ V1 UI and API are expected to use the same application origin.

Therefore broad public CORS access is not required.

Do not configure:

```text
Access-Control-Allow-Origin: *
```

for authenticated application APIs.

Cloudflare R2 CORS should permit only required upload origins.

---

# 129. Cache Policy

Private API responses should normally use conservative caching.

Guest/private resources must not be accidentally cached publicly.

Examples:

```text
Cache-Control: private, no-store
```

where appropriate.

---

# 130. API Logging

Log:

- Request ID
- Route
- HTTP status
- Duration
- User/membership ID where appropriate
- Wedding ID where appropriate

Do not log:

- Guest raw tokens
- Magic-link tokens
- R2 credentials
- Guest private contact information unnecessarily

---

# 131. Request Correlation ID

Recommended response/request header:

```text
X-Request-ID
```

If absent, Wedding HQ generates one.

Useful for debugging API errors.

---

# 132. OpenAPI Specification

The REST contract should be represented in:

```text
/openapi/wedding-hq-v1.yaml
```

using OpenAPI 3.1.

The specification should include:

- Routes
- Parameters
- Schemas
- Responses
- Auth requirements
- Role notes
- Error schemas

---

# 133. OpenAPI Security Schemes

Conceptually define:

```text
organizerSession
guestSession
photoUploadSession
```

Auth.js cookie specifics may be documented descriptively rather than exposing internal implementation details.

---

# 134. API Resource Groups

OpenAPI tags should include:

```text
Weddings
Members
Events
Households
Imports
Invitations
RSVPs
Tasks
Vendors
Expenses
Communications
Photos
Guest
Dashboard
Audit
```

---

# 135. API Endpoint Summary — Weddings

```text
POST   /api/v1/weddings
GET    /api/v1/weddings
GET    /api/v1/weddings/:weddingId
PATCH  /api/v1/weddings/:weddingId
DELETE /api/v1/weddings/:weddingId
```

---

# 136. API Endpoint Summary — Members

```text
GET    /api/v1/weddings/:weddingId/members
POST   /api/v1/weddings/:weddingId/members
PATCH  /api/v1/weddings/:weddingId/members/:membershipId
DELETE /api/v1/weddings/:weddingId/members/:membershipId
```

---

# 137. API Endpoint Summary — Events

```text
GET    /api/v1/weddings/:weddingId/events
POST   /api/v1/weddings/:weddingId/events
PATCH  /api/v1/weddings/:weddingId/events/reorder

GET    /api/v1/weddings/:weddingId/events/:eventId
PATCH  /api/v1/weddings/:weddingId/events/:eventId
DELETE /api/v1/weddings/:weddingId/events/:eventId

POST   /api/v1/weddings/:weddingId/events/:eventId/invitation-asset/upload-url
POST   /api/v1/weddings/:weddingId/events/:eventId/invitation-asset/confirm
DELETE /api/v1/weddings/:weddingId/events/:eventId/invitation-asset
```

---

# 138. API Endpoint Summary — Households

```text
GET    /api/v1/weddings/:weddingId/households
POST   /api/v1/weddings/:weddingId/households

GET    /api/v1/weddings/:weddingId/households/:householdId
PATCH  /api/v1/weddings/:weddingId/households/:householdId
DELETE /api/v1/weddings/:weddingId/households/:householdId

POST   /api/v1/weddings/:weddingId/households/:householdId/guest-link/regenerate
POST   /api/v1/weddings/:weddingId/households/:householdId/guest-link/revoke
```

---

# 139. API Endpoint Summary — Guest Import/Export

```text
POST /api/v1/weddings/:weddingId/guest-imports/preview

POST /api/v1/weddings/:weddingId/guest-imports/:importId/confirm

GET  /api/v1/weddings/:weddingId/guest-exports?format=csv

GET  /api/v1/weddings/:weddingId/guest-exports?format=xlsx
```

---

# 140. API Endpoint Summary — Invitations

```text
GET
/api/v1/weddings/:weddingId/households/:householdId/invitations

POST
/api/v1/weddings/:weddingId/households/:householdId/invitations

DELETE
/api/v1/weddings/:weddingId/households/:householdId/invitations/:eventId
```

---

# 141. API Endpoint Summary — Guest

```text
POST /api/v1/guest/session

GET  /api/v1/guest/wedding

GET  /api/v1/guest/events/:eventId

GET  /api/v1/guest/events/:eventId/rsvp
PUT  /api/v1/guest/events/:eventId/rsvp

GET  /api/v1/guest/events/:eventId/photos
GET  /api/v1/guest/photos

POST /api/v1/guest/events/:eventId/photos/upload-url
POST /api/v1/guest/events/:eventId/photos/confirm

GET  /api/v1/guest/photos/:photoId/download
```

---

# 142. API Endpoint Summary — RSVP Admin

```text
GET /api/v1/weddings/:weddingId/rsvps

GET /api/v1/weddings/:weddingId/events/:eventId/rsvps

PUT
/api/v1/weddings/:weddingId/events/:eventId/households/:householdId/rsvp

PATCH
/api/v1/weddings/:weddingId/events/:eventId/households/:householdId/rsvp/note
```

---

# 143. API Endpoint Summary — Tasks

```text
GET    /api/v1/weddings/:weddingId/tasks
POST   /api/v1/weddings/:weddingId/tasks

GET    /api/v1/weddings/:weddingId/tasks/:taskId
PATCH  /api/v1/weddings/:weddingId/tasks/:taskId
DELETE /api/v1/weddings/:weddingId/tasks/:taskId
```

---

# 144. API Endpoint Summary — Vendors

```text
GET    /api/v1/weddings/:weddingId/vendors
POST   /api/v1/weddings/:weddingId/vendors

GET    /api/v1/weddings/:weddingId/vendors/:vendorId
PATCH  /api/v1/weddings/:weddingId/vendors/:vendorId
DELETE /api/v1/weddings/:weddingId/vendors/:vendorId
```

---

# 145. API Endpoint Summary — Expenses

```text
GET    /api/v1/weddings/:weddingId/expenses
POST   /api/v1/weddings/:weddingId/expenses

GET    /api/v1/weddings/:weddingId/expenses/summary

GET    /api/v1/weddings/:weddingId/expenses/:expenseId
PATCH  /api/v1/weddings/:weddingId/expenses/:expenseId
DELETE /api/v1/weddings/:weddingId/expenses/:expenseId
```

---

# 146. API Endpoint Summary — Communications

```text
GET    /api/v1/weddings/:weddingId/communications
POST   /api/v1/weddings/:weddingId/communications

GET    /api/v1/weddings/:weddingId/communications/:communicationId
PATCH  /api/v1/weddings/:weddingId/communications/:communicationId
DELETE /api/v1/weddings/:weddingId/communications/:communicationId
```

---

# 147. API Endpoint Summary — Photos

```text
GET  /api/v1/weddings/:weddingId/photos

POST /api/v1/weddings/:weddingId/events/:eventId/photos/upload-url
POST /api/v1/weddings/:weddingId/events/:eventId/photos/confirm

POST /api/v1/weddings/:weddingId/photos/:photoId/approve
POST /api/v1/weddings/:weddingId/photos/:photoId/reject

GET    /api/v1/weddings/:weddingId/photos/:photoId/download
DELETE /api/v1/weddings/:weddingId/photos/:photoId
```

---

# 148. API Endpoint Summary — QR Photo Upload

```text
POST /api/v1/photo-upload/session

POST /api/v1/photo-upload/photos/upload-url

POST /api/v1/photo-upload/photos/confirm
```

---

# 149. API Endpoint Summary — Dashboard/Audit

```text
GET /api/v1/weddings/:weddingId/dashboard

GET /api/v1/weddings/:weddingId/audit-logs
```

---

# 150. Explicitly Excluded V1 APIs

No V1 APIs are required for:

- WhatsApp
- SMS
- Hotel rooms
- Transportation
- Airport pickup
- Seating
- Guest chat
- Vendor login
- Vendor marketplace
- Gift tracking
- Payments
- Accounting
- Video uploads
- Bulk photo ZIP export
- Complete wedding export
- Image compression
- Image transformations
- Realtime WebSockets

---

# 151. Future API Considerations

Future versions may introduce:

```text
/api/v2/planner-teams

/api/v2/vendor-accounts

/api/v2/hotels

/api/v2/transport

/api/v2/seating

/api/v2/payments

/api/v2/notifications
```

These should not influence V1 implementation beyond maintaining clean domain boundaries.

---

# 152. API Implementation Flow

Every protected mutation should conceptually follow:

```text
Request
   ↓
Parse
   ↓
Zod Validation
   ↓
Authenticate
   ↓
Resolve Membership / Guest Session
   ↓
Authorise Role/Scope
   ↓
Validate Wedding Ownership
   ↓
Business Rules
   ↓
Domain Service
   ↓
Mongoose / R2 / Resend
   ↓
Audit Important Action
   ↓
Response
```

---

# 153. API Layer Responsibility

Route handlers should remain thin.

A route handler should not contain hundreds of lines of business logic.

Preferred:

```text
Route Handler
      ↓
TaskService.createTask(...)
```

rather than embedding:

- MongoDB queries
- permission checks
- email logic
- audit logic

directly into the HTTP handler.

---

# 154. Service Layer Responsibility

Domain services should enforce business rules.

Examples:

```text
WeddingService

EventService

HouseholdService

RsvpService

TaskService

VendorService

ExpenseService

PhotoService

CommunicationService

ImportService
```

---

# 155. Repository/Data Access

Where useful, isolate database-specific operations behind domain data-access helpers.

Example:

```text
TaskService
    ↓
TaskRepository
    ↓
Mongoose
```

V1 does not need an elaborate generic repository framework.

Keep abstractions practical.

---

# 156. Audit Integration

Important domain operations should emit audit records.

Example:

```text
RsvpService.updateGuestRsvp()
      ↓
RSVP updated
      ↓
AuditLog:
RSVP_UPDATED
```

API routes should not independently duplicate audit logic.

---

# 157. Resend Integration

Communication APIs create domain Communication records/jobs.

Actual email delivery happens through:

```text
EmailService
    ↓
Resend
```

Resend-specific implementation details should not leak into API contracts.

---

# 158. R2 Integration

Photo and invitation APIs use:

```text
StorageService
    ↓
Cloudflare R2
```

Clients receive only temporary presigned URLs.

R2 credentials are never exposed.

---

# 159. API Stability Rule

Once V1 clients depend on a response field or endpoint, breaking changes should not be silently introduced.

Compatible additions are acceptable.

Breaking changes should require:

```text
/api/v2
```

or an explicitly coordinated V1 migration before launch.

---

# 160. V1 API Design Principle

Wedding HQ's API should be:

> **Explicit enough to be predictable, simple enough to implement inside the monolith, and strict enough that a future mobile app or planner interface can safely use the same backend contract.**

---

# 161. Final V1 API Definition

Wedding HQ V1 uses a versioned REST API exposed through Next.js Route Handlers.

Organisers authenticate through Auth.js.

Guests authenticate through scoped household sessions.

Event QR photo uploads use a separate event-scoped upload session.

Every wedding-owned admin resource is scoped by `weddingId`.

All state-changing operations are validated server-side.

MongoDB stores business state.

Cloudflare R2 stores files.

Resend delivers email.

Vercel Cron processes scheduled jobs.

OpenAPI 3.1 documents the API contract.

---

# 162. Document Status

**Wedding HQ API Design V1.0**

**Status: Awaiting Approval**

Once approved, this document becomes the baseline REST API contract for Wedding HQ V1.

The next technical steps may include:

1. Convert the approved database model into Mongoose schemas.
2. Create Zod request/response schemas.
3. Generate the initial OpenAPI 3.1 definition.
4. Implement shared authentication and permission middleware/helpers.
5. Implement APIs module-by-module.

Recommended initial implementation order:

```text
Authentication
    ↓
Weddings
    ↓
Memberships
    ↓
Events
    ↓
Households
    ↓
Event Invitations
    ↓
Guest Sessions
    ↓
RSVP
    ↓
Tasks
    ↓
Vendors
    ↓
Expenses
    ↓
Communications
    ↓
Photos
    ↓
Dashboard / Audit
```

Future API changes should be recorded as:

```text
API Design V1.1
API Design V1.2
API Design V2.0
```

rather than silently changing the approved contract.
