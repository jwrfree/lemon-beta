# Button Design Audit Plan

## Objective
Create a specialized Gemini CLI skill to audit button-related components (`Button`, `FAB`, `GlobalFAB`) against the Lemon Beta Design System (DS 1.5).

## Scope
-   **Target Components**: `src/components/ui/button.tsx`, `src/components/ui/fab.tsx`, `src/components/ui/global-fab.tsx`.
-   **Key Standards**: DS §4.1 (Button), §4.2 (FAB), §8 (Interaction Tokens), §11 (Error states).

## Proposed Skill: `button-design-audit`

### 1. Reusable Resources
-   **`references/button-standards.md`**: Detailed mapping of allowed variants, sizes, and interaction tokens derived from `docs/standards/DESIGN_SYSTEM.md`.
-   **`scripts/audit_buttons.cjs`**: A script that uses `grep` or AST analysis (if possible with simple node scripts) to find non-compliant button patterns.
-   **`assets/compliant-examples.tsx`**: Snippets of perfectly compliant buttons for reference.

### 2. Audit Workflow
1.  **Detect**: Identify all usages of `Button`, `FAB`, and `GlobalFAB` in the codebase.
2.  **Verify**: Check each usage against:
    -   Variant validity (only DS-approved variants).
    -   Size compliance (touch targets, standard heights).
    -   Class overrides (detecting hardcoded colors/radius/shadows).
    -   Accessibility (aria-labels for icon-only buttons).
    -   Context (one primary CTA rule, position for FAB).
3.  **Report**: Categorize findings by severity (Critical/High/Medium/Low) with diff suggestions.

## Implementation Steps
1.  **Initialize**: `node .../init_skill.cjs button-design-audit --path my-ai-skills`
2.  **Populate References**: Extract button-specific rules from `docs/standards/DESIGN_SYSTEM.md` into `references/button-standards.md`.
3.  **Develop Script**: Create a basic Node.js script to scan files for common anti-patterns (e.g., `bg-blue-600` on a Button).
4.  **Draft SKILL.md**: Write the imperative instructions for the auditor agent.
5.  **Package & Install**: Run `package_skill.cjs` and install to `workspace` scope.

## Verification
-   Run the skill on `src/features/transactions/components/unified-transaction-sheet.tsx` (known to have non-standard buttons).
-   Run the skill on `src/components/ui/button.tsx` itself.
