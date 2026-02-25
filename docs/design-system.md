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

Use only the following shadow tokens. Limit maximum elevation depth to **3 levels per screen**.

| Token | Purpose |
| :--- | :--- |
| `shadow-card` | Base card surface |
| `shadow-lg` | Modal / bottom sheet |
| `shadow-xl` | Overlay / popover (use sparingly) |

**Rules:**
- No more than 3 distinct elevation levels visible on any single screen at once.
- `shadow-xl` is reserved for overlays and popovers; avoid overuse.

---

## 3. Border & Depth

- **Border is for separation only** — never use border as a substitute for elevation.
- **No strong shadow + strong border combination** — pick one or the other to convey depth.
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
