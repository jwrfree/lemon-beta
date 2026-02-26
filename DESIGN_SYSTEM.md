# Lemon Beta — Design System

> **Version:** 1.4  
> **Status:** Active — all new code must comply.  
> **Source of truth:** This document + `tailwind.config.ts` + `globals.css`.  
> **Enforcement:** ESLint (`eslint.config.mjs`) + code review checklist below.

---

## 1. Design Principles

### P1 — Tokens over Literals
Never use a raw Tailwind colour (`bg-blue-600`) or pixel value (`text-[10px]`) where a semantic token or named utility exists. Every value that exists in more than one place becomes a token.

### P2 — One Affordance, One Pattern
Each UI affordance (FAB, status badge, section label, amount display) has exactly one canonical implementation. Duplicating a pattern inline is a bug.

### P3 — Semantic > Decorative
Colours communicate meaning. `bg-primary` = brand action. `bg-destructive` = irreversible/danger. `bg-success` = completion. `bg-warning` = caution. A blue FAB for reminders and a purple FAB for goals are both wrong — they communicate nothing except feature ownership, which is the wrong layer.

### P4 — Mobile-First, Token-Sized
Spacing, radius, and blur all follow a named scale. Picking a value means picking a named step — not calculating a pixel number. This makes global adjustments (e.g., a tighter radius on all cards) a single-line change.

### P5 — Progressive Complexity
Three card tiers exist (`flat`, `premium`, `glass`) because they serve distinct information hierarchies. A flat card is a list item. A premium card is a primary entity with identity. A glass panel is metadata inside a premium card. Do not mix tiers.

---

## 2. Typography System

### 2.1 Allowed Font Sizes

Use only the following classes. No `text-[Xpx]`, no `text-[X.Xrem]`.

| Token | Class | Pixels | Weight rule | Use case |
|---|---|---|---|---|
| Display | `text-3xl` | 30px | `font-medium` | Hero totals (large balance) |
| Heading L | `text-2xl` | 24px | `font-medium` | Card primary value |
| Heading M | `text-xl` | 20px | `font-medium` | Section heading |
| Heading S | `text-lg` | 18px | `font-semibold` | Card title, list group header |
| Body L | `text-base` | 16px | `font-medium` | Submit buttons, form labels |
| Body | `text-sm` | 14px | `font-medium` | List items, card metadata |
| Body S | `text-xs` | 12px | `font-medium` | Secondary metadata |
| **Label** | `text-label` | 12px | **`font-semibold` + `tracking-widest`** | Section group headers (all-caps) |

`text-label` is a custom token in `tailwind.config.ts` that includes `letterSpacing: '0.1em'` and `fontWeight: '600'` baked in. It is the **only** replacement for `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[8px]`.

### 2.2 Font Weight Rules

| Context | Weight |
|---|---|
| Headings (h1–h6, CardTitle) | `font-semibold` |
| Card titles, nav items | `font-semibold` |
| Stat values, amounts | `font-medium` |
| Body text, metadata | `font-medium` |
| Button labels | `font-medium` |
| Section micro-labels | `font-semibold` (via `label-xs` utility) |
| Form inputs | `font-normal` |

`font-bold` is reserved for marketing/landing use only.

### 2.3 Letter Spacing Rules

| Context | Class |
|---|---|
| Section micro-labels (all-caps) | `tracking-widest` |
| Card titles, headings | `tracking-tight` |
| Amount/number displays | `tracking-tighter` |
| Body text | *(default — no class)* |

**Forbidden:** `tracking-[0.2em]`, `tracking-[0.3em]`, or any other arbitrary value. Use `tracking-widest` for all all-caps labels.

### 2.4 Canonical Utility Classes

Add these to JSX className instead of repeating the full class string:

| Utility | Expands to | Use for |
|---|---|---|
| `label-xs` | `text-xs font-semibold uppercase tracking-widest text-muted-foreground` | All section group headers |
| `number-display` | `font-medium tracking-tighter tabular-nums` | All financial amounts |

Both utilities are defined in `src/app/globals.css` under `@layer components`.

### 2.5 Migration: Arbitrary Sizes → Tokens

| Old class | Replace with |
|---|---|
| `text-[10px]` | `text-label` or `text-xs` |
| `text-[9px]` | `text-label` |
| `text-[11px]` | `text-label` or `text-xs` |
| `text-[8px]` | `text-label` |
| `text-[15px]` | `text-sm` |
| `text-[0.8rem]` | `text-sm` |
| `tracking-[0.2em]` | `tracking-widest` |
| `tracking-[0.3em]` | `tracking-widest` |

**461 existing usages** must be migrated in Phase 2 of the refactor roadmap (§8).

### 2.6 Line-height (Leading) Rules

Line-height is set per content category. Use only the Tailwind `leading-*` scale — no `leading-[Xpx]` or `leading-[X.X]` arbitrary values.

| Content type | Class | Tailwind ratio | Use case |
|---|---|---|---|
| Headings (h1–h6, CardTitle, DialogTitle) | `leading-tight` | 1.25 | All heading elements, card titles |
| Body / descriptive text | `leading-relaxed` | 1.625 | Paragraphs, card descriptions, help text |
| Labels / captions | `leading-snug` | 1.375 | Inline labels, badge captions, metadata lines |
| Numeric / financial display | `leading-none` | 1.0 | Large amount figures, stat counters |

> **Global baseline:** `body` inherits `line-height: 1.5` from `globals.css`. Only override when the content type requires a different ratio per the table above.

**Forbidden:** `leading-[1.15]`, `leading-[1.6]`, `leading-[18px]`, or any other arbitrary value.

---

## 3. Color & Semantic Token System

### 3.1 Semantic Tokens (defined in `globals.css`)

These are the **only** colours that should appear in component code for UI states:

| Token | CSS Var | Light | Dark | Use |
|---|---|---|---|---|
| `primary` | `--primary` | teal-600 | teal-400 | Brand CTA, nav active, FAB |
| `primary-foreground` | `--primary-foreground` | white | teal-950 | Text on primary |
| `destructive` | `--destructive` | rose-600 | rose-600 | Delete, danger, irreversible |
| `destructive-foreground` | `--destructive-foreground` | white | white | Text on destructive |
| `success` | `--success` | emerald-600 | emerald-500 | Completion, positive balance |
| `success-foreground` | `--success-foreground` | white | emerald-900 | Text on success |
| `warning` | `--warning` | yellow-600 | yellow-500 | Caution, approaching limit |
| `warning-foreground` | `--warning-foreground` | white | yellow-900 | Text on warning |
| `info` | `--info` | blue-600 | blue-500 | Informational, neutral notice |
| `info-foreground` | `--info-foreground` | white | white | Text on info |
| `muted` | `--muted` | gray-100 | gray-800 | Disabled, inactive backgrounds |
| `muted-foreground` | `--muted-foreground` | gray-500 | gray-400 | Secondary text |
| `card` | `--card` | white | gray-900 | Card surface |
| `background` | `--background` | gray-50 | gray-950 | Page background |

### 3.2 Palette Colours (category/chart use only)

The full named palette (`teal`, `blue`, `rose`, `purple`, etc.) exists **only** for:
- Transaction category colouring (dynamic, data-driven)
- Chart series colours (`--chart-1` through `--chart-5`)
- DNA gradient cards (`visual-dna.ts` output)

Using palette colours directly for UI state (e.g., `bg-blue-600` on a FAB) is **forbidden**. Use semantic tokens instead.

### 3.3 Status Badge Colour Mapping

| State | StatusBadge variant | Background | Text |
|---|---|---|---|
| Active / Informational | `default` | `primary/10` | `primary` |
| Completed / Success | `success` | `emerald-500/10` | `emerald-600` |
| Warning / Caution | `warning` | `amber-500/10` | `amber-600` |
| Error / Overdue / Exceeded | `error` | `destructive/10` | `destructive` |
| Neutral / Inactive | `neutral` | `muted` | `muted-foreground` |
| Border only | `outline` | transparent | `foreground` |

**`bg-yellow-500/10`** is deprecated. Use `StatusBadge variant="warning"` which maps to `amber-500/10`. There is one canonical warning colour: amber.

---

## 4. Component Standards

### 4.1 Button

**File:** `src/components/ui/button.tsx`

#### Variants (complete)

| Variant | Use |
|---|---|
| `default` | Primary CTA — one per view |
| `destructive` | Irreversible action (delete, remove) |
| `outline` | Secondary actions alongside a default button |
| `secondary` | Low-prominence actions |
| `ghost` | Toolbar/icon actions, nav items |
| `tertiary` | Lowest-prominence text action — muted foreground, no fill |
| `link` | Inline text navigation |
| `success` | Confirmation of a positive outcome |
| `error` | Alias for destructive — use when UX context says "error state" not "delete" |

#### Rules

1. One `default` button maximum per modal/sheet/page section.
2. Never use `className` to override the background colour of a button except via `success`, `error`, `destructive` variants or through the `FAB` component.
3. Submit buttons inside forms always use `size="lg"` and `type="submit"`.
4. Icon-only buttons always use `size="icon"` and include `aria-label`.
5. Rounded override (`rounded-full`) is allowed only for: FAB, nav icon buttons, avatar buttons.

#### Forbidden

```tsx
// ❌ Overriding colour with inline class — use variant instead
<Button className="bg-blue-600">Save</Button>

// ❌ Missing aria-label on icon button
<Button size="icon"><Plus /></Button>

// ❌ Unsupported variant — silently falls through (now detected by ESLint)
<Button variant="success">  // ✅ now valid — was broken before DS 1.0
```

---

### 4.2 FAB (Floating Action Button)

**File:** `src/components/ui/fab.tsx`

#### API

```tsx
import { FAB } from '@/components/ui/fab';

<FAB
  onClick={() => setIsModalOpen(true)}
  label="Tambah transaksi"     // required — aria-label + sr-only text
  icon={Plus}                  // optional — defaults to Plus
  mobileOnly={true}            // optional — defaults to true (lg:hidden)
  className="..."              // optional — semantic token overrides only
/>
```

#### Rules

1. Always use `<FAB>` instead of the inline pattern.
2. Default colour is `bg-primary`. Override only with `bg-destructive` if the entire page/panel is a destructive context.
3. Position is non-negotiable: `fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8`.
4. One FAB per page. If a page needs two actions, add the secondary to the `PageHeader` `actionButton` prop or a toolbar.
5. Remove the `mobileOnly` FAB from page files that also render a dashboard component with its own FAB. Only one level may own the FAB.

#### Forbidden

```tsx
// ❌ Inline FAB — replace with <FAB>
<div className="fixed bottom-24 right-6 z-40">
  <Button className="h-14 w-14 rounded-full bg-purple-600">
    <Plus />
  </Button>
</div>

// ❌ Wrong bottom offset
<div className="fixed bottom-20 right-6">  // → must be bottom-24

// ❌ Hardcoded literal colour
<FAB className="bg-blue-600" />             // → bg-primary or bg-destructive only
```

---

### 4.3 StatusBadge

**File:** `src/components/status-badge.tsx`

#### API

```tsx
import { StatusBadge } from '@/components/status-badge';

<StatusBadge variant="success">Lunas</StatusBadge>
<StatusBadge variant="error">Terlambat</StatusBadge>
<StatusBadge variant="warning">Ditunda</StatusBadge>
<StatusBadge variant="default">Aktif</StatusBadge>
<StatusBadge variant="neutral">Tidak Aktif</StatusBadge>
<StatusBadge variant="error" tooltip="Melewati jatuh tempo">Overdue</StatusBadge>
```

#### Rules

1. All status/state display must use `<StatusBadge>`.
2. Raw `<Badge>` with manual colour classes is forbidden for status display.
3. `bg-rose-500/10` and `bg-yellow-500/10` are forbidden — these are the old inconsistent patterns. Use `StatusBadge variant="error"` and `variant="warning"` respectively.
4. The `tooltip` prop takes a string or ReactNode; use it whenever a status needs explanation.

#### Forbidden

```tsx
// ❌ Raw inline badge
<Badge className="bg-emerald-500/10 text-emerald-600">Lunas</Badge>

// ❌ Rose vs destructive split
<span className="bg-rose-500/10 text-rose-600">...</span>

// ❌ Amber vs yellow split — pick amber (StatusBadge warning)
<Badge className="bg-yellow-500/10 text-yellow-600">...</Badge>
```

---

### 4.4 Card

**File:** `src/components/ui/card.tsx`

Three tiers. Pick the tier that matches the information hierarchy of the content.

#### Tier 1 — Flat Card (list items, stat widgets, dashboard panels)

```tsx
<Card>                          // shadow-card + rounded-lg is the default
  <CardHeader> ... </CardHeader>
  <CardContent> ... </CardContent>
</Card>
```

Base classes (do NOT override): `rounded-lg bg-card text-card-foreground shadow-card`  
Content padding: `p-4` (do not change to p-3, p-5, p-6 for flat cards)

#### Tier 2 — Premium Card (primary entities: budget, goal)

```tsx
<Card
  className="border-none rounded-card-premium overflow-hidden shadow-2xl"
  style={{ background: dna.gradient }}
>
  <div className="p-7 ...">   {/* always p-7 */}
```

Rules:
- Always use `rounded-card-premium` (`var(--radius-card-premium)` = 2rem / 32px)
- Always `p-7` for the inner content container
- Gradient background is generated by `visual-dna.ts` — do not hardcode gradients
- Ambient glow `div` is allowed as presentational decoration

#### Tier 3 — Glass Inset Panel (metadata panels inside premium cards)

```tsx
<div className="bg-white/5 backdrop-blur-md rounded-card-glass p-4 border border-white/10 shadow-inner">
```

Rules:
- Always `rounded-card-glass` (`var(--radius-card-glass)` = 1.5rem / 24px)
- Always `p-4`
- Always `backdrop-blur-md` (not `xl`, not `sm`)
- Only use inside Tier 2 cards

#### Tier summary

| Tier | Radius | Shadow | Padding | Background |
|---|---|---|---|---|
| Flat | `rounded-card` | `shadow-card` | `p-4` | `bg-card` |
| Premium | `rounded-card-premium` | `shadow-2xl` | `p-7` | `dna.gradient` |
| Glass inset | `rounded-card-glass` | `shadow-inner` | `p-4` | `bg-white/5` |

Icon containers inside Tier 2 cards always use `rounded-card-icon` (1.25rem / 20px).

---

## 5. Layout & Spacing Rules

### 5.1 Page Layout

Every scrollable page container:

```tsx
<main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
```

| Rule | Value | Reason |
|---|---|---|
| Mobile padding | `p-4` | 16px — matches bottom nav width |
| Desktop padding | `md:p-6` | 24px |
| Section spacing | `space-y-6` | Consistent vertical rhythm |
| Nav clearance | `pb-24` | 96px — clears 64px nav + 24px offset |

**`pb-20`, `pb-28`, `pb-32`, `pb-safe` are forbidden.** Use `pb-24` exclusively.

### 5.2 Spacing Scale

| Use case | Class |
|---|---|
| Inline icon + text gap | `gap-2` |
| Button group gap | `gap-2` |
| Form field gap | `gap-4` |
| Card grid gap | `gap-4` |
| Summary stat grid gap | `gap-3` |
| Section gap (inside page) | `space-y-6` |
| List item gap | `space-y-3` |
| Sub-item / detail gap | `space-y-2` |

### 5.3 Header

The `<PageHeader>` component is the only permitted sticky header. Its height is `h-16` (64px). Do not build custom header elements. The home page's `mobile-header.tsx` (h-14) should be deprecated in favour of `PageHeader`.

---

## 6. Border Radius & Elevation (Shadow) Rules

### 6.1 Radius Tokens

All radius values come from these named tokens:

| Token | CSS Var | Value | Use |
|---|---|---|---|
| `rounded-sm` | `--radius - 4px` | ~10px mobile, 4px desktop | Input fields, small chips |
| `rounded-md` | `--radius - 2px` | ~12px mobile, 6px desktop | Selects, dropdown triggers |
| `rounded-lg` / `rounded-card` | `--radius` | 14px mobile, 8px desktop | Flat cards, modals |
| `rounded-card-premium` | `--radius-card-premium` | 32px | Premium entity cards |
| `rounded-card-glass` | `--radius-card-glass` | 24px | Glass inset panels |
| `rounded-card-icon` | `--radius-card-icon` | 20px | Icon containers in premium cards |
| `rounded-full` | N/A | 9999px | Avatars, FAB, pill badges, nav dots |
| `rounded-xl` | N/A (Tailwind default) | 12px | Reserved — use named tokens instead |
| `rounded-2xl` | N/A (Tailwind default) | 16px | Reserved — use named tokens instead |

`rounded-xl` and `rounded-2xl` are **not used** in new code. Existing usages will be migrated to `rounded-card` or `rounded-card-premium` as appropriate.

### 6.2 Shadow (Elevation) Scale

| Shadow | Named | Surface type |
|---|---|---|
| `shadow-card` | Flat | Default card elevation — use `Card` component |
| `shadow-sm` | Soft | Non-card elevated containers (pills, selects) |
| `shadow-md` | Hover | Hover state on flat cards |
| `shadow-lg` | Modal | Modals, sheets, dropdowns |
| `shadow-xl` | Hero | Hero surfaces (desktop stat panels) |
| `shadow-2xl` | Premium | Premium cards, FAB |
| `shadow-inner` | Inset | Glass panels, pressed states |

`shadow-card` and `shadow-sm` are **not interchangeable**. `shadow-card` is the correct default for `<Card>`. Use `shadow-sm` only for non-card elevated containers.

### 6.3 Backdrop Blur Scale

| Level | Class | Surface |
|---|---|---|
| Overlay scrim | `backdrop-blur-sm` | Modal/sheet overlay background |
| Glass panel | `backdrop-blur-md` | Glass inset panels (Tier 3 card) |
| Top surface | `backdrop-blur-xl` | Header, sidebar, premium card surfaces, modal content, FAB glow area |

`backdrop-blur-3xl` is deprecated — replace with `backdrop-blur-xl` on the bottom nav.

---

## 7. Anti-Patterns (Forbidden)

The following patterns are actively detected by ESLint (`eslint.config.mjs`, `no-restricted-syntax` rules). Violating them produces a `warn` that becomes an error in CI.

| Anti-Pattern | Rule | Replacement |
|---|---|---|
| `text-[8px]` / `text-[9px]` / `text-[10px]` / `text-[11px]` / `text-[15px]` | `[DS §2]` | `text-label` or `text-xs` |
| `tracking-[0.2em]` / `tracking-[0.3em]` (any `tracking-[X]`) | `[DS §2]` | `tracking-widest` |
| `leading-[Xpx]` / `leading-[X.X]` (any arbitrary leading) | `[DS §2.6]` | `leading-tight`, `leading-relaxed`, `leading-snug`, or `leading-none` |
| `pb-20`, `pb-28`, `pb-32`, `pb-safe` in JSX | `[DS §5]` | `pb-24` |
| `bg-purple-600`, `bg-blue-600`, `bg-green-600` (literal colours on interactive elements) | `[DS §4]` | `bg-primary`, `bg-destructive`, `bg-success` |

The following are forbidden but not yet auto-detected (Phase 3 enforcement):

| Anti-Pattern | Replacement |
|---|---|
| Inline badge colour classes: `bg-emerald-500/10 text-emerald-600`, `bg-rose-500/10`, `bg-yellow-500/10` | `<StatusBadge variant="...">` |
| `rounded-[32px]` | `rounded-card-premium` |
| `rounded-[24px]` | `rounded-card-glass` |
| `rounded-[20px]` | `rounded-card-icon` |
| `rounded-2xl` / `rounded-xl` (except Radix UI primitives) | named radius token |
| Multiple `FAB` implementations per page | `<FAB>` component |
| `backdrop-blur-3xl` or `backdrop-blur-2xl` | `backdrop-blur-xl` |

---

## 8. Interaction State Tokens (DS §8)

Phase 2 introduces semantic interaction tokens for hover, active, focus, disabled, and loading states. All interactive components must use these tokens exclusively — no hardcoded `opacity-*` or raw colour values for state feedback.

### 8.1 Token Definitions

Defined in `globals.css` under `:root` and `.dark`:

| Token | CSS Var | Light | Dark | Use |
|---|---|---|---|---|
| `focus-ring` | `--focus-ring` | same as `--ring` | same as `--ring` | Focus ring colour on all interactive elements |
| `focus-ring-offset` | `--focus-ring-offset` | `--background` | `--background` | Focus ring offset colour |
| `state-hover` | `--state-hover` | gray-900/5% | gray-50/7% | Hover overlay on neutral interactive surfaces |
| `state-active` | `--state-active` | gray-900/9% | gray-50/12% | Active/pressed overlay on neutral surfaces |
| `transition-duration` | `--transition-duration` | 150ms | 150ms | Standard interaction transition speed |
| `transition-easing` | `--transition-easing` | ease-in-out cubic | ease-in-out cubic | Standard easing curve |

Registered in `tailwind.config.ts` as Tailwind colour tokens: `bg-state-hover`, `bg-state-active`, `ring-focus-ring`.

### 8.2 Focus State

All focusable interactive elements must use:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

Use `focus-visible:` (not `focus:`) unless supporting older keyboard-only patterns. The ring colour maps to `--focus-ring` via `--ring`.

### 8.3 Disabled State

Disabled state must **not** rely on opacity alone. Required pattern:

| Element type | Classes |
|---|---|
| Button | `disabled:pointer-events-none disabled:opacity-60 disabled:text-muted-foreground` |
| Input / Textarea | `disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60` |
| Select trigger | `disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60` |
| Checkbox | `disabled:cursor-not-allowed disabled:border-muted disabled:opacity-60` |
| Switch | `disabled:cursor-not-allowed disabled:opacity-60` |
| Label (peer-disabled) | `peer-disabled:cursor-not-allowed peer-disabled:text-muted-foreground` |
| Menu items | `data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground data-[disabled]:opacity-60` |

**Forbidden:** `disabled:opacity-50` or `peer-disabled:opacity-70` as the sole disabled indicator.

### 8.4 Hover State

Semantic token priority:
- Filled buttons: `hover:bg-{variant}/90` (already semantic per §4.1)
- Ghost / outline: `hover:bg-accent hover:text-accent-foreground`
- Neutral surfaces (tabs, nav): `hover:text-foreground`
- Clickable containers: `hover:bg-state-hover`

### 8.5 Active / Pressed State

Every interactive element must communicate the pressed state:

| Pattern | Class | Use |
|---|---|---|
| Filled buttons | `active:bg-{variant}/80` | All colour-filled variants |
| Ghost / outline | `active:bg-state-active` | Ghost, outline buttons |
| Tabs | `active:scale-[0.98]` | Tab triggers |
| FAB / nav icon | `active:scale-95` | Circular touch targets |

---

## 9. Motion Guidelines (Phase 6)

**Tone:** finance-grade, calm, intentional. No bounce/spring or playful easing.

### 9.1 Tokens

Defined in `globals.css` and re-exported for JS in `src/lib/motion-tokens.ts`:

| Token | CSS Var | Value | Use |
|---|---|---|---|
| `duration-fast` | `--motion-duration-fast` | 160ms | Press/hover/inline validation |
| `duration-normal` | `--motion-duration-normal` | 200ms | Overlays, cards, list changes |
| `easing-standard` | `--motion-easing-standard` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | All entrances |
| `translate-sm` | `--motion-translate-sm` | 4px | Micro slide offset |
| `translate` | `--motion-translate` | 8px | Larger slide offset (rare) |

Reduced motion (`prefers-reduced-motion: reduce`) zeroes both durations and offsets.

### 9.2 Utilities

- `motion-pressable`: shared transition timing for buttons, tabs, icon actions (active nudges 1px).
- `motion-overlay`: scrims fade in/out using motion tokens.
- `motion-panel`: modal/sheet content fades + slides 4px; exit uses ease-in.
- `motion-surface`: default surface entrance for cards/empty states (fade + 4px translate).
- `motion-inline-alert`: inline validation/error appears with a fast fade-slide.
- `motion-list-transition [data-loading="true"]`: dims list children and offsets them 4px to avoid CLS while loading.

### 9.3 Patterns

| Interaction | Entrance | Exit |
|---|---|---|
| Modal/Sheet | Fade + 4px translate, `duration-normal` ease-out | Fade + 4px translate, `duration-fast` ease-in |
| Buttons/Tabs | `motion-pressable` + active 1px nudge | `active:bg-*` tokens only |
| Empty → Populated | Wrap surfaces with `motion-surface` to fade/settle content | N/A |
| Loading → Success | Keep container height; animate opacity/translate only (`motion-list-transition`) | Fade with `duration-fast` |
| Filter changes | Apply `motion-list-transition` to result lists with `data-loading` while fetching | N/A |
| Inline validation | `motion-inline-alert` on `<ErrorMessage>` / `<FormMessage>` | N/A |

**Forbidden:** bounce/spring easing, >8px translations, rotating/particle bursts in product surfaces.

### 8.6 Loading State

The `Button` component accepts an `isLoading` prop:

```tsx
<Button isLoading>Menyimpan</Button>
```

When `isLoading={true}`:
- Renders a `Loader2` spinner instead of children
- Sets `disabled={true}` (prevents double submission)
- Sets `aria-busy={true}` (screen reader notification)
- `sr-only` "Loading" text is announced

**Forbidden:** Manual `disabled={isSaving}` with inline spinner — use `isLoading` prop.

### 8.7 Error / Success States

Use semantic colour tokens, never raw values:

| State | Token | Class |
|---|---|---|
| Error text / icon | `--error` | `text-error` |
| Error surface | `--error-surface` | `bg-error-surface` |
| Error border | `--error-border` | `border-error-border` |
| Success text / icon | `--success` | `text-success` |
| Success surface | `--success-foreground` on `bg-success` | `bg-success text-success-foreground` |

See §11 for full error component hierarchy.

### 8.8 Transition Consistency

All interactive components must use a single standard transition:

```
transition-all duration-150 ease-in-out
```

**Forbidden:**
- `transition-opacity` (use colour-based disabled state instead)
- Arbitrary durations: `duration-[300ms]`, `duration-[500ms]` on interactions
- Mixing `transition-colors` and `transition-all` on the same component
- Conflicting hover + active transforms on the same axis

---

## 9. Refactor Roadmap

### Phase 1 — Foundation (1–2 days) ✅ DONE in DS 1.0
- [x] Add `success` and `error` variants to `button.tsx`
- [x] Add named radius tokens (`rounded-card`, `rounded-card-premium`, `rounded-card-glass`, `rounded-card-icon`) to `tailwind.config.ts`
- [x] Add CSS variables `--radius-card-*` to `globals.css`
- [x] Add `label-xs` and `number-display` utility classes to `globals.css`
- [x] Create `src/components/ui/fab.tsx` — canonical FAB component
- [x] Add `no-restricted-syntax` ESLint rules to `eslint.config.mjs`
- [x] Create this document (`DESIGN_SYSTEM.md`)

### Phase 2 — Semantic Interaction & State Normalization ✅ DONE in DS 1.3
Target: Enforce semantic interaction state consistency across all interactive components.

- [x] Add DS §8 Interaction tokens to `globals.css` (`--focus-ring`, `--state-hover`, `--state-active`, `--transition-duration`, `--transition-easing`)
- [x] Register `state-hover`, `state-active`, `focus-ring` in `tailwind.config.ts`
- [x] `button.tsx` — add `isLoading` prop, fix `disabled:opacity-50` → semantic color + opacity, add `active:` states, standardize `transition-all duration-150`
- [x] `tabs.tsx` — add `data-[state=inactive]:hover:text-foreground`, fix disabled, add `active:scale-[0.98]`
- [x] `input.tsx` — `disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60`
- [x] `select.tsx` — trigger + item disabled state with semantic color tokens
- [x] `textarea.tsx` — `disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60`
- [x] `checkbox.tsx` — `disabled:border-muted disabled:opacity-60`
- [x] `switch.tsx` — `disabled:opacity-60`
- [x] `radio-group.tsx` — `disabled:opacity-60`
- [x] `label.tsx` — `peer-disabled:text-muted-foreground` (remove `peer-disabled:opacity-70`)
- [x] `dialog.tsx` close button — `text-muted-foreground hover:text-foreground transition-colors` (remove `opacity-70 hover:opacity-100 transition-opacity`)
- [x] `sheet.tsx` close button — same as dialog
- [x] `dropdown-menu.tsx` — disabled items use `data-[disabled]:text-muted-foreground data-[disabled]:opacity-60`
- [x] Update `DESIGN_SYSTEM.md` with §8 Interaction Tokens section

### Phase 3 — Typography Rhythm & Spacing Harmonization ✅ DONE in DS 1.4
Target: Normalize font-weight usage and remove arbitrary color/typography values across all components.

- [x] Replace all `font-bold` usages with DS-compliant weights:
  - Headings (h2/h3/h4, AlertDialogTitle): `font-bold` → `font-semibold`
  - Stat values / amounts (risk score, chart totals, budget inputs, usage counters): `font-bold` → `font-medium`
  - Section micro-labels (uppercase + tracking-widest pattern): `font-bold` → `font-semibold`
  - Inline currency value badge: `font-bold` → `font-medium`
- [x] Replace arbitrary color `text-[#064e4b]` → `text-primary` (semantic token)
- [x] Files normalized: `budgeting/[id]/page.tsx`, `budgeting/page.tsx`, `desktop-wallet-view.tsx`, `risk-score-card.tsx`, `chart-lists.tsx`, `deepseek-usage-card.tsx`, `budget-status-pill.tsx`, `result-card.tsx`, `add-budget-modal.tsx`, `edit-budget-modal.tsx`

Rationale:
- `font-bold` is reserved for marketing/landing pages only (DS §2.2)
- All numeric/amount displays use `font-medium` per DS `number-display` token rule
- All heading elements use `font-semibold` per DS §2.2
- All section micro-labels use `font-semibold` per `label-xs` utility rule
- Arbitrary hex colors replaced with semantic tokens per DS P1 (Tokens over Literals)

### Phase 3B — Line-height & Tracking Enforcement ✅ DONE in DS 1.5
Target: Normalize `line-height` and `tracking` classes across the app.

- [x] Add §2.6 Line-height Rules to `DESIGN_SYSTEM.md` (tight/relaxed/snug/none per content type)
- [x] Add `leading-[X]` arbitrary-value detection rule to `eslint.config.mjs`
- [x] Update §7 Anti-Patterns table and §10.1/§10.4 enforcement docs
- [x] Fix `uppercase tracking-tighter` on non-amount labels → `tracking-widest` (goals, charts, home, transactions, settings pages)
- [x] Fix `uppercase tracking-wider` on section micro-labels → `tracking-widest` (assets, smart-add, debts, token-calculator, repair pages and feature components)

Rationale:
- `tracking-tighter` is reserved for financial amount displays (`number-display` token), not labels
- `tracking-wider` is reserved for navigation tab triggers, not section micro-labels
- All all-caps section labels must use `tracking-widest` per DS §2.3

### Phase 4 — Token Abstraction Layer ✅ DONE in DS 1.6
Target: Abstract structural spacing into semantic tokens to reduce direct Tailwind utility repetition in layout structure.

- [x] Create `src/lib/layout-tokens.ts` — central semantic spacing token registry
- [x] Define 6 tokens mapped to the approved spacing scale:
  - `spacing.container` → `flex-1 p-4 md:p-6 space-y-6 pb-24` (DS §5.1 page container)
  - `spacing.section` → `space-y-6` (DS §5.2 section gap)
  - `spacing.cardPremium` → `p-7` (DS §4.2 Tier 2 premium card)
  - `spacing.cardFlat` → `p-4` (DS §4.2 Tier 1 flat card)
  - `spacing.gridGap` → `gap-4` (DS §5.2 card grid gap)
  - `spacing.stack` → `space-y-4` (DS §5.2 form field gap)
- [x] Export `layout` alias for ergonomic JSX: `className={layout.container}`
- [x] Replace repeated structural utility usage in:
  - Page containers: `goals/page.tsx`
  - Section wrappers: `token-calculator/page.tsx`, `net-cashflow-chart.tsx`
  - CardContent (flat): `debts-dashboard.tsx`
  - CardContent (premium): `debts/page.tsx`, `budgeting/page.tsx`
  - Grid layouts: `goals/page.tsx`
  - Form stacks: `login-page.tsx`, `forgot-password-page.tsx`, `signup-page.tsx`

Token coverage: container×1, section×4, cardFlat×3, cardPremium×3, gridGap×2, stack×3 = 16 replacements.

### Phase 5 — FAB Consolidation (0.5 sprint)
Target: Replace all 8 inline FAB patterns with `<FAB>`.

Process:
1. Remove the duplicate FAB from `app/(main)/goals/page.tsx` (dashboard owns it).
2. Replace inline FABs in: `goals-dashboard.tsx`, `debts-dashboard.tsx`, `budgeting-dashboard.tsx`, `reminders-dashboard.tsx`, `wallets/page.tsx`.
3. Standardise desktop offset: remove `md:bottom-10 md:right-10` from `budgeting/page.tsx`.

### Phase 6 — Shadow & Blur Audit (0.5 sprint)
Target: Replace all `shadow-sm` on `<Card>` with `shadow-card`. Replace `backdrop-blur-3xl` on bottom nav.

---

## 10. Automation & Enforcement Strategy

### 10.1 ESLint (Active — `eslint.config.mjs`)

Four `no-restricted-syntax` rules are active as `"warn"` level:
- Arbitrary font sizes (`text-[8-15px]`)
- Arbitrary tracking (`tracking-[X]`)
- Arbitrary line-height (`leading-[X]`)
- Non-standard nav padding (`pb-20/28/32/safe`)
- Literal colour class on interactive elements

**To escalate to error in CI:** Add `ESLINT_MAX_WARNINGS=0` to the build command or set the rules to `"error"`.

```bash
# In CI pipeline:
npx eslint src/ --max-warnings=0
```

### 10.2 Prettier (Active — `.prettierrc`)

`prettier-plugin-tailwindcss` is installed and configured. It enforces class sort order and catches obvious duplicates. Run on every commit via pre-commit hook.

```bash
# Recommended: add to package.json scripts
"lint:format": "prettier --check src/"

# Recommended: add pre-commit hook (husky or simple-git-hooks)
"pre-commit": "prettier --write src/**/*.tsx && eslint src/ --max-warnings=20"
```

### 10.3 TypeScript (Active)

The `ButtonProps` interface uses `VariantProps<typeof buttonVariants>` — adding `success` and `error` to `buttonVariants` in Phase 1 means TypeScript now validates correct variant usage at compile time. Any call site that passes an unknown variant string now produces a type error.

### 10.4 Code Review Checklist

Add to PR template (`.github/pull_request_template.md`):

```markdown
## Design System Checklist
- [ ] No `text-[Xpx]` arbitrary font sizes used (use `text-label` or `text-xs`)
- [ ] No `tracking-[Xem]` arbitrary tracking (use `tracking-widest` or `tracking-tight`)
- [ ] No `leading-[X]` arbitrary line-height (use `leading-tight`, `leading-relaxed`, `leading-snug`, or `leading-none`)
- [ ] Uppercase micro-labels use `tracking-widest` (not `tracking-wider` or `tracking-tighter`)
- [ ] Status badges use `<StatusBadge variant="...">` — no raw colour classes
- [ ] FABs use `<FAB>` component — no inline pattern
- [ ] Nav clearance uses `pb-24` — not pb-20/28/32/safe
- [ ] New cards use the correct tier (flat / premium / glass)
- [ ] New semantic states use `bg-primary/destructive/success/warning` — no literal colours
```

### 10.5 CI Gate (Recommended — GitHub Actions)

Create `.github/workflows/design-system.yml`:

```yaml
name: Design System Compliance
on: [pull_request]
jobs:
  ds-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: ESLint DS rules
        run: npx eslint src/ --max-warnings=0 --rule '{"no-restricted-syntax": "error"}'
      - name: Prettier format check
        run: npx prettier --check "src/**/*.tsx"
```

### 10.6 Ongoing Governance

| Cadence | Action |
|---|---|
| Every PR | Design System Checklist review |
| Weekly | `grep -c "text-\[" src/**/*.tsx` — track migration progress |
| Per sprint | One Phase from the Refactor Roadmap completed |
| On new component | Author verifies component against §4 component standards |
| On new colour need | First ask: does a semantic token exist? If not, propose token before using raw value |

---

## 11. Error State Guidelines

### 11.1 Error Design Tokens

The following semantic tokens are defined in `globals.css` and registered in `tailwind.config.ts`:

| Token | Tailwind class | Use |
|---|---|---|
| `--error` | `text-error` / `bg-error` | Error foreground text and solid backgrounds |
| `--error-foreground` | `text-error-foreground` | Text on a solid error background |
| `--error-surface` | `bg-error-surface` | Subtle error card/panel background |
| `--error-muted` | `bg-error-muted` | Hover background on error ghost buttons |
| `--error-border` | `border-error-border` | Error card/input border |

`--error` resolves to the same rose-600 value as `--destructive`. Use `error-*` tokens for UX error states; use `destructive` for irreversible/danger actions (delete, remove).

### 11.2 Error Tone Categories

Four tone categories define how error messages are written:

| Category | Trigger | Tone | Example |
|---|---|---|---|
| **Validation** | User input issue | Calm, specific, actionable | "Nama dompet wajib diisi." |
| **Network** | Connection / timeout | Reassuring, actionable | "Koneksi bermasalah. Periksa jaringan kamu, lalu coba lagi." |
| **Server/System** | Unexpected server error | Apologetic, not technical | "Terjadi kesalahan pada sistem. Kami sedang memperbaikinya." |
| **Empty/Fallback** | Data unavailable | Neutral, not alarming | "Data belum tersedia. Coba refresh halaman." |

#### Wording Rules

- ✅ Calm, not blaming: "Nama tidak boleh kosong" (not "Invalid input")
- ✅ Actionable: tell the user what to do next
- ✅ Human: avoid HTTP codes, stack traces, or technical identifiers
- ❌ No raw technical messages: "500 Internal Server Error", "undefined", "null"
- ❌ No passive vague messages as a first choice: "Something went wrong" is only acceptable as a last-resort fallback
- ❌ No exclamation marks in error messages

### 11.3 Error Components

#### `ErrorMessage` / `InlineError` — inline field-level validation

**File:** `src/components/ui/error-message.tsx`

```tsx
import { ErrorMessage } from '@/components/ui/error-message';
// Alias: InlineError
import { InlineError } from '@/components/ui/error-message';

{errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
```

Renders with `role="alert"` and `aria-live="polite"`. Returns `null` when no children are provided.

#### `ErrorAlert` / `ErrorBanner` — block-level inline error notification

**File:** `src/components/ui/error-alert.tsx`

```tsx
import { ErrorAlert } from '@/components/ui/error-alert';
// Alias: ErrorBanner
import { ErrorBanner } from '@/components/ui/error-alert';

// Network failure
<ErrorAlert
  variant="network"
  message="Gagal memuat data."
  description="Periksa koneksi internet kamu."
  onRetry={handleRetry}
/>

// Server error
<ErrorAlert
  variant="server"
  message="Terjadi kesalahan pada sistem."
/>

// Validation summary
<ErrorAlert
  variant="validation"
  message="Periksa kembali isian kamu."
  description="Ada 2 field yang belum diisi dengan benar."
/>
```

Renders with `role="alert"` and `aria-live="assertive"`. `onRetry` is optional — omit to hide the retry button.

#### `RetrySection` — self-contained retry prompt

**File:** `src/components/ui/retry-section.tsx`

Use when a section of the page failed to load and the user can trigger a refetch without navigating away.

```tsx
import { RetrySection } from '@/components/ui/retry-section';

<RetrySection
  message="Gagal memuat daftar transaksi."
  onRetry={refetch}
  isRetrying={isFetching}
/>
```

Renders with `role="status"` and `aria-live="polite"`. The retry button shows a spinner while `isRetrying` is `true`.

#### `Alert` variant `"error"` — rich inline alert block

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert variant="error">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Saldo tidak cukup</AlertTitle>
  <AlertDescription>
    Kamu perlu menambah dana sebelum melanjutkan.
  </AlertDescription>
</Alert>
```

#### `ErrorBoundary` — React error boundary for widget isolation

**File:** `src/components/error-boundary.tsx`

Wrap any widget that fetches or processes data independently. Provides automatic retry.

```tsx
<ErrorBoundary>
  <MyDashboardWidget />
</ErrorBoundary>
```

#### `CustomToast` — transient error feedback

Use `showToast(message, 'error')` from `useUI()` for non-blocking, transient errors. Error toasts render with a `bg-destructive` background to distinguish them from info/success toasts.

```tsx
const { showToast } = useUI();
showToast('Gagal menyimpan perubahan.', 'error');
```

### 11.4 Visual Hierarchy

```
Page-level critical error     → ErrorAlert / ErrorBanner variant="server" (top of page, full-width)
Section / async load failure  → ErrorAlert variant="network" + onRetry  OR  RetrySection
Form field validation error   → ErrorMessage / InlineError (below the field)
Form summary validation       → ErrorAlert variant="validation" (above submit button)
Widget crash / render error   → ErrorBoundary fallback
Transient feedback (1 action) → showToast(..., 'error')
```

### 11.5 Do and Don't

#### ✅ Do

```tsx
// Do: use ErrorMessage for field errors
{errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}

// Do: use ErrorAlert for failed fetches
{fetchError && (
  <ErrorAlert variant="network" message="Gagal memuat data." onRetry={refetch} />
)}

// Do: use semantic tokens
<div className="bg-error-surface border border-error-border rounded-card p-4">

// Do: add aria-live to dynamically injected error regions
<div aria-live="polite">{errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}</div>
```

#### ❌ Don't

```tsx
// Don't: raw red palette on UI state
<p className="text-red-500">Error!</p>                  // → text-error

// Don't: silent catch without UI feedback
try { await save(); } catch (e) { console.error(e); }   // → showToast + console.error

// Don't: technical messages to users
showToast('PostgrestError: duplicate key', 'error');    // → human message

// Don't: alert() for error feedback
alert('Gagal!');                                        // → showToast or ErrorAlert

// Don't: loading state left without error fallback
{isLoading && <Skeleton />}                             // → also handle error state
```

### 11.6 Accessibility Requirements

- All error messages **must** have either `role="alert"` or be in an `aria-live` region.
- `aria-live="polite"` — for non-urgent errors (field validation, empty state).
- `aria-live="assertive"` — for urgent errors (network failure, data loss risk).
- Color alone must **not** convey an error — always pair with an icon or text.
- Error icon contrast must meet **WCAG AA** (4.5:1 for text-size icons, 3:1 for large icons).
- `ErrorMessage` and `ErrorAlert` satisfy these requirements out of the box.

---

## 12. Empty State Governance

### 12.1 Overview

Empty states communicate absence of content or data. They are not decorative — they are UI signposts that guide users toward productive actions. Every empty container must follow these rules.

**File:** `src/components/empty-state.tsx`

### 12.2 Structure

```tsx
import { EmptyState } from '@/components/empty-state';

<EmptyState
  title="Short Clear Headline"
  description="Calm, action-oriented supporting text."
  actionLabel="Primary CTA"
  onAction={() => handleAction()}
  icon={IconComponent}
  variant="default"
/>
```

### 12.3 Variants

| Variant | Use Case | Icon Style | Button Variant |
|---|---|---|---|
| `default` | First-time user, no data yet | `bg-primary/10` | `default` |
| `filter` | Filter/search returns 0 results | `bg-muted` | `outline` |
| `error` | Error state, failed to load | `bg-destructive/10` | `destructive` |

### 12.4 Layout Rules

#### Mobile
- Top-aligned with generous padding (`pt-12 px-6`)
- Max width: `320px` (readable, not stretched)
- Card radius: `rounded-card-premium`
- Padding: `p-7`

#### Desktop
- Vertically centered in container (`items-center`)
- Max width: `md:max-w-md` (larger readable area)
- Card radius: `md:rounded-lg` (standard card)
- Padding: `md:p-8`

### 12.5 Tone Guidelines

#### ✅ Do
- Keep titles **short** (max 6 words)
- Use **calm**, clear language
- Be **action-oriented** ("Buat Target Baru", not "Kamu belum punya target")
- Avoid blame ("Filter tidak menampilkan hasil", not "Kamu salah filter")
- One primary CTA only
- Icon should reinforce the message (e.g., `Target` for goals, `HandCoins` for budgets)

#### ❌ Don't
- Don't use playful or informal tone ("Yuk mulai sekarang! 🎉")
- Don't blame the user ("Tidak ada data karena kamu belum input")
- Don't use multiple CTAs (no secondary actions)
- Don't stretch the empty state to full width
- Don't use custom one-off empty UI per page

### 12.6 Usage Examples

#### First-Time User (default variant)
```tsx
<EmptyState
  icon={Target}
  title="Belum Ada Target"
  description="Mulai menabung untuk impianmu hari ini. Tetapkan target dan raih satu per satu."
  actionLabel="Buat Target Baru"
  onAction={() => setIsGoalModalOpen(true)}
  variant="default"
/>
```

#### Filter Empty Result (filter variant)
```tsx
<EmptyState
  icon={BellRing}
  title="Tidak Ada Pengingat"
  description="Filter ini tidak menampilkan pengingat. Coba sesuaikan filter atau buat baru."
  actionLabel="Buat Pengingat"
  onAction={() => setIsReminderModalOpen(true)}
  variant="filter"
/>
```

#### Error State (error variant)
```tsx
<EmptyState
  icon={AlertTriangle}
  title="Gagal Memuat Data"
  description="Terjadi kesalahan saat memuat data. Periksa koneksi internet dan coba lagi."
  actionLabel="Coba Lagi"
  onAction={() => refetch()}
  variant="error"
/>
```

### 12.7 Spacing Tokens

All spacing must use design system tokens:
- Icon container: `p-5 rounded-card mb-6`
- Title margin: `mb-3 md:mb-4`
- Description margin: `mb-8 md:mb-10`
- Description max width: `max-w-[280px]`

### 12.8 Forbidden Patterns

```tsx
// ❌ Don't: inline one-off empty state
<div className="flex flex-col items-center p-12">
  <div className="bg-blue-500/10 p-4 rounded-xl">
    <Icon />
  </div>
  <h2>Belum Ada Data</h2>
  <p>Buat sekarang yuk!</p>
  <Button>Buat</Button>
</div>

// ❌ Don't: raw card without EmptyState
<Card className="p-6 text-center">
  Belum ada data. <Button>Buat</Button>
</Card>

// ❌ Don't: playful tone
<EmptyState 
  title="Waduh, kosong nih!" 
  description="Yuk isi sekarang biar seru! 🎉"
/>

// ❌ Don't: blame language
<EmptyState 
  title="Kamu belum input" 
  description="Makanya data kosong terus."
/>

// ❌ Don't: multiple CTAs
<EmptyState 
  actionLabel="Buat Baru"
  onAction={...}
>
  <Button variant="outline">Lihat Tutorial</Button>
  <Button variant="link">Skip</Button>
</EmptyState>
```

### 12.9 Compliance Checklist

Before shipping an empty state:
- [ ] Uses `<EmptyState>` component
- [ ] Title is max 6 words
- [ ] Description is calm and action-oriented
- [ ] Icon reinforces the message
- [ ] Only one primary CTA (or none for non-actionable states)
- [ ] Follows mobile/desktop layout rules
- [ ] No custom inline empty UI
- [ ] No playful or blame language

---
