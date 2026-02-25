# Lemon Design System – Visual Contract v1.2

This document is the authoritative visual contract for the Lemon design system. All UI contributions must conform to the rules defined here.

---

## 1. Radius Scale

Use only the following design tokens for border radius. Raw Tailwind radius utilities are **forbidden**.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `rounded-sm` | 6px | Chips, badges, small UI elements |
| `rounded-md` | 8px | Inputs, buttons, secondary cards |
| `rounded-lg` | 12px | Standard cards, panels |
| `rounded-card` | 24px | Hero cards, modals, bottom sheets |

**Forbidden utilities:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`, and any other raw Tailwind radius class not listed above. Always use a design token.

---

## 2. Elevation Scale

Use only the following shadow tokens. All three are explicitly defined in `tailwind.config.ts`. Limit maximum elevation depth to **3 levels per screen**.

| Token | CSS definition | Purpose |
| :--- | :--- | :--- |
| `shadow-card` | `0 2px 8px -2px rgba(0,0,0,0.10)` | Base card surface |
| `shadow-lg` | `0 8px 24px -4px rgba(0,0,0,0.12)` | Modal / bottom sheet |
| `shadow-xl` | `0 20px 40px -8px rgba(0,0,0,0.16)` | Overlay / popover (use sparingly) |

**Rules:**
- No more than 3 distinct elevation levels visible on any single screen at once.
- `shadow-xl` is reserved for overlays and popovers; avoid overuse.

---

## 3. Border & Depth

- **Border is for separation only** — use `border-border` (full opacity) for structural dividers; use `border-border/20` or lower for subtle inset separators. Never use border as a substitute for elevation.
- **No elevated shadow + opaque border combination** — do not pair `shadow-lg` or `shadow-xl` with a fully opaque border (`border-border`). If elevation is needed, let shadow carry it; a hairline tint (`border-border/10`) is acceptable.
- **CTA buttons must not use shadow** — button prominence comes from color and contrast, not elevation.

---

## 4. Focus State

- **Single focus ring system** — one consistent ring style across all interactive elements.
- **No excessive glow in dark mode** — focus indicators must remain subtle and non-distracting in dark contexts.
- **Focus must not overpower CTA** — the focus ring should never compete visually with the primary call-to-action.

---

## 5. Governance

- **All PRs must use design tokens** — no hardcoded radius, shadow, or color values.
- **No new radius or shadow tokens** without a corresponding update to this document.
- **PR description must include a compliance note** confirming adherence to this visual contract (e.g., _"Design tokens used: `rounded-card`, `shadow-card`"_).

Non-compliant PRs will be blocked until they conform to this contract.
