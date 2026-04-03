# Information Architecture Roadmap

## Purpose
This document maps Lemon's current information architecture, identifies overlap between key finance objects, and proposes a forward roadmap to keep the product scalable without increasing navigation complexity.

It is intended as a product, UX, and frontend alignment document for future planning rather than an immediate restructuring mandate.

---

## 1. Current IA Summary

### Public layer
- Landing
- Authentication
  - Login
  - Sign up
  - Forgot password
  - Email verification
  - Optional biometric enrollment

### App shell
Primary bottom navigation:
- Home
- Transactions
- Budgets
- Insights
- More

### Current role of each primary area
- **Home** — daily command center for balances, quick actions, and urgent financial signals.
- **Transactions** — ledger and historical activity feed.
- **Budgets** — spending control, category performance, and goal-related planning.
- **Insights** — interpretation layer for trends, health, and AI summaries.
- **More** — secondary modules, configuration, support, and utilities.

---

## 2. Current Object Map

The product now contains these major domain objects:
- Transactions
- Wallets
- Budgets
- Goals
- Debts / IOUs
- Reminders
- Assets & liabilities
- Insights
- Account / security / support

### Current object-to-navigation relationship
| Object | Primary visibility today | Notes |
| --- | --- | --- |
| Transactions | Transactions, Home | Clear ownership |
| Wallets | Home, desktop views | Operationally important, but no strong standalone home in primary nav |
| Budgets | Budgets | Clear ownership |
| Goals | Budgets | Closely related to planning, but distinct mental model |
| Debts / IOUs | Home, Transactions, Insights | High-value object with distributed ownership |
| Reminders | Home entry points, More | Important behavior feature, but hidden structurally |
| Assets & liabilities | More, Insights | Data entry in one place, analysis surfaced elsewhere |
| Insights | Insights | Clear ownership |

---

## 3. Current IA Strengths

1. **Clear 5-tab foundation**
   - The current shell is easy to understand and mobile-friendly.
   - Home, Transactions, Budgets, and Insights each map to a recognizable user intent.

2. **Strong command-center model on Home**
   - Wallet visibility + quick actions support fast daily use.

3. **Good separation between operational and analytical layers**
   - Transactions/Budgets handle operational input and control.
   - Insights handles interpretation and review.

4. **Scalable shell for beta-stage expansion**
   - The current IA supports growth without forcing premature full re-architecture.

---

## 4. Current IA Risks

### 4.1 Distributed ownership of debts
Debts currently appear across multiple areas:
- Home highlights
- Transactions segmented views
- Insights (debt health)
- Quick actions

**Risk:** users may not understand where debt “lives” as an object.

### 4.2 Reminders are behaviorally important but structurally secondary
Reminders can be created from Home and other workflows, but their management center sits under More.

**Risk:** high-retention utility, low navigational prominence.

### 4.3 Goals are nested too tightly under Budgets
Goals and Budgets both belong to financial planning, but they represent different user intent:
- **Budgets** = controlling current outflow
- **Goals** = moving toward a future target

**Risk:** users may confuse limit-based planning with target-based planning.

### 4.4 Wallets are critical but under-homed
Wallets are central to daily operations, yet mostly anchored to Home rather than a clearly defined information space.

**Risk:** strong daily visibility, weaker structural findability.

### 4.5 More is becoming a catch-all bucket
More currently includes a mix of:
- financial utilities
- settings
- support
- tooling / experiments

**Risk:** reduced scanability and weaker long-term IA discipline.

---

## 5. Mental Model Framing

Lemon is increasingly operating across five user-intent layers:

1. **Capture**
   - Add transaction
   - Scan receipt
   - Create debt
   - Create reminder

2. **Monitor**
   - Wallet balances
   - Upcoming reminders
   - Debt status
   - Daily cashflow

3. **Control / Plan**
   - Budgets
   - Goals
   - Reminder scheduling

4. **Understand**
   - Insights
   - Trends
   - AI summary
   - Subscription and debt analysis

5. **Configure / Administer**
   - Profile
   - Security
   - Import/export
   - Help
   - Feedback

This framing suggests the product is outgrowing a purely feature-based IA and is moving toward an intent-based IA.

---

## 6. Roadmap Direction

### Phase 1 — Clarify ownership inside the current IA
**Goal:** improve clarity without changing the 5-tab shell.

#### Recommended actions
1. Define and document the “home” of each key object.
2. Group More into clearer subsections:
   - **Manage Money**
     - Assets & Liabilities
     - Reminders
   - **Account**
     - Profile
     - Security
     - Data
   - **Support**
     - Help
     - Feedback
     - Changelog
   - **Tools / Labs**
     - AI Token Calculator
3. Clarify copy across the app so objects with distributed visibility still have one canonical ownership model.
4. Strengthen entry points from Home into the canonical management screens for reminders, debts, and wallets.

#### Expected outcome
- Lower ambiguity without destabilizing the current navigation model.

---

### Phase 2 — Reduce overlap between planning objects
**Goal:** distinguish control, target, and follow-up behaviors more clearly.

#### Recommended actions
1. Treat **Budgets** and **Goals** as sibling planning modes rather than one being visually subordinate to the other.
2. Reframe **Reminders** as part of planning behavior, not just a utility hidden in More.
3. Ensure debt-related reminders and budget-related goals use consistent object language.
4. Audit screen titles, CTA labels, and section headers so the planning layer is conceptually aligned.

#### Expected outcome
- Better mental separation between:
  - spending limits
  - future targets
  - scheduled follow-up

---

### Phase 3 — Introduce universal retrieval
**Goal:** reduce findability pressure on navigation.

#### Recommended actions
1. Add universal search / command palette for:
   - transactions
   - reminders
   - debts
   - wallets
   - contacts (future)
2. Support both lookup and action initiation:
   - “Find transaction”
   - “Open wallet”
   - “Create reminder”
3. Use search as an IA relief valve so not every object needs stronger persistent nav presence.

#### Expected outcome
- Faster access for power users.
- Reduced dependency on exact tab memory.

---

### Phase 4 — Evaluate intent-based primary navigation
**Goal:** prepare for a future nav model if feature breadth continues to grow.

A future candidate structure:
- **Home**
- **Activity**
- **Plan**
- **Insights**
- **More**

#### Rationale
- **Activity** can unify transactions, transfers, and debt payment history.
- **Plan** can unify budgets, goals, and reminders.
- This structure better reflects user intent:
  - what happened
  - what I plan to do
  - what it means

#### Important note
This should be treated as a future validation hypothesis, not a short-term restructuring commitment.

#### Expected outcome
- A more scalable IA if Lemon grows into a broader financial operating system.

---

## 7. Recommended Canonical Ownership Model

This model can be adopted before any nav redesign:

| Object | Canonical home | Can surface elsewhere? |
| --- | --- | --- |
| Transactions | Transactions | Yes — Home, Insights |
| Wallets | Home / dedicated wallet management entry | Yes — transaction forms, desktop dashboards |
| Budgets | Budgets | Yes — Home, Insights, AI |
| Goals | Budgets (as sibling planning mode) | Yes — Home, AI, reminders |
| Debts / IOUs | Dedicated debt detail / management flow | Yes — Transactions, Home, Insights |
| Reminders | Reminder center | Yes — Home, budgets, debt flows |
| Assets & liabilities | More > Manage Money | Yes — Insights |
| Insights | Insights | No change needed |

---

## 8. Prioritized UX Recommendations

### Highest priority
1. Add stronger structural grouping inside More.
2. Clarify canonical ownership of debts, reminders, and wallets.
3. Separate budgeting and goals more explicitly in UI language.

### Medium priority
4. Add wallet orientation aids (indicators, list fallback, quick switch).
5. Add universal search / command palette.
6. Improve Home hierarchy so it remains focused on “today” rather than becoming a full system index.

### Lower priority / strategic
7. Validate whether an intent-based navigation model outperforms the current feature-based shell.
8. Consider whether reminders deserve stronger primary navigation presence in a later release.

---

## 9. Suggested Success Criteria

The IA roadmap should be judged by behavioral clarity, not only visual polish.

### Signals to watch
- Faster first-week task completion for new users
- Lower confusion around where to manage debts and reminders
- Reduced support questions about where features live
- Increased repeat use of reminders and goals
- Better retrieval speed for past records

### Qualitative questions for validation
- “Where would you go to manage a debt?”
- “Where would you go to check what needs attention today?”
- “What is the difference between budgets, goals, and reminders?”
- “If you wanted to find an old transaction quickly, where would you start?”

---

## 10. Recommendation Summary

Lemon's current IA is strong enough for the current beta stage, but the product is beginning to outgrow a simple feature-bucket structure.

The next roadmap should not start with a full nav redesign.
It should start with:
1. clearer ownership,
2. better grouping,
3. stronger retrieval,
4. then validation of an intent-based model.

This preserves current stability while preparing the product for broader financial workflows over time.
