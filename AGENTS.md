# Wedding HQ — Repository Guidance

## 1. Product goal

Wedding HQ is a private wedding coordination platform. The prototype exists to answer:
**Does Wedding HQ meaningfully reduce wedding coordination friction for couples and their families?**
The immediate goal is a working prototype that validates the UX, not the complete long-term product or every PRD/backend capability.

## 2. Prototype-first rule

- Prefer the simplest implementation that satisfies the current prototype requirement.
- Do not over-engineer, build speculative functionality, or create abstractions solely for hypothetical future scale.
- Do not create placeholder modules for features that are not currently being implemented.
- Proposed folder structures are conceptual: create folders only when the current phase needs them.
- If a feature is not clearly in the approved prototype scope, stop and flag it instead of inventing it.

## 3. Document precedence

Read the relevant documents before implementation. For prototype conflicts, follow this order:

1. [Prototype Core Flows & Remaining Screens](docs/Prototype_Core_Flows_Remaining_Screens_V1.0.md)
2. [UI Consistency Specification](docs/UI_Consistency_Specification_V1.0.md)
3. [Prototype Design System](docs/Prototype_Design_System_V1.0.md)
4. [API Design](docs/API_Design_V1.0.md)
5. [Database Design](docs/Database_Design_V1.0.md)
6. [System Architecture](docs/System_Design_Architecture_V1.0.md)
7. [PRD V1.1](docs/PRD_V1.1.md) (supersedes `docs/PRD_V1.md`)
8. [UI/UX Design Brief](docs/UI_UX_Design_Brief_V1.0.md)
9. [Cleaned Stitch references](design-reference/stitch_cleaned/)

Explicit approved project decisions override conflicting document text. Cleaned Stitch files are visual references, not production architecture or code to copy blindly.

## 4. Approved technical direction

- Next.js App Router + TypeScript: one full-stack application (modular monolith), deployed to Vercel; no separate Express backend.
- MongoDB Atlas + Mongoose; Auth.js; Zod; REST Route Handlers under `/api/v1`.
- Tailwind CSS for styling; Cloudflare R2 for files; Resend for email.
- Mongo-backed Job records + Vercel Cron when scheduled work is implemented; no dedicated queue infrastructure.

Introduce technologies and packages only when their implementation phase requires them. The expected future dependency set is not an initial installation list.

## 5. Current implementation order

A. Repository guidance.
B. Minimal Next.js + TypeScript scaffold.
C. Design tokens and only required UI primitives.
D. Responsive organiser application shell.
E. Overview with shared fixture data.
F. Events, Guests and Tasks frontend slices using fixtures.
G. Coded UX and responsive behaviour review.
H. Progressive Auth.js, database and REST API integration.

Do not skip directly to Phase H or build backend services merely because architecture documents mention them. Work only on the authorised phase; completing it does not authorise starting the next.

## 6. Scope boundaries

Do not add the following unless a later approved project decision explicitly changes scope:

- Planner company hierarchy or a multi-wedding planner portal.
- Vendor marketplace or vendor accounts.
- Hotels/accommodation, transportation, seating or food preferences.
- Guest chat, WhatsApp or SMS.
- Complex accounting or payment processing.
- Invitation builder or multiple guest themes.
- Bulk wedding ZIP export or media-processing pipelines.
- Microservices, Redis, Kafka, Kubernetes or WebSockets.
- Native applications.

## 7. Locked product decisions

- The wedding creator becomes the initial OWNER. An existing Owner may later invite another OWNER; no special two-owner onboarding architecture.
- Create actual Event records only when approved mandatory data, including required date/time details, is available. Keep onboarding simple; do not weaken the Event schema for incomplete selections.
- Never store guest plaintext access tokens. Sending/resending/regenerating an invitation creates a fresh secure token, stores only its hash, invalidates the previous token where appropriate, and emails the new link.
- Expense records supply wedding-level estimated, actual and variance totals. Vendor costs are reference fields and must not be independently added into those totals or double-counted.
- Preserve the approved Mongo-backed Job + Vercel Cron architecture unless explicitly revised. Revisit scheduling internals when the Messages phase begins, not during scaffolding.
- Resolve non-blocking future ambiguities, including import staging, RSVP aggregation and retention automation, only when their feature phase begins.

## 8. UI implementation rules

- Follow the Prototype Design System and canonical Wedding HQ branding.
- Use one shared Ravi & Priya fixture dataset until real data replaces it.
- Preserve layout, information and action parity across Light/Dark/System modes.
- Eye Comfort changes visual tokens only; it does not create a different application layout.
- Mobile organiser navigation: Overview / Guests / Tasks / Events / More.
- Prefer plain product language over clever terminology.
- Do not reintroduce out-of-scope UI from old Stitch generations.

## 9. Coding rules

- Read relevant docs before implementing a feature; keep changes narrow to the current task and do not rewrite unrelated files.
- Install packages only when the current phase requires them. Prefer native platform capabilities before adding dependencies.
- Do not install future backend, spreadsheet, email, storage, QR or test tooling during the initial frontend scaffold.
- Avoid unnecessary layers. Do not create repository abstractions, factories, event buses or generic frameworks unless actual complexity justifies them.
- Do not pre-create future modules, API directories or test directories.
- When database work begins, preserve wedding-level tenant scoping and enforce permissions server-side.
- Never use destructive Git commands unless explicitly requested.
- Do not commit secrets or credentials.

## 10. Verification

- For implementation tasks, run relevant available lint/build/tests before declaring completion; do not add unrelated tooling just to run checks.
- Report what changed, verification results, and any checks that could not run.
- State unresolved problems clearly. Do not silently expand scope to fix unrelated issues.

## 11. Git discipline

- Keep changes small and reviewable, with one implementation concern per task where practical.
- Never rewrite project history.
- Avoid modifying unrelated files.
