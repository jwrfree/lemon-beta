# Button Component Standards (DS 1.5)

## 1. Button Variants (`src/components/ui/button.tsx`)

| Variant | Use | Classes |
|---|---|---|
| `default` | Primary CTA — one per view | `bg-foreground text-background` |
| `primary` | Alias for `default` | `bg-foreground text-background` |
| `volt` | Primary brand glow | `bg-accent text-accent-foreground` |
| `destructive` | Irreversible action (delete, remove) | `bg-destructive text-destructive-foreground` |
| `outline` | Secondary actions alongside a default button | `border border-input bg-background` |
| `secondary` | Low-prominence actions | `bg-secondary text-secondary-foreground` |
| `ghost` | Toolbar/icon actions, nav items | `hover:bg-accent hover:text-accent-foreground` |
| `tertiary` | Lowest-prominence text action | `text-muted-foreground` |
| `link` | Inline text navigation | `text-primary underline-offset-4` |
| `success` | Confirmation of positive outcome | `bg-success text-success-foreground` |
| `error` | Alias for destructive (UX context) | `bg-destructive text-destructive-foreground` |

## 2. Button Sizes

| Size | Height | Padding | Usage |
|---|---|---|---|
| `default` | `h-11` | `px-6 py-2` | Standard buttons |
| `sm` | `h-9` | `px-4` | Compact UI, small cards |
| `lg` | `h-13` | `px-10` | Form submit buttons |
| `icon` | `h-11 w-11` | N/A | Icon-only buttons (44x44 target) |

## 3. FAB (Floating Action Button) Standards (`src/components/ui/fab.tsx`)

- **Position (Mobile)**: `fixed bottom-[136px] right-6 z-40` (Clears bottom navigation)
- **Position (Desktop)**: `md:bottom-8 md:right-8`
- **Shape**: `rounded-full` (always)
- **Size**: `h-14 w-14`
- **Icon**: `h-7 w-7` (centered)
- **Color**: `bg-primary` default. `bg-destructive` only for destructive contexts.
- **Rules**:
  - One FAB maximum per page.
  - Require `label` prop for `aria-label`.
  - Prefer `<FAB>` over inline custom implementations.

## 4. Interaction & Motion Rules

- **Hover/Active**: `motion-pressable`, `active:scale-95`, `transition-all`.
- **Loading State**: `isLoading` prop must be used instead of manual spinner.
- **Focus**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

## 5. Anti-Patterns (Forbidden)

- ❌ Hardcoded colors: `bg-blue-600`, `text-[#064e4b]`. Use variants or semantic tokens.
- ❌ Arbitrary radius: `rounded-2xl`, `rounded-xl`. Use `rounded-full` or named tokens.
- ❌ Arbitrary shadows: `shadow-[...]`. Use `shadow-card`, `shadow-2xl` (premium).
- ❌ Missing `aria-label` on icon-only buttons.
- ❌ Manual spinner implementation (use `isLoading` prop).
- ❌ Hardcoded bottom padding for nav clearance: `pb-24`, `pb-safe`. Use `app-page-body-padding` or FAB `bottom-[136px]`.
