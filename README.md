# Lemon – Personal Finance Tracker

> **v2.5.1** · Complete Category Coverage Fix · February 2026

Lemon is a modern financial companion designed to help Indonesia's digital workers master their income, expenses, debts, and financial goals right from their pocket. Release v2.5.1 ensures all transaction categories are now available to all users.

## 🔥 Latest Update (v2.5.1)

**Critical Fix**: Added 8 missing expense categories and 1 income category to the database. All users now have access to the complete set of 26 transaction categories including Digital Subscriptions, Business & Productivity, Family & Children, and more. [Read more →](KATEGORI_FIX_README.md)

## ✨ Key Highlights & Recent Updates
- **Massive Merchant Map Expansion:** Hundreds of Indonesian (Pertamina, Richeese, Erigo, etc.) and global (AWS, OpenAI, Spotify, etc.) brands are now automatically detected with their official logos and colors.
- **Smart Keyword Recognition:** Not just brands! Lemon now detects product keywords like *"serum"*, *"bensin"*, *"servis motor"*, and *"pajak"* to auto-assign fitting visual branding.
- **Enterprise Desktop UI:** High-density, borderless "Command Center" aesthetic for the wallet and assets view, optimized for professional efficiency.
- **Balance Correction Tool:** One-tap reconciliation to sync app balances with real-world values via automated adjustment transactions.
- **Optimistic Updates:** Instant UI response (zero-latency) when recording transactions—balance numbers update before server confirmation completes.
- **AI Smart Add 2.0:** Super-fast recording with natural language now supports bulk transaction detection and granular sub-categories.

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
