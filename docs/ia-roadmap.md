# Information Architecture Roadmap

## Purpose

This document provides a strategic mapping of Lemon Beta's current Information Architecture (IA) and an actionable roadmap for evolving it. The goal is to address existing structural overlaps, clarify object ownership, and establish a scalable navigation model for future feature growth without requiring an immediate, disruptive redesign.

## 1. Current IA Summary

Lemon Beta currently operates on a standard 5-tab mobile-first navigation model:

1. **Home**: The operational dashboard. Provides immediate visibility into wallet balances, net cashflow, upcoming reminders, and quick-action triggers (Smart Add). Implementation handles `DesktopDashboard` and `MobileDashboard` through dynamic imports.
2. **Transactions**: The historical ledger. Features segmented views (All, Income, Expense, Transfers, Debts).
3. **Plan**: The "Planning Hub". **CRITICAL IMPLEMENTATION DETAIL**: This route (`/plan`) already exists as a unified surface on mobile, grouping Budgets, Goals, Debts, and Bills (Reminders) into a single segmented control.
4. **Insights/Analytics**: Split between `/charts` (Desktop sidebar) and components like `RiskScoreCard` or `AiBriefingCard` that consume the `UnifiedFinancialContext`.
5. **Secondary/Admin**: Profile (`/profile`), Settings (`/settings`), and utility routes like `/repair` or `/token-calculator`.

*Note on Navigation Discrepancy*: While mobile uses a streamlined 4-tab model (Home, Transactions, Plan, Profile), the desktop sidebar (`src/lib/sidebar-config.ts`) persists a flat, fragmented list where `Budgeting`, `Plan`, and `Target` (Goals) all occupy top-level slots, creating a more complex mental model for desktop users.

## 2. Current Object Map

The core domain objects and their current surfaces:

*   **Transactions**: Native to `/transactions`. Surfaces in Home (recent), Budgets (category breakdown), and Insights (trends).
*   **Wallets**: Structurally housed in More/Settings, but operationally native to Home (carousel).
*   **Budgets**: Native to `/budgeting`.
*   **Goals**: Structurally housed in More (`/goals`), representing long-term planning.
*   **Debts/IOUs**: Fragmented. Exists as a segmented view in `/transactions`, a status widget on Home, a detailed module in `/debts`, and heavily factors into Insights (Debt Health).
*   **Reminders**: Housed in More (`/reminders`). Operationally linked to Home (upcoming) and Transactions (convert to reminder).
*   **Assets & Liabilities**: Housed in More (`/assets-liabilities`).

## 3. Current IA Strengths

*   **Existing Unified Planning Hub**: The `/plan` route is a high-performing pattern that already conceptually unifies "Forward-Looking" objects. It just needs to be reinforced as the canonical home across all device types.
*   **Unified Data Service**: The `financial-context-service.ts` provides a `UnifiedFinancialContext` object, meaning the "Object Model" is already logically unified even where the "Navigational Model" is fragmented.
*   **Action-Oriented Dashboard**: The Home tab effectively consolidates the most critical "glanceable" information (wallet balances, cashflow) and primary actions (Smart Add), reducing time-to-task for daily logging.
*   **Modular Feature Implementation**: The underlying codebase (`src/features/*`) is highly decoupled, meaning routing and presentation can be adjusted without breaking business logic.


## 4. Current IA Risks / Overlap

The current structure has several scaling risks and conceptual overlaps:

*   **Mobile vs. Desktop Fragmentation**: The desktop sidebar exposes too many granular routes (`/goals`, `/budgeting`, `/debts`, `/reminders`) that are already consolidated under the `/plan` hub on mobile. This creates two different mental models for the same product.
*   **Debt Fragmentation**: Debts exist uneasily across multiple surfaces. Treating debts primarily as a "Transaction" subtype ignores the ongoing lifecycle, contract details (interest), and relationship (counterparty) aspects of a debt.
*   **Wallet Marginalization**: Despite being the central source of truth for funds, Wallet management lacks a clear canonical home, split between the Home carousel (interaction) and settings (management).
*   **Reminders Identity Crisis**: Reminders act both as a utility (a calendar tool) and a behavioral feature (push notifications, upcoming widgets).


## 5. Mental Model Framing

Users typically interact with personal finance tools through three primary conceptual lenses:

1.  **Tracking & Logging (The "Now" & "Past")**: "What did I spend?" (Home, Transactions, Wallets)
2.  **Planning & Forward-Looking (The "Future")**: "What am I aiming for?" (Budgets, Goals, Reminders)
3.  **Health & Optimization (The "Big Picture")**: "How am I doing overall?" (Insights, Net Worth, Debts)

The current IA forces users to jump between primary tabs and the "More" menu to complete a single mental loop (e.g., checking a Goal [More] vs checking a Budget [Primary Tab]).

## 6. Roadmap Direction

This roadmap proposes a phased approach to evolving the IA, ensuring smooth user transitions.

### Phase 1 — Clarify ownership inside current IA

*   **Action**: Consolidate desktop sidebar and clarify "Primary" vs "Contextual" routes.
*   **Tactics**:
    *   Align Desktop Sidebar with Mobile IA: Move `/goals`, `/budgeting`, `/debts`, and `/reminders` under a single "Planning" section in the sidebar that ideally points to the `/plan` hub.
    *   Establish the Home Wallet Carousel as the canonical entry point for Wallet configuration (using the `EditWalletModal` triggered from the carousel).

### Phase 2 — Formalize the "Planning" mental model

*   **Action**: Reinforce the `/plan` page as the "Source of Truth" for all non-ledger financial activity.
*   **Tactics**:
    *   Transition standalone routes like `/budgeting` to be sub-routes or tabs within the `/plan` context.
    *   Enhance the "Plan" hub to surface cross-domain insights (e.g., how achieving a "Goal" affects a "Budget").


### Phase 3 — Optimize Ledger Entry (COMPLETED)

*   **Action**: Unify the "Add" experience across all financial domains.
*   **Tactics**:
    *   Implemented the `UniversalAddSheet` as the central visual gateway for all transaction and planning entries.
    *   Integrated **Context Awareness** so that the hub intelligently highlights "Target" or "Hutang" based on the user's current location in the Plan Hub.
    *   Standardized the mobile "+" button to serve as the unified entry point for the entire Finance OS.

### Phase 4 — Introduce universal retrieval

*   **Action**: Reduce reliance on navigational hunting.
*   **Tactics**:
    *   Implement the planned Universal Search / Command Palette (Command+K / Omni-search). This allows power users to bypass the "More" menu entirely to find specific debts, reminders, or settings.

### Phase 5 — Evaluate intent-based primary navigation (Hypothesis)

*   **Action**: *Hypothesis mapping for future major version.* Shift to an IA based on the mental models outlined in Section 5.
*   **Tactics**:
    *   Consider a 4-tab model: **Dashboard** (Home + Wallets), **Activity** (Transactions + Reminders), **Plan** (Budgets + Goals), and **Wealth** (Assets + Debts + Insights). Settings and Profile remain as supplementary top-bar actions.

## 7. Recommended Canonical Ownership Model

To prevent future fragmentation, new feature development should abide by this ownership matrix:

| Object | Canonical Home | Can surface elsewhere? |
| :--- | :--- | :--- |
| **Transactions** | `/transactions` | Home (recent), Budgets (breakdown) |
| **Wallets** | Home Carousel | Transfer flows, Smart Add forms |
| **Budgets** | `/budgeting` (or `Plan`) | Home (status widget), Insights |
| **Goals** | `/budgeting` (or `Plan`) | Home (progress widget) |
| **Debts** | `/debts` | Insights (health), Transactions (payments) |
| **Reminders** | `/reminders` | Home (upcoming), Debts/Goals (linked triggers) |
| **Assets/Liabilities** | `/assets-liabilities` | Insights (Net Worth calculations) |

## 8. Prioritized UX Recommendations

1.  **Elevate Goals**: Move Goals out of "More" and integrate them visually alongside Budgets. Users need a holistic view of where their money is designated to go.
2.  **Centralize Debt Logic**: Stop treating Debts primarily as transactions. Define Debts as standalone entities (contracts) that *generate* transactions (payments/loans). The primary entry point for a user checking their debt should be the Debt module, not the ledger.
3.  **Streamline Wallet Editing**: Add a direct "Manage Wallets" or "Edit" affordance inside the Home Wallet carousel to eliminate the need to hunt for wallet settings in the More tab.
4.  **Repurpose "More"**: Transition "More" to strictly contain Account Configuration (Profile, Security, Data export, Support). Move financial domains (Assets, Goals, Reminders) into their canonical functional areas.

## 9. Suggested Success Criteria

Before moving forward with substantial IA changes (Phase 2 and beyond), validate the hypotheses against these metrics and questions:

*   **Validation Questions**:
    *   Do users understand the difference between logging a "Debt" transaction vs updating a "Debt" entity?
    *   Are users discovering "Goals" and "Assets" in the "More" tab, or is adoption lagging compared to Budgets?
*   **Success Metrics**:
    *   Increased feature adoption for Goals and Assets/Liabilities.
    *   Reduced time-to-task for modifying Wallet settings.
    *   Fewer abandoned user flows when adjusting recurring Reminders or Debt payments.

## 10. Recommendation Summary

Lemon Beta's current IA is robust and highly actionable for daily tracking, but it faces scaling risks as wealth-building features (Goals, Debts, Assets) grow. The primary recommendation is **not** an immediate structural redesign, but a staged clarification. By unifying Budgets and Goals into a single "Plan" context, giving Debts dedicated canonical ownership outside the transaction ledger, and clearing the "More" tab of financial entities, the application can scale elegantly while maintaining its fast, familiar, mobile-first experience.
