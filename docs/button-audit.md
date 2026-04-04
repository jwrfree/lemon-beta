# Button Audit Report (Repo-wide)

Date: 2026-04-04
Scope: All button surfaces in `src/` (Button component, `buttonVariants`, raw `<button>`, `motion.button`, and `role="button"`).
Method: Static code inspection only (no runtime/visual verification).

## Baseline (Design System)
Source: `src/components/ui/button.tsx`
- Variants: `primary`, `default`, `volt`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `tertiary`, `success`, `error` (lines 13-26).
- Sizes: `default` (h-11), `sm` (h-9), `lg` (h-13), `icon` (h-11 w-11) (lines 29-33).
- Defaults: `variant="primary"`, `size="default"` (lines 35-37).
- Interaction: `motion-pressable`, focus ring, disabled styling, and loading state with `aria-busy` (lines 8-64).

## Inventory Summary
Counts include test usage under `src/`.

| Type | Count | Files |
| --- | ---: | ---: |
| `<Button>` | 225 | 81 |
| Raw `<button>` | 56 | 30 |
| `<motion.button>` | 9 | 6 |
| `role="button"` on non-button | 2 | 2 |
| `buttonVariants(...)` usage | 18 | 4 |

### Button Variant Usage (explicit props only)
- `ghost`: 96
- `outline`: 39
- `destructive`: 9
- `link`: 7
- `secondary`: 6
- `volt`: 2
- `default`: 1
- Buttons without explicit `variant` (fall back to `primary`): 64

### Button Size Usage (explicit props only)
- `icon`: 73
- `sm`: 43
- `lg`: 18
- Buttons without explicit `size` (fall back to `default`): 90

### File Inventory (by type)
- `<Button>` usage files: see `src/` list in Appendix A.
- Raw `<button>` usage files: see Appendix B.
- `motion.button` usage files: see Appendix C.
- `role="button"` usage files: see Appendix D.

## Findings
Severity scale: Critical, Major, Minor.

### A11y & Semantics
1) Major — Icon-only Buttons missing `aria-label`.
- Count: 63 instances where `size="icon"` is used without `aria-label`.
- Examples:
  - `src/components/ui/global-fab.tsx:14-20`
  - `src/features/home/components/mobile-dashboard.tsx:146-162`
  - `src/features/transactions/components/unified-transaction-sheet.tsx:146-196`
- Impact: Screen readers announce “button” without context.
- Recommendation: add `aria-label` or an `sr-only` label for all icon-only Buttons, or enforce via lint/test.

2) Major — Non-button element with `role="button"` lacks keyboard behavior.
- `src/components/help-tooltip.tsx:26-30` uses a `<div role="button">` with no `onKeyDown`/`onKeyUp` handling.
- Impact: keyboard users cannot trigger it reliably.
- Recommendation: use `<button>`/`<Button asChild>` or add full keyboard handling (Enter/Space) and focus styles.

3) Minor — Raw `<button>` without explicit `type` (21 occurrences).
- Examples:
  - `src/app/(main)/budgeting/[id]/page.tsx:109-113`
  - `src/features/charts/components/chart-lists.tsx:31-38`
  - `src/features/charts/components/advanced-stats/saving-potential.tsx:68-79`
- Impact: default `type="submit"` can cause unintended submits in form contexts.
- Recommendation: add `type="button"` for non-submit actions.

4) Minor — Touch target below 44px on icon actions.
- Examples:
  - `src/components/onboarding-checklist.tsx:126-132` (`h-7 w-7`)
  - `src/features/assets/components/assets-liabilities-dashboard.tsx:145-170` (`h-10 w-10`)
  - `src/app/(main)/reminders/page.tsx:299-301` (`h-9 w-9`)
- Impact: fails 44px touch guidance in multiple locations.
- Recommendation: keep `h-11 w-11` minimum or add `size="icon-sm"` with padding to keep hit area >= 44px.

### Consistency & Design Tokens
5) Major — Literal color tokens in button styling (not semantic tokens).
- Examples:
  - `src/features/charts/components/analytics-dashboard.tsx:389-390` uses `text-teal-600`.
  - `src/features/budgets/components/edit-budget-modal.tsx:208-210` uses `bg-rose-500/10 text-rose-600`.
  - `src/features/charts/components/chart-lists.tsx:36,109-110` uses `ring-rose-500/10`, `text-emerald-600`.
  - `src/features/home/components/quick-add-widget.tsx:111-113,170-171,180-184` uses `amber/emerald/rose` literals.
- Impact: inconsistent theming and harder token maintenance.
- Recommendation: define semantic tokens or Button variants for these states (e.g., `warning`, `success`, `danger-ghost`).

6) Minor — `primary` and `default` variants are identical, but `default` is only used once.
- Evidence: `src/components/ui/button.tsx:13-14,35-37` and `src/features/home/components/quick-add-widget.tsx:183-184`.
- Impact: redundant API surface; encourages inconsistent naming.
- Recommendation: remove `default` or alias it explicitly in docs and standardize usage.

7) Minor — Variants defined but unused (`tertiary`, `success`, `error`).
- Evidence: defined in `src/components/ui/button.tsx:24-26`, no explicit usage in repo.
- Impact: dead design surface and extra maintenance.
- Recommendation: either remove unused variants or add real usage examples.

### Maintainability & Component Architecture
8) Major — Multiple FAB implementations with different behaviors.
- `src/components/ui/fab.tsx` (design system guidance, aria-label, semantic token warning).
- `src/components/ui/global-fab.tsx` (no `aria-label`, different hover/scale/shadow, different positioning).
- Impact: divergence in placement and behavior over time.
- Recommendation: consolidate to one FAB component or make `GlobalFAB` a thin wrapper around `FAB`.

9) Minor — `motion.button` used without base Button styling (focus ring, disabled styles, motion-pressable).
- Example: `src/components/onboarding-checklist.tsx:151-189`.
- Impact: interaction patterns diverge from design system.
  - Recommendation: apply `buttonVariants` or convert to `<Button asChild>` with motion wrapper.
  
### Close Button Standardization
10) Major — Close/X actions were implemented with bespoke `<Button variant="ghost" size="icon">` markup across sheets, dialogs, and prompts.
- Impact: duplicated spacing, missing `aria-label` defaults, and drifted hover/focus styles made overlays harder to audit.
- Recommendation: use the shared `CloseButton` (`src/components/ui/close-button.tsx`) so each overlay reuses the same 44×44 touch target, tokenized hover states, and localized `aria-label` instead of re-creating the class chain.

### Labels & Language
  10) Minor — Mixed language and labeling across primary CTAs.
- Example: `src/features/budgets/components/edit-budget-modal.tsx:203-222` uses English (“Save Changes”, “Delete”, “Cancel”) while surrounding UI is Indonesian.
- Impact: inconsistent UX voice.
- Recommendation: standardize language (ID/EN) per product spec.

## Recommendations (Summary)
- Enforce `aria-label` for icon-only Buttons (lint rule or test).
- Add `type="button"` to raw buttons and consider migrating to `Button`/`buttonVariants`.
- Consolidate FAB components and ensure accessibility parity.
- Add semantic variants or token utilities for “success/warning/danger” instead of raw palette values.
- Rationalize variant set (`default` vs `primary`, unused variants).
- Add a smaller icon size variant that preserves 44px hit area, or disallow `h-7/8/9/10` on icon buttons.

## Appendix A — Files using `<Button>`
(81 files) See inventory list from audit run.

## Appendix B — Files using raw `<button>`
(30 files)
- `src/app/(main)/budgeting/[id]/page.tsx`
- `src/app/(main)/plan/page.tsx`
- `src/app/(main)/profile/page.tsx`
- `src/app/(main)/transactions/page.tsx`
- `src/app/(main)/wealth/page.tsx`
- `src/components/bottom-navigation.tsx`
- `src/components/sidebar.tsx`
- `src/features/ai-chat/components/ai-chat-drawer.tsx`
- `src/features/ai-chat/components/rich-results/AnomalyAlertCard.tsx`
- `src/features/ai-chat/components/rich-results/InsightSummaryCard.tsx`
- `src/features/budgets/components/add-budget-modal.tsx`
- `src/features/budgets/components/edit-budget-modal.tsx`
- `src/features/charts/components/advanced-stats/saving-potential.tsx`
- `src/features/charts/components/analytics-dashboard.tsx`
- `src/features/charts/components/category-analysis.tsx`
- `src/features/charts/components/chart-lists.tsx`
- `src/features/charts/components/net-cashflow-chart.tsx`
- `src/features/goals/components/goal-list.tsx`
- `src/features/home/components/mobile-dashboard.tsx`
- `src/features/reminders/components/reminders-dashboard.tsx`
- `src/features/transactions/components/category-form.tsx`
- `src/features/transactions/components/category-picker-sheet.tsx`
- `src/features/transactions/components/form-partials/amount-input.tsx`
- `src/features/transactions/components/form-partials/dynamic-suggestions.tsx`
- `src/features/transactions/components/form-partials/semantic-review.tsx`
- `src/features/transactions/components/sub-category-sheet.tsx`
- `src/features/wallets/components/desktop-wallet-view.tsx`
- `src/features/wallets/components/wallet-card-stack.tsx`

## Appendix C — Files using `motion.button`
(6 files)
- `src/components/onboarding-checklist.tsx`
- `src/components/universal-add-sheet.tsx`
- `src/features/ai-chat/components/ai-chat-drawer.tsx`
- `src/features/home/components/mobile-dashboard.tsx`
- `src/features/insights/components/ai-briefing-card.tsx`
- `src/features/transactions/components/liquid-composer/MagicBar.tsx`

## Appendix D — Files using `role="button"`
- `src/components/help-tooltip.tsx`
- `src/features/wallets/components/add-wallet-modal.tsx`
