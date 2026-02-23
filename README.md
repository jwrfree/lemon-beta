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
├── DeepSeek V3 (DEEPSEEK_API_KEY)  — transaction text extraction (Smart Add)
└── Google Gemini (GEMINI_API_KEY)  — weekly insights, receipt scanning, debt/subscription audits
    └── orchestrated with Genkit flows (src/ai/flows)
```

**Optimistic updates:** balance totals are written to local state immediately on transaction save; Supabase confirms in the background. No Realtime subscription is needed for the happy path.

**Offline support:** a service worker caches the shell so previously visited pages load without a network. Write operations are not queued offline.

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
DEEPSEEK_API_KEY=<key>                         # Smart Add transaction extraction
GEMINI_API_KEY=<key>                           # Insights, receipt scan, audits

# WebAuthn / passkey (biometric auth)
NEXT_PUBLIC_ORIGIN=http://localhost:3000       # must match the browser origin exactly
NEXT_PUBLIC_RP_ID=localhost                    # relying-party ID (domain without port)
NEXT_PUBLIC_RP_NAME=Lemon App

# Optional – logo lookup for merchant branding
NEXT_PUBLIC_LOGO_DEV_KEY=<key>
```

The app builds and runs without AI keys; Smart Add and Insights will return errors until they are provided. Supabase variables are required for login to work.

### 3. Apply the database schema

```bash
# Start a local Supabase instance (Docker required)
npx supabase start

# Apply all migrations
npx supabase db push
```

The canonical schema lives in `supabase/migrations`. `SUPABASE_SETUP.sql` and `SUPABASE_RPC.sql` document the Postgres functions and triggers used for balance integrity and atomic ownership checks.

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

- [Product Blueprint](./docs/blueprint.md) – information architecture, detailed flows, and motion specs
- [Design System](./docs/DESIGN_SYSTEM.md) – typography scale, color palette, spacing rules
- [Complexity Control Guide](./docs/complexity-control-guide.md) – guardrails for information density
- [UX Writing Guide](./docs/UX_WRITING_GUIDE.md) – microcopy style guide
- [Design Audit](./docs/design-audit.md) – heuristic evaluation and full flow assessment
- [Changelog](./CHANGELOG.md) – version history

---

Feel free to open an issue or pull request. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
