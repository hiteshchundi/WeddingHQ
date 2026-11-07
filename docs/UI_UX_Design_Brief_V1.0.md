# Wedding HQ — UI/UX Design Brief

**Version:** 1.0  
**Status:** Proposed for Approval  
**Product:** Wedding HQ V1  
**Primary Audience:** Couples planning their wedding  
**Platform:** Responsive web application  
**Design Direction:** Warm, calm, trustworthy, understated

---

# 1. Purpose

This document defines the visual and interaction direction for Wedding HQ V1.

It should guide:

- Public website design
- Organiser workspace design
- Guest experience
- Collaborator experience
- Responsive behaviour
- Light and dark themes
- Eye-comfort treatment
- Illustration direction
- Typography
- Colour
- Navigation
- Information hierarchy
- Initial Stitch design generation

The goal is to ensure Wedding HQ looks and feels intentionally designed for wedding coordination rather than resembling either:

- A traditional wedding website
- A generic enterprise dashboard
- A wedding-themed SaaS template

---

# 2. Core Product Experience

Wedding HQ should communicate:

> **A calmer way to manage your wedding.**

The experience should make users feel:

- Organised
- Reassured
- In control
- Comfortable
- Trusted
- Unoverwhelmed

Wedding HQ should feel like a product that understands how complicated wedding coordination becomes.

The product should not primarily try to impress users through decoration.

It should create trust through clarity.

---

# 3. Core Design Philosophy

Wedding HQ should be:

> **Powerful for organisers. Extremely simple for guests.**

The design should balance:

```text
60% Warm + Human
40% Premium + Understated
```

The product should never become:

- Overly romantic
- Overly corporate
- Visually noisy
- Overly luxurious
- Childishly colourful
- Technically intimidating

---

# 4. Design Personality

Wedding HQ should feel:

- Calm
- Thoughtful
- Authentic
- Warm
- Mature
- Reliable
- Contemporary
- Indian without becoming decorative
- Premium without becoming luxurious
- Friendly without becoming playful

It should avoid feeling:

- Flashy
- Loud
- Generic
- Artificial
- Corporate
- Festive for the sake of festivity
- Like an invitation-template marketplace

---

# 5. Romance Level

Wedding HQ should use different levels of emotional expression depending on context.

## Organiser Workspace

Approximate romance level:

```text
3–4 / 10
```

Primarily operational.

Warmth should come from:

- Couple names
- Typography
- Spacing
- Illustration accents
- Language

Not from decoration.

## Guest Experience

Approximate romance level:

```text
5–6 / 10
```

Guests should feel that they are entering a wedding experience rather than an admin product.

The experience should remain restrained.

---

# 6. Primary V1 Audience

Wedding HQ V1 should market primarily to:

> **Couples planning their wedding**

Wedding planners remain supported as a role inside the product.

However, dedicated planner marketing and multi-wedding planner experiences are deferred to later versions.

V1 should not dilute its homepage positioning by trying to speak equally to:

- Couples
- Wedding planners
- Event-management companies

Couples come first.

---

# 7. Product Surfaces

Wedding HQ contains five distinct UI surfaces.

## 7.1 Public Website

Audience:

- Prospective couples

Purpose:

- Explain Wedding HQ
- Build trust
- Demonstrate product value
- Encourage account creation

## 7.2 Authentication and Onboarding

Audience:

- Bride
- Groom

Purpose:

- Sign in
- Create wedding
- Configure basic wedding information
- Begin setup

## 7.3 Organiser Workspace

Audience:

- Bride
- Groom
- Planner
- Admin

Purpose:

- Run wedding operations

## 7.4 Collaborator Workspace

Audience:

- Family
- Friends
- Assigned helpers

Purpose:

- See assigned responsibilities
- Update tasks

## 7.5 Guest Experience

Audience:

- Wedding guests

Purpose:

- View invited events
- RSVP
- Find venues
- View invitations
- Access livestreams
- Upload/view photos
- Find help contact

---

# 8. Visual Identity

Wedding HQ should avoid traditional wedding-website visual conventions.

Do not use:

- Bright red backgrounds
- Strong pink palettes
- Saturated yellow/marigold everywhere
- Decorative floral borders
- Mandalas used as generic decoration
- Wedding ring stock photography
- Stock images of couples
- Generic Indian wedding photography
- Champagne imagery
- Excessive gradients
- Glassmorphism
- Neon colour
- Script/calligraphy fonts
- Decorative patterns behind every section

The product should feel elegant through restraint.

---

# 9. Core Colour Direction

The primary palette should be:

```text
Warm ivory / off-white
Charcoal
Warm stone grey
Muted sage / olive green
Small amount of clay / terracotta
```

Exact colour values should be finalised during design-system work.

# 10. Primary Accent

The primary accent colour is:

> **Muted sage / olive green**

It should communicate:

- Calm
- Trust
- Warmth
- Naturalness
- Stability

It should not become:

- Bright emerald
- Neon green
- Highly saturated forest green

# 11. Secondary Warm Accent

Clay / terracotta may appear in small quantities.

Use cases:

- Illustration details
- Decorative micro-elements
- Selected emotional surfaces

It should not become a second competing UI accent.

Functional controls should remain primarily sage/olive.

# 12. Status Colours

Status colours may use conventional meaning:

- Red → overdue/error
- Amber → warning/maybe
- Green → success/completed

However:

- Keep saturation restrained.
- Avoid large coloured KPI cards.
- Do not turn dashboards into traffic-light interfaces.

Colour should communicate meaning, not decorate every surface.

# 13. Light Theme

Light mode should not use harsh pure white.

Recommended visual behaviour:

```text
Page background     Warm ivory
Primary surface     Soft white / warm stone
Secondary surface   Light warm grey
Primary text        Soft charcoal
Secondary text      Warm medium grey
Accent              Muted sage / olive
Borders             Soft warm grey
```

The page should remain comfortable during long planning sessions.

# 14. Dark Theme

Dark mode should not use pure black.

Recommended visual behaviour:

```text
Page background     Deep warm charcoal
Primary surface     Dark stone
Secondary surface   Slightly lighter charcoal
Primary text        Warm off-white
Secondary text      Muted warm grey
Accent              Softened sage
Borders             Subtle warm dark-grey
```

Dark mode should feel like:

> **The evening version of Wedding HQ**

not:

> A developer console.

# 15. Theme Modes

Wedding HQ supports:

```text
Light
Dark
System
```

System mode follows device preference.

Theme preference should be remembered.

# 16. Eye Comfort Mode

Wedding HQ should include a separate eye-comfort feature inspired by the intention of macOS Night Shift.

This is not a true display colour-temperature adjustment.

Instead, Wedding HQ changes its own visual tokens to reduce glare and cool colour intensity.

Available states:

```text
Off
On
Auto
```

# 17. Comfort Mode Behaviour

Comfort Mode may:

- Warm backgrounds slightly
- Reduce blue/cool undertones
- Reduce decorative saturation
- Soften large bright surfaces
- Reduce border harshness
- Warm dark surfaces
- Warm off-white text
- Reduce excessive colour intensity

Comfort Mode must not:

- Add a strong orange filter
- Make the interface look yellow
- Destroy colour meaning
- Reduce text readability

Core rule:

> **Low glare, not low readability.**

# 18. Automatic Comfort Mode

Auto mode may use the browser's local time.

Initial behaviour may be approximately:

```text
7:00 PM → Comfort Mode On
7:00 AM → Comfort Mode Off
```

No location permission is required.

Custom scheduling may be introduced later.

# 19. Accessibility

Wedding HQ should remain accessible while maintaining a soft visual appearance.

Requirements:

- Strong readable contrast
- Visible keyboard focus
- Clear button states
- No information communicated by colour alone
- Comfortable body-text sizes
- Touch-friendly mobile controls
- Reduced-motion support
- Clear form labels
- Error messaging close to affected fields

The design should support system settings such as reduced motion where possible.

# 20. Typography

Wedding HQ should use two complementary typographic voices.

## Primary Typeface

Clean contemporary sans-serif.

Used for:

- Application navigation
- Forms
- Tables
- Buttons
- Operational headings
- Body copy
- Numbers
- Dashboard information

The typeface should feel:

- Warm
- Highly readable
- Contemporary
- Non-futuristic

## Secondary Typeface

Tasteful editorial serif.

Used selectively for:

- Couple names
- Homepage hero headlines
- Guest wedding headings
- Emotional moments

Do not use serif type heavily inside operational screens.

# 21. Typography to Avoid

Do not use:

- Calligraphy
- Handwritten wedding fonts
- Highly ornamental serif
- Decorative display fonts
- Excessively geometric futuristic fonts

# 22. Illustration Direction

Wedding HQ should use original hand-drawn editorial illustrations.

The intended qualities are:

- Minimal line work
- Human warmth
- Graceful forms
- Negative space
- Small moments of humour
- Indian cultural familiarity
- Restrained colour
- Elegant simplicity

# 23. Cultural Illustration Direction

Illustrations may include subtle:

- Indian wedding details
- South-Indian details
- Telugu cultural references where appropriate

Examples:

- Wedding shoes near a doorway
- Invitation being passed between hands
- Family member holding a checklist
- Elderly couple viewing a venue map
- Camera and guest photographs
- Chairs awaiting a ceremony
- Small decorative wedding objects
- Family coordinating an event
- Guests arriving at a venue

Illustrations should never become caricatures.

# 24. Artist Reference Rule

Wedding HQ should not reproduce, trace, or imitate the work of Bapu or any single named artist.

The product may draw inspiration only from broad principles such as:

- Simplicity
- Expressive line work
- Indian cultural familiarity
- Graceful composition
- Understatement

All final illustrations should be original and legally safe.

# 25. Illustration Colour Behaviour

Use softened versions of culturally familiar colours.

Example:

```text
Bright marigold → Muted ochre
Bright red      → Earthy brick
Hot pink        → Dusty rose
Emerald         → Sage / muted forest
Royal blue      → Muted indigo
```

Illustrations should work in both light and dark themes.

# 26. Photography

Wedding HQ V1 should not use stock wedding photography.

Avoid:

- Stock couples
- Ceremony photography
- Wedding venue stock photos
- Generic smiling-family imagery

Use instead:

- Product UI
- Illustrations
- Diagrams
- Typography
- Actual user-generated wedding content only when legitimately available later

# 27. Surface Style

Wedding HQ should feel slightly tactile without becoming skeuomorphic.

Use:

- Warm paper-like surfaces
- Thin borders
- Subtle shadow where hierarchy requires it
- Restrained corner radius
- Generous spacing
- Editorial composition

Avoid:

- Floating card overload
- Heavy drop shadows
- Glass panels
- Excessively pill-shaped UI
- Giant gradient surfaces

# 28. Motion

Motion should confirm actions rather than decorate the product.

Appropriate examples:

- Task completion
- RSVP saved
- Photo approval
- Drawer opening
- Menu expansion
- Success confirmation

Avoid:

- Scroll-jacking
- Heavy parallax
- Constant movement
- Decorative bouncing
- Confetti after routine actions

One subtle celebratory moment may appear after completing initial wedding setup.

# 29. Public Website Navigation

Initial V1 navigation:

```text
Wedding HQ

Product
How it works

Sign in
Start planning
```

Dedicated Planner navigation should not appear in V1.

# 30. Public Homepage Structure

The homepage should remain focused at approximately 6–7 sections.

## Section 1 — Hero

Headline direction:

> **A calmer way to manage your wedding.**

Supporting positioning:

> Keep your events, guests, RSVPs, tasks, vendors, expenses, updates and photos together — so everyone knows what needs to happen next.

Actions:

```text
Start planning
See how it works
```

Primary visual:

> Actual Wedding HQ product UI

No stock photo.

## Section 2 — The Coordination Problem

Headline direction:

> **Your wedding shouldn't live across ten different places.**

Visual concept:

```text
WhatsApp
Spreadsheets
Calls
Maps
Emails
Photos
     ↓
Wedding HQ
```

Use restrained editorial illustration/diagramming.

## Section 3 — Product Overview

Headline direction:

> **Everything for your wedding. Finally in one place.**

Show:

- Events
- Guests
- Tasks
- Vendors
- Expenses

Prefer one coherent product composition over many repetitive feature cards.

## Section 4 — Guest Experience

Headline direction:

> **Simple for you. Even simpler for your guests.**

Emphasise:

```text
No account
No app
No password
```

Show mobile guest interface prominently.

## Section 5 — How It Works

Suggested structure:

```text
Set up your wedding
        ↓
Add events and guests
        ↓
Invite your people
        ↓
Stay on top of everything
```

Use four small original illustrations.

## Section 6 — Privacy / Trust

Headline:

> **Your wedding stays private.**

Communicate:

- Secure guest links
- Guests only see invited events
- Wedding is not publicly searchable
- Private photo storage

Tone should be calm and reassuring.

## Section 7 — Final CTA

Direction:

> **Less chasing. Less confusion. More time for the wedding itself.**

Action:

```text
Start planning
```


# 31. Authentication Experience

Authentication should remain minimal.

## Sign In

```text
Welcome to Wedding HQ

Continue with Google

or

Email address
[Send magic link]
```

Avoid elaborate full-screen marketing alongside the form.

## Magic Link Confirmation

```text
Check your email

We sent a sign-in link to:
priya@example.com
```

# 32. Onboarding

Onboarding should be short and progressive.

Do not require complete wedding configuration before entry.

Use four primary steps.

# 33. Onboarding Step 1 — Your Wedding

Collect:

- Bride name
- Groom name
- Wedding title
- Start date
- End date
- Timezone

Wedding title may default to:

```text
Ravi & Priya
```

# 34. Onboarding Step 2 — Events

Selectable templates:

```text
Engagement
Haldi
Mehendi
Sangeet
Wedding
Reception
Custom event
```

Users select events first.

Complete event details may be added later.

# 35. Onboarding Step 3 — Team

Optional.

Allow:

- Wedding Planner
- Admin / Family Coordinator

Include:

```text
Skip for now
```

# 36. Onboarding Step 4 — Guests

Offer:

```text
Import from spreadsheet

or

Add guests manually

or

I'll do this later
```

Then:

> **Your Wedding HQ is ready.**

# 37. Organiser Desktop Shell

Desktop uses a collapsible left sidebar.

Expanded state:

```text
Wedding HQ

Ravi & Priya
12 days to go

Overview
Events
Guests
Tasks
Vendors
Expenses
Messages
Photos
Activity

──────────

Settings

Collapse
```

# 38. Collapsed Sidebar

Collapsed state shows:

- Brand mark
- Couple monogram
- Navigation icons
- Settings
- Expand control

Example couple identity:

```text
R + P
```

All navigation icons require tooltips.

Collapsed/expanded state should be remembered per signed-in user.

# 39. Organiser Top Bar

Keep sparse.

Structure:

```text
Page title

                     Appearance
                     Help
                     Profile
```

Contextual primary action appears when required.

Examples:

```text
Guests                  + Add household
Tasks                   + New task
Events                  + Add event
```

# 40. Organiser Mobile Navigation

Use bottom navigation for high-frequency destinations.

```text
Overview
Guests
Tasks
Events
More
```

Inside More:

```text
Vendors
Expenses
Messages
Photos
Activity
Settings
```

This should support one-handed operation during live wedding activity.

# 41. Organiser Overview

The Overview is Wedding HQ's flagship application screen.

Top:

```text
Good morning, Priya

Ravi & Priya
12 days to go
December 18–20
```

# 42. Overview Summary Metrics

Display four restrained metrics:

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

Avoid colourful KPI-card grids.

# 43. Needs Your Attention

This is the most important Overview section.

Examples:

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

This section should visually outrank generic statistics.

Core philosophy:

> **Users log in to understand what they should do next.**

# 44. Coming Up

Display upcoming events.

Example:

```text
Sangeet
18 Dec · 7:00 PM
2 days away

Wedding
19 Dec · 9:00 AM
3 days away
```

Cards should be compact and elegant.

# 45. Recent Activity

Example:

```text
Reddy Family confirmed Reception

Rahul completed "Confirm decorator"

Planner added Royal Caterers

12 new photos uploaded
```

Activity should feel operational, not social.

# 46. Events Screen

Events should initially appear as a wedding schedule rather than a database table.

Example:

```text
December 18

Sangeet
7:00 PM
Example Convention Centre
125 households invited


December 19

Wedding
9:00 AM
Temple Venue
180 households invited
```

# 47. Event Setup Status

Each event may display:

```text
Venue ✓
Invitation ✓
RSVP deadline ✓
Livestream —
```

Primary action:

```text
Add event
```

# 48. Event Detail

Suggested internal navigation:

```text
Overview
Guests
RSVPs
Photos
```

Main event information:

- Date
- Time
- Venue
- Map
- Dress code
- Invitation
- RSVP deadline
- Livestream

# 49. Guests Screen

Top-level tabs:

```text
Households
RSVPs
Import / Export
```

# 50. Household List

Each row/card may show:

```text
Reddy Family

Ravi Reddy
4 adults · 2 children

Invited:
Sangeet · Wedding · Reception

RSVP:
3 attending · Reception confirmed
```

Include:

- Search
- Event filter
- RSVP filter

Primary action:

```text
Add household
```

# 51. Household Detail

Show:

```text
Reddy Family

Primary contact
Ravi Reddy
ravi@example.com
+91 ...

Invited
4 adults
2 children

Events
✓ Sangeet
✓ Wedding
✓ Reception

RSVP
Sangeet      Yes
Wedding      Maybe
Reception    Yes
```

Also include:

- Guest-link status
- Notes
- Activity

Actions:

```text
Edit household
Resend invitation
```

Do not display raw guest tokens.

# 52. RSVP Management

Filters:

```text
Event
Response
```

Example:

```text
Reception
Awaiting response
```

Rows:

```text
Reddy Family
Invitation sent 5 days ago
Send reminder

Sharma Family
Invitation sent 4 days ago
Send reminder
```

Operational action should remain obvious.

# 53. Guest Import

Tone should be friendly.

Headline:

> **Bring your guest list with you.**

Action:

```text
Upload CSV or Excel
```

Preview:

```text
400 rows found

390 ready to import
6 need attention
4 possible duplicates
```

Avoid technical language wherever possible.

# 54. Tasks

Support:

```text
List
Board
```

V1 defaults to:

> **List**

# 55. Task List

Group by urgency.

Example:

```text
Needs attention

Confirm decorator
Rahul
Today
HIGH


Finalize Sangeet playlist
Priya
Tomorrow
MEDIUM


Upcoming

Call photographer
Planner
12 Dec
```

Completed tasks may collapse into a secondary section.

Wedding HQ Tasks should not feel like Jira.

# 56. Vendors

Present vendors as a clear operational directory.

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

Filters:

- Category
- Event
- Status

On mobile, contact actions such as:

```text
Call vendor
```

should be prominent.

# 57. Expenses

Keep the financial interface simple.

Top summary:

```text
Estimated
₹14.5L

Actual
₹13.8L

Variance
₹70K under
```

Then grouped expenses.

Example:

```text
Venue         ₹4.0L
Catering      ₹3.5L
Photography   ₹2.0L
Decoration    ₹1.8L
Other         ₹2.5L
```

Small restrained visualisations are acceptable.

Avoid financial-dashboard complexity.

# 58. Messages

Navigation label:

> **Messages**

even though V1 communication is one-way email.

Tabs:

```text
Scheduled
Sent
Drafts
```

Primary action:

```text
New message
```

# 59. Message Composer

Structure:

```text
To

Reception guests who haven't RSVP'd


Subject

Reception RSVP reminder


Message

...


Send now
Schedule
```

Writing a message should feel approximately as easy as writing an email.

# 60. Photos

Use a visual interface.

Tabs:

```text
Pending review
Approved
```

Pending photos use a grid.

Selecting a photo shows a larger review surface.

Example:

```text
IMG_1082.jpg

Reception
Uploaded by guest

Reject
Approve
```

# 61. Activity

Chronological feed.

Example:

```text
Today

09:42
Rahul completed "Confirm decorator"

09:21
Reddy Family RSVP'd Yes for Reception

08:55
Priya approved 12 photos
```

Avoid social-media styling.

# 62. Settings

Settings sections:

```text
Wedding details
Team & permissions
Guest help contacts
Appearance
Privacy & retention
```

# 63. Appearance Settings

Theme:

```text
Light
Dark
System
```

Eye comfort:

```text
Off
On
Auto
```

Optional future configuration:

```text
Auto schedule
7:00 PM – 7:00 AM
```

# 64. Owner Experience

Owner Overview should answer:

> **How is our wedding doing, and what needs our attention?**

Prioritise:

- Countdown
- Needs attention
- Guest status
- Tasks
- Expenses
- Photo review
- Upcoming events
- Recent activity

# 65. Planner and Admin Experience

Planner and Admin may share essentially the same V1 organiser workspace.

V1 does not need separate dashboard products.

Role-specific differences may be revisited in later versions.

The wedding identity should remain:

```text
Ravi & Priya
```

rather than becoming:

```text
Wedding Project #3829
```

# 66. Collaborator Experience

Collaborators should see a dramatically simplified product.

Home:

```text
Ravi & Priya

Your responsibilities

1 overdue
2 upcoming
4 completed
```

Then their tasks.

# 67. Collaborator Task Detail

Display:

- Task title
- Description
- Related event
- Due date
- Priority
- Notes

Actions:

```text
Start task
Mark complete
```

Do not expose the complete organiser workspace.

# 68. Guest Design Direction

Guest experience is mobile-first.

It should feel warmer than the organiser application.

Use:

- More whitespace
- Selective serif typography
- Small illustration motif
- Warm surfaces
- Couple names prominently

Do not add complex navigation.

# 69. Guest Homepage

Example:

```text
Ravi & Priya

December 18–20
Hyderabad

12 days to go
```

Then invited event cards.

Only invited events should appear.

# 70. Guest Event Card

Example:

```text
Sangeet

Friday, December 18
7:00 PM

Example Convention Centre
Hyderabad

Open in Maps →

Dress code
Indo-Western

View invitation →

Your RSVP
3 adults · 1 child attending

Change RSVP
```

# 71. Guest RSVP

Simple question:

> **Will your family be joining us?**

Options:

```text
Yes
Maybe
No
```

If Yes/Maybe:

```text
Adults attending
[-] 3 [+]

Children attending
[-] 1 [+]
```

Primary action:

```text
Save RSVP
```

No unnecessary fields.

# 72. Guest Photos

Guest page:

```text
Photos

View gallery
Upload photos
```

Upload flow:

> **Share your photos from the wedding**

Select photos.

Upload.

Confirmation:

> **Thanks! Your photos were sent to the wedding gallery.**

Do not expose technical infrastructure language.

# 73. QR Photo Upload

This is the simplest Wedding HQ workflow.

Guest scans QR.

Screen:

> **Share your photos from the Reception**

Then:

```text
Choose photos
```

Upload.

Confirmation.

No account.

No navigation.

No RSVP access.

# 74. Guest Theme Behaviour

Guest experience supports:

```text
Light
Dark
System
```

plus Eye Comfort.

Default should normally respect system settings.

A simple appearance control may be available without making configuration prominent.

# 75. Guest Customisation

Wedding HQ V1 uses:

> **One strong default guest design**

Do not introduce a theme marketplace or multiple wedding templates.

The quality of one excellent default experience is more important than broad customisation.


# 76. Responsive Philosophy

## Guest

Mobile-first.

## Organiser

Desktop/tablet rich, but fully usable on mobile.

## Planner/Admin

Critical operations must remain fast from a phone during an active wedding.

# 77. Important Mobile Actions

Examples:

- Complete task
- Call vendor
- View guest RSVP
- Open venue map
- Send reminder
- Review photo
- View upcoming event

These should never require deep navigation.

# 78. Primary Navigation

Locked organiser navigation:

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

Do not introduce unnecessary additional top-level sections in V1.

# 79. Information-Hierarchy Rule

Every screen should answer:

1. What am I looking at?
2. What matters most?
3. What needs attention?
4. What can I do next?

Avoid interfaces that show data without helping the user act.

# 80. Dashboard Rule

Do not design Wedding HQ around charts.

Prefer:

- Counts
- Clear lists
- Status summaries
- Actionable alerts
- Upcoming items

Graphs are allowed only where they materially improve understanding.

# 81. Copywriting Direction

Wedding HQ language should be:

- Human
- Plain
- Short
- Warm
- Reassuring

Avoid:

- Enterprise jargon
- Technical vocabulary
- Productivity clichés
- Overly romantic wedding language

Examples:

Prefer:

> **Bring your guest list with you.**

over:

> Import guest dataset.

Prefer:

> **83 photos are waiting for review.**

over:

> Pending moderation queue: 83.

# 82. Trust Language

Trust should be communicated through clarity.

Avoid exaggerated claims like:

> Military-grade wedding security.

Prefer:

> **Your wedding stays private. Guests only see the events they're invited to.**

# 83. Empty States

Empty states should explain the next useful action.

Example Guests:

> **No guests here yet.**

> Add your first household or bring in your existing spreadsheet.

Actions:

```text
Add household
Import guest list
```

# 84. Error States

Errors should explain:

- What happened
- Whether data was saved
- What the user can do next

Avoid raw technical errors.

# 85. Loading States

Use:

- Skeletons
- Subtle progress
- Clear upload states

Avoid:

- Full-screen spinners for minor operations
- Abrupt layout jumps

# 86. Destructive Actions

Actions such as:

- Delete wedding
- Delete event with dependencies
- Revoke guest access
- Remove member

must require clear confirmation.

Confirmation language should describe consequences.

# 87. First Stitch Design Batch

The first design generation should establish the complete Wedding HQ design language.

Generate:

1. Public homepage
2. Sign-in page
3. Wedding onboarding
4. Wedding Overview — desktop light
5. Wedding Overview — desktop dark
6. Wedding Overview — mobile
7. Guests screen
8. Tasks screen
9. Events screen
10. Guest wedding page — mobile light
11. Guest wedding page — mobile dark/comfort
12. Guest RSVP
13. QR photo upload

# 88. Why These Screens Come First

These screens prove:

- Brand identity
- Marketing language
- Typography
- Colour system
- Light/dark themes
- Comfort mode
- Desktop shell
- Mobile shell
- Sidebar
- Dashboard philosophy
- Operational list design
- Guest design
- Illustration language
- Responsive behaviour

Once approved, secondary screens can inherit the system.

# 89. Second Design Batch

After the primary visual system is approved:

- Vendor list/detail
- Expense screen
- Messages
- Message composer
- Photo moderation
- Activity
- Settings
- Household detail
- RSVP management
- Guest import flow
- Collaborator task workspace

# 90. Design Anti-Patterns

Stitch should explicitly avoid:

- Stock wedding photos
- Generic smiling couples
- Bright wedding gradients
- Pink/red/yellow-dominated interfaces
- Floral borders everywhere
- Mandala-heavy visuals
- Glassmorphism
- Excessive rounded cards
- Huge shadows
- Neon colours
- Analytics-heavy dashboards
- Multiple meaningless charts
- Generic SaaS hero illustrations
- Script fonts
- Excessive animation
- Overcrowded navigation
- Enterprise terminology
- Wedding-template styling

# 91. Emotional Goal

When a couple sees Wedding HQ for the first time, the intended reaction is:

> **This feels calm.**

Then:

> **This looks like it was made for people actually managing a wedding.**

Then:

> **I understand what this product does.**

And finally:

> **I trust this enough to put my wedding information here.**

# 92. Organiser Emotional Goal

When a user opens the organiser workspace:

> **I immediately know how the wedding is doing and what needs my attention.**

# 93. Guest Emotional Goal

When a guest opens their invitation:

> **This is beautiful, simple, and I immediately know where I need to be and what I need to do.**

# 94. Final Design Definition

Wedding HQ V1 should feel like:

> **A calm, warm and highly usable wedding coordination workspace that combines the clarity of excellent productivity software with the human character of a wedding, without falling into traditional wedding-site clichés.**

The organiser product should remain functional and restrained.

The guest experience may become slightly warmer and more expressive.

Both should clearly belong to the same Wedding HQ design system.

# 95. Document Status

**Wedding HQ UI/UX Design Brief V1.0**

**Status: Awaiting Approval**

Once approved, this brief becomes the baseline for:

- Stitch prompt creation
- Visual exploration
- Screen generation
- Future design-system documentation
- Frontend implementation

The next step after approval is:

> **Create the Wedding HQ Stitch Master Prompt for the first design batch.**

Future UI/UX revisions should be documented as:

```text
UI/UX Brief V1.1
UI/UX Brief V1.2
UI/UX Brief V2.0
```

rather than silently changing the approved design direction.
