
# Learning Room — Frontend Design System

> **Design philosophy:** A warm, creative, focused digital space where learning feels collaborative, personal, and alive.

This document defines the visual identity, design principles, typography, color palette, component styles, layouts, interaction patterns, and implementation rules for the Learning Room frontend.

Every frontend feature must follow this system unless a deliberate design decision requires otherwise.

---

## 1. Product Identity

### What We Are Building

Learning Room is a real-time collaborative learning platform where people gather in shared rooms to learn, discuss, brainstorm, and work together.

The experience includes:

- Collaborative learning rooms
- Video meetings through Google Meet integration
- Real-time text chat
- Shared canvas for writing, sketching, and images
- Room members, presence, and activity indicators
- Room creation, invitations, and joining
- Shared learning resources and future collaboration tools

### The Feeling We Want

The product should feel like a combination of a beautifully designed digital studio, a welcoming study room, and a modern creative workspace.

Users should feel comfortable staying in a room for hours.

**Design keywords:** Warm, Creative, Calm, Connected, Focused, Premium, Adaptive.

### What the Design Must NOT Look Like

- A generic SaaS admin dashboard
- A clone of Google Meet, Discord, Slack, or Notion
- A screen full of cards, borders, gradients, and floating buttons
- A neon-heavy gaming interface
- A completely white interface without visual depth
- An unnecessarily dark interface that feels cold or intimidating
- A collection of disconnected features with inconsistent styling

Every screen should feel like part of one coherent product.

---

## 2. Core Design Principles

### 2.1 Collaboration First

The interface should emphasize people working together rather than merely communicating.

The shared canvas and active learning content should receive more visual attention than secondary controls.

### 2.2 Warm Minimalism

Use generous spacing, subtle surfaces, restrained colors, and thoughtful typography.

Minimalism does not mean empty screens. Every element should have a clear purpose.

### 2.3 Balanced Layout

Avoid giving every feature equal visual weight.

Establish a clear hierarchy:

1. Primary learning activity
2. Shared canvas or active content
3. Room participants
4. Chat and collaboration tools
5. Secondary settings and utilities

### 2.4 Adaptive Experience

The interface must work in light and dark themes.

Theme changes should preserve the same brand identity, component hierarchy, spacing, and usability.

### 2.5 Functional Beauty

Animations, gradients, illustrations, and decorative elements must support the experience rather than distract from learning.

### 2.6 Consistency

Existing components and design tokens must be reused when implementing new features.

Never introduce random colors, font sizes, shadows, border radii, or spacing values.

---

## 3. Visual Direction

### Overall Aesthetic

Use a premium, editorial-inspired workspace aesthetic with warm neutrals, deep ink surfaces, muted indigo, and a restrained lavender accent.

The interface should feel polished but not corporate.

The product's personality should come from typography, composition, subtle motion, and the way collaboration tools interact.

### Visual Characteristics

- Warm neutral backgrounds
- High-contrast readable typography
- Muted indigo as the primary brand color
- Lavender used for secondary emphasis
- Subtle borders instead of heavy outlines
- Soft shadows for floating surfaces
- Rounded corners with a consistent radius scale
- Large, comfortable canvas areas
- Compact and purposeful navigation
- Small, expressive details for live collaboration

Avoid using gradients everywhere. Reserve them for selected hero areas, onboarding illustrations, and special emphasis.

---

## 4. Color System

All colors must be defined as reusable CSS custom properties.

Do not hardcode colors inside individual components.

### 4.1 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Brand Primary | `#635BDB` | Primary actions, links, selected states |
| Brand Hover | `#5148C8` | Hover state for primary actions |
| Brand Soft | `#EEECFF` | Light-theme accent backgrounds |
| Brand Deep | `#39318F` | Strong emphasis and dark-theme brand details |
| Accent Lavender | `#A99AFB` | Secondary highlights and illustrations |
| Accent Sky | `#82B8E8` | Informational elements and collaboration accents |
| Accent Mint | `#8CCFB5` | Positive status and success accents |
| Accent Peach | `#F3B69A` | Warm decorative accents |

Brand colors should be used intentionally, not as decoration on every element.

### 4.2 Light Theme

| Token | Hex | Usage |
|---|---|---|
| Background | `#F7F6F2` | Main application background |
| Surface | `#FFFFFF` | Cards, panels, dialogs |
| Surface Secondary | `#F0EFEA` | Secondary panels and input backgrounds |
| Surface Hover | `#EAE9E3` | Hovered neutral surfaces |
| Text Primary | `#252522` | Headings and primary text |
| Text Secondary | `#6D6C67` | Supporting text |
| Text Muted | `#92918A` | Metadata and placeholders |
| Border | `#E7E5DE` | Dividers and component borders |
| Border Strong | `#D5D2C8` | Emphasized boundaries |
| Success | `#248A62` | Success feedback |
| Warning | `#B97824` | Warning feedback |
| Danger | `#CF4D52` | Errors and destructive actions |
| Info | `#3977B8` | Informational feedback |

### 4.3 Dark Theme

| Token | Hex | Usage |
|---|---|---|
| Background | `#171815` | Main application background |
| Surface | `#20211E` | Cards and panels |
| Surface Secondary | `#292A26` | Inputs and secondary surfaces |
| Surface Hover | `#32332E` | Hovered neutral surfaces |
| Text Primary | `#F2F0E9` | Headings and primary text |
| Text Secondary | `#B0AFA6` | Supporting text |
| Text Muted | `#85857D` | Metadata and placeholders |
| Border | `#363731` | Dividers and component borders |
| Border Strong | `#4A4B43` | Emphasized boundaries |
| Brand Primary | `#A39AFF` | Primary actions and links |
| Brand Hover | `#B8B1FF` | Hovered primary actions |
| Brand Soft | `#302D4B` | Selected surfaces |
| Success | `#79D5AB` | Success feedback |
| Warning | `#F0C078` | Warning feedback |
| Danger | `#FF8588` | Errors and destructive actions |
| Info | `#8CC4FF` | Informational feedback |

### 4.4 CSS Color Tokens

```css
:root {
  color-scheme: light;

  --color-brand: #635bdb;
  --color-brand-hover: #5148c8;
  --color-brand-soft: #eeecff;

  --color-background: #f7f6f2;
  --color-surface: #ffffff;
  --color-surface-secondary: #f0efea;
  --color-surface-hover: #eae9e3;

  --color-text-primary: #252522;
  --color-text-secondary: #6d6c67;
  --color-text-muted: #92918a;

  --color-border: #e7e5de;
  --color-border-strong: #d5d2c8;

  --color-success: #248a62;
  --color-warning: #b97824;
  --color-danger: #cf4d52;
  --color-info: #3977b8;
}

[data-theme="dark"] {
  color-scheme: dark;

  --color-brand: #a39aff;
  --color-brand-hover: #b8b1ff;
  --color-brand-soft: #302d4b;

  --color-background: #171815;
  --color-surface: #20211e;
  --color-surface-secondary: #292a26;
  --color-surface-hover: #32332e;

  --color-text-primary: #f2f0e9;
  --color-text-secondary: #b0afa6;
  --color-text-muted: #85857d;

  --color-border: #363731;
  --color-border-strong: #4a4b43;

  --color-success: #79d5ab;
  --color-warning: #f0c078;
  --color-danger: #ff8588;
  --color-info: #8cc4ff;
}
```

Components must consume these tokens rather than maintaining separate theme-specific styles.

---

## 5. Typography

Typography is one of the primary elements of the product's identity.

### 5.1 Font Families

**Primary interface font: Manrope**

Use Manrope for headings, navigation, buttons, and most interface text. Its geometric forms give the product a contemporary and friendly personality.

**Secondary interface font: Inter**

Use Inter for dense content, forms, chat messages, metadata, and areas requiring excellent readability.

**Monospace font: JetBrains Mono**

Use JetBrains Mono for code snippets, technical identifiers, and developer-oriented content.

Load fonts through a reliable font provider or bundle them locally if required.

### 5.2 Font Imports

```css
@import url(
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap"
);
```

For production, prefer self-hosting or a controlled font-loading strategy when appropriate.

### 5.3 Typography Tokens

| Element | Size | Weight | Line Height |
|---|---|---|---|
| Display heading | 48px | 800 | 1.1 |
| Page heading | 32px | 700 | 1.2 |
| Section heading | 24px | 700 | 1.3 |
| Card heading | 18px | 700 | 1.4 |
| Large body | 16px | 400 | 1.7 |
| Body | 14px | 400 | 1.6 |
| Button | 14px | 600 | 1.4 |
| Caption | 12px | 500 | 1.5 |
| Tiny metadata | 11px | 500 | 1.4 |

These values are desktop defaults. Use responsive typography where appropriate.

### 5.4 Typography Rules

- Use Manrope for important headings.
- Use sentence case for headings, buttons, and labels.
- Avoid excessive uppercase text.
- Do not use extra-bold text everywhere.
- Maintain clear contrast between headings and supporting copy.
- Use muted text only for secondary information.
- Avoid text smaller than 12px for essential interface content.
- Prefer readable line lengths and comfortable paragraph spacing.
- Do not use multiple unrelated font families.

---

## 6. Spacing and Layout

Use a consistent spacing scale based on multiples of four.

| Token | Value |
|---|---|
| Space 1 | 4px |
| Space 2 | 8px |
| Space 3 | 12px |
| Space 4 | 16px |
| Space 5 | 20px |
| Space 6 | 24px |
| Space 8 | 32px |
| Space 10 | 40px |
| Space 12 | 48px |
| Space 16 | 64px |

### Layout Rules

- Main application padding: 24–32px on desktop.
- Compact panel padding: 16–20px.
- Card padding: 20–24px.
- Standard component gap: 12–16px.
- Section gap: 24–40px.
- Keep consistent alignment across adjacent panels.
- Use flexible layouts instead of fixed widths wherever possible.
- Avoid unnecessary nested cards.
- Use whitespace to establish hierarchy rather than adding more borders.

### Border Radius

| Component | Radius |
|---|---|
| Small controls | 8px |
| Inputs and buttons | 10px |
| Cards and panels | 14px |
| Dialogs and larger surfaces | 20px |
| Pills and status indicators | 999px |

Do not give every component a pill-shaped appearance.

---

## 7. Application Shell

The main application shell should feel like a creative workspace rather than an administrative console.

### Desktop Structure

The application contains:

1. A compact navigation sidebar.
2. A flexible main content region.
3. Optional contextual panels.
4. A lightweight global header where needed.

The sidebar should provide access to:

- Home
- My rooms
- Discover or join rooms
- Recent activity
- Settings and profile

Use icons paired with labels for primary navigation.

Keep the sidebar visually quiet. Highlight the active route with a softly tinted brand surface and clear text contrast.

### Sidebar Behavior

- Desktop: persistent, compact sidebar.
- Tablet: collapsible sidebar.
- Mobile: drawer or bottom navigation, depending on screen context.
- Active navigation must be clearly distinguishable.
- Tooltips may be used for icon-only collapsed navigation.
- Preserve navigation state when practical.

### Main Content

- Use the background token for the application shell.
- Reserve white or elevated surfaces for meaningful content.
- Avoid enclosing every section in its own card.
- Maintain a clear content hierarchy.
- Use responsive maximum widths for content-heavy pages.

---

## 8. Home and Dashboard

The home screen should welcome the user and immediately help them continue learning.

### Layout Hierarchy

1. Personalized greeting.
2. Primary action to create or join a room.
3. Continue learning or recent rooms.
4. Upcoming sessions or recent activity, when applicable.
5. Room discovery and invitations.

### Visual Style

Use a spacious layout with a strong heading, concise supporting text, and a clearly emphasized primary action.

Room cards should feel like invitations to collaborative spaces, not data-heavy dashboard widgets.

### Room Cards

Each room card may include:

- Room name.
- Short description.
- Host or creator.
- Member avatars.
- Live or scheduled status.
- Last active time.
- Join or continue action.

Use subtle surface contrast and restrained borders.

On hover, slightly elevate the card or strengthen its border. Do not combine large scaling, dramatic shadows, and strong color changes.

Empty states should explain what the user can do next and provide a useful action.

---

## 9. Learning Room Interface

The room is the core product experience and deserves the most design attention.

### Primary Objective

Make collaboration feel immediate and natural while keeping the shared learning activity central.

### Recommended Desktop Layout

- Top bar: room identity, connection status, participants, and room actions.
- Main workspace: shared canvas or active learning content.
- Secondary panel: chat, participant details, or learning tools.
- Contextual controls: canvas tools and collaboration actions.
- Optional meeting area: embedded or linked Google Meet experience.

The canvas must have enough space to support meaningful work.

Avoid allowing chat or navigation to dominate the screen.

### Room Header

Include:

- Room title.
- Optional room description.
- Live collaboration indicator.
- Participant count.
- Invite or share action.
- Settings and leave-room actions.

Keep the header compact.

Use a small live indicator and textual status rather than relying on a colored dot alone.

### Participant Presence

- Show avatars for active participants.
- Use consistent avatar sizes.
- Show online or active status when available.
- Provide accessible labels for presence indicators.
- Avoid excessive animation for ordinary presence changes.
- Never fabricate presence or connection information.

### Google Meet Integration

Google Meet is a meeting capability, not the visual identity of the entire product.

Keep Learning Room navigation, canvas, chat, and other collaboration features visually consistent with the application.

If Meet opens externally, clearly communicate the transition. If it is embedded through a supported integration, ensure the surrounding workspace remains usable.

Do not assume arbitrary embedding is supported by Google Meet.

---

## 10. Shared Canvas

The canvas is a primary workspace, not merely a decorative panel.

### Appearance

- Use a clean, high-contrast working surface.
- Separate the canvas visually from surrounding navigation.
- Provide enough room for text, drawings, and images.
- Keep tool controls organized and discoverable.
- Use subtle guides or grid patterns only when they improve spatial understanding.
- Ensure written content remains readable in both themes.

### Canvas Toolbar

Possible tools:

- Select or move
- Text
- Pen or drawing
- Image insertion
- Eraser
- Undo and redo
- Clear or reset, with confirmation when destructive

Use simple icons with accessible tooltips.

Group related actions logically.

### Canvas Interaction

- Clearly distinguish the selected tool.
- Provide visible feedback when an object is selected.
- Support keyboard access wherever feasible.
- Keep zoom and pan controls discoverable.
- Preserve a stable workspace during collaborative updates.
- Communicate saving or synchronization states accurately.
- Do not use color alone to identify collaborators or selected objects.

### Canvas Background

Use a neutral surface with optional subtle grid dots.

The grid should never compete with text or drawings.

Canvas content colors may be independent of the application theme when users are creating visual content.

---

## 11. Chat Panel

Chat should support collaboration without overpowering the canvas.

### Layout

- Compact header with a chat title.
- Scrollable message history.
- Clear distinction between message content and metadata.
- Persistent composer at the bottom.
- Optional participant or unread indicators.

### Message Styling

- Use readable text with comfortable line height.
- Avoid excessively rounded speech bubbles.
- Distinguish the current user's messages subtly.
- Display author and timestamp when useful.
- Group consecutive messages from the same author where appropriate.
- Support links and long messages without breaking the layout.

### Composer

Include:

- Multiline text input.
- Send action.
- Keyboard-friendly submission.
- Optional attachment or collaboration actions.

The composer should have a clear focus state and must not disappear behind the virtual keyboard on mobile.

Show sending, failure, and retry states when supported by the messaging implementation.

### Empty State

Use a short, welcoming message encouraging participants to start a discussion.

Avoid large illustrations that consume valuable chat space.

---

## 12. Buttons

### Primary Button

Used for the most important action on a screen.

- Background: brand primary.
- Text: high-contrast foreground.
- Radius: 10px.
- Weight: 600.
- Padding: approximately 10px 16px.
- Hover: brand hover token.
- Focus: visible keyboard focus ring.
- Disabled: clearly unavailable without looking interactive.

### Secondary Button

Used for supporting actions.

- Background: surface.
- Text: primary text.
- Border: standard border token.
- Hover: surface hover token.

### Ghost Button

Used for low-emphasis actions and toolbar controls.

- Transparent background.
- No unnecessary border.
- Clear hover and focus feedback.

### Destructive Button

Used for actions such as deleting a room or removing content.

Use danger colors and confirmation for destructive operations where appropriate.

### Button Rules

- Keep button heights consistent within a group.
- Use concise, action-oriented labels.
- Avoid multiple competing primary buttons.
- Show loading states for asynchronous actions.
- Prevent accidental repeated submissions.
- Ensure accessible touch targets, aiming for at least 44px on touch interfaces.

---

## 13. Inputs and Forms

Inputs should be calm, clear, and easy to use.

### Style

- Surface background.
- Standard border.
- 10px radius.
- Comfortable horizontal padding.
- Clear label above the field.
- Visible focus ring.
- Error message near the affected field.

### Interaction

- Labels must not rely on placeholders alone.
- Preserve entered values when validation fails.
- Clearly identify required fields.
- Display helpful validation messages.
- Provide loading and submission states.
- Associate errors with their respective fields for assistive technologies.

### Room Creation Form

Keep room creation short.

Recommended fields:

- Room name.
- Optional description.
- Visibility or access settings, if supported.
- Create room action.

Do not ask for information the application does not need.

---

## 14. Modals and Dialogs

Use dialogs for focused tasks that should not require a new page.

Examples:

- Create room.
- Invite participants.
- Room settings.
- Confirmation before destructive actions.

### Appearance

- Surface background.
- 20px radius.
- Comfortable internal padding.
- Clear heading and supporting description.
- Limited number of actions.
- Subtle shadow and overlay.

### Behavior

- Keep keyboard focus inside the dialog while open.
- Support Escape when appropriate.
- Restore focus when closed.
- Prevent background interaction when modal behavior requires it.
- Use a drawer instead of a centered modal when that works better on mobile.

Avoid using dialogs for every small interaction.

---

## 15. Avatars and Status Indicators

### Avatars

- Use consistent sizing.
- Use real profile images when available.
- Provide initials as a fallback.
- Use a neutral background for missing images.
- Add accessible names for meaningful avatars.
- Limit stacked avatars and show a count for additional participants.

### Status

Support distinct states such as:

- Online
- Away
- Connecting
- Offline
- In a meeting

Only show states supported by actual application data.

Use text, icons, or accessible labels alongside colors where necessary.

---

## 16. Icons and Illustration

### Icons

Use Lucide icons consistently.

Recommended icon library: `lucide-react`.

Rules:

- Use consistent stroke weight.
- Prefer 18–20px for standard interface icons.
- Use 16px for compact metadata and controls.
- Use 22–24px for prominent actions.
- Pair unfamiliar icons with labels or tooltips.
- Do not mix unrelated icon libraries.

### Illustrations

Illustrations should feel editorial, warm, and minimal.

Prefer:

- Abstract collaborative shapes.
- Soft organic forms.
- Simple line illustrations.
- Small expressive visual accents.

Avoid:

- Generic corporate stock illustrations.
- Excessive decorative blobs.
- Unnecessary 3D graphics on every page.
- Decorative elements that reduce text contrast.

---

## 17. Shadows, Borders, and Elevation

The design should use subtle depth rather than heavy visual effects.

### Shadow Principles

- Most components should rely on surface contrast.
- Use shadows for dialogs, menus, popovers, and floating controls.
- Use hover elevation sparingly.
- Avoid strong black shadows on every card.

### Suggested Shadow Tokens

```css
:root {
  --shadow-sm: 0 1px 2px rgb(30 30 20 / 5%);
  --shadow-md: 0 6px 20px rgb(30 30 20 / 8%);
  --shadow-lg: 0 16px 48px rgb(30 30 20 / 12%);

  --transition-fast: 140ms ease;
  --transition-normal: 220ms ease;
}
```

For dark mode, adjust shadows and borders to remain visible without creating artificial glowing outlines.

---

## 18. Motion and Microinteractions

Motion should make the application feel responsive and alive.

### Recommended Motion

- Button hover transitions.
- Gentle card elevation.
- Dialog fade and scale.
- Sidebar and panel transitions.
- Smooth opening and closing of chat panels.
- Subtle presence indicators.
- Clear feedback for successful actions.

### Motion Rules

- Typical hover transition: 140–180ms.
- Standard interface transition: 180–240ms.
- Use easing that feels natural.
- Avoid excessive bounce effects.
- Do not animate large areas unnecessarily.
- Never animate every element when a screen loads.
- Do not make motion necessary to understand an action.
- Respect `prefers-reduced-motion`.

Real-time collaboration should feel immediate. Never delay important interactions simply to create an animation.

---

## 19. Responsive Design

The interface must remain useful on desktop, tablet, and mobile.

### Desktop: 1200px and Above

- Persistent sidebar.
- Wide collaborative canvas.
- Optional side panel for chat.
- Full room controls.
- Balanced multi-panel layout.

### Tablet: 768px–1199px

- Collapsible navigation.
- Flexible canvas width.
- Hide or collapse secondary panels when necessary.
- Use tabs or panel switching if simultaneous visibility becomes cramped.

### Mobile: Below 768px

- Prioritize one main task at a time.
- Use a drawer or compact bottom navigation.
- Make chat and canvas accessible through clear panel switching.
- Keep primary room actions reachable.
- Prevent horizontal overflow.
- Support touch interactions.
- Account for safe areas and virtual keyboards.
- Keep text readable without unnecessary zooming.

### Responsive Rules

- Use CSS Grid and Flexbox.
- Prefer `minmax()`, `min()`, `max()`, and `clamp()` where useful.
- Avoid fixed widths that break smaller viewports.
- Test long room names and large participant counts.
- Test empty states, loading states, and error states at every breakpoint.

---

## 20. Light and Dark Theme Behavior

Both themes must be complete design experiences.

### Light Theme

- Warm off-white application background.
- White content surfaces.
- Dark ink typography.
- Muted indigo emphasis.
- Soft, neutral borders.

### Dark Theme

- Deep charcoal background.
- Slightly elevated charcoal panels.
- Warm off-white typography.
- Lavender brand emphasis.
- Visible but restrained borders.

### Theme Requirements

- All components must use semantic design tokens.
- Theme switching must not require duplicated component implementations.
- Persist the preference when supported.
- Respect system preference on initial visits when appropriate.
- Prevent a flash of the wrong theme where practical.
- Check contrast in both themes.
- Avoid simply inverting light-theme colors.

---

## 21. Accessibility

Accessibility is part of the design system, not a later enhancement.

Requirements:

- Use semantic HTML.
- Support keyboard navigation.
- Provide visible focus states.
- Maintain sufficient text and control contrast.
- Give icon-only buttons accessible names.
- Associate labels with form inputs.
- Announce important asynchronous status changes appropriately.
- Do not rely exclusively on color to communicate status.
- Respect reduced-motion preferences.
- Provide accessible canvas controls where feasible.
- Ensure interactive elements have suitable touch targets.
- Keep heading levels in a logical order.

Aim for WCAG 2.2 AA conformance.

---

## 22. Loading, Empty, Error, and Offline States

Every major feature must account for states beyond successful loading.

### Loading

- Use skeletons for structured content where appropriate.
- Keep layout dimensions stable.
- Use small progress indicators for individual actions.
- Avoid full-page spinners when only one panel is loading.

### Empty

- Explain what is missing.
- Provide one clear next action.
- Keep illustrations small and relevant.
- Do not display fake rooms, users, or messages.

### Error

- Explain the problem in plain language.
- Offer retry when appropriate.
- Preserve user input when possible.
- Avoid exposing internal stack traces or implementation details.

### Real-Time Connection

Represent connection states clearly:

- Connected
- Reconnecting
- Connection unavailable

Use accurate state information from the application's actual connection layer.

Do not imply that content is synchronized when synchronization has failed.

---

## 23. Frontend Architecture and Styling Rules

The existing project architecture must be respected.

### Technology

- React
- JavaScript
- Node.js and Express backend
- Axios for HTTP requests
- The existing real-time communication implementation

Use the styling technology already established in the project. Do not introduce a new styling framework without a clear reason.

### CSS Organization

Keep design tokens centralized.

Suggested organization:

```text
src/
  components/
    ui/
      Button.jsx
      Input.jsx
      Dialog.jsx
      Avatar.jsx
  layouts/
    AppLayout.jsx
    RoomLayout.jsx
  pages/
    HomePage.jsx
    RoomsPage.jsx
    RoomPage.jsx
  styles/
    tokens.css
    global.css
    typography.css
  App.jsx
```

This is a suggested structure, not a requirement to reorganize an existing working project.

### Component Rules

- Prefer reusable components.
- Keep presentation and business logic reasonably separated.
- Avoid duplicating styling across screens.
- Use semantic HTML elements.
- Use CSS variables for shared design tokens.
- Use existing UI primitives before creating replacements.
- Keep components focused on a clear responsibility.
- Preserve existing API contracts and real-time behavior during visual updates.

### Implementation Rules

- Do not rewrite working backend logic for a frontend styling task.
- Do not change API endpoints without a functional requirement.
- Do not replace real application data with hardcoded demonstration data.
- Do not add dependencies merely for decorative effects.
- Do not create unnecessary abstractions.
- Do not remove existing features to simplify a visual implementation.
- Verify responsive behavior after significant layout changes.

---

## 24. Design Token Implementation

Use this structure as the foundation for the global stylesheet.

```css
:root {
  font-family: "Inter", sans-serif;

  --font-heading: "Manrope", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-display: clamp(2.5rem, 4vw, 3rem);

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --shadow-sm: 0 1px 2px rgb(30 30 20 / 5%);
  --shadow-md: 0 6px 20px rgb(30 30 20 / 8%);

  --transition-fast: 140ms ease;
  --transition-normal: 220ms ease;
}

body {
  margin: 0;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-heading);
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The semantic color tokens from Section 4 must be included in the actual stylesheet before using this foundation.

---

## 25. AI Coding Assistant Instructions

When using Gemini, Cursor, or another AI coding assistant, follow these instructions:

1. Read this `design.md` before creating or modifying frontend components.
2. Inspect the existing codebase before proposing architectural changes.
3. Identify the current routes, component patterns, styling approach, and installed dependencies.
4. Reuse existing components and design tokens wherever possible.
5. Follow the specified colors, typography, spacing, radii, and interaction patterns.
6. Ensure that new screens fit the existing visual identity.
7. Implement loading, empty, error, and responsive states where applicable.
8. Preserve API integration, authentication, and real-time communication.
9. Do not fabricate functionality or application data.
10. Avoid unnecessary dependencies, duplicate components, and unrelated refactoring.
11. Test the affected screen and check for layout regressions.
12. Update this document only when a deliberate, reusable design-system decision changes.

If a specific screen requires a new pattern, choose the smallest consistent extension to the existing system.

Do not interpret this document as permission to rebuild the entire frontend for every feature request.

---

## 26. Definition of Done

A frontend feature is considered complete when:

- It follows the established visual identity.
- It uses the correct semantic color tokens.
- It follows the typography and spacing system.
- It works in light and dark themes.
- It is responsive across supported screen sizes.
- It has visible hover, focus, disabled, and loading states where applicable.
- It includes appropriate empty and error states.
- It is accessible by keyboard where applicable.
- It preserves existing backend and real-time functionality.
- It does not introduce unnecessary visual complexity.
- It has been checked for regressions.

---

## Final Design Principle

**Learning Room should feel like a place people want to spend time in, not another tool they have to use.**

Every design decision should make learning, sharing, and collaborating feel easier, calmer, and more natural.

Keep the interface warm. Keep the workspace focused. Let the collaboration itself be the most interesting thing on the screen.
