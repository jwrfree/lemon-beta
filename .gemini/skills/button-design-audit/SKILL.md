---
name: button-design-audit
description: Audit Button, FAB, and GlobalFAB components against Lemon Beta DS 1.5 standards. Use when checking for non-compliant button patterns, hardcoded colors, accessibility issues, or layout inconsistencies.
---

# Button Design Audit Skill

This skill provides a systematic workflow for auditing button-related components against the Lemon Beta Design System (DS 1.5).

## Core Standard

Buttons in Lemon Beta must prioritize **semantic tokens**, **consistent sizing**, and **accessibility**. Hardcoded colors and arbitrary radius/shadows are strictly prohibited.

## Workflow

1.  **Load Standards**: Read `references/button-standards.md` to refresh on allowed variants, sizes, and anti-patterns.
2.  **Scan for Anti-Patterns**: Run the `scripts/audit_buttons.cjs` script to identify common DS violations across the codebase.
    -   Usage: `node my-ai-skills/button-design-audit/scripts/audit_buttons.cjs [target_dir]`
3.  **Analyze Findings**: For each finding, determine the correct compliant pattern.
4.  **Propose Fixes**: Provide `diff` suggestions to the user for each non-compliant button.

## Guidance

### Common Fixes

- **Hardcoded Backgrounds**:
  - `bg-blue-600` → `bg-primary` or `variant="primary"`
  - `bg-purple-600` → `variant="volt"`
- **FAB Positioning**:
  - `bottom-24` → `bottom-[136px]` (Mobile nav clearance)
- **Radius**:
  - `rounded-2xl` → `rounded-full` (Buttons must be pills)
- **Accessibility**:
  - Icon-only buttons MUST have `aria-label`.

### FAB Checklist
- Is there only one FAB per page?
- Does it use the `<FAB>` component?
- Does it have the correct `bottom-[136px]` offset on mobile?

### Reference Material
For more detailed information, see [references/button-standards.md](references/button-standards.md).
