# Lemon – Personal Finance Tracker

> **v2.3.1** · Patch Release · February 2021

Lemon is a modern financial companion designed to help Indonesia's digital workers master their income, expenses, debts, and financial goals right from their pocket. Release v2.3.1 delivers a critical **"Data Integrity & Atomic Sync"** patch.

## ✨ Key Highlights & Recent Updates
- **Security & Balance Integrity:** Moving critical logic to database triggers and RPCs to ensure 100% accurate balances and resource ownership.
- **Deep Financial Analytics:** 4 new data layers: *Net Worth Trend* (6-month tracking), *Saving Potential* (Efficiency metrics), *Behavior Analytics* (Weekday vs Weekend patterns), and *Subscription Audit*.
- **Premium UI/UX Fidelity:** Implementation of *Skeleton Screens*, *Haptic Feedback*, and success celebration animations providing a "High-End" app sensation.
- **Optimistic Updates:** Instant UI response (zero-latency) when recording transactions—balance numbers update before server confirmation completes.
- **Elite PWA Experience:** Self-install support via an elegant "Install Lemon" module in settings and a robust offline mode.
- **Modular Architecture (Clean Code):** Major refactoring of transaction modules into *Service Layers* and *Custom Hooks* for long-term reliability.
- **AI Smart Add 2.0:** Super-fast recording with natural language now supports bulk transaction detection and granular categories (Sub-Categories).
- **Desktop UI/UX Overhaul (Assets & Wallets):** Redesigned desktop asset management page with gradient summary cards and enterprise-grade visual hierarchy.

*For complete technical details, please see [CHANGELOG.md](./CHANGELOG.md).*

## 🧭 Key User Flows
| Flow | Summary |
| --- | --- |
| **Onboarding & Activation** | Landing → CTA → Sign Up/Login modal → Email verification → Optional biometric setup → Dashboard. |
| **Quick Transaction Entry** | "Record" quick action → Select Manual/AI → Fill details → Save → Toast notification + Balance counter update. |
| **Smart Reminders** | Create reminder from quick action/tab → Select frequency & channel → Reminder Center → Notifications & snooze. |
| **Debt & IOU** | comprehensive Debt/Receivable forms → Payment timeline → Integration with reminders & Debt Health insights. |
| **Budgeting** | Category ring progress, AI recommendations, and real-time target adjustments. |
| **Insights** | AI Weekly Digest, category trends, expense distribution, and actionable recommendations. |

## 🎨 Design Principles & Accessibility
- Consistent typography scale and color palette (teal/lemon) with AA contrast ratios.
- 4/8 px spacing system, 16–32 px radii, and soft shadows to maintain hierarchy without clutter.
- Clear focus rings, skip links, and nav anchors support keyboard navigation.
- All animations use a standard 0.28s ease-out and respect `reduced-motion` preferences.
- Error & success alerts use `aria-live`, decorative illustrations are marked `aria-hidden`.

## 📚 Documentation
- [Design Audit](./docs/design-audit.md) – Heuristic summary, design system, and full flow evaluation.
- [Product Blueprint](./docs/blueprint.md) – Information architecture reference, detailed flows, motion specs, and roadmap.
- [Complexity Control Guide](./docs/complexity-control-guide.md) – Mandatory guardrails for information architecture and UI density.
- [Changelog](./CHANGELOG.md) – History of feature updates and technical improvements.
- [UX Writing Guide](./UX_WRITING_GUIDE.md) – Style guide for microcopy.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **UI:** Tailwind CSS & shadcn/ui
- **Backend:** Supabase (Auth, Database, Realtime)
- **AI:** DeepSeek V3 (Core Extraction), Google Gemini & Genkit (Insights)
- **Form & Validation:** React Hook Form & Zod
- **Animations:** Framer Motion (with `prefers-reduced-motion` support)

## 🚀 Running Locally
1. Clone this repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
5. Set up your own Firebase configuration in environment variables before testing authentication.

Happy financial tidying! Feel free to open an issue or pull request for further ideas.
