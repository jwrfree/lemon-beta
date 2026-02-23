# UI Audit Report — Lemon Beta

**Scope:** `/src/app/**`, `/src/components/**`, `/src/features/**`  
**Date:** 2026-02-23  
**Method:** Static analysis of all `.tsx` files under the scoped paths.

---

## 1. Buttons

### 1.1 Variant Usage Frequency

| Variant | Count | Defined in `button.tsx`? |
|---|---|---|
| `ghost` | 92 | ✅ |
| `outline` | 53 | ✅ |
| `secondary` | 14 | ✅ |
| `link` | 9 | ✅ |
| `destructive` | 8 | ✅ |
| `default` | 6 | ✅ |
| `success` | 2 | ❌ — Not defined |
| `error` | 2 | ❌ — Not defined |

### 1.2 Size Usage Frequency

| Size | Count |
|---|---|
| `icon` | 79 |
| `sm` | 55 |
| `lg` | 26 |
| *(default)* | remainder |

### 1.3 Inconsistencies

- **Undefined variants:** `variant="success"` and `variant="error"` are called in feature files but do **not** exist in `button.tsx`. These silently fall back to the `default` variant and produce unexpected visual output.  
  *Files:* `features/wallets/components/desktop-wallet-view.tsx`, `features/insights/components/pocket-copilot.tsx` (and inline usages).
- **Floating Action Button (FAB) colors are not standardized.** Eight different FABs across the app use different background colors (see §3).

### 1.4 Suggested Standard

```
button.tsx → add variants:
  success: "bg-success text-success-foreground hover:bg-success/90"
  error:   "bg-destructive text-destructive-foreground hover:bg-destructive/90"
```

---

## 2. Cards

### 2.1 Card Pattern Taxonomy

Three visually distinct card styles are in concurrent use:

| Pattern | Style Class | Usage Count (approx.) | Representative File |
|---|---|---|---|
| **Flat card** | `border-none shadow-sm bg-card rounded-lg` | ~25 files | `dashboard-stat-card.tsx`, `debts-dashboard.tsx` |
| **Premium / DNA card** | `border-none shadow-2xl rounded-[32px]` + `style={{ background: dna.gradient }}` | ~3 files | `budget-card.tsx`, `goal-list.tsx` |
| **Glass card** | `bg-gradient-to-br from-[color]-950 ... rounded-lg` + custom inline box-shadow | ~2 files | `deepseek-usage-card.tsx`, hero section |

### 2.2 Card Padding Inconsistencies

Interior padding varies widely across card types even for same-level content:

| Location | Padding Used |
|---|---|
| `CardContent` (standard) | `p-4` (default from `card.tsx`) |
| Budget card interior | `p-7` |
| Goal list card interior | `p-7` |
| Debt list card | `p-4` |
| Reminder status mini-cards | `p-3` |
| Login page content area | `p-5` |
| Glass inset panels (budget, goal) | `p-4` |

### 2.3 Card Border Radius Inconsistencies

| Radius Value | Usage | Location |
|---|---|---|
| `rounded-lg` | Design system default | Most cards |
| `rounded-[32px]` | Premium outer shell | `budget-card.tsx`, `goal-list.tsx`, `transaction-composer.tsx` |
| `rounded-[24px]` | Glass inset panels | Budget/Goal interior glass panel |
| `rounded-[20px]` | Icon containers inside premium cards | Budget card, Goal list |
| `rounded-2xl` | Some feature sections | Tabs, Debt/Budget summary cards |
| `rounded-xl` | Various containers | Reminder status cards |

### 2.4 Card Shadow Inconsistencies

| Shadow | Count | Context |
|---|---|---|
| `shadow-sm` | 144 | Standard/flat cards |
| `shadow-card` | 48 | Defined in `tailwind.config.ts` as subtle card shadow |
| `shadow-2xl` | 40 | Premium/FAB elements |
| `shadow-inner` | 50 | Glass inset panels |
| `shadow-lg` | 46 | Modals, dropdowns, FABs |
| `shadow-xl` | 30 | Some hero sections |
| `shadow-primary/…` | 32 | FABs with colored shadows |

`shadow-sm` and `shadow-card` are used interchangeably for flat card content though `shadow-card` is the designed token.

### 2.5 Suggested Standard

```
Flat content card   → border-none shadow-card bg-card rounded-lg
Section/summary card → border-none shadow-sm bg-card rounded-lg (p-4 content)
Premium feature card → rounded-[32px] shadow-2xl (DNA gradient bg, p-7)
Glass inset panel   → bg-white/5 backdrop-blur-md rounded-[24px] p-4 border border-white/10 shadow-inner
```

---

## 3. Floating Action Buttons (FAB)

### 3.1 All FAB Instances

| File | Position Class | Color |
|---|---|---|
| `app/(main)/goals/page.tsx` | `fixed bottom-20 right-6 z-40 md:bottom-8 md:right-8` | `bg-primary` |
| `app/(main)/wallets/page.tsx` | `fixed bottom-20 right-6 z-40` | `bg-primary` |
| `app/(main)/debts/page.tsx` | `fixed bottom-20 right-6 z-40 md:bottom-8 md:right-8` | `bg-primary` |
| `app/(main)/budgeting/page.tsx` | `fixed bottom-24 right-6 z-40 md:bottom-10 md:right-10` | `bg-primary` |
| `features/goals/components/goals-dashboard.tsx` | `fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden` | `bg-purple-600` |
| `features/debts/components/debts-dashboard.tsx` | `fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden` | `bg-destructive` |
| `features/budgets/components/budgeting-dashboard.tsx` | `fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden` | `bg-primary` |
| `features/reminders/components/reminders-dashboard.tsx` | `fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden` | `bg-blue-600` |

### 3.2 Inconsistencies

1. **Bottom offset:** `bottom-20` (app pages) vs `bottom-24` (feature dashboards) — 16px difference. Causes FAB to sit at different heights depending on where it is rendered.
2. **Desktop offset:** `md:bottom-10 md:right-10` (budgeting page) vs `md:bottom-8 md:right-8` (everywhere else).
3. **Color:** `bg-primary`, `bg-purple-600`, `bg-destructive`, `bg-blue-600` — four different brand expressions for the same UI affordance.
4. **Shadow:** `shadow-2xl shadow-primary/40`, `shadow-lg shadow-destructive/20`, `shadow-lg shadow-blue-500/20` — no uniform approach.
5. **Duplication:** Goals has a FAB in `app/(main)/goals/page.tsx` **and** in `features/goals/components/goals-dashboard.tsx` — both rendered.

### 3.3 Suggested Standard

```tsx
// Standard FAB wrapper
<div className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden">
  <Button
    size="icon"
    className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 hover:scale-110 transition-transform active:scale-95"
  >
    <Plus className="h-7 w-7" />
  </Button>
</div>
```

All FABs should use `bg-primary` unless there is a strong semantic reason (e.g., `bg-destructive` for a delete-only action). Color variation currently does not map to semantic meaning.

---

## 4. Status / State Badges

### 4.1 Pattern Usage

| Approach | Count (approx.) | Files |
|---|---|---|
| `StatusBadge` component | ~8 usages | only `debts-dashboard.tsx` and `debts/page.tsx` |
| Inline raw `Badge` with manual `className` | 63+ | Nearly every other feature file |

### 4.2 Raw Inline Badge Color Patterns Found

| Class Pattern | Semantic Meaning |
|---|---|
| `bg-emerald-500/10 text-emerald-600` | Success / Completed |
| `bg-destructive/10 text-destructive` | Error / Overdue |
| `bg-amber-500/10 text-amber-600` | Warning / Snoozed |
| `bg-primary/10 text-primary` | Informational / Active |
| `bg-rose-500/10 text-rose-600` | Danger / Exceeded |
| `bg-yellow-500/10 text-yellow-600` | Warning (alt) |

The `StatusBadge` component already encodes `success`, `warning`, `error`, `default` and `neutral` variants covering all of the above — but it is only used in two files.

### 4.3 Inconsistency

- `reminders-dashboard.tsx` duplicates all four raw badge classes inline rather than importing `StatusBadge`.
- `transactions/transaction-list-item.tsx` uses `bg-rose-500/10` inline rather than `StatusBadge variant="error"`.
- Some files use `bg-amber-` while others use `bg-yellow-` for "warning" — there is no single canonical warning color in use.

### 4.4 Suggested Standard

Adopt `StatusBadge` everywhere:
```tsx
import { StatusBadge } from '@/components/status-badge';
// success → <StatusBadge variant="success">Lunas</StatusBadge>
// error   → <StatusBadge variant="error">Terlambat</StatusBadge>
// warning → <StatusBadge variant="warning">Ditunda</StatusBadge>
// default → <StatusBadge>Aktif</StatusBadge>
```

---

## 5. Typography

### 5.1 Font Size Usage

| Class | Count | Notes |
|---|---|---|
| `text-sm` | 234 | Body text, metadata |
| `text-xs` | 229 | Secondary/small labels |
| `text-[10px]` | **305** | Sub-label, uppercase tracking text |
| `text-[9px]` | 78 | Micro-label (sidebar section headers) |
| `text-[11px]` | 57 | Slightly-larger micro-label |
| `text-[8px]` | 21 | Smallest micro-label |
| `text-lg` | 71 | Card titles, section headings |
| `text-xl` | 54 | Hero values |
| `text-2xl` | 45 | Primary balance display |
| `text-3xl` | 18 | Large hero/amount display |
| `text-base` | 40 | Submit buttons, form labels |
| `text-[15px]` | 1 | One-off arbitrary |
| `text-[0.8rem]` | 1 | One-off arbitrary |

> **461 instances** of arbitrary pixel-size text (`text-[Xpx]`) are present. This bypasses the Tailwind type scale entirely and will not benefit from the design token system.

### 5.2 Font Weight Usage

| Class | Count | Notes |
|---|---|---|
| `font-medium` | 564 | Most used — applied broadly including primary headings |
| `font-semibold` | 341 | Subtitles, card labels, nav items |
| `font-normal` | 15 | Form inputs, body |
| `font-bold` | 15 | Rarely used |

`font-medium` and `font-semibold` are used interchangeably for heading-level text. No consistent rule governs when to use one over the other.

### 5.3 Letter Spacing (Tracking) Inconsistencies

| Class | Count | Notes |
|---|---|---|
| `tracking-widest` | 195 | Most common — used on section micro-labels |
| `tracking-tight` | 102 | Card titles, h-level content |
| `tracking-tighter` | 83 | Amount/number display |
| `tracking-wider` | 58 | Secondary labels |
| `tracking-[0.2em]` | ~10 | Sidebar custom — same intent as `tracking-widest` |
| `tracking-[0.3em]` | ~5 | Sidebar custom — slightly wider than `tracking-widest` |
| `tracking-wide` | 4 | Infrequent |
| `tracking-normal` | 1 | Rare |

Three different values (`tracking-widest`, `tracking-[0.2em]`, `tracking-[0.3em]`) are used for the same micro-label pattern (uppercase section headers). The two arbitrary values appear only in `sidebar.tsx`.

### 5.4 Section Label Pattern — Three Competing Styles

Same UI concept (small all-caps label above a content group) expressed three different ways:

| File | Class String |
|---|---|
| `sidebar.tsx` | `text-[9px] font-semibold text-muted-foreground/40 px-5 mb-4 uppercase tracking-[0.3em]` |
| `transaction-composer.tsx` | `text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ml-1` |
| `reminders-dashboard.tsx` | `text-[11px] font-medium tracking-wider uppercase text-muted-foreground` |

### 5.5 Suggested Standard

```
Section micro-label  → text-xs font-semibold uppercase tracking-widest text-muted-foreground
                       (replaces text-[9px], text-[10px], text-[11px] + tracking-[0.Xem])
Body secondary text  → text-xs text-muted-foreground
Card label/title     → text-sm font-semibold tracking-tight
Large number display → text-2xl font-medium tracking-tighter tabular-nums
```

---

## 6. Spacing

### 6.1 Gap / Space-y Usage

| Class | Count |
|---|---|
| `gap-2` | 219 |
| `gap-1` | 103 |
| `gap-4` | 94 |
| `gap-3` | 87 |
| `gap-6` | 32 |
| `space-y-2` | 96 |
| `space-y-4` | 68 |
| `space-y-1` | 61 |
| `space-y-3` | 54 |
| `space-y-6` | 50 |

No clear rule distinguishes when to use `gap-2` vs `gap-3` for inline items, or `space-y-4` vs `space-y-6` for sections.

### 6.2 Page-level Padding

| Pattern | Files |
|---|---|
| `p-4 md:p-8` | `goals/page.tsx` |
| `p-4` | `token-calculator/page.tsx` |
| `p-6` | `offline/page.tsx` |
| `px-6` (via `PageHeader`) | All pages using `PageHeader` |

Page containers do not use a consistent padding token.

### 6.3 Bottom Padding (Navigation Clearance)

Bottom padding to clear the mobile nav bar is hardcoded per page and inconsistent:

| Value | Count |
|---|---|
| `pb-24` | 6 |
| `pb-32` | 5 |
| `pb-safe` | 3 |
| `pb-28` | 1 |
| `pb-20` | 1 |

Five different values for the same purpose. The correct clearance depends on the bottom nav bar height (`h-16` = 64px) + `bottom-6` offset = approximately 88px → `pb-24` (96px) is the closest match.

### 6.4 Suggested Standard

```
Page scroll container → pb-24 (clears mobile nav: 64px bar + 24px bottom offset ≈ 88px)
Inner page padding    → p-4 (mobile) md:p-6 (desktop)
Section spacing       → space-y-6
Item list spacing     → space-y-3 or space-y-4
Inline icon+text gap  → gap-2
```

---

## 7. Backdrop Blur

| Class | Count | Typical Context |
|---|---|---|
| `backdrop-blur-sm` | 30 | Overlays, modals |
| `backdrop-blur-md` | 30 | Glass panels, cards |
| `backdrop-blur-xl` | 29 | Header, sidebar, premium surfaces |
| `backdrop-blur-3xl` | 1 | Bottom nav (likely too strong) |
| `backdrop-blur-2xl` | 1 | One-off |

No documented rule for which blur level applies to which surface type.

### Suggested Standard

```
Page header / sidebar     → backdrop-blur-xl
Modal overlay / sheets    → backdrop-blur-sm (on the scrim)
Modal content surface     → backdrop-blur-xl
Glass inset panels        → backdrop-blur-md
Bottom navigation bar     → backdrop-blur-xl (not backdrop-blur-3xl)
```

---

## 8. Header Heights

| Component | Height | Behavior |
|---|---|---|
| `PageHeader` (reusable) | `h-16` (64px) | Sticky, backdrop-blur-xl |
| `mobile-header.tsx` (home feature) | `h-14` (56px) | Static, simple border |
| `desktop-header.tsx` (home feature) | `h-16` (64px) | Static, simple border |

`mobile-header.tsx` and `PageHeader` have different heights (56px vs 64px). The home page's mobile header is a plain stub (only contains "Lemon" text) and is not currently used in production.

---

## 9. Commonly Used Tailwind Combinations

The following class combinations appear 10+ times and are candidates for component abstraction:

### 9.1 Section Micro-Label (461 occurrences of arbitrary px sizes)
```tsx
// Current (inconsistent)
className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
// Candidate utility class: "label-xs"
```

### 9.2 Status Pill (63+ inline repetitions)
```tsx
// Current (inconsistent)
className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-semibold"
// → Use <StatusBadge variant="success"> universally
```

### 9.3 Icon Container
```tsx
// Two competing patterns
className="p-2 rounded-full bg-{color}/10 text-{color}"        // smaller, inline
className="p-3 rounded-[20px] bg-white/10 backdrop-blur-xl"     // premium card style
```

### 9.4 Number / Amount Display
```tsx
// Most common pattern
className="font-medium tracking-tighter tabular-nums"
// Sizes vary: text-xl, text-2xl, text-3xl — not standardized per context
```

### 9.5 Hover Scale Interaction
```tsx
// Appears on all interactive cards and buttons
className="hover:scale-110 transition-transform active:scale-95"
// Consistent — already de-facto standard
```

### 9.6 Gradient Card Shell
```tsx
// Premium card outer
className="border-none rounded-[32px] overflow-hidden shadow-2xl"
style={{ background: dna.gradient }}
// + Ambient glow div inside
```

### 9.7 Glass Inset Panel
```tsx
// Inside premium cards
className="bg-white/5 backdrop-blur-md rounded-[24px] p-4 border border-white/10 shadow-inner"
```

---

## 10. Summary of Inconsistencies

| # | Category | Inconsistency | Severity | Affected Files |
|---|---|---|---|---|
| 1 | Buttons | `variant="success"` and `variant="error"` not in `button.tsx` | 🔴 High | 4 |
| 2 | FAB | Bottom offset: `bottom-20` vs `bottom-24` | 🟡 Medium | 8 |
| 3 | FAB | Color not semantic: purple / destructive / blue / primary | 🟡 Medium | 8 |
| 4 | FAB | Desktop offset: `md:bottom-10` vs `md:bottom-8` | 🟡 Medium | 8 |
| 5 | StatusBadge | Component exists but not adopted (63+ inline duplications) | 🟡 Medium | 30+ |
| 6 | Typography | 461 arbitrary `text-[Xpx]` values bypassing Tailwind scale | 🟡 Medium | All features |
| 7 | Typography | Three competing section-label patterns | 🟡 Medium | 10+ |
| 8 | Typography | `font-medium` / `font-semibold` used interchangeably | 🟢 Low | All features |
| 9 | Spacing | Five different `pb-*` values for nav clearance | 🟡 Medium | 15+ |
| 10 | Cards | `shadow-sm` vs `shadow-card` for flat cards | 🟢 Low | 25+ |
| 11 | Cards | `p-4`, `p-5`, `p-6`, `p-7` card interiors — no rule | 🟢 Low | 20+ |
| 12 | Border Radius | Four different values for card shells | 🟡 Medium | 15+ |
| 13 | Tracking | `tracking-widest` vs `tracking-[0.2em]` vs `tracking-[0.3em]` | 🟢 Low | 5+ |
| 14 | Backdrop Blur | No documented level hierarchy (sm/md/xl) | 🟢 Low | 30+ |
| 15 | Header | Home mobile header `h-14` vs PageHeader `h-16` | 🟢 Low | 2 |

---

## 11. Recommended Action Items

1. **Add `success` and `error` variants to `button.tsx`** — eliminates silent variant fallback.
2. **Standardize FAB** to a single `<FAB>` component with `bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden` and `bg-primary` default.
3. **Adopt `StatusBadge` across all features** — remove 63+ raw inline badge class strings.
4. **Replace `text-[10px]`, `text-[9px]`, `text-[11px]`, `text-[8px]`** with a Tailwind `text-xs` + scale extension or a consistent `label-xs` utility (`text-xs` = 12px is close enough for section headers).
5. **Consolidate section-label pattern** to one canonical class string:  
   `text-xs font-semibold uppercase tracking-widest text-muted-foreground`
6. **Standardize nav-clearance bottom padding** to `pb-24` everywhere.
7. **Document card radius tiers**: `rounded-lg` (flat), `rounded-[32px]` (premium/DNA), `rounded-[24px]` (glass inset) — make these explicit design tokens.
8. **Replace `tracking-[0.2em]` / `tracking-[0.3em]`** in `sidebar.tsx` with `tracking-widest`.
