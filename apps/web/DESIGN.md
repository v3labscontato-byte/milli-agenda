---
name: Milli Agenda
description: Multi-tenant salon operations platform — schedule, serve, charge, report.
colors:
  signal-blue: "#2563EB"
  signal-blue-deep: "#1D4ED8"
  signal-blue-wash: "#DBEAFE"
  signal-blue-ghost: "#EFF6FF"
  command-dark: "#0F172A"
  panel-slate: "#1E293B"
  working-surface: "#F8FAFC"
  surface-white: "#FFFFFF"
  surface-secondary: "#F1F5F9"
  ink-primary: "#0F172A"
  ink-secondary: "#64748B"
  ink-muted: "#94A3B8"
  ink-disabled: "#CBD5E1"
  border-subtle: "#E2E8F0"
  border-strong: "#CBD5E1"
  success: "#10B981"
  success-light: "#D1FAE5"
  warning: "#F59E0B"
  warning-light: "#FEF3C7"
  danger: "#EF4444"
  danger-light: "#FEE2E2"
  purple: "#8B5CF6"
  purple-light: "#F3E8FF"
typography:
  display:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  title-sm:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
  kpi:
    fontFamily: "SF Pro Text, Inter, -apple-system, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.signal-blue}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input-focus:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Milli Agenda

## 1. Overview

**Creative North Star: "The Operational Clock"**

The Milli Agenda design system exists to make a salon's operational tempo visible and actionable — at a glance, under pressure, with one hand free. Like the clock on the salon wall, every element must be instantly readable: what state, whose chair, what needs doing next. The aesthetic borrows directly from Stripe's operational density — high information, zero visual noise — and applies it to the rhythm of a Brazilian beauty business where a missed appointment or an unclear status costs real money.

This system explicitly rejects the glossy marketplace UI of Fresha and Booksy, where saturated conversion CTAs displace professional workflow. It rejects the gradient-and-glassmorphism dashboard aesthetic that reads as a Dribbble demo on first load and breaks under daily use. It equally rejects the generic teal-and-white SaaS neutral that achieves clarity by erasing context. Milli Agenda knows it's a salon operations tool, and that knowledge should be legible in every pixel: in the semantic status vocabulary, in the dense-but-clear sidebar, in the KPI tiles that answer "how is today going?" before a single interaction.

Design serves the shift, not the brand. The interface disappears while the work happens.

**Key Characteristics:**
- Operational density: Stripe-level information per screen-centimeter
- Signal Blue used only for decision points — primary actions, active selections, focused fields
- Eight appointment states, each uniquely identifiable by color + icon + label (never color alone)
- Sidebar as command layer: dark, authoritative, always-collapse-aware
- Flat surfaces by default; shadows mark layer relationships, not aesthetics
- 150ms state-change transitions; no page-load choreography

## 2. Colors: The Operational Palette

A restrained field of cool neutrals anchored by a single, deliberate accent — Signal Blue — used only where the user must act or where the system must respond.

### Primary

- **Signal Blue** (`#2563EB`): The system's sole saturated accent. Primary action buttons, active sidebar items, focused input borders, current selection indicators. Used on ≤ 10% of any screen. Its rarity is its authority.
- **Signal Blue Deep** (`#1D4ED8`): Hover and pressed state for Signal Blue surfaces only. Never appears without Signal Blue context.
- **Signal Blue Wash** (`#DBEAFE`): Focus ring base; tinted backgrounds for info callouts.
- **Signal Blue Ghost** (`#EFF6FF`): Lightest primary tint; used for SCHEDULED status background and hover highlights only.

### Neutral

- **Command Dark** (`#0F172A`): Sidebar background and primary text ink. Present on every authenticated screen as the sidebar spine.
- **Panel Slate** (`#1E293B`): Sidebar hover states and sidebar border. Depth between sidebar levels without shadow.
- **Working Surface** (`#F8FAFC`): Application background. Slightly cooled off-white — prevents pure-white fatigue across a full workday.
- **Surface White** (`#FFFFFF`): Cards, panels, modal backgrounds, form inputs. Lifts above the working surface.
- **Surface Secondary** (`#F1F5F9`): Disabled input backgrounds, secondary panels, table row alternation.
- **Ink Primary** (`#0F172A`): Primary text. Maximum contrast on all light surfaces.
- **Ink Secondary** (`#64748B`): Secondary labels, helper text, metadata.
- **Ink Muted** (`#94A3B8`): Sidebar idle text, placeholders, timestamps.
- **Ink Disabled** (`#CBD5E1`): Disabled text and inactive UI. Forbidden on active copy — never passes WCAG AA.
- **Border Subtle** (`#E2E8F0`): Default card, input, and divider borders. Structural, not decorative.
- **Border Strong** (`#CBD5E1`): Emphasized separators, table column dividers.

### Semantic

- **Success** (`#10B981`): CONFIRMED and COMPLETED states; PIX payment badge. Positive outcomes.
- **Warning** (`#F59E0B`): CHECKED_IN state; VOUCHER payment badge. Attention required, not urgent.
- **Danger** (`#EF4444`): AWAITING_PAYMENT and CANCELLED states. Immediate action or terminal negative.
- **Purple** (`#8B5CF6`): IN_SERVICE state; CREDIT payment badge. Active, in-progress.

### Status Vocabulary (8-state appointment lifecycle)

| State | Background | Text | Border |
|---|---|---|---|
| SCHEDULED | `#EFF6FF` | `#1D4ED8` | `#2563EB` |
| CONFIRMED | `#D1FAE5` | `#065F46` | `#10B981` |
| CHECKED_IN | `#FEF3C7` | `#92400E` | `#F59E0B` |
| IN_SERVICE | `#F3E8FF` | `#6B21A8` | `#8B5CF6` |
| AWAITING_PAYMENT | `#FEE2E2` | `#991B1B` | `#EF4444` |
| COMPLETED | `#D1FAE5` | `#065F46` | `#10B981` |
| NO_SHOW | `#F1F5F9` | `#475569` | `#94A3B8` |
| CANCELLED | `#FEE2E2` | `#991B1B` | `#EF4444` |

**The One-Accent Rule.** Signal Blue (`#2563EB`) is the only saturated accent in the neutral field. Status colors are semantic — they encode lifecycle state, not personality. The moment Signal Blue appears as decoration, the system loses its primary decision signal.

**The No-Decoration Rule.** Danger red, success green, warning amber, and service purple each map to specific appointment lifecycle states. Using them for badges, promotions, or visual accent corrupts the operational vocabulary.

## 3. Typography

**Primary Font:** SF Pro Text (Apple system) / Inter (cross-platform) / system-ui stack
**Mono Font:** SF Mono / JetBrains Mono / Fira Code — timestamps, codes, technical identifiers

**Character:** A single, well-tuned sans-serif carries all roles. No display/body pairing; the operational register needs one voice, not two personalities. Hierarchy comes entirely from weight and size differentials.

### Hierarchy

- **Display** (700, 32px, 1.2 lh, -0.02em): Page-level titles, large KPI labels in reporting. One per screen maximum.
- **Headline** (600, 24px, 1.3 lh, -0.01em): Section headers, dialog titles, primary panel headings.
- **Title** (600, 20px, 1.4 lh): Card headings, sub-section titles.
- **Title-SM** (500, 16px, 1.4 lh): Table column headers, form section labels.
- **Body** (400, 14px, 1.6 lh): All prose, descriptions, table cell data. The default.
- **Label** (400, 12px, 1.5 lh): Helper text, input labels, supplementary metadata.
- **Caption** (500, 11px, 1.4 lh, +0.06em, uppercase): Status badge text, system labels, tag overlines. Never applied to prose.
- **KPI** (700, 28px, 1.1 lh, -0.02em): Dashboard metric values only. Never repurposed for headings or marketing copy.

**The No-Fluid Rule.** All sizes are fixed in `px`. Fluid `clamp()` type serves marketing surfaces where DPI and viewport vary. Product UIs at consistent DPI gain nothing from fluid type and lose layout predictability.

**The KPI-Only Rule.** The 28px/700 role is exclusive to dashboard metrics. A large bold number in any other context — feature highlights, pricing, hero sections — is the hero-metric SaaS cliché: prohibited.

## 4. Elevation

Almost flat. Primary depth is established by surface color contrast (Command Dark sidebar → Working Surface app → Surface White cards), not shadow. Three discrete functional shadow levels exist exclusively for layer separation.

### Shadow Vocabulary

- **Card** (`0 1px 3px 0 rgb(0 0 0 / 0.04)`): Default card and panel lift. Barely visible; prevents card edges from disappearing against the working surface.
- **Dropdown** (`0 4px 6px -1px rgb(0 0 0 / 0.08)`): Menus, autocomplete popovers, select options. Signals layer above content.
- **Modal** (`0 20px 25px -5px rgb(0 0 0 / 0.08)`): Full modal dialogs only. Maximum depth in the system.
- **Focus Ring** (`0 0 0 3px #DBEAFE`): Not visual depth — a keyboard-navigation accessibility marker. Appears on `:focus-visible` only, never decoratively.

**The Flat-By-Default Rule.** Surfaces rest flat. Shadows appear only to mark functional layer relationships: card above page, dropdown above content, modal above everything. No ambient glows, no blur, no glassmorphism under any circumstance.

## 5. Components

### Buttons

Direct and confident — sharp enough to feel like a professional tool, not a consumer app.

- **Shape:** 4px radius (`rounded.sm`). Not pill-shaped; not perfectly square. 4px signals "professional tool" without aggression.
- **Primary:** Signal Blue (`#2563EB`) bg, white text, 8px × 16px padding, 14px body weight. Hover: Signal Blue Deep (`#1D4ED8`). Transition: 150ms ease-out.
- **Secondary / Ghost:** Transparent bg, Signal Blue text, 1px Signal Blue border. Same radius and padding. Hover: Signal Blue Ghost (`#EFF6FF`) bg.
- **Danger:** Danger red (`#EF4444`) bg, white text. Exclusively for irreversible destructive actions (delete appointment, cancel comanda). Never for warnings or soft states.
- **Disabled:** `#CBD5E1` bg, `#94A3B8` text. No hover state; not interactive.

### Status Badges

The system's most distinctive component. Eight states, one shape contract: `rounded.sm` (4px), `1px` border, Caption typography (11px/500/uppercase/+0.06em), 4px vertical × 8px horizontal padding. Must include an icon glyph alongside the text label. Color alone is never sufficient.

### Cards / Containers

- **Corner Style:** 8px radius (`rounded.lg`).
- **Background:** Surface White (`#FFFFFF`) on Working Surface (`#F8FAFC`).
- **Shadow:** `shadow-card` (0 1px 3px / 4% opacity). Universal on all card containers.
- **Border:** 1px Border Subtle (`#E2E8F0`). Always present; prevents edge loss on high-brightness displays.
- **Internal Padding:** 16px default, 24px for spacious panels. Never below 12px.
- **Nesting rule:** Cards are never nested. A card inside a card is always the wrong answer.

### Inputs / Fields

- **Style:** Surface White bg, 1px Border Subtle stroke, 6px radius (`rounded.md`), 8px × 12px padding, 14px body.
- **Focus:** Border shifts to Signal Blue (`#2563EB`); focus ring (`0 0 0 3px #DBEAFE`) appears.
- **Error:** Border shifts to Danger red (`#EF4444`); error message in Danger color below the field in Label size.
- **Disabled:** Surface Secondary (`#F1F5F9`) bg, Ink Disabled text. No hover state.

### Navigation / Sidebar

The sidebar is the command layer — present on every authenticated screen. Width 240px expanded, 64px icon-only collapsed.

- **Background:** Command Dark (`#0F172A`).
- **Idle:** Ink Muted (`#94A3B8`) text, transparent bg, 14px/400.
- **Hover:** Ink Disabled (`#CBD5E1`) text on Panel Slate (`#1E293B`) bg, 6px radius.
- **Active:** White text, 500 weight, Signal Blue (`#2563EB`) full-width block bg at 6px radius. Unambiguous; no left-stripe treatment.
- **Section overlines:** Caption typography (11px, uppercase, +0.06em, Ink Muted).

### KPI Tiles

Dashboard-exclusive. Reserved for the daily summary: appointments booked, revenue, chair utilization.

- **Value:** KPI typography (28px, 700, -0.02em, Ink Primary).
- **Label:** Caption typography (11px, 500, uppercase, +0.06em, Ink Secondary).
- **Container:** Standard Card with 24px padding.
- **Rule:** The KPI role must never appear in marketing copy, feature highlights, or pricing.

## 6. Do's and Don'ts

### Do:

- **Do** use Signal Blue (`#2563EB`) exclusively for primary CTA buttons, active sidebar nav, focused input borders, and selection indicators. Its rarity is its authority — dilute it and the system loses its primary decision signal.
- **Do** always render appointment status with color + icon + text label together. WCAG AA forbids color as the sole state indicator. Every status badge carries all three.
- **Do** use fixed `px` sizes for all typography. Product UIs at consistent DPI gain nothing from `clamp()` type.
- **Do** use only the three-shadow vocabulary (card / dropdown / modal). If a new shadow is needed, map it to one of these three roles.
- **Do** target ≤ 3 interactions for any critical operation: schedule, check-in, charge. More than three is a UX failure.
- **Do** prefer density over whitespace when density reduces navigation. The professional's floor time is more valuable than visual breathing room.
- **Do** keep all motion to 150ms. Transitions convey state; anything longer starts to perform for the user.

### Don't:

- **Don't** reproduce Fresha or Booksy's marketplace UI patterns — saturated "Book Now" CTAs, consumer-facing star ratings, promotional banners. This is a professional operations tool, not a booking widget.
- **Don't** use glassmorphism. Background blurs, frosted panels, and translucent cards are explicitly banned. Glassmorphism signals template UI that does not survive daily production use.
- **Don't** use the startup gradient-dashboard aesthetic: hero metric cards with glowing gradient backgrounds, gradient-to-transparent overlays, neon accent pulses, or layered blur effects.
- **Don't** produce generic SaaS neutral. The Notion/Linear blue-and-white look erases context. Milli Agenda is a Brazilian salon operations tool with a specific vocabulary — that specificity must be visible.
- **Don't** use display fonts in UI labels, data cells, buttons, navigation, or sidebar text.
- **Don't** let semantic colors appear as decoration. Danger red, success green, warning amber, and purple each map to specific appointment lifecycle states. Using them elsewhere corrupts the operational vocabulary.
- **Don't** use gradient text (`background-clip: text` + gradient). Never intentional.
- **Don't** add page-load choreography. Motion in Milli Agenda conveys state change only. The only acceptable page animation is `fade-in` (150ms, `translateY(4px) → 0`, ease-out) on async content.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored decorative stripe. Active sidebar items use a full-width background block, not a left stripe.
