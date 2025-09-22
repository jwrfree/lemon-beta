# Lemon Mobile Blueprint

## 1. Product Vision
Lemon is a mobile-first personal finance companion that helps digital workers and independent earners stay on top of their cash flow, budgets, savings goals, and financial obligations. The app prioritizes single-handed use with swift interactions, accessible typography, and contextual insights powered by AI.

## 2. Mobile Experience Principles
- **Thumb-friendly layout**: Primary actions are anchored in the lower half of the screen within a 44–56 px touch target area.
- **Glanceable hierarchy**: Key balances and budget health indicators appear above the fold with large numerals and color-coded chips.
- **Adaptive elevation**: Cards use subtle borders and layered blurs instead of heavy shadows to maintain contrast in both light and dark modes.
- **Predictable navigation**: A 5-tab bottom navigation bar surfaces Home, Transactions, Budgets, Insights, and More.
- **Haptic feedback**: Important confirmations (transaction saved, reminder snoozed) trigger light haptics to reinforce actions.

## 3. Information Architecture
1. **Home**
   - Wallet stack carousel with swipe gestures.
   - Today’s highlights: net cash flow, reminders due, upcoming debt payments.
   - Quick actions: Catat Cepat, Add Reminder, Log Debt/Payment.
2. **Transactions**
   - Sticky segmented controls (All, Income, Expense, Transfers, Debts).
   - Infinite scroll grouped by relative date labels.
   - Search and advanced filters tucked behind a floating sheet.
3. **Budgets**
   - Monthly overview with progress rings per category.
   - Budget suggestions from AI with accept/dismiss cards.
4. **Insights**
   - AI-generated summaries, category distribution charts, and trend comparisons.
   - Debt health widget (total owed vs. owed to you).
5. **More**
   - Profile, Security (biometrics), Reminders calendar view, Data import/export, Settings.

## 4. Core Flow Designs
### 4.1 Transaction Logging
- **Entry**: Floating "Catat" button opens a bottom sheet with tabs for Manual and Catat Cepat (AI).
- **Fields**: Amount keypad, type toggle, wallet, category > sub-category, date, notes, tags, optional location/store.
- **Smart defaults**: Wallet defaults to last used per device; date defaults to today; AI suggestions pre-fill category & tags.
- **Feedback**: Animated counter updates on the Home header, with undo snackbar and accessible toast.

### 4.2 Wallet Management
- Card stack on Home with left/right swipe to focus a wallet.
- Tapping a card opens wallet detail with transaction list, transfer button, and limits.
- Wallet creation/edit uses stepper modal optimized for portrait orientation.

### 4.3 Smart Reminders (New)
- **Use cases**: Bill due dates, savings transfers, subscription renewals, follow-up on pending reimbursements.
- **Entry points**: Quick action on Home, "Reminders" list, or contextually when logging a transaction or debt.
- **Reminder types**: One-time, recurring (daily/weekly/monthly/custom interval), payback countdown (linked to a debt).
- **Form fields**: Title, link to wallet/category/debt, amount, due date, reminder schedule, notification channel (push, email), optional notes.
- **Reminder center**: Calendar + list view with filters (All, Upcoming, Snoozed, Completed). Users can mark complete, snooze (custom intervals), or skip.
- **Notifications**: Push notifications include quick actions (Mark paid, Snooze). Missed reminders escalate with summary digest in Insights tab.

### 4.4 Comprehensive Debt & IOU Tracking (New)
- **Debt types**: Money you owe (Loans), money owed to you (IOUs), shared expenses (Split Bills).
- **Creation flow**: Accessible from Transactions tab or Home quick action.
  - Amount keypad with currency support.
  - Counterparty selector (from contacts or manual entry) with avatar initials.
  - Classification: personal, business, household.
  - Start date, due date, interest rate, repayment frequency, collateral notes.
  - Optional attachment (photo of agreement/receipt).
- **Debt detail screen**:
  - Summary card: outstanding balance, next payment, progress bar toward payoff.
  - Timeline: chronological list of payments, adjustments, reminders.
  - Actions: Log payment, add note, convert to recurring reminder, settle debt.
- **Automation**: Payments logged via Catat Cepat auto-link to existing debts when the counterparty and amount match.
- **Insights**: Debt health widget in Insights tab shows trends, interest projections, and risk alerts when payments are overdue.

## 5. Interaction Specs
- Bottom sheets have rounded 24 px corners, drag handle, and expand to 80% height on swipe-up.
- Primary buttons use accent teal (#008080) with 16 px radius; secondary buttons use outline style.
- Animations follow a 0.2 s ease-out curve, with 0.1 s stagger for list items.
- Voice input is accessible via microphone icon near the amount field.

## 6. Data Model Considerations
- **Reminders collection**
  - `title`, `userId`, `type`, `targetType` (transaction, debt, standalone), `targetId`, `amount`, `dueDate`, `repeatRule`, `status`, `snoozeCount`, `channels`, `createdAt`, `updatedAt`.
- **Debts collection**
  - `userId`, `direction` (owed / owing), `counterparty`, `contactId`, `principal`, `outstandingBalance`, `interestRate`, `interestType`, `paymentFrequency`, `nextPaymentDate`, `endDate`, `status`, `notes`, `attachments`, `createdAt`, `updatedAt`.
- **DebtPayments sub-collection**
  - `amount`, `paymentDate`, `method`, `walletId`, `notes`, `createdBy`.
- Index reminders by `userId + dueDate` for chronological queries and by `userId + status` for quick filters.

## 7. AI & Automation Hooks
- Catat Cepat output extended with classification tags: `reminderIntent` and `debtMatchScore`.
- AI summarizer generates weekly digest summarizing top overspending categories, upcoming reminders, and at-risk debts.
- Use Firebase Cloud Functions to schedule reminder push notifications and recalibrate debt projections nightly.

## 8. Accessibility & Localization
- Support Bahasa Indonesia as primary language with expandable strings for future locales.
- Ensure text alternatives for icons, voice-over labels for gestures, and high-contrast color tokens for WCAG AA compliance.
- Numbers and currency formatted according to user locale; due dates use relative phrasing ("Besok", "3 hari lagi").

## 9. Success Metrics
- Reminder completion rate ≥ 80% for active users.
- 25% reduction in missed debt payments compared to pre-feature baseline.
- Session-to-transaction conversion rate ≥ 60% on mobile within 4 taps.

## 10. Roadmap Notes
- Phase 1: Implement reminders MVP with push notifications and link to debts/transactions.
- Phase 2: Release debt tracking with payment timeline and integrations into Insights.
- Phase 3: Introduce shared debts with invited contacts and collaborative reminders.
- Phase 4: Explore predictive reminders based on historical spending and upcoming bills detected by AI.
