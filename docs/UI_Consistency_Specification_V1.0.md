# Wedding HQ — UI Consistency Specification

**Version:** 1.0  
**Status:** Approved  
**Purpose:** Normalize the Stitch-generated UI into one coherent Wedding HQ design system.

---

# 1. Core Rule

All Wedding HQ screens must feel like parts of **one product**.

Differences between desktop, mobile, light mode, dark mode, guest view, organiser view, and QR upload should be intentional.

They must not create different visual identities.

# 2. Canonical Brand Name

The product name is always:

> **Wedding HQ**

Use exactly this casing.

Do not use: WQ, WEDDING HQ, Wedding Hq, Wedding HQ Ledger, Wedding Binder, Digital Ledger, Celebration Notebook, or Production Book.

# 3. Canonical Wordmark

Use **Wedding HQ** in **Plus Jakarta Sans SemiBold**.

The wordmark should feel stable, contemporary and functional. Do not use the editorial serif for the brand name. The serif is reserved for couple names, marketing headlines, and guest-facing emotional moments.

# 4. Brand Icon

Use one original Wedding HQ icon.

Preferred direction:

> **Woven W / Joined Paths**

Concept: two paths or forms come together into one simple abstract W-shaped mark, subtly representing two people, two families, many moving parts, and one coordinated place.

Do not make it literally depict wedding rings, hearts, flowers, leaves, books, mandaps, knots, or initials inside a circle.

# 5. Brand Icon Requirements

The icon must:

- Work at 16–20 px
- Work in one colour
- Work in sage, charcoal, and white
- Remain recognisable without text
- Avoid fine detail, gradients, and shadows
- Feel slightly rounded and human
- Be original artwork

# 6. Brand Usage by Surface

## Desktop / Large Tablet

```text
[icon] Wedding HQ
```

## Collapsed Desktop Sidebar

```text
[icon]
```

## Mobile Organiser

```text
[icon]
```

Do not display the full wordmark unless space naturally allows it.

## Guest Experience

Wedding identity takes priority:

```text
Ravi & Priya
```

Wedding HQ becomes secondary, for example subtle mark-only or footer branding.

## QR Photo Upload

Wedding/event identity takes priority. No large Wedding HQ header.

# 7. Typography System

## Primary UI Typeface

**Plus Jakarta Sans** for navigation, buttons, form fields, tables, lists, operational headings, metrics, status labels, and application copy.

## Editorial Typeface

**Newsreader** used selectively for Ravi & Priya, marketing hero headlines, guest-facing titles, and emotional editorial moments.

Do not use Newsreader for sidebar labels, button labels, table headings, product wordmark, or status labels.

# 8. Colour System

Canonical palette:

```text
Warm ivory
Soft charcoal
Warm stone grey
Muted sage / olive
Small amount of clay / terracotta
```

Avoid introducing new primary colours screen-by-screen.

# 9. Light Theme

Use warm ivory page backgrounds, soft warm surfaces, charcoal text, warm grey secondary text, muted sage accents, and subtle warm borders. Avoid pure white as the dominant surface.

# 10. Dark Theme

Use the same components and hierarchy as Light. Only change design tokens.

Use deep warm charcoal backgrounds, dark stone surfaces, warm off-white text, muted warm grey, and soft sage accents. Do not redesign the screen.

# 11. Theme Consistency Rule

Light, Dark and Comfort versions of a screen must preserve the same information, layout, component positions, navigation, content hierarchy, actions, and labels. Only presentation tokens may change.

# 12. Eye Comfort

Preferred copy:

> **Eye comfort is on**

Optional description:

> Warmer colours and softer surfaces for evening use.

Do not use Kelvin values, spectral balance, surface temperature, display science terminology, or fake hardware-like readings.

Wedding HQ is changing UI colours, not the physical display.

# 13. Design Tokens

All generated screens must inherit one shared token system. Do not redefine radius, colours or spacing independently inside individual screens.

Canonical radius direction:

```text
sm      subtle
md      standard controls
lg      cards/panels
xl      selected large surfaces
full    true pill / circle only
```

`rounded-full` must actually be fully rounded.

# 14. Spacing

Use consistent spacing rhythm:

```text
4
8
12
16
24
32
48
64
```

Do not create arbitrary screen-specific spacing values unless necessary.

# 15. Surface Treatment

Use fine warm borders, very subtle shadows, warm paper-like surfaces, and restrained radius.

Avoid floating-card overload, heavy elevation, glassmorphism, thick shadows, and too many disconnected panels.

# 16. Icons

Application icons may use one consistent icon library. Do not mix Material Symbols, Lucide, custom filled icons, and random generated icons within the same product shell.

Brand icon is separate and custom.

# 17. Organiser Navigation

Canonical desktop navigation:

```text
Overview
Events
Guests
Tasks
Vendors
Expenses
Messages
Photos
Activity
Settings
```

Do not rename these per screen.

# 18. Page Header Rule

Do not use unnecessary breadcrumbs such as `Dashboard / Tasks`, `Dashboard / Guests`, or `Dashboard / Events`.

Use direct headers such as:

```text
Tasks                         + New task
Guests                     + Add household
Events                         + Add event
```

# 19. Copywriting Rule

Application copy should favour clarity over cleverness.

Use Tasks, Events, Expenses, Photos, Needs your attention, Coming up, and Recent activity instead of elaborate ERP/editorial labels.

# 20. Canonical Demo Wedding

## Couple

**Ravi & Priya**

## Location

**Hyderabad**

## Dates

**December 18–20, 2026**

## Events

- Sangeet — December 18, 2026, 7:00 PM
- Wedding — December 19, 2026, 9:00 AM
- Reception — December 20, 2026, 7:30 PM

# 21. Canonical Demo Data

```text
342 confirmed guests
25 households awaiting RSVP

12 tasks remaining
4 overdue

₹13.8L actual spend
₹14.5L estimated

83 photos awaiting review
```

Example household: **Reddy Family**  
Coordinator: **Rahul**  
Vendor: **Royal Caterers**  
Venue: **Example Convention Centre**

# 22. V1 Scope Guard

The UI must not imply features that are not in V1.

Remove hotel allocation, accommodation management, airport pickup, transportation planning, shuttle management, flight information, food preferences, dietary requirements, seating, guest chat, WhatsApp messaging, SMS, run-sheet export, fleet management, complex production logistics, and planner ERP modules.

# 23. WhatsApp Rule

Wedding HQ may mention WhatsApp only when describing the problem couples currently face.

Do not show Wedding HQ sending WhatsApp messages in V1. All Wedding HQ outbound communication in V1 is email.

# 24. Photography Rule

Remove all random stock wedding photography.

Use product UI, original illustration, neutral photo placeholders, or real uploaded media only when legitimately available later.

# 25. Illustration Rule

Keep the approved original editorial illustration direction. Illustrations should be minimal, warm, Indian, restrained, original, and non-photorealistic. Do not copy any specific artist.

# 26. Overview Screen

Canonical sections:

```text
Good morning, Priya

Ravi & Priya
12 days to go
December 18–20
```

Then:

1. Summary metrics
2. Needs your attention
3. Coming up
4. Recent activity

Do not add unrelated modules.

# 27. Overview — Remove

Remove weather, coordinator briefing, production readiness percentage, daily run-sheet export, spectral comfort readings, planner operations panels, and random map widgets unless directly required.

# 28. Overview Metrics

Keep:

```text
342
Guests confirmed
25 awaiting

12
Tasks remaining
4 overdue

₹13.8L
Actual spend
₹14.5L estimated

83
Photos waiting
for review
```

Do not convert them into colourful enterprise KPI cards.

# 29. Needs Your Attention

Canonical examples:

```text
4 tasks are overdue
View tasks →

25 households haven't replied
Send reminder →

Reception venue details aren't complete
Add venue →

83 photos are waiting for approval
Review photos →
```

This section must remain visually more important than generic analytics.

# 30. Mobile Overview

Keep bottom navigation, compact metrics, Needs your attention, Coming up, and Recent activity.

Remove WQ text mark, Bengaluru map, Coordinator synced badge, readiness percentage, and unnecessary reminder widgets.

Use Wedding HQ icon only in the header.

# 31. Events Screen

Keep the schedule-style layout.

Canonical event card information:

- Event name
- Date
- Time
- Venue
- Invited household count
- Setup status

Setup status may include Venue, Invitation, RSVP deadline, and Livestream.

# 32. Events — Remove

Remove weather forecast, fleet status, transportation modules, printable production run sheet, run-sheet export, stock venue photography, and event-production ERP widgets.

# 33. Guests Screen

Canonical top-level tabs:

```text
Households
RSVPs
Import / Export
```

Do not add Accommodation, Transit, Hospitality, or Food preferences.

# 34. Household List

Keep household name, primary contact, adults invited, children invited, invited events, and RSVP summary.

Avoid excessive columns. The screen must still work with hundreds of households.

# 35. Guests — Remove

Remove special dietary needs, hotel, flight, cab, airport, transit, room allocation, and food preferences.

# 36. Tasks Screen

Keep List as default, Needs attention, Upcoming, Assignee, Due date, Priority, and Status. Keep Board as optional secondary view. Do not make Tasks feel like Jira.

# 37. Sign-In Screen

Canonical content:

```text
Welcome to Wedding HQ

Continue with Google

or

Email address

Send magic link
```

Remove design-language copy such as “Clothbound editorial workspace”.

# 38. Onboarding

Keep four steps:

1. Your Wedding
2. Events
3. Your Team
4. Guests

Use plain language.

# 39. Onboarding — Remove

Remove phrases such as Workspace Designation, Celebration Notebook, Wedding Binder, and Hospitality Managers.

Use Wedding title, Your wedding, Your team, and Guests.

Replace stock wedding imagery with original illustration or product-oriented composition.

# 40. Guest Experience

Guest pages should prioritise **Ravi & Priya**, not Wedding HQ branding. Wedding HQ may appear subtly.

Guest pages should remain warmer than the organiser workspace.

# 41. Guest Event Information

Only show event name, date, time, venue, map, dress code, invitation, RSVP, livestream if available, photos, and help contact.

# 42. Guest — Remove

Remove hotel shuttle, airport transfer, flight information, dietary request, transportation assistance, WhatsApp concierge, and generic travel itinerary features.

# 43. Guest Mobile Header

Preferred direction:

```text
←                         appearance
```

Then:

```text
Ravi & Priya
```

Do not waste compact space with Wedding HQ or WQ as a large header label.

# 44. Guest Footer Branding

Optional subtle footer:

```text
Powered by [Wedding HQ icon] Wedding HQ
```

Keep low emphasis.

# 45. QR Photo Upload

Canonical structure:

```text
Ravi & Priya
Reception

Share your photos from the Reception

Help Ravi & Priya collect everyone's favourite moments.

Choose photos
```

# 46. QR Selected State

```text
3 photos selected

Upload 3 photos
```

Show simple thumbnails if useful.

# 47. QR Success State

```text
Thank you!

Your photos were sent to
Ravi & Priya's wedding gallery.

Add more photos
```

# 48. QR — Remove

Remove account profile, full product navigation, Private Vault language, table number, Snapshot mode, Encrypted Transfer marketing, Original Resolution Preserved marketing, complex storage language, RSVP controls, guest-account controls, and stock wedding photography.

# 49. Dark + Comfort Guest Screen

Must be the same guest screen as Light. Only theme tokens change.

Keep the same event cards, content, controls, spacing, and hierarchy.

# 50. Status Components

Use one canonical badge system for Confirmed, Awaiting, Maybe, Overdue, Done, Pending review, and Approved.

Same radius, font, spacing and status colour logic everywhere.

# 51. Buttons

Canonical hierarchy:

- Primary: muted sage filled button
- Secondary: warm neutral outline or surface
- Tertiary: text action

Do not change button shapes from page to page.

# 52. Form Fields

Use one consistent form style with the same label size, input height, radius, border, focus state, error state, and helper text.

Onboarding and Sign-In should not have a separate visual language from the main application.

# 53. Tables and Lists

Prefer readable lists and simple tables with generous row height, soft separators, clear hierarchy, and minimal grid lines.

Avoid dense spreadsheet styling.

# 54. Mobile Bottom Navigation

Canonical:

```text
Overview
Guests
Tasks
Events
More
```

Do not reorder between screens.

# 55. More Menu

Contains:

```text
Vendors
Expenses
Messages
Photos
Activity
Settings
```

# 56. Accessibility

All consistency fixes must preserve strong text contrast, keyboard focus, touch-friendly controls, clear labels, non-colour status cues, and reduced-motion support.

Comfort should not mean faint text.

# 57. Screen-by-Screen Priority

## Priority 0 — Brand/System

Fix brand icon, wordmark, typography, shared colour tokens, radius tokens, icons, and demo data first.

## Priority 1 — Structural Drift

Then fix Light vs Dark Overview, Guests out-of-scope features, Events ERP additions, QR complexity, and Guest scope violations.

## Priority 2 — Copy

Then normalize page titles, clever terminology, breadcrumbs, and marketing language.

## Priority 3 — Polish

Finally fix spacing, small responsive differences, micro-interactions, empty states, and hover/focus states.

# 58. Keep From Current Stitch Output

Preserve the strong generated decisions:

- Warm ivory + sage direction
- Plus Jakarta Sans + Newsreader pairing
- Collapsible sidebar
- Mobile bottom navigation
- Paper-like low-glare surfaces
- Needs your attention
- Schedule-oriented Events design
- Guests structure
- Task list layout
- Comfortable whitespace

The goal is not to redesign these strengths.

# 59. Cleanup Philosophy

Treat the current Stitch result as:

> **A strong visual prototype with inconsistent system execution.**

The task is:

> **Standardise, simplify and align — not start again.**

# 60. Canonical Product Feeling

After cleanup, every screen should communicate:

> **This is Wedding HQ.**

The system should feel calm, warm, clear, consistent, trustworthy, and deliberate.

# 61. Final Rule

When choosing between more features and greater clarity, choose clarity.

When choosing between more decoration and better hierarchy, choose hierarchy.

When choosing between clever terminology and plain understandable language, choose plain language.

When choosing between desktop completeness and mobile simplicity, preserve both through responsive design rather than adding clutter.

# 62. Status

**Wedding HQ UI Consistency Specification V1.0**  
**Status: Approved**

This becomes the reference used to clean and revise the Stitch-generated screens and generated frontend code.
