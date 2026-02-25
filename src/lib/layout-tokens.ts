/**
 * Semantic spacing tokens — Phase 4 Token Abstraction Layer
 *
 * Maps structural layout patterns to named tokens per DESIGN_SYSTEM.md §5.
 * Use these tokens instead of repeating raw Tailwind utility strings in
 * page containers, section wrappers, CardContent, grid layouts, and form stacks.
 *
 * @see DESIGN_SYSTEM.md §5.1 Page Layout
 * @see DESIGN_SYSTEM.md §5.2 Spacing Scale
 * @see DESIGN_SYSTEM.md §4.2 Card Tiers
 */

export const spacing = {
  /** DS §5.1 — Canonical scrollable page container */
  container: 'flex-1 p-4 md:p-6 space-y-6 pb-24',

  /** DS §5.2 — Section gap inside a page (vertical rhythm between sections) */
  section: 'space-y-6',

  /** DS §4.2 Tier 2 — Premium card inner content padding */
  cardPremium: 'p-7',

  /** DS §4.2 Tier 1 — Flat card inner content padding */
  cardFlat: 'p-4',

  /** DS §5.2 — Card grid gap (between grid children) */
  gridGap: 'gap-4',

  /** DS §5.2 — Form / stack field gap (between form fields) */
  stack: 'space-y-4',
} as const;

/** Alias exported as `layout` for ergonomic JSX usage: `className={layout.container}` */
export const layout = spacing;
