# Agents

## Cursor Cloud specific instructions

### Architecture

Lemon is a single Next.js 16 (App Router + Turbopack) personal-finance PWA backed by Supabase (Postgres, Auth, Realtime). See `README.md` for the full tech stack and `docs/blueprint.md` for detailed flows.

### Running services

| Service | Command | Port |
|---|---|---|
| Next.js dev server | `npm run dev` | 3000 |
| Supabase (Postgres, Auth, etc.) | `npx supabase start` | 54321 (API), 54322 (DB), 54323 (Studio), 54324 (Mailpit) |

### Key gotchas

- **Missing base table migrations**: The repository's Supabase migrations assume core tables (`wallets`, `transactions`, `budgets`, `debts`, `goals`, `reminders`) already exist. A bootstrap migration `supabase/migrations/20260118000000_create_base_tables.sql` must be present for `npx supabase start` to succeed. If this file is missing, `supabase start` will fail with `relation "wallets" does not exist`.
- **Docker required**: Local Supabase runs via Docker containers. Docker must be installed and running before `npx supabase start`.
- **`.env.local` setup**: After `npx supabase start`, create `.env.local` with the Supabase URL, anon key, and service role key from `npx supabase status -o env`. See `README.md` "Local setup" section for the full template.
- **Email confirmation disabled locally**: The local Supabase config has `enable_confirmations = false`, so new accounts work immediately without email verification.
- **Lint**: `npm run lint` reports pre-existing warnings/errors in the codebase (not blocking for development).

### Standard commands

See `README.md` "Available scripts" table for `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, etc.
