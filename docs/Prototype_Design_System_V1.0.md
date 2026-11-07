# Wedding HQ — Prototype Design System

**Version:** 1.0  
**Purpose:** Keep the Wedding HQ prototype visually consistent and implementation-ready without over-engineering.

---

# 1. Design Principle

Wedding HQ should feel:

> **Calm, warm, clear and trustworthy.**

The design system exists only to make the prototype consistent.

If a component or token is not needed for the prototype, do not create it yet.

---

# 2. Brand

## Product name

Always:

**Wedding HQ**

## Wordmark

Font:

**Plus Jakarta Sans SemiBold**

Desktop:

```text
[Wedding HQ mark] Wedding HQ
```

Mobile organiser:

```text
[Wedding HQ mark]
```

Guest experience:

Wedding identity takes priority:

```text
Ravi & Priya
```

Wedding HQ branding is secondary.

---

# 3. Brand Mark

Use the approved working direction:

> **Woven W / Joined Paths**

One-colour original symbol.

Requirements:

- Simple
- Recognisable at small size
- No gradient
- No shadows
- No heart/ring/flower/leaf/book imagery
- Works in charcoal, sage and white

This is the working prototype mark.

Final trademark/logo refinement can happen later.

---

# 4. Typography

Use only two font families.

## Primary UI

**Plus Jakarta Sans**

Use for:

- Navigation
- Buttons
- Forms
- Lists
- Tables
- Metrics
- Body text
- Operational headings

## Editorial

**Newsreader**

Use only for:

- Couple names
- Homepage hero headlines
- Guest-facing wedding titles

Do not create additional font families for V1.

---

# 5. Type Scale

Keep the scale small.

```text
12px   Small metadata
14px   Secondary text / labels
16px   Default body
18px   Strong body / small heading
24px   Section heading
32px   Main app heading
40–48px Marketing / guest hero
```

Mobile hero typography may scale down naturally.

Do not create dozens of typography variants.

---

# 6. Light Theme

Use these prototype colours.

```text
Background       #F7F5EF
Surface          #FCFBF7
Surface Alt      #EFECE4

Primary Text     #282A25
Secondary Text   #6D7068

Border           #DDD9CF

Primary Sage     #6F7F63
Sage Hover       #5F6F55
Sage Soft        #E5EADF

Clay Accent      #B97A61
```

Clay is decorative only.

Do not use it for primary actions.

---

# 7. Dark Theme

```text
Background       #1D201C
Surface          #252821
Surface Alt      #2D3029

Primary Text     #F1EFE7
Secondary Text   #A9ABA1

Border           #3B3E36

Primary Sage     #98A88B
Sage Hover       #A9B79D
Sage Soft        #32382F

Clay Accent      #C48A72
```

Avoid pure black.

---

# 8. Eye Comfort

Comfort Mode is only a minor token adjustment.

Do not create a separate interface.

## Light Comfort

Slightly warmer background:

```text
Background       #F4F0E6
Surface          #FAF7EF
```

## Dark Comfort

Slightly warmer charcoal:

```text
Background       #211F1A
Surface          #29261F
```

Everything else remains substantially the same.

Display simple status:

> Eye comfort is on

No Kelvin values or technical display terminology.

---

# 9. Functional Colours

Keep functional colours muted.

```text
Success     muted green
Warning     muted amber
Error       muted brick red
Info        muted slate
```

Avoid large blocks of these colours.

Use them mainly for:

- Small badges
- Icons
- Borders
- Error messages

Do not communicate status by colour alone.

---

# 10. Spacing

Use one spacing scale:

```text
4px
8px
12px
16px
24px
32px
48px
64px
```

Most layout work should use:

```text
8 / 12 / 16 / 24 / 32
```

Do not invent arbitrary spacing unless required.

---

# 11. Radius

Keep corners restrained.

```text
Small controls       6px
Buttons / inputs     8px
Cards / panels       12px
Large feature panel  16px
Circle / pill        9999px
```

Do not turn every element into a pill.

---

# 12. Borders and Shadows

Default:

```text
1px subtle border
```

Use shadows only when hierarchy genuinely requires them.

Suggested:

```text
0 2px 8px rgba(0,0,0,0.05)
```

Avoid dramatic floating-card shadows.

---

# 13. Icons

Use one UI icon family consistently.

For the prototype:

> **Lucide-style simple outline icons**

Do not mix multiple icon styles.

Brand mark remains separate.

Default icon treatment:

- 18–20px desktop
- 20–24px mobile
- Rounded visual character
- Consistent stroke width

---

# 14. Buttons

Only three button types are needed.

## Primary

Muted sage fill.

Examples:

```text
Start planning
Add household
Save RSVP
Choose photos
```

## Secondary

Neutral surface with border.

Examples:

```text
Cancel
Edit
View invitation
```

## Tertiary

Text-only action.

Examples:

```text
View tasks →
Send reminder →
```

---

# 15. Button Dimensions

Desktop:

```text
Height: 40–44px
```

Mobile:

```text
Minimum touch height: 44px
```

Primary buttons should not become oversized unless used as a major marketing CTA.

---

# 16. Form Fields

Use one input treatment everywhere.

```text
Height          44px
Radius          8px
Border          subtle warm grey
Background      surface
Focus border    sage
```

Every field gets:

- Visible label
- Optional helper text
- Clear error message

Avoid placeholder-only labels.

---

# 17. Cards

Use cards sparingly.

Cards should be used when content genuinely forms a distinct unit:

- Event
- Upcoming item
- Guest event
- Vendor
- Photo review

Do not place every metric or line of content inside a separate card.

---

# 18. Status Badges

Use one shared badge pattern.

Examples:

```text
Confirmed
Awaiting
Maybe
Overdue
Done
Pending review
Approved
```

Badge style:

- Small
- Soft background
- Clear text
- Moderate radius

Avoid large bright badges.

---

# 19. Organiser Desktop Shell

Canonical structure:

```text
┌───────────────┬─────────────────────────────┐
│ Wedding HQ    │ Page title          actions │
│               │                             │
│ Ravi & Priya  │ Main content                │
│ 12 days       │                             │
│               │                             │
│ Overview      │                             │
│ Events        │                             │
│ Guests        │                             │
│ Tasks         │                             │
│ Vendors       │                             │
│ Expenses      │                             │
│ Messages      │                             │
│ Photos        │                             │
│ Activity      │                             │
│               │                             │
│ Settings      │                             │
└───────────────┴─────────────────────────────┘
```

Sidebar remains collapsible.

---

# 20. Sidebar

Expanded width:

approximately:

```text
240–260px
```

Collapsed:

approximately:

```text
64–72px
```

Expanded:

```text
[mark] Wedding HQ

Ravi & Priya
12 days to go
```

Collapsed:

```text
[mark]

[R+P]
```

Remember sidebar state for the user.

---

# 21. Organiser Mobile Shell

Bottom navigation:

```text
Overview
Guests
Tasks
Events
More
```

Do not change ordering between screens.

More contains:

```text
Vendors
Expenses
Messages
Photos
Activity
Settings
```

---

# 22. Page Headers

Keep them simple.

Example:

```text
Guests                           + Add household
```

Do not use:

```text
Dashboard / Guests
```

or verbose labels such as:

```text
Guest Coordination Management Center
```

---

# 23. Overview

Canonical hierarchy:

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

No extra dashboard modules unless needed later.

---

# 24. Tables and Lists

Use tables only where useful.

For Guests:

- Comfortable row height
- Minimal separators
- Search
- Filters
- No dense spreadsheet appearance

For mobile, transform complex rows into stacked list items rather than squeezing desktop tables.

---

# 25. Modal vs Drawer

Keep the rule simple.

## Modal

Use for:

- Confirm deletion
- Small confirmations
- Short forms

## Side Drawer

Use for:

- Household details
- Quick vendor details
- Task details where appropriate

## Full Page

Use when:

- The workflow is substantial
- There is meaningful navigation
- Mobile requires more room

Do not create multiple patterns for the same interaction.

---

# 26. Empty States

Every major area only needs one useful empty state.

Example:

> **No guests here yet.**

> Add your first household or bring in your spreadsheet.

Buttons:

```text
Add household
Import guest list
```

No elaborate empty-state illustration is required for the prototype.

---

# 27. Loading

Use:

- Skeleton rows
- Skeleton cards
- Small inline loading state

Avoid full-screen spinners except initial app loading.

---

# 28. Success Feedback

Use small toast/confirmation feedback.

Examples:

```text
RSVP saved
Task completed
Guest added
Message scheduled
Photos uploaded
```

Do not create celebration animations for routine actions.

---

# 29. Errors

Errors must explain what happened.

Example:

> We couldn't upload this photo. Try again.

Avoid:

```text
Error 500
Upload processor failed
```

---

# 30. Destructive Actions

Require confirmation for:

- Delete wedding
- Delete event
- Remove member
- Revoke guest access

Use plain consequence-oriented copy.

Example:

> **Delete Sangeet?**

> This removes the event from the wedding and its guest invitations.

Buttons:

```text
Cancel
Delete event
```


# 31. Guest Experience

Guest pages use the same visual system but slightly warmer.

Use:

- More whitespace
- More Newsreader
- Larger couple names
- Fewer visible controls
- No sidebar
- No complex navigation

Primary identity:

> **Ravi & Priya**

---

# 32. Guest Mobile Layout

Recommended content width:

```text
100%
```

with approximately:

```text
20–24px horizontal padding
```

Event cards should be easy to scan and tap.

---

# 33. Guest Actions

Primary guest actions:

```text
Open in Maps
View invitation
RSVP
Upload photos
View photos
```

Keep them obvious.

Do not introduce secondary workflows.

---

# 34. QR Upload

The QR photo flow does not need the main application shell.

Use only:

```text
Ravi & Priya
Reception

Share your photos from the Reception

Choose photos
```

Then upload progress and success.

---

# 35. Responsive Breakpoints

For the prototype, use only three practical ranges.

```text
Mobile     < 768px
Tablet     768–1023px
Desktop    ≥ 1024px
```

Do not design a large custom breakpoint system.

---

# 36. Desktop Content Width

Main application content should generally stay within approximately:

```text
1200–1400px
```

depending on screen type.

Avoid unnecessarily stretching text and tables across ultra-wide displays.

---

# 37. Accessibility Minimums

For the prototype, ensure:

- Body text is readable
- Buttons are keyboard reachable
- Focus states visible
- Touch targets ~44px
- Text contrast remains strong
- Status isn't represented by colour alone
- Reduced motion respected

No need to create an exhaustive accessibility framework yet.

---

# 38. Motion

Use only simple transitions:

```text
150–250ms
```

for:

- Sidebar
- Drawer
- Modal
- Hover
- Task completion
- Toast

No advanced motion system is necessary.

---

# 39. Canonical Demo Data

Use one fixture everywhere:

```text
Ravi & Priya
Hyderabad
December 18–20, 2026
```

Events:

```text
Sangeet
Dec 18 · 7:00 PM

Wedding
Dec 19 · 9:00 AM

Reception
Dec 20 · 7:30 PM
```

Dashboard:

```text
342 confirmed guests
25 households awaiting RSVP

12 tasks remaining
4 overdue

₹13.8L actual spend
₹14.5L estimated

83 photos awaiting review
```

---

# 40. Prototype Component Set

These are the only shared components we need initially:

```text
BrandMark
Button
IconButton
Input
Select
Textarea
Checkbox
Radio
Badge
Card
Tabs
Modal
Drawer
Toast
Tooltip
Skeleton
Sidebar
BottomNav
PageHeader
SearchField
FilterControl
EmptyState
ConfirmDialog
```

Domain components:

```text
Metric
AttentionItem
EventCard
HouseholdRow
TaskRow
VendorRow
ExpenseRow
PhotoTile
ActivityItem
```

Do not build a larger component library until needed.

---

# 41. What We Are Deliberately NOT Designing Yet

For the prototype, defer:

- Huge token documentation
- Multiple button sizes
- Multiple card families
- Full animation library
- Complex chart system
- Custom data-grid framework
- Theme marketplace
- Guest template system
- Planner-specific design system
- Advanced accessibility controls
- Fine-grained responsive breakpoints
- Component documentation website
- Storybook-level exhaustive variants

These can come later if the prototype proves useful.

---

# 42. Prototype Rule

Before creating anything new, ask:

> **Does the prototype need this to test whether Wedding HQ solves the coordination problem?**

If the answer is no:

> **Do not build it yet.**

---

# 43. Status

**Wedding HQ Prototype Design System V1.0**

This is intentionally small.

It is sufficient to:

- Clean the current prototype
- Design the remaining V1 screens
- Build reusable frontend components
- Test the product with real users

It should expand only when real product needs justify expansion.
