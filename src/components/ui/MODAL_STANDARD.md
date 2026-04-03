# DS-1 Modal Standard

Use one modal primitive per interaction type so motion, dismissal, and accessibility stay predictable across the app.

## Preferred hierarchy

- `Sheet` with `side="bottom"`
  - Use for mobile-first create and edit flows.
  - Backdrop tap closes through `onOpenChange`.
  - Swipe-to-dismiss is attached locally with `useSwipeable` when the flow should match native bottom-sheet behavior.
- `AlertDialog`
  - Use for destructive confirmations and irreversible actions.
  - Keep the primary action explicit and secondary action non-destructive.
- `Dialog`
  - Use for desktop-centered informational or settings flows that are not mobile-first bottom sheets.

## DS-1 migration scope

- Migrated to `Sheet` in this sprint:
  - add wallet
  - edit wallet
  - add budget
  - edit budget
- Existing transaction sheets already follow this pattern and remain the reference implementation.

## Legacy exceptions

- Auth panels are still legacy custom modal shells in DS-1.
- Keep them as-is until the broader modal consolidation sprint so this stabilization pass stays scoped to the critical finance flows.
