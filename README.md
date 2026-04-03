# Lemon – Personal Finance Tracker

Lemon is a mobile-first personal finance PWA for tracking income, expenses, debts, savings goals, and net worth. It is built on Next.js (App Router) with Supabase as the backend and uses two AI providers (DeepSeek V3 and Google Gemini) to power natural-language transaction entry and weekly spending insights.

The primary audience is Indonesian digital workers who want a single place to manage multiple wallets, recurring debts, and category budgets — accessible from any device without installing a native app.

---

## How the system fits together

```
Browser / PWA
└── Next.js App Router (src/app)
    ├── Route handlers (src/app/api)       — auth, AI proxy, logo lookup, PWA icons
    ├── Feature modules (src/features)     — transactions, budgets, debts, goals, wallets …
    └── AI flows (src/ai/flows)            — Genkit-based pipelines (see below)

Supabase
├── Auth      — email + optional WebAuthn (passkey) via @simplewebauthn/server
├── Database  — Postgres with RLS; schema bootstrapped by supabase/migrations
└── Realtime  — used for optimistic balance updates

AI pipeline
├── DeepSeek V3 (DEEPSEEK_API_KEY)  — Lemon Coach chat + transaction text extraction (Smart Add)
└── Google Gemini (GEMINI_API_KEY)  — weekly insights, receipt scanning, debt/subscription audits
    └── orchestrated with Genkit flows (src/ai/flows)
```

Lemon Coach chat orchestration now runs through a thin `/api/chat` route into `src/ai/router.ts`, `src/ai/planner.ts`, and action handlers in `src/ai/actions/`, so auth/rate limiting stay at the edge while routing and execution logic live in dedicated modules.
Chat-side transaction mutations also share the same internal tool/action layer in `src/ai/tools.ts` and the RPC-backed transaction service, so add, update, and delete no longer use separate mutation paths.
Delete requests now require a staged server-side confirmation before the RPC-backed delete path can run, so destructive chat actions are guarded in code instead of relying on prompt instructions alone.
Lemon Coach sessions now persist in `public.chat_sessions` with `session_id`, `user_id`, `messages`, `memory_summary`, `created_at`, and `updated_at`. The client reloads the latest stored turns when chat opens, older turns are compacted into `memory_summary`, and the clear-chat button deletes the persisted session before starting a fresh one.
Lemon Coach also exposes a typed app-action bridge through the `app_action` tool so assistant replies can attach clickable chips for navigation, opening forms, or highlighting relevant UI sections without changing the `/api/chat` transport contract.
Assistant text responses are now normalized into a typed `<response>{...}</response>` envelope with `text`, `components`, `actions`, and `suggestions`, while the client still keeps a backward-compatible fallback for older plain-text and legacy tag-based replies.

**Optimistic updates:** balance totals are written to local state immediately on transaction save; Supabase confirms in the background. No Realtime subscription is needed for the happy path.

**Offline support:** a service worker caches the shell so previously visited pages load without a network. The app also restores the last successful snapshots for wallets, reminders, debts, and range-based transaction lists from local storage to make relaunches faster and keep recent data visible while offline. Write operations are not queued offline.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| Backend | Supabase (Auth, Postgres, Realtime) |
| AI – extraction | DeepSeek V3 via `@ai-sdk/deepseek` |
| AI – insights | Google Gemini via `@google/generative-ai` + Genkit |
| Auth extras | WebAuthn passkeys via `@simplewebauthn/server` |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion (respects `prefers-reduced-motion`) |
| Testing | Vitest + Testing Library |
| Deployment | Firebase App Hosting (`apphosting.yaml`) |

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root. Required variables:

```bash
# Supabase – required for all authentication and data operations
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-side admin calls only

# AI – at least one is needed to use AI features
DEEPSEEK_API_KEY=<key>                         # Lemon Coach chat + Smart Add transaction extraction
GEMINI_API_KEY=<key>                           # Insights, receipt scan, audits

# WebAuthn / passkey (biometric auth)
NEXT_PUBLIC_ORIGIN=http://localhost:3000       # must match the browser origin exactly
NEXT_PUBLIC_RP_ID=localhost                    # relying-party ID (domain without port)
NEXT_PUBLIC_RP_NAME=Lemon App

# Optional – logo lookup for merchant branding
NEXT_PUBLIC_LOGO_DEV_KEY=<key>
```

The app builds and runs without AI keys, but DeepSeek-backed Lemon Coach chat and Smart Add now fail explicitly when DEEPSEEK_API_KEY is missing. Gemini-backed insight features will also return errors until GEMINI_API_KEY is provided. Supabase variables are required for login to work.

### 3. Apply the database schema

```bash
# Start a local Supabase instance (Docker required)
npx supabase start

# Apply all migrations
npx supabase db push
```

The canonical schema lives in `supabase/migrations`. `supabase/reference/SUPABASE_SETUP.sql` and `supabase/reference/SUPABASE_RPC.sql` document the Postgres functions and triggers used for balance integrity and atomic ownership checks.

### 4. Run the development server

```bash
npm run dev          # Next.js dev server with Turbopack
```

Open [http://localhost:3000](http://localhost:3000). Register an account — email verification is required before the dashboard is accessible.

---

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run genkit:dev` | Start Genkit developer UI for inspecting AI flows |

---

## Key modules

| Path | What lives there |
| --- | --- |
| `src/features/` | One folder per domain: `transactions`, `budgets`, `debts`, `goals`, `wallets`, `insights`, `reminders`, `assets`, `auth` |
| `src/ai/flows/` | Genkit flows: `extract-transaction`, `generate-insight`, `scan-receipt`, `audit-debts`, `audit-subscriptions`, `suggest-category`, `count-tokens` |
| `src/lib/supabase/` | Supabase client helpers for browser, server, middleware, and admin contexts |
| `src/lib/config.ts` | Single file that reads all environment variables — add new ones here |
| `src/lib/categories.ts` | Source of truth for the default transaction categories |
| `supabase/migrations/` | Ordered Postgres migrations; run via `supabase db push` |

---

## Documentation

- [Docs Index](./docs/README.md) – overview of standards, audits, and feature-specific docs
- [Product Blueprint](./docs/blueprint.md) – information architecture, detailed flows, and motion specs
- [Design System](./docs/standards/DESIGN_SYSTEM.md) – typography scale, color palette, spacing rules
- [Complexity Control Guide](./docs/complexity-control-guide.md) – guardrails for information density
- [UX Writing Guide](./docs/standards/UX_WRITING_GUIDE.md) – microcopy style guide
- [Design Audit](./docs/design-audit.md) – heuristic evaluation and full flow assessment
- [Category Fix Docs](./docs/categories-fix/DOCS_INDEX.md) – grouped documentation for the v2.5.1 category migration
- [Changelog](./CHANGELOG.md) – version history

---

Feel free to open an issue or pull request. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
