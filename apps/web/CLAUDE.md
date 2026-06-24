# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Next.js 14, port 3000)
npm run build      # Production build
npm run lint       # ESLint via next lint
npx tsc --noEmit   # Type-check only — run after every code change
```

No test suite currently. After code changes, always run `npx tsc --noEmit` before committing.

## Architecture

This is a **Next.js 14 App Router** monorepo package (`@milli/web`). There are two completely separate apps sharing the same codebase:

### Dashboard (operator-facing)
Route groups `(dashboard)`, `(clientes)`, `(comandas)`, `(servicos)`, `(profissionais)`, `(financeiro)` — all share the same shell layout: full-height `flex h-screen` with `Sidebar` (collapsible, 240px→64px) + `Topbar` + scrollable `main`. The configuracoes page is under `(dashboard)` as well.

Entry points: `/dashboard`, `/agenda`, `/comandas`, `/clientes`, `/profissionais`, `/servicos`, `/financeiro`, `/configuracoes`

### Booking App (client-facing)
Route group `(booking)` — mobile-first at `max-w-md`, centered, with `BottomNav` pinned at bottom (`pb-[72px]`). This is the public scheduling page that customers use on mobile.

Entry points: `/booking`, `/booking/agendar`, `/booking/meus-agendamentos`, `/booking/perfil`, `/booking/pacotes`, `/booking/afiliados`, `/booking/notificacoes`, `/booking/login`

### Layout nesting
```
src/app/layout.tsx          ← root: Inter font, lang="pt-BR"
  (dashboard)/layout.tsx    ← Sidebar + Topbar shell
  (financeiro)/layout.tsx   ← same shell (Sidebar + Topbar)
  (clientes)/layout.tsx     ← same shell
  ... etc
  (booking)/layout.tsx      ← mobile shell: max-w-md + BottomNav
```

Each section within a route group has its own `layout.tsx` that sets the `<Metadata>` title template.

## Mock Data

All data is mocked — no real API calls. Each domain has a `src/lib/*-mock.ts` file:

| File | Contains |
|------|---------|
| `agenda-mock.ts` | Appointments, professionals schedule |
| `clientes-mock.ts` | Client list |
| `comanda-mock.ts` | Orders (comandas) |
| `financeiro-mock.ts` | KPIs, transactions, charts data |
| `financeiro-historico.ts` | 6-month history keyed by `MonthKey` (`'jan-26'`…`'jun-26'`) |
| `profissionais-mock.ts` | Professionals |
| `servicos-mock.ts` | Services |
| `booking-mock.ts` | Client app: SALON, CLIENT, UPCOMING_APPOINTMENTS, loyalty config |
| `configuracoes-mock.ts` | All settings: SalonInfo, BusinessHours, PaymentConfig, AfiliadosConfig, FidelidadeConfig, etc. |
| `carousel-config.ts` | Home carousel slides config |

### Month key pattern (financeiro)
Historical data is `Record<string, T[]>` keyed by `'jan-26' | 'fev-26' | 'mar-26' | 'abr-26' | 'mai-26' | 'jun-26'`. `CURRENT_MONTH = 'jun-26'`. When using `useState` with month keys, always type as `useState<string>` — never let TypeScript narrow to the union type, or it'll conflict with `MonthFilter`'s `onChange: (month: string) => void`.

## Design System

Colors are **hardcoded hex** throughout — never use Tailwind color names for these:

| Token | Hex | Use |
|-------|-----|-----|
| Content primary | `#0F172A` | Headings, bold text |
| Content secondary | `#475569` | Body, labels |
| Muted | `#94A3B8`, `#64748B` | Hints, placeholders |
| Border | `#E2E8F0` | All borders |
| Surface secondary | `#F1F5F9`, `#F8FAFC` | Backgrounds, table headers |
| Primary | `#2563EB` | Buttons, active states, links |
| Primary dark | `#1D4ED8` | Button hover |
| Primary light | `#DBEAFE` | Focus rings, active bg tints |
| Danger | `#DC2626`, `#EF4444` | Errors, destructive actions |
| Success | `#10B981`, `#16A34A` | Positive states |

**Focus ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]` on every interactive element.

**Sidebar** is the only place using CSS custom properties (`--color-sidebar`, `--color-sidebar-active`, etc.) — defined in `globals.css`.

**Utility class**: `.font-tabular` (tabular-nums) — use on any monetary/numeric display.

**Motion**: `transition-colors duration-150 motion-reduce:transition-none` on all animated elements. Recharts: `isAnimationActive={false}` or check `window.matchMedia('(prefers-reduced-motion: reduce)')`.

## Component Patterns

### Self-contained sections
Financial and settings section components manage their own state — they import mock data directly and don't accept data props. This avoids prop drilling through page.tsx.

### Configuracoes primitives
`src/components/configuracoes/_primitives.tsx` exports: `Toggle`, `SaveButton`, `FieldLabel`, `TextInput`, `SelectInput`, `SectionCard`, `useSaveState`. Use these in all configuracoes sections.

`useSaveState()` returns `[SaveState, triggerSave]` — simulates async save with idle→saving→saved→idle lifecycle (800ms).

`SectionCard` renders a card with `p-6`, `rounded-lg border border-[#E2E8F0]`, and an optional `text-[14px] font-semibold` title.

### MonthFilter component
`src/components/financeiro/month-filter.tsx` exports `MonthFilter`, `MONTHS`, `MonthKey`, `CURRENT_MONTH`. Renders Jan–Jun/26 pill tabs. Selected month drives data lookup from `*_HISTORICO` records.

### Financeiro tab structure
`financeiro/page.tsx` renders a tab strip (Procedimentos, Recebimentos, Comissões, Inadimplência, Fluxo de Caixa, Metas, Plano de Contas). Each tab renders a self-contained section component. The page itself holds only the `activeTab` state and the period filter for the top charts.

### Configuracoes layout
`configuracoes/page.tsx` holds only `activeTab` state. `SettingsNav` renders the 220px sidebar with 10 tabs. Each `Section*` component is fully self-contained.

### Booking app components
`src/components/booking/` — mobile-sized components. `bottom-nav.tsx` is the persistent mobile nav. Steps for scheduling flow are in `step-service.tsx`, `step-professional.tsx`, `step-datetime.tsx`, `step-confirm.tsx`.

## Path Aliases

`@/` maps to `src/`. Always import from `@/lib/...` and `@/components/...`.

## Monorepo Packages

`@milli/shared-types` and `@milli/database` are workspace packages transpiled by Next.js (`transpilePackages` in `next.config.mjs`). They are not yet implemented — don't add imports from them.
