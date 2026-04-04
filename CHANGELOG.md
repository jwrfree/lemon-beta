# Changelog

All updates and improvements to the Lemon app will be documented here.

## [Version 2.6.0] - 3 April 2026
	
### Added
- **Batch Budget Creation**
  - Added support for selecting multiple sub-categories when creating a budget.
  - Automatically creates separate budget cards for each selected sub-category with the same target amount (Batch Creation).
  - Added visual counters and naming hints (`{Name} – {Sub}`) to inform users of the batch process.

### Changed
- **Premium Iconography Migration**
  - Migrated the entire category icon system from `lucide-react` to `@phosphor-icons/react` for a more consistent and premium "Volt Fintech" aesthetic.
  - Updated `category-utils.ts` and associated components to support Phosphor icon weights (`regular` and `duotone`).
- **Refined Category Selection UI**
  - Implemented semantic color mapping (`cat.color` and `cat.bg_color`) into the category selection grid.
  - Added "Liquid" visual states: icons now transition from `regular` to `duotone` weight when selected for better tactile feel.
  - Removed aggressive `uppercase` and `tracking-widest` styling from category labels and sub-category chips to improve readability.
  - Optimized grid layout by removing hard borders in favor of background elevation and soft shadows.
- **Smart Budget Insights**
  - Updated recommendation logic to provide sub-category specific spend averages only when a single sub-category is selected.
- **Standardized UI Geometry**
  - Migrated `AlertDialog`, `Dialog`, and `Sheet` components to use `rounded-card-premium` semantic tokens.
  - Added `backdrop-blur-sm` to modal overlays for a native glassmorphism effect.

### Fixed
- **Sub-category Pill Visibility**
  - Fixed a CSS conflict where `text-label` utility was overriding `Button` variant colors, resolving the dark-on-dark text visibility bug in selected states.

---

## [Unreleased] - Phase 3 In Progress

### Fixed
- **DS-1 mobile input baseline**
  - Raised the shared `Input` primitive to a 16px mobile text floor and added regression coverage so iOS no longer zooms on focus in shared form fields.
- **DS-1 icon runtime consistency**
  - Standardized runtime icon imports behind `src/lib/icons.ts`, kept Phosphor as the single UI icon library, and migrated remaining Lucide call sites to compatibility aliases so product surfaces render from one visual system.
- **DS-1 modal shell consistency**
  - Migrated add/edit budget and add/edit wallet flows onto the shared bottom `Sheet` pattern with backdrop dismissal and local swipe-to-close behavior, and documented the current modal hierarchy in `src/components/ui/MODAL_STANDARD.md`.
- **DS-1 home table overflow**
  - Moved the dashboard recent-transactions widget onto the shared table overflow wrapper so the card stays usable on 375px mobile viewports without forcing page-level horizontal overflow.
- **DS-2 typography scale standardization**
  - Added named `display-*`, `title-*`, `body-*`, and `label-*` font tokens in Tailwind and replaced arbitrary `text-[...]` sizes across app surfaces so typography now maps to a shared semantic scale.
- **DS-2 elevation token standardization**
  - Added `shadow-elevation-1` through `shadow-elevation-4` in Tailwind, replaced arbitrary shadow values across app surfaces, and moved the global highlight animation onto named shadow variables.
- **DS-2 radius token standardization**
  - Aligned Tailwind radius tokens to a fixed semantic scale, added `rounded-inherit` for shared primitives, and replaced arbitrary `rounded-[...]` values across app surfaces with token-backed classes.
- **DS-2 raw color sealing**
  - Replaced remaining raw hex and rgba color literals in feature and component code with semantic tokens or CSS variables, including charts, auth brand SVGs, category color helpers, and sidebar surface styling.
- **DS-2 loading state standardization**
  - Added `src/components/ui/loading-states.md` as the approved loading-state standard and migrated remaining widget/page placeholders from raw `animate-pulse` divs or blank returns to shared `Skeleton` and `EmptyState` patterns in home, insights, budgets, debts, charts, and AI rich-result cards.
- **Build stability after DS-2**
  - Fixed a broken `tailwind.config.ts` object shape that was crashing Turbopack CSS evaluation, and replaced server-side loading/offline icon usage with build-safe markup so `/offline` and `/charts` can prerender again.
- **DS-3 empty-state polish**
  - Replaced remaining raw `Belum ada data` placeholders in dashboard, charts, assets, and Lemon Coach trend surfaces with more descriptive empty-state copy, and updated the visual regression coverage to assert the new shared card shell defaults.

### Added
- **App Navigation Bridge** (`src/lib/app-actions.ts`)
  - Introduced a typed `APP_TARGETS` registry with 20+ named targets covering highlight, navigate, state, param, and ui-action types.
  - `executeAppAction` in `ai-chat-drawer.tsx` now resolves `APP_TARGETS` keys first, then falls back to the legacy type-based dispatch for backward compatibility.
  - AI chat action chips now render with Indonesian-friendly labels mapped from `FRIENDLY_LABELS`.

- **Widget ID Anchors for Bridge Navigation**
  - Added stable `id` attributes to all 7 dashboard widgets: `widget-financial-pulse`, `widget-recent-transactions`, `widget-budget-status`, `widget-risk-score`, `widget-net-worth`, `widget-goals`, `widget-alerts`.
  - Widgets can now be targeted by Lemon Coach for smooth scroll + highlight.

- **Dashboard Chat Bridge Event Listeners** (`desktop-dashboard.tsx`)
  - Listening to `lemon:set-analyst-view` CustomEvent to toggle analyst view from chat.
  - Listening to `lemon:set-wallet-filter` CustomEvent to filter dashboard by wallet from chat.

- **Widget Highlight CSS** (`globals.css`)
  - Added `.lemon-highlight` class with a pulsing outline animation triggered when the AI highlights a dashboard widget.

- **Close Button standard** (`src/components/ui/close-button.tsx`)
  - Introduced a shared `CloseButton` primitive that reuses the design-system `Button`, enforces the 44×44 hit target, and defaults to the localized “Tutup” label so every overlay close control is consistent.
  - Replaced bespoke close/X buttons across sheets, dialogs, toasts, prompts, and rich modals with the new component, and added `close-button.test.tsx` plus documentation notes so future surfaces reuse the same spacing, tone, and accessibility guarantees.

- **Category icons weight** (`src/lib/category-utils.ts`)
  - Wrapped every category visual icon with a `weight="fill"` default so transaction/budget/category selectors always render filled phosphor glyphs and avoid mixed stroke styles in the finance surfaces.

- **Supabase: `chat_sessions` table**
  - Applied migration for durable conversation memory.
  - Table includes RLS policy (`Users own their sessions`) and `updated_at` index for efficient lookup.

- **Typed Chat Response Contract** (`src/ai/chat-contract.ts`)
  - Defined `ChatResponse`, `RichComponent`, `AppActionPayload` types for structured LLM responses.
  - Kept `AppActionSchema` backward-compatible with legacy `type` field (optional) while supporting new `APP_TARGETS` keys.

### Fixed
- **`debtSummary` hardcoded `undefined`** — now computed from live `useDebts` data.
- **`reminderSummary.overdueCount` incorrect** — now correctly counts reminders past their due date using `isAfter()`.
- **`lastRefreshed` fixture date** — replaced static `2026-03-28` with `new Date()` for runtime accuracy.
- **Budget `spent` not filtering by `subCategory`** — fixed filter logic to account for budget sub-category specificity.
- **`risk-score-card.tsx` structural corruption** — fully rewritten to restore component integrity after a fragmented partial edit.


### Changed
- **AI Token Optimization Pipeline (Phase 3.5)**
  - Implemented token usage telemetry, a 5-level intelligent cascading truncation logic based on priority, and a "Natural Minimal Mode" fallback to gracefully handle context window overflows and prevent 400 errors.
  - Reduced prompt overhead by segregating the full coach identity into a `CHAT_SYSTEM_PROMPT` and a `CHAT_LIGHTWEIGHT_SYSTEM_PROMPT`.
  - Restricted the AI SDK's tool execution steps from 5 consecutive loops (`stopWhen: stepCountIs(5)`) to 2, drastically cutting LLM API costs and request roundtrips per user interaction.
- **Decoupled AI Context Queries**
  - Parameterized `financialContextService.getUnifiedContext` to accept specific context modules (`['wealth']`, `['budgets']`, etc.).
  - Updated AI tools to execute targeted DB queries instead of full profile aggregations, significantly reducing query latency.
- **Solid Mobile Header Chrome**
  - Removed transparency and backdrop-blur effects from the mobile sticky header (`pageShell.headerChrome`) across all pages and skeletons, opting for a clean, solid background.
- **DS-3 dashboard surface variants**
  - Added named `Card` shell variants (`default`, `elevated`, `flat`, `ai`) with `cva` in the shared UI primitive and migrated the main dashboard widgets plus Lemon Coach rich cards onto those variants so radius, shadow, and overflow styling now come from one consistent surface system.
- **DS-3 app page transitions**
  - Wrapped the main App Router content shell in a lightweight `PageTransition` component so route changes now use a subtle 150ms fade-and-rise animation driven only by `opacity` and `transform`, keeping the motion mobile-friendly and isolated from sheets and drawers.
- **Phase 4 verification coverage**
  - Added release-readiness coverage for anomaly mapping across all three anomaly types, `/api/chat` anomaly review routing, and the new typed rich cards with valid/empty payloads, then re-ran the full suite successfully before tagging the AI upgrade release.
- **Persistent coaching profile memory**
  - Added the `user_financial_profile` table, background `/api/chat/update-profile` summarization route, and profile injection back into Lemon Coach prompts so long-term spending patterns and coaching notes survive beyond a single session without blocking the live chat stream.
- **Typed Phase 4 rich insight cards**
  - Added typed `TrendChart`, `GoalProgress`, `AnomalyAlert`, and `InsightSummary` Lemon Coach components plus the `get_category_trend` tool, so richer coaching replies can render deeper insight cards through the structured response contract instead of legacy tag strings.
- **Planner-side coaching context chaining**
  - Added explicit coaching directives to the Lemon Coach system prompt and moved budget/goal support context chaining into the planner, so budget answers now arrive with risk + goal progress and goal answers arrive with budget health before the model writes its response.
- **AI anomaly review groundwork**
  - Added the `detect_spending_anomalies` RPC plus `get_spending_anomalies` Lemon Coach tool, and routed broad "cek keuangan saya" style prompts into a server-prepared anomaly review path with severity/action guidance instead of treating them like generic health-check or transaction-search queries.
- **Typed response wrapper policy**
  - Updated Lemon Coach so plain-text replies can stream normally, while rich replies use the typed `<response>{...}</response>` envelope and legacy render tags remain as a deprecated fallback with console warnings.
- **Wallet data source stabilization**
  - Moved wallet reads onto the `useWallets` React Query cache so wallet data now has one reactive source of truth, while `WalletProvider` only handles optimistic sync and cache refresh.
- **Asset data source stabilization**
  - Moved asset and liability reads plus mutations onto `useAssets` with a feature service, leaving `AssetProvider` as a compatibility wrapper so asset data also has one React Query-backed source of truth.
- **Scoped service-layer enforcement**
  - Replaced direct `supabase.from(...)` usage in the Phase 4-facing hooks/providers with budget, category, transaction, and asset service functions, and marked each migrated hook call site to keep future RPC work inside the service layer.
- **Feature public API boundaries**
  - Added `index.ts` barrels for `transactions`, `budgets`, `wallets`, and `insights`, then switched the scoped cross-feature imports in finance surfaces to those public exports instead of deep internal paths.
- **Typed Lemon Coach response contract**
  - Normalized assistant text into a structured `<response>{...}</response>` envelope with typed text, rich components, actions, and suggestions, while keeping a legacy fallback parser so existing rich cards continue to render during the transition.
  - Reused the same typed envelope for persisted chat history and follow-up generation so memory summaries and suggestion builders read clean text instead of raw render tags or JSON payloads.
- **Lemon Coach app action bridge**
  - Added the `app_action` chat tool plus client-side action chips so assistant replies can navigate to pages, open forms, and highlight relevant dashboard sections directly from chat.
- **Durable Lemon Coach memory**
  - Added Supabase-backed `chat_sessions` persistence, server-side memory summaries, and synced clear-chat deletion so Lemon Coach can reload the latest conversation context across app restarts without sending the full raw history back to the model.
- **Dead chat intent cleanup**
  - Removed the unused `data-entry` Lemon Coach intent after the orchestration refactor confirmed it had no reachable routing path, leaving the remaining intent branches as live planner states only.
- **Server-enforced chat delete confirmation**
  - Added a staged confirmation state for Lemon Coach deletes so a transaction cannot be removed until a second confirmed delete call is made for the same transaction on the server.
- **Unified chat transaction mutations**
  - Moved Lemon Coach transaction creation onto the same shared tool/action layer as update and delete so chat mutations now reuse one RPC-backed execution path instead of a route-only special case.
- **AI chat orchestration boundaries**
  - Split Lemon Coach chat routing out of the monolithic `/api/chat` handler into dedicated router, planner, and action modules so the route stays thin while preserving the existing response behavior.
- **AI chat test coverage**
  - Added route-level coverage for Lemon Coach auth, rate limiting, and deterministic replies, plus parser coverage for rich render tags so the current hybrid renderer is locked in before Phase 2 refactors.
- **DeepSeek key validation**
  - Added explicit DeepSeek API key guards to Lemon Coach chat and Smart Add extraction so missing configuration now fails with a clear error instead of falling through to ambiguous runtime behavior.
- **Recent transactions chat card**
  - Replaced the single-item placeholder in Lemon Coach’s recent-transactions card with a real 3-item fetch, including loading and empty states, so the rich reply matches the intent it advertises.
- **Lemon Coach prompt framing**
  - Added the shared financial framework to the chat-only system prompt so Lemon Coach uses the same budgeting heuristics without changing other AI flows.
- **AI chat tool identifiers**
  - Added `transaction_id` and `id` to Lemon Coach transaction search/recent tool results so update and delete tool calls can reuse the returned identifier directly without an extra lookup.
- **Offline and relaunch responsiveness**
  - Restored last-known wallets, reminders, debts, and range-based transaction snapshots from local storage so previously fetched data stays visible offline and opens faster on repeat launches.
  - Moved React Query Devtools behind a development-only lazy import to reduce unnecessary production overhead.
- **Lemon Coach AI Chat Enhancements**
  - **Robust UI Component Parsing**: Replaced regex-based UI component parsing with a balanced bracket parser in `ai-chat-drawer.tsx` to handle nested arrays/objects securely and prevent UI rendering breakage.
  - **Instant Visual Deterministic Replies**: Injected UI Component tags (e.g., `[RENDER_COMPONENT:WealthSummary]`) directly into deterministic responses in `chat-flow.ts` to provide instant rich visual feedback without LLM latency.
  - **Smart Subscription Detection**: Upgraded the `analyze_subscriptions` tool to evaluate transaction time intervals (e.g., weekly, monthly) and limit amount variance (max 30%), significantly reducing false positives compared to the previous simple occurrence count.
  - **Robust Intent Classification**: Refactored the `classifyChatIntent` function to utilize synonym arrays, accommodating common Indonesian typos and slang (e.g., "bujet", "bajet", "boncos", "duit"), improving deterministic hit rates.
  - **Compound Intent Handling**: Added logic in `chat-flow.ts` to fallback to LLM processing when a user provides compound sentences (containing multiple topics and conjunctions like "dan", "terus") to ensure comprehensive multi-tool answers.
  - **Dynamic Follow-up Suggestions**: Updated `CHAT_SPECIFIC_INSTRUCTIONS` prompt to instruct the LLM to output contextual follow-up questions using `[SUGGESTION:...]` tags, and modified `follow-up-suggestions.ts` and `ai-chat-drawer.tsx` to extract and render these dynamic suggestions interactively.

---

## [Version 2.5.9] - 2 April 2026

### Added
- **Runtime correctness foundations**
  - Added `src/lib/utils/current-date.ts` as a shared helper so production flows no longer depend on hardcoded fixture dates.
  - Added focused tests for atomic transaction helpers and unified financial context resolution to lock in the new correctness paths.
- **Lemon Coach chat surfaces**
  - Added richer in-chat finance components, dynamic follow-up suggestions, and voice-to-text support to make assistant responses more actionable.
  - Added stronger budget projection and health-audit support in Lemon Coach flows.
- **UI system expansion**
  - Added standardized empty states across chart and analysis surfaces.
  - Added centralized error primitives and error design tokens for inline, banner, and retry states.
  - Added premium shadow tokens to the design system and migrated key transaction surfaces to use them.
- **Database performance and safety**
  - Added composite and foreign-key indexes to support faster transaction, budget, reminder, goal, debt, audit-log, and membership queries.
  - Added stronger RLS policy patterns aligned with Supabase best practices.
- **Planning and reminders UI**
  - Added the redesigned `Rencana Keuangan` experience for bills and debts, including higher-contrast summary cards and metadata-rich reminder views.
- **Profile lifecycle**
  - Added account deletion support as part of the profile management refresh.

### Changed
- **Production correctness hardening**
  - Replaced hardcoded dashboard reference dates with runtime date resolution so home summaries, reminder windows, and debt notifications always follow the actual current date.
  - Switched Lemon Coach rate limiting from per-instance memory to the database-backed `consume_rate_limit` RPC for deployment-safe enforcement.
  - Consolidated chat and UI transaction mutations behind the same RPC-backed create, update, and delete paths.
- **Unified financial context**
  - Updated `financialContextService` to prefer `get_unified_context` first and fall back to direct-query aggregation only when RPC resolution fails.
  - Added lightweight observability to record whether `rpc` or `fallback` was used and how long context assembly took.
- **AI assistant and Smart Add flow**
  - Refined Lemon Coach routing so recent mutations, transaction search, deterministic finance answers, and add-via-chat requests take direct paths before LLM fallback.
  - Standardized transaction timestamps so chat capture, Smart Add, and quick add preserve full date-time values instead of truncating to date only.
  - Expanded parser heuristics and merchant coverage for Indonesian daily-spend scenarios, utilities, marketplaces, fuel, coffee brands, top-ups, and subscriptions.
- **Profile and navigation UX**
  - Refined mobile bottom navigation and overhauled profile-related mobile flows for better reachability and smaller-screen ergonomics.
  - Added database resilience improvements to profile-facing paths.
- **Auth hardening**
  - Hardened biometric sign-in to prefer `userId`, retain email only as a compatibility fallback, and avoid leaking account existence through distinct failure messages.
  - Preserved the current magic-link session bridge after successful WebAuthn verification for a minimal-risk rollout.
- **Design system and frontend structure**
  - Refactored merchant identity logic into a dedicated `useMerchantIdentity` hook.
  - Updated budget-performance views to use more index-friendly date filters.
  - Reduced visual noise in expense amount styling while keeping income states distinct.
  - Standardized error messaging tone in Bahasa Indonesia across toast and inline feedback surfaces.

### Fixed
- **Transaction and chat integrity**
  - Fixed Lemon Coach update and delete actions so they no longer bypass the atomic RPCs used by the main app, preventing wallet-balance and derived-data drift.
  - Fixed direct transaction capture regressions introduced during routing redesign, including safer wallet fallback handling and date-only normalization.
  - Fixed recent transaction ordering edge cases by sorting with both `date` and `created_at`.
- **Mobile and UI polish**
  - Fixed the sub-category sheet close-icon import issue and polished sheet presentation across AI and transaction surfaces.
  - Reduced global empty-state top padding to improve content density on small screens.
  - Updated subscription audit behavior so efficiency tips are hidden when monthly spend is zero, and upgraded the empty state to a clearer clean-audit treatment.
  - Fixed missing feedback paths so wallet-fetch and wallet-reconcile failures surface visible user-facing errors instead of staying console-only.
- **Operational noise**
  - Removed noisy middleware and Supabase client debug logging from sensitive runtime paths.

### Documentation
- Added `docs/EDIT_TRANSACTION_SHEET_GUIDE.md` covering information hierarchy, amount-input state handling, keyboard behavior, and QA guidance for the edit drawer.
- Standardized documentation layout and hook documentation patterns to align internal docs with the current engineering conventions.
- Audited and refined design system principles and the maintenance roadmap documentation.

---

## [Version 2.5.8] - 24 February 2026

### 🐛 Bug Fix — Hutang Baru Tidak Bisa Dicatat (Debt Recording Fix)

#### Root Cause

Pengguna tidak bisa mencatat hutang baru karena tiga masalah utama yang ditemukan setelah audit penuh seluruh kolom database dan frontend:

1. **Kolom database hilang**: Tabel `debts` dibuat melalui Supabase Dashboard tanpa migrasi `CREATE TABLE` dalam repo, sehingga kolom-kolom penting (`direction`, `category`, `payment_frequency`, `interest_rate`, `custom_interval`, `start_date`, `next_payment_date`) mungkin tidak ada di environment produksi. Saat service mencoba INSERT dengan kolom-kolom tersebut, query gagal dengan error database.

2. **Direction logic terbalik di `use-debts.ts`**: Fungsi `logDebtPayment` memiliki logika tipe transaksi yang salah:
   - **Sebelum (salah)**: `direction === 'owing' ? 'expense' : 'income'`
   - **Sesudah (benar)**: `direction === 'owed' ? 'expense' : 'income'`
   
   Nilai `'owed'` = "Saya Berhutang" → pembayaran keluar → `expense`. Nilai `'owing'` = "Orang Lain Berhutang" → penerimaan → `income`. Logika SQL di `pay_debt_v1` sudah benar; hanya optimistic UI update di frontend yang salah.

3. **Error handling tidak memadai**: Fungsi `addDebt` dan `updateDebt` dalam `use-debts.ts` menangkap error secara internal tetapi tidak melempar ulang (`re-throw`), sehingga form tidak pernah menerima notifikasi kegagalan, dan pengguna hanya melihat data yang muncul lalu hilang tanpa pesan error yang jelas.

#### Perubahan

**Database Migration** (`supabase/migrations/20260224000000_ensure_debts_schema.sql`):
- Menambahkan `CREATE TABLE IF NOT EXISTS public.debts` dengan semua kolom yang diperlukan
- Menambahkan `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` untuk setiap kolom yang mungkin hilang: `direction`, `category`, `interest_rate`, `payment_frequency`, `custom_interval`, `start_date`, `next_payment_date`, `counterparty`, `notes`, `updated_at`
- Menambahkan CHECK constraint untuk `direction`, `status`, dan `payment_frequency`
- Menambahkan indeks untuk performa: `idx_debts_user_id`, `idx_debts_status`, `idx_debts_direction`
- Menambahkan trigger `updated_at` otomatis

**`src/features/debts/hooks/use-debts.ts`**:
- ✅ Perbaiki logika `txType` di `logDebtPayment`: `'owed'` = expense, `'owing'` = income (konsisten dengan SQL)
- ✅ `addDebt`: Setelah error, re-open modal agar pengguna bisa mencoba lagi; tampilkan pesan error spesifik; re-throw error ke form
- ✅ `updateDebt`: Idem — re-open modal, pesan error spesifik, re-throw

**`src/features/debts/schemas/debt-schema.ts`**:
- ✅ Tambahkan `.default('owed')` pada field `direction` agar tidak pernah `undefined` saat validasi

**`src/features/debts/components/debt-form.tsx`**:
- ✅ Tambahkan state `submitError` untuk menampilkan pesan error inline di bawah tombol simpan
- ✅ Reset `submitError` saat submit dimulai ulang

#### Tests (`26 test baru`)

- `src/features/debts/schemas/debt-schema.test.ts` (17 tests):
  - Validasi input valid minimal, default direction, default category, default paymentFrequency
  - Validasi semua nilai `direction` dan `paymentFrequency`
  - Validasi penolakan field kosong (title, counterparty, principal) dengan pesan error yang benar
  - Validasi penolakan nilai enum yang tidak valid

- `src/lib/services/debt-service.test.ts` (9 tests):
  - `mapDebtPaymentFromDb`: mapping semua field dari DB row
  - `mapDebtFromDb`: mapping semua field termasuk `outstanding_balance` → `outstandingBalance`, `payment_frequency` → `paymentFrequency`
  - Handling `direction` 'owed' dan 'owing'
  - Handling field null (due_date, start_date, interest_rate, dll.)
  - Handling payments array kosong dan terisi

---



### ♻️ Refactor — Full Design System Enforcement (Phase 2–5 Complete)

This release completes the mechanical enforcement of the design system (`docs/standards/DESIGN_SYSTEM.md`) across the entire codebase. **No business logic was changed.**

#### Summary

All arbitrary Tailwind values (pixel font sizes, pixel tracking, non-standard padding, arbitrary border radii, raw palette colors on interactive elements) have been replaced with semantic utility classes, named tokens, and canonical component variants. The UI is now visually coherent across all routes.

#### Typography (Phase 2 — Complete)

- **401 arbitrary font sizes eliminated** across 82 files:
  - `text-[10px]`, `text-[9px]`, `text-[11px]`, `text-[8px]` → `text-xs`
  - `text-[15px]` → `text-sm`
  - `text-[0.8rem]` → `text-sm`
- **77 arbitrary tracking values eliminated** across 29 files:
  - `tracking-[0.1em]`, `tracking-[0.2em]`, `tracking-[0.3em]`, `tracking-[0.4em]`, `tracking-[0.05em]`, `tracking-[0.15em]` → `tracking-widest`
- **Affected modules**: `page-header.tsx`, `sidebar.tsx`, all features (`transactions`, `home`, `budgets`, `goals`, `debts`, `reminders`, `wallets`, `charts`, `insights`, `settings`, `assets`)

#### Spacing (Phase 2 — Complete)

- **Forbidden padding standardised**: `pb-32`, `pb-28`, `pb-20` → `pb-24` in all main layout containers
- `pb-safe` (iOS-only) → `pb-6` in modal/sheet footer contexts

#### Border Radius (Phase 3 — Complete)

- `rounded-[32px]`, `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[28px]` → `rounded-card-premium`
- `rounded-[24px]`, `rounded-[1.5rem]` → `rounded-card-glass`
- `rounded-[20px]`, `rounded-[1.25rem]` → `rounded-card-icon`
- `rounded-[6px]` → `rounded-md`
- `rounded-3xl` → `rounded-card-glass` (exact match: both 24px)
- `rounded-2xl` → `rounded-card` (16px → 14px, within 1 step)
- `rounded-xl` → `rounded-md` (12px → ~12px)

#### Elevation & Blur (Phase 5 — Complete)

- `shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[...]` → `shadow-card` (semantic flat card shadow)
- `backdrop-blur-2xl` → `backdrop-blur-xl`

#### Colors & Semantic Tokens (Phase 3 — Complete)

- `bg-green-500` → `bg-success` in `success-animation.tsx`
- `bg-violet-600` / `bg-indigo-500` (on Buttons) → `bg-primary` in `ai-insight-card.tsx`, `monthly-summary.tsx`
- `bg-blue-100/bg-blue-900/30 text-blue-600` (info-style icon containers) → `bg-info/10 text-info` in `assets-liabilities/page.tsx`, `settings/page.tsx`, `finance-overview.tsx`
- `bg-purple-500/20` / `bg-purple-50` (AI decorative) → `bg-primary/20` / `bg-primary/5` in `prophet-chart.tsx`
- `bg-indigo-500/20` (decorative glow) → `bg-primary/20` in `deepseek-usage-card.tsx`
- `bg-orange-500/50` (chat message accent) → `bg-warning/50` in `messages-list.tsx`
- `bg-violet-50/border-violet-200` (Smart Add quick action button) → `bg-primary/10/border-primary/20` in `dashboard-quick-actions.tsx`
- `bg-green-400` (status indicator) → `bg-success` in `finance-overview.tsx`
- `bg-blue-500/10 text-blue-600` (info panel) → `bg-info/10 text-info` in `token-calculator/page.tsx`

#### Affected Modules

`components/success-animation.tsx`, `components/page-header.tsx`, `app/(main)/goals/page.tsx`, `app/(main)/settings/page.tsx`, `app/(main)/budgeting/*`, `app/(main)/charts/page.tsx`, `app/(main)/assets-liabilities/page.tsx`, `app/(main)/token-calculator/page.tsx`, `app/(main)/add-smart/*`, `app/(main)/reminders/page.tsx`, `features/home/*`, `features/transactions/*`, `features/budgets/*`, `features/charts/*`, `features/wallets/*`, `features/insights/*`, `features/debts/*`, `features/reminders/*`, `features/settings/*`

#### No Business Logic Changed

All changes are **presentation-layer only** (CSS class names in JSX). No TypeScript logic, hooks, data fetching, state management, routing, or database interactions were modified.



### 🎨 UI — Design System Consistency Audit (Phase 2–5)

This release enforces the design system standards documented in `docs/standards/DESIGN_SYSTEM.md` across the entire presentation layer. **No business logic was changed.**

#### Typography

- **Arbitrary pixel font sizes eliminated** from key components:
  - `sidebar.tsx`: `text-[9px]` and all `text-[10px] font-semibold uppercase tracking-widest` instances replaced with the canonical `text-label` and `label-xs` utility classes.
  - `goals-dashboard.tsx`: `text-[10px] tracking-[0.2em]` → `label-xs`.
  - `wallets/page.tsx`: tab trigger labels and section headers now use `text-label` / `label-xs`.
  - `debts/page.tsx`: all hero card micro-labels (`text-[10px]`, `text-[9px]`) → `label-xs`.
  - `budgeting/page.tsx`: `text-[10px]`, `text-[9px]`, `text-[11px]` → `label-xs` / `text-xs`.

- **Arbitrary `tracking-[X]` values eliminated**:
  - `sidebar.tsx`: `tracking-[0.2em]` and `tracking-[0.3em]` → `tracking-widest`.
  - `budgeting/page.tsx`, `debts/page.tsx`, and `goals-dashboard.tsx`: all `tracking-[0.2em]` / `tracking-[0.3em]` instances removed in favour of `tracking-widest`.

#### Spacing

- **`pb-32` → `pb-24`** in `debts/page.tsx` — standardised nav clearance across all pages.

#### Colors & Component Structure

- **FAB Consolidation** — all 8 inline FAB patterns replaced with the canonical `<FAB>` component:
  - `goals-dashboard.tsx`: `bg-purple-600` → `bg-primary` via `<FAB>`.
  - `reminders-dashboard.tsx`: `bg-blue-600` → `bg-primary` via `<FAB>`.
  - `debts-dashboard.tsx`: inline Button → `<FAB>`.
  - `budgeting-dashboard.tsx`: inline Button → `<FAB>`.
  - `wallets/page.tsx`: `bottom-20` → `bottom-24` via `<FAB>`.
  - `goals/page.tsx`: `bottom-20` → `bottom-24` via `<FAB>`.
  - `debts/page.tsx`: `bottom-20` → `bottom-24` via `<FAB>`, Tooltip wrapper removed.
  - `budgeting/page.tsx`: `md:bottom-10 md:right-10` → `md:bottom-8 md:right-8` via `<FAB>`, motion wrapper removed.

- **Border Radius Tokens** — arbitrary values replaced with named tokens:
  - `rounded-[32px]` → `rounded-card-premium` in `goal-list.tsx`, `goals-dashboard.tsx`, `debts/page.tsx`, `budgeting/page.tsx`, `wallets/page.tsx`.
  - `rounded-[24px]` → `rounded-card-glass` in `goal-list.tsx`, `debts/page.tsx`, `budgeting/page.tsx`.
  - `rounded-[20px]` → `rounded-card-icon` in `goal-list.tsx`, `budgeting/page.tsx`, `goals-dashboard.tsx`.
  - `rounded-2xl` → `rounded-card-icon` in `goals-dashboard.tsx`.

#### Backdrop Blur

- **`backdrop-blur-3xl` → `backdrop-blur-xl`** in `bottom-navigation.tsx` — aligns with the documented blur scale (3xl is deprecated).



### 🎨 UI — Font Weight Reduction

- **Reduced text weight across the entire app**:
  - All `font-black` (900) instances downgraded to `font-bold` (700).
  - All `font-bold` (700) instances downgraded to `font-semibold` (600).
  - Affects 44 files across `src/components/`, `src/app/`, and `src/features/`, covering page headers, sidebar labels, transaction cards, budget modals, wallet views, debt panels, and more.
  - Result: a lighter, more readable visual hierarchy throughout the UI.

## [Version 2.5.4] - 23 February 2026

### 🐛 Bug Fixes — Smart Add Bottom Sheet

- **Keyboard-Aware Bottom Sheet (`SmartAddOverlay`)**:
  - Fixed the Smart Add bottom sheet input being obscured by the on-screen keyboard on mobile devices (especially iOS Safari).
  - Added a new `useKeyboardHeight` hook (`src/hooks/use-keyboard-height.ts`) that uses the [`visualViewport` API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API) to reliably detect keyboard height across platforms. On iOS Safari the layout viewport height does not shrink when the keyboard appears — the visual viewport does — so this approach is required for correct detection.
  - The `SheetContent` in `SmartAddOverlay` now receives `style={{ bottom: keyboardHeight }}` so the entire sheet slides above the keyboard automatically. A `transition-[bottom] duration-200` CSS transition ensures the movement is smooth.

## [Version 2.5.3] - 22 February 2026

### 🐛 Bug Fixes — Smart Add Flow

- **`resolveSubCategory` — Special-Character Normalization**:
  - Fixed fuzzy sub-category matching to correctly match inputs like `"bayar parkir tol"` → `"Parkir & Tol"` and `"isi bensin di pom"` → `"Bensin"`.
  - Added a `normalizeForFuzzy` helper that strips punctuation (`&`, `/`, `(`, `)`, etc.) before bidirectional substring comparison, making matching robust to Indonesian address/category formatting.

- **`quickParseTransaction` — Word-Level Sub-Category Matching**:
  - Quick parser now splits sub-category names by delimiters (`/`, `&`, `()`, spaces) and checks for individual word matches (minimum 4 chars) in the input text.
  - Example: `"makan 25rb"` now correctly matches `"Konsumsi & F&B"` via the word `"makan"` in `"Makan Harian/Warteg"`, returning `confidence: 'medium'` instead of `'low'`.

- **`saveTransaction` — Transfer Wallet Not Found**:
  - Previously, if a transfer's source/destination wallet names were not resolved, the transaction silently fell through and was added as a regular transaction.
  - Fixed: now shows an error toast `"Dompet asal atau tujuan transfer tidak ditemukan."` and returns `false`.

- **`saveTransaction` / `saveMultiTransactions` — Proper `isSaving` State**:
  - Introduced `isSaving` state in `useSmartAddFlow` that is set during save operations and exposed in the hook return value.
  - The save button in `SmartAddPage` now uses `isSaving` (instead of the always-false `isSubmitting` from the unrelated `useTransactionForm`) for its `disabled` prop and loading spinner, preventing double-submit.

- **`useWalletActions.deleteWallet` — Error Message Consistency**:
  - Standardized the toast message when a wallet with existing transactions cannot be deleted to `"Gagal menghapus: Dompet masih memiliki riwayat transaksi."`.

### 🧪 Test Fixes

- **`use-wallet-actions.test.ts`**:
  - Added mock for `debt_payments` table query that was missing after `deleteWallet` gained a debt-payment safety check, fixing a `TypeError: supabase.from(...).select is not a function` crash.
  - Fixed delete chain mock to support the two-chained `.eq()` calls (`.eq('id', …).eq('user_id', …)`).

- **`use-transaction-actions.test.ts`** and **`use-transfer-actions.test.ts`**:
  - Updated tests to mock `transactionService` directly (instead of raw `supabase.from().insert()`) to match the current RPC-based implementation.
  - Added missing `useWalletData` mock to prevent `WalletProvider` context error.

- **`sheet.test.tsx`**:
  - Replaced `toBeInTheDocument()` / `not.toBeInTheDocument()` assertions (requires `@testing-library/jest-dom` setup) with standard vitest `toBeDefined()` / `toBeNull()` equivalents.



### ✨ Smart Add — Complete Transaction Flow

- **Sub-Category Editing in Confirmation Card**:
  - Added a new "Sub-kategori" row in the Smart Add result card that appears only when the selected category has sub-categories.
  - Users can now tap to pick a specific sub-category from a scrollable popover list; the selection resets when the main category is changed.
- **Wallet / Sumber Dana Picker**:
  - Added a "Sumber Dana" row displaying the currently selected wallet (with color dot indicator).
  - Users can select a different wallet directly from the confirmation card; the selection updates `parsedData.walletId`.
- **Date & Time Editing**:
  - Added a "Waktu Transaksi" row showing the formatted transaction date and time.
  - A combined calendar picker + time input lets users adjust both fields; changes update `parsedData.date` as ISO string while preserving the other field's value.
  - Robust date handling: `parseISO` wrapped in try/catch with `new Date()` fallback; time parsing uses `parseInt` + `isNaN` guards.

### 🧩 Smart Add — Standard Bottom Sheet Migration

- **Sheet Component**: Replaced custom `framer-motion` backdrop + drag-gesture overlay with the standard `Sheet`/`SheetContent side="bottom"` from `@radix-ui/react-dialog`.
  - Removed: `useAnimation`, `controls`, `handleDragEnd`, `PanInfo`, `AnimatePresence` wrapper.
  - Sheet now provides: slide-in animation, backdrop overlay, close-on-backdrop-click, Escape key dismiss, focus trap, and ARIA dialog attributes — all standard and accessible.
- **`SheetContent` Enhancement**: Added optional `hideCloseButton` prop (backwards-compatible) to suppress the default ✕ close button for bottom sheets that use a drag handle instead.
  - Drag handle is marked `aria-hidden="true"` (decorative only).

### 🔧 Build Fix

- **Supabase Client Resilient During SSR/Build**: Fixed `npm run build` crash caused by `createClient()` throwing when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent at build time.
  - When running server-side (`typeof window === 'undefined'`) without env vars, a placeholder client is returned with a `console.warn` instead of throwing.
  - In production deployments env vars are always set; browser-side behavior is unchanged (still throws for clear user-facing error).
  - Result: all 28 pages now generate successfully during `next build`.

### 🧪 Tests & Validation

- **`quickParseTransaction` Test Suite**: Added comprehensive tests for the regex-based fast parser covering: amount suffixes (`rb`/`k`/`jt`/`juta`/Indonesian thousand separator/plain integers), confidence levels, category + sub-category detection, transaction type, need/want classification, wallet detection, `kemarin` date offset, and transfer keyword detection.
- **`SheetContent hideCloseButton` Tests**: New `sheet.test.tsx` verifying the close button is present by default and absent when `hideCloseButton={true}`, with children rendering correctly in both cases.

## [Version 2.5.2] - 22 February 2026

### 🔧 Critical Category Database Fix

- **Missing Default Categories Resolved**:
  - Fixed a critical issue where 8 expense categories and 1 income category defined in the application code were not present in the database.
  - Added migration `20260222170000_add_missing_default_categories.sql` to ensure all 26 categories (16 expense + 9 income + 1 internal) are available to all users.
  - **New Categories Now Available**:
    - **Expense**: Langganan Digital, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Penyesuaian Saldo
    - **Income**: Penyesuaian Saldo
  - **Category Naming Consistency**: Renamed "Rumah" to "Rumah & Properti", "Lain-lain" to "Biaya Lain-lain" (expense) and "Pendapatan Lain" (income) for clarity.
  - All changes are applied globally via default categories, making them immediately visible to all users without any action required.
  - Migration uses idempotent `IF NOT EXISTS` checks for safe deployment and rerunning.

### 📚 Documentation Improvements

- **Comprehensive Solution Documentation**: Added `SOLUTION_SUMMARY.md` with detailed root cause analysis, solution implementation, and impact assessment.
- **Migration Documentation**: Created `README_20260222170000.md` explaining the migration's purpose, impact, and verification steps.
- **Verification Tools**: Provided `VERIFY_20260222170000.sql` with SQL queries to confirm successful migration deployment.

## [Version 2.5.0] - 21 February 2026

### 🏦 Assets & Liabilities Architecture Overhaul

- **Global State & Real-time Sync**:
  - Introduced `AssetProvider` to manage assets and liabilities globally across the application. This ensures that adding, updating, or deleting entries reflects instantly in all relevant views without manual page refreshes.
  - Implemented **Supabase Real-time** listeners for assets and liabilities tables, enabling multi-device synchronization and instant UI updates.
- **Improved Entry Experience**:
  - **Robust Form Validation**: Refactored `AssetLiabilityForm` to utilize standard HTML form submission, ensuring field validation and better keyboard accessibility.
  - **Smarter Quantity Parsing**: Improved the parsing of asset quantities (e.g., grams of gold, stock lots) to handle various input formats and prevent `NaN` errors.
  - **Consistent Pricing**: Refined the gold price tracking logic within the provider for better performance.
- **Architecture Cleanup**:
  - Refactored `useAssets` into a lightweight consumer hook for the global `AssetContext`, adhering to the project's modularity standards.

### 🧠 Performance & UX Refinements

- **AI Cost Optimization**:
  - Optimized the `extractTransaction` AI flow by moving dynamic context (time, user lists) from the system prompt to the user message. This leverages **DeepSeek Prefix Caching**, significantly reducing token consumption and costs.
- **Mobile Fidelity Patches**:
  - Refined the mobile bottom navigation with reduced transparency and increased backdrop blur for a more premium, readable feel.
- **Type Safety & Build Stability**:
  - Resolved several TypeScript errors in `TransactionComposer` and `useTransactionForm` related to date formatting and Zod schema transformations, ensuring successful production builds.

## [Version 2.4.9] - 21 February 2026

### 🛠 Transaction Editing & Robustness

- **Streamlined Editing Workflow**:
  - Refactored `EditTransactionSheet` to consistently utilize `useActions` for `updateTransaction` and `deleteTransaction`. This ensures all editing operations benefit from centralized optimistic updates, real-time event emissions, and robust error handling.
  - Resolved an issue where optimistic updates were not correctly applied during transaction edits, leading to perceived failures or delayed UI feedback.
- **Enhanced Edit User Experience**:
  - The manual edit form within `EditTransactionSheet` is now **always visible** by default, eliminating confusion and ensuring immediate access to all editable fields without requiring an additional click. The toggle button for manual form visibility has been removed for a streamlined experience.
  - Fixed `CategorySelector` to correctly initialize and display the existing sub-category of a transaction when opened for editing, preventing data loss or misrepresentation.
  - Ensured the `isNeed` (Needs vs. Wants) flag is accurately preserved and displayed when editing transactions.

### 💸 Expense Category Refinement & AI Integration

- **Comprehensive Expense Schema**:
  - Overhauled default expense categories in `src/lib/categories.ts` for greater detail and modern relevance (e.g., "Makanan" -> "Konsumsi & F&B", "Belanja" -> "Belanja & Lifestyle", "Tagihan" -> "Tagihan & Utilitas", "Langganan" -> "Langganan Digital").
  - Expanded sub-categories for all expense types to cover modern needs like Skincare, Logistics, and various Digital Subscriptions.
- **AI Intelligence for Expenses**:
  - Updated `extract-transaction-flow`'s AI prompt with specific mapping logic for new expense categories and sub-categories.
  - Enhanced merchant awareness for automotive maintenance (e.g., "oli", "yamalube", "motul") within the AI prompt, improving automated categorization accuracy.
  - Updated `MERCHANT_MAP` in `merchant-utils.ts` to include popular motor oil brands and related services.
- **Visual & Database Alignment**:
  - Integrated new Lucide icons (`Zap`, `Tv`) into `iconMap` in `category-utils.ts` for improved visual representation of new categories.
  - Introduced a new migration (`20260221130000_refine_expense_categories.sql`) to safely update default expense category names and sub-categories in the database, including the automatic update of existing transactions to align with the new naming conventions.

## [Version 2.4.8] - 21 February 2026

### 💰 Income Category Overhaul & Precision

- **Comprehensive Income Schema**:
  - Re-architected income categories to be more descriptive and professional (e.g., "Gaji" -> "Gaji & Tetap", "Investasi" -> "Investasi & Pasif").
  - **New Specialized Categories**: Introduced "Refund & Cashback" and "Penjualan Aset" (specifically for second-hand items, electronics, and vehicles).
  - **Modern Sub-categories**: Added support for Affiliate/AdSense income, Royalties, Zakat/Infaq received, and Asset liquidation.
- **AI Intelligence Upgrade**:
  - Enhanced the `extract-transaction-flow` engine to recognize high-intent keywords like "jual", "laku", "cair", and "cashback".
  - Improved mapping logic to automatically assign income to the new specialized categories.
- **Visual Fidelity**:
  - Integrated new high-fidelity Lucide icons (`RefreshCw`, `BadgeDollarSign`, `Wallet`, `Code`) with refined Tailwind color palettes for better visual distinction in lists and charts.
- **Database Integrity & Migration**:
  - Implemented a safe SQL migration (`20260221120000_refine_income_categories.sql`) to rename default categories and automatically update existing transaction history, ensuring zero data loss during the transition.

## [Version 2.4.7] - 21 February 2026

### 🎨 Dynamic DNA UI & Immersive Experience

- **"Dynamic DNA" Visual Engine**:
  - Implemented a sophisticated color extraction system that transforms category/wallet colors into high-fidelity visual profiles (Mesh Gradients, Ambient Glows, and Branded Shadows).
  - **Dashboard Overhaul**: Hero card now features a dynamic animated mesh background.
  - **Branded Wallet Stack**: Wallet cards now automatically adopt their brand's visual identity with glassmorphism insets for balance protection.
  - **Transaction List Fidelity**: Added **DNA Stripes** (vertical color indicators) to each transaction row for instant visual categorization.
- **Universal Borderless Depth**:
  - Replaced all remaining hard borders with layered shadows and elevation (Visual Depth principle).
  - Standardized "Inset Group" backgrounds for detail sections inside cards.

### 📊 Precision Budgeting & Sub-categories

- **Sub-category Budgets**:
  - Enabled the ability to set budgets for specific sub-categories (e.g., "Kopi" instead of just "Makanan").
  - **Atomic Sync**: Updated database triggers and backend logic to calculate "Spent" totals respecting sub-category filters.
  - **Refined Modals**: Added a multi-step selection flow in Add/Edit Budget modals for granular control.
  - **Smart Insights**: Budget recommendations now factor in historical sub-category spending.

## [Version 2.4.6] - 21 February 2026

### 🏗 Architecture & Engineering Standardization

- **Design System v1.1.0 Update**:
  - Formalized **Modularity & Scalability** as core engineering mandates in `docs/standards/DESIGN_SYSTEM.md`.
  - Defined **Atomic Component** hierarchy: Atoms (basic UI), Molecules (combined logic), and Organisms (feature blocks).
  - Established strict **Naming Conventions**: `kebab-case` for files, `PascalCase` for components, and `camelCase` for utilities/hooks.
  - Specified **State Management** tiers: Global (Context), Server (Real-time hooks), and Local (React state).
  - Defined **API Versioning Strategy** for Supabase RPCs using `_v{n}` suffixes to ensure backward compatibility.

## [Version 2.4.5] - 21 February 2026

### 🛠 UI Infrastructure & Accessibility Fixes

- **Tooltip Rendering Fix**: 
  - Updated `src/components/ui/tooltip.tsx` to utilize **React Portal**. This ensures tooltips are no longer clipped by containers with `overflow: hidden` (like the new Capsule Sidebar).
- **Global Tooltip Standardization**:
  - Centralized `TooltipProvider` in the root `layout.tsx` to enable consistent tooltip behavior and performance across the entire application.
  - Standardized `delayDuration` to 300ms for a smooth, high-fidelity interaction feel.
- **Code Quality**:
  - Cleaned up redundant provider declarations in the Sidebar.
  - Fixed a syntax error in the Sidebar component that was blocking production builds.

## [Version 2.4.4] - 21 February 2026

### ✨ Visual Harmony & "Apple Capsule" Overhaul

- **Floating Inset Sidebar (Desktop)**:
  - Redesigned as a **floating capsule** with `rounded-[32px]` and deep shadow depth.
  - Implemented **Shadcn UI Tooltips** for all navigation items in collapsed mode.
  - Refined typography to `semibold` for an elegant, professional macOS-style feel.
  - Optimized alignment and spacing for perfect visual symmetry.
- **Universal Card Standardization**:
  - Upgraded all list cards (Budgets, Goals, Debts, Reminders) to `rounded-[32px]` with **Visual Depth** (soft shadows instead of hard borders).
  - Standardized progress bars and status badges with high-fidelity typography (`tracking-tighter` for amounts).
- **Modal & Bottom Sheet Polish**:
  - Standardized all mobile sheets to `rounded-t-[2.5rem]` with `backdrop-blur-xl` glass effects.
  - Converted all primary action buttons to `rounded-full` for better ergonomics and aesthetic consistency.
- **Settings Bento Grid 2.0**:
  - Overhauled the profile bento layout with the new radius and shadow standards.
  - Refined typography and spacing for a high-density "Command Center" feel.

## [Version 2.4.3] - 21 February 2026

### 🏷️ Massive Merchant Visual Map Extension
- **Comprehensive Indonesian Branding**: Added hundreds of local favorites across:
  - **F&B**: Richeese Factory, Waroeng Steak, Mie Gacoan, Kopi Tuku, Point Coffee, Duck/Bebek Kaleyo, etc.
  - **Fashion**: Erigo, 3Second, Roughneck 1991, The Executive, Cardinal.
  - **Footwear**: Ventela, Compass, Aerostreet, Brodo.
  - **Health & Beauty**: Kahf, Azarine, Skintific, Wardah, Somethinc, Avoskin, Scarlett.
- **Global & Tech Ecosystem**:
  - **Dev & Infra**: Alibaba Cloud, Hostinger, Vercel, AWS, GitHub, Cloudflare.
  - **Digital Services**: ChatGPT, Midjourney, Disney+, Noton, Slack.
  - **Electronics**: Samsung, Sony, Polytron, Intel, NVIDIA, RTX, Ryzen.
- **Daily Utilities & Public Services**:
  - **Fuel**: Pertamina (Pertalite/Pertamax), Shell, BP, Vivo.
  - **Gov**: Samsat (STNK), PBB, BPJS, Pajak, Paspor (using new `ShieldCheck` icon).
  - **Transport**: MRT, LRT, KRL, TransJakarta, Garuda, AirAsia.
- **Smart Cataloging**:
  - Added support for **Generic Keywords**: Automatically brands transactions containing "serum", "facewash", "skincare", "bensin", "bengkel", "obat", etc.
  - Expanded icon library with 20+ new Lucide icons for high-fidelity visual representation.


## [Version 2.4.2] - 21 February 2026

### 🎨 Design System Standardization

- **New Design System Document**: 
  - Created `docs/DESIGN_SYSTEM.md` to formalize the **"Apple-Inspired Premium Fidelity"** aesthetic.
  - Defined core visual pillars: **Glassmorphism**, **Visual Depth** (no borders), **Typography-First**, and **Liquid Intelligence**.
  - Established standards for components (Magic Bar, Result Cards), charts (Monotone, Shadcn), and interactions (Haptics, Optimistic UI).
- **Goal**: To serve as the Single Source of Truth for maintaining visual consistency and high-quality UX across the entire application ecosystem.

## [Version 2.4.1] - 21 February 2026

### 🧠 Smart Add 2.0 "Liquid Intelligence"

- **Visual Overhaul (Apple-Style)**:
  - **Result Card**: Redesigned with a cleaner, "frosted glass" aesthetic (`bg-white/90` with `backdrop-blur-xl`).
  - **Typography First**: Transaction amount is now the hero element (large, bold text).
  - **Intelligent Merchant Detection**: Automatically displays the **real merchant logo** (e.g., Starbucks, Gojek, Netflix) if detected, falling back to category icons.
  - **Input Bar**: Replaced borders with "Visual Depth" (deep shadows and ambient glow) for a floating, immersive feel.
  - **Typewriter Effect**: AI status messages now type out character-by-character for a more organic assistant feel.
- **UX Refinements**:
  - **Consistent Iconography**: Standardized "Keinginan" (Want) icon to `ShoppingBag` across all forms.
  - **No UI Jump**: Fixed a glitch where the confirmation card would flash back to the input field during saving.
  - **Smart Date/Time**: Added a Time Picker (`HH:mm`) to manual entry for precise timestamping.

### 📊 Charts & Analytics Fixes

- **Spending Trend Fix**: 
  - **Date Boundary Bug**: Fixed an issue where today's transactions were cut off from the chart/list due to timezone/timestamp truncation. Now fetches up to `23:59:59` of the end date.
  - **Negative Dip Fix**: Changed chart interpolation from `natural` to `monotone` to prevent the area chart from dipping below zero (visual artifact).
  - **Shadcn UI Migration**: Refactored the chart to use the standardized `ChartContainer` system for consistent theming and tooltips.
  - **Mobile Interactivity**: Added haptic feedback (`onTouchStart`) and a visible cursor/active dot to improve touch responsiveness.
- **Activity List Ordering**:
  - Enforced strict `DESC` sorting by `date` AND `created_at` to ensure the most recently input transaction always appears at the top, even if dates are identical.

## [Version 2.4.1] - 21 February 2026

### 🏦 Enhanced Wallet Ecosystem & "Command Center" UI

This update focuses on deepening the wallet management experience and achieving a professional, high-density desktop aesthetic.

- **New Wallet Categorization**:
  - Added support for **Paylater** and **Investasi** account types across the entire ecosystem.
  - **Smart Brand Detection**: New intelligence layer automatically assigns logos and color themes for Indonesian brands like Kredivo, Spaylater, Bibit, Ajaib, etc., during creation.
- **Enterprise Desktop UI (Wallet View)**:
  - **Borderless Design**: Achieved a clean, frameless aesthetic by removing all visible borders and relying on background elevation/shadows for separation.
  - **Optimized Density**: Reduced padding and refined spacing to maximize information density, creating a true "Financial Command Center" feel.
  - **Typographic Polish**: Removed heavy font weights (Bold/Black) in favor of a cleaner, medium-weight hierarchy.
- **Balance Correction Utility**:
  - Introduced a **"Koreksi Saldo"** tool in the wallet settings.
  - Automatically creates a reconciliation transaction under the new **"Penyesuaian Saldo"** category to sync app records with real-world balances transparently.
- **Improved Filter System**:
  - Redesigned the wallet navigator with high-density filter pills for quick switching between Bank, E-Wallet, Paylater, and Investment accounts.


### ⚡️ Real-Time & Optimistic UI Overhaul

This release focuses on making the app feel "instant" by eliminating loading states for core actions.

- **Instant Budget Updates**: 
  - The "Spent" progress bar on budgets now updates immediately when you add a transaction, without needing a page refresh.
  - Implemented a listener for `transaction.created` events directly in the budget hook to recalculate progress on the fly.
- **Optimistic Goals & Debts**:
  - Creating, editing, or deleting **Savings Goals** and **Debts** now reflects instantly in the UI.
  - **Debt Payments**: Recording a debt payment now instantly updates the debt's outstanding balance and status (e.g., to "Settled") before the server confirms the request.
- **Unified Event Architecture**:
  - Refactored `WalletProvider` to listen to global transaction events (`transaction.created/updated/deleted`).
  - **Prevented Double-Counting**: Removed manual wallet updates from `use-transaction-actions.ts` to rely solely on the global event listener, ensuring a Single Source of Truth for balance updates.

## [Version 2.3.3] - 21 February 2026

### 🛡 Type Safety & Stability Improvements

- **Design System Consistency**:
  - **Badge Variants**: Added missing `success` (Emerald) and `warning` (Yellow) variants to the `Badge` component, resolving visual regressions in the Net Worth card.
- **Robust Transaction Handling**:
  - **Optimistic Type Safety**: Enforced strict number conversion for transaction amounts in `use-transaction-actions`, preventing potential `NaN` or string concatenation errors during optimistic UI updates.
  - **Service Layer Hardening**: Simplified data processing in `TransactionService` by leveraging Zod-validated types directly, removing redundant and error-prone string manipulation logic.
  - **Form Initialization**: Fixed a type conflict in `useTransactionForm` where initial empty values clashed with strict schema definitions, ensuring smoother form hydration.

## [Version 2.3.2] - 21 February 2026

### 📲 PWA Installation Experience

- **Global Install Prompt**: 
  - Introduced a non-intrusive, global installation prompt (`InstallPrompt`) that elegantly suggests installing the app.
  - The prompt is designed to appear after a short delay to avoid disrupting the initial user experience.
- **Sidebar Integration**: 
  - Added a persistent "Install App" button to the desktop sidebar footer.
  - This button intelligently hides itself once the app is successfully installed or running in standalone mode.
- **Enhanced Discoverability**: 
  - Moved the installation trigger from being buried in Settings to prominent, context-aware locations for better user adoption.

## [Version 2.3.1] - 21 February 2026

### 🛡 Data Integrity & Atomic Sync Patch

- **Critical Fix: Double-Counting Balance**: 
  - Fixed a regressive bug in `create_transaction_v1` and `update_transaction_v1` where wallet balances were being updated twice (both by RPC and Trigger).
  - Cleaned up RPC logic to rely solely on the database trigger `on_transaction_change` for gold-standard accuracy.
- **Improved Debt Payment Deletion**:
  - Linked `debt_payments` to the `transactions` table via `transaction_id`.
  - Updated `delete_debt_payment_v1` to automatically delete the associated money transaction, ensuring wallet balances are reverted correctly when a payment is deleted.
- **Atomic Reliability**: Enforced stricter ownership checks across all database functions using `auth.uid()`.

## [Version 2.3.0] - 18 February 2026

### 🛡 Security & Performance Audit Fixes

- **Database Performance & Integrity**:
  - **Added Missing Indexes**: Created B-tree indexes for `user_id`, `wallet_id`, `date`, and `category` across all core tables (`transactions`, `wallets`, `budgets`, `debts`, `goals`, `reminders`) to ensure $O(log n)$ query speed.
  - **Unique Email Constraint**: Enforced a `UNIQUE` constraint on `profiles.email` to guarantee reliable biometric login and profile lookups.
- **Functional Fixes**:
  - **Resolved Wallet Double-Counting**: Fixed a critical bug where transactions were being counted twice in wallet balances by removing redundant manual balance updates from RPCs and delegating solely to the database trigger.
  - **Atomic Debt Payment Deletion**: Moved complex payment removal logic from the client to a robust SQL RPC (`delete_debt_payment_v1`), preventing race conditions and ensuring $100\%$ balance integrity.
- **Security Hardening**:
  - **Atomic Ownership Verification**: Updated all financial RPCs (`create_transaction_v1`, `update_transaction_v1`, `delete_transaction_v1`, `create_transfer_v1`, `pay_debt_v1`) to verify resource ownership using `auth.uid()` before execution.
  - **Client Parameter Isolation**: Hardened RPCs against ID spoofing by overriding any client-provided `p_user_id` with the actual authenticated session ID.
- **Architecture & DX**:
  - **Unified RPC Signature**: Simplified `TransactionService` to handle `sub_category` and `is_need` flags directly within atomic database calls, reducing network round-trips.

### 🛠 Codebase Refactoring & Quality Audit

- **Form Management Overhaul**: Refactored Debt, Wallet, and Transaction forms to use `React Hook Form` and `Zod` for robust validation and improved UX.
- **Type Safety Enforcement**: Eliminated 100+ instances of `any` types in critical files ([use-assets.ts](file:///g:/01_projects/lemon-beta/src/features/assets/hooks/use-assets.ts), [lazy-charts.tsx](file:///g:/01_projects/lemon-beta/src/features/charts/components/lazy-charts.tsx), etc.) to improve developer experience and prevent runtime bugs.
- **Hook Modernization**: Replaced deprecated `useApp` hook with modular `useAuth` and `useActions` across 13+ files, reducing unnecessary re-renders and improving code modularity.
- **Performance Optimization**: Optimized Context Providers (`AuthProvider`, `ActionProvider`, `UIProvider`) using `useMemo` and `useCallback` for stable state management.
- **Icon Casing Fix**: Resolved 10 console errors related to incorrect React component casing for Lucide icons in [chart-utils.ts](file:///g:/01_projects/lemon-beta/src/features/charts/lib/chart-utils.ts).
- **Centralized Actions**: Moved core CRUD operations to `ActionProvider` for better maintainability and state consistency.
- **Clean Code**: Deleted legacy `use-data.ts` and other redundant files to reduce technical debt.

## [Version 2.2.0] - 16 February 2026

This release focuses on "Premium Fidelity" and Advanced Analytics, elevating Lemon from a simple tracker to a professional wealth management tool.

### ✨ New Features

- **Advanced Financial Analytics**: 4 new data layers for deep financial storytelling.
  - **Net Worth Trend**: Historical 6-month tracking of total wealth (Assets vs. Liabilities).
  - **Saving Potential & Efficiency**: Visual comparison of maximum saving capacity vs. actual performance.
  - **Behavior Analytics**: Deep dive into spending habits (Weekday vs. Weekend) and "Payday Drain" velocity.
  - **Subscription & Fixed Cost Audit**: Centralized tracker for recurring bills with due-date alerts.
- **Premium PWA Experience**: 
  - **Custom Install Prompt**: New elegant "Install Lemon" module in Settings with one-tap installation.
  - **OLED Optimized Palette**: Synchronized brand colors (Teal 600) across manifest and UI.
  - **Offline Resilience**: Improved "Luring" mode with premium visual feedback and smart caching.

### 🎨 Visual & UX Enhancements ("Premium Fidelity")

- **Standardized Component Radius**: Professional 8px radius for desktop and touch-friendly 14px for mobile devices.
- **Haptic Feedback Engine**: Subtle physical vibrations for navigation, Smart Add, and successful transactions.
- **Success Celebrations**: New high-end checkmark animations and particle effects when saving transactions.
- **Skeleton Loading Screens**: Replaced generic spinners with contextual skeletons for Home and Statistics pages.
- **Premium Empty States**: Beautiful silhouettes and aspirational typography for empty lists and charts.
- **Progress Track Design**: Overhauled category list items with smooth gradients and integrated budget indicators.
- **Fluid Layout**: Increased maximum mobile width to `max-w-lg` for better appearance on modern wide phones and foldables.

### 🛠 Technical & Robustness

- **Clean Architecture Refactor**:
  - **Service Layer**: Isolated database logic into `TransactionService` for better testability.
  - **Controller Hooks**: Unified form logic into `useTransactionForm` custom hook.
  - **Modular UI**: Extracted edit logic into a standalone premium `EditTransactionSheet`.
- **Optimistic Updates**: Zero-latency UI response—wallet balances and lists update instantly before server confirmation.
- **Database Schema Sync**: Added `sub_category` column support across database triggers, RPC functions, and frontend forms.
- **Performance Optimization**: Implemented `next/dynamic` lazy loading for heavy chart components to reduce initial bundle size.

## [Unreleased] - February 2026

### 🎨 Visual & UI Consistency

- **Design System Standardization**:
  - **Semantic Tokens**: Introduced `warning` and `info` semantic tokens to the global design system for better consistency.
  - **Sharpened Shadows**: Added a custom `shadow-card` utility for a more professional, enterprise-grade look.
  - **Radius Consistency**: Refactored `Card` components to use the standardized `rounded-lg` radius, ensuring consistency with the design system.
- **Component Refactoring**:
  - **NetWorthCard**: Updated to use semantic text colors (`text-success`, `text-warning`, `text-destructive`) instead of hardcoded palette values.
  - **DesktopDashboard**: Removed hardcoded colors and border radii, aligning the dashboard with the global theme and responsive design tokens.
- **Brand Intelligence**:
  - **SeaBank Integration**: Added SeaBank to merchant and wallet visual maps, ensuring the logo and brand colors appear correctly in transaction lists and wallet stacks.
- **Testing**: Added `visual-regression.test.tsx` to verify component structure and class usage.

## [Unreleased] - January 2026

### ✨ New Features

- **AI Smart Add 2.0 (Powered by DeepSeek V3)**: Major upgrade to the intelligent transaction logging system.
  - **Bulk Transaction Processing**: Record multiple transactions in a single natural language sentence (e.g., "Beli kopi 25rb dan bensin 50rb").
  - **Automatic Wallet Detection**: Intelligent mapping of payment sources like "BCA", "GoPay", or "Kas" using fuzzy matching.
  - **Debt Payment Integration**: Automatically detects when a transaction is a debt repayment and suggests linking it to existing debts.
  - **Real-time Balance & Budget Insights**: Instant AI warnings if a transaction leads to insufficient funds or exceeds category budgets.
  - **Conversational Refinement**: 
    - **Chat Correction**: Correct mistakes naturally via chat (e.g., "Eh, tadi salah, itu pakai kartu kredit BCA").
    - **Ambiguity Clarification**: AI asks clarifying questions for ambiguous inputs (e.g., "Ini masuk kategori 'Kebutuhan' atau 'Gaya Hidup'?").
  - **Enhanced AI UI**: New confirmation chips with category-specific colors and icons, haptic feedback, and auto-focus for a smoother experience.

- **Debt Monitoring & Analytics**: Introduced advanced debt tracking features to monitor financial health.
  - **Historical Comparison**: Track total debt changes compared to last month and last year with visual trend indicators.
  - **Silent Growth Detection**: Automatically identifies debts with high interest rates or outstanding balances exceeding the principal to prevent "silent" debt growth.
  - **Debt Payoff Projection**: Predicts estimated payoff dates based on the average monthly payment history from the last 3 months.
  - **Interactive Analytics Card**: A new dedicated dashboard for debt insights integrated into the Debts page.

- **Desktop UI/UX Overhaul (Assets & Wallets)**: Complete redesign of the desktop asset management experience.
  - **Gradient Summary Cards**: New visual cards for Total Assets, Total Liabilities, and Net Worth with beautiful gradients.
  - **Refined Wallet List**: Modern list view for wallets with improved typography, spacing, and visual hierarchy.
  - **Enhanced Wallet Details**: Improved desktop view for individual wallet details including active visual state integration.
  - **Unified Page Headers**: Implementation of the standard `PageHeader` component across desktop views for consistency.

- **Improved Transaction Visuals**: 
  - **Color-Coded Transaction Indicators**: Expense transactions now consistently use red (`text-rose-600`) for amounts and icons (`arrow-down-left`) across mobile and desktop views.
  - **Consistent Iconography**: Standardized use of `ArrowDownLeft` (expense) and `ArrowUpRight` (income) with appropriate semantic coloring.

- **Enhanced Mobile Homepage**: Complete redesign with modern solid design
  - **Clean Solid Cards**: All main cards now feature solid backgrounds with subtle borders and shadows for better clarity
  - **Gradient Text Effects**: Total balance display with beautiful gradient text effects for premium visual appeal
  - **Pull-to-Refresh Functionality**: Native mobile gesture implementation with smooth animated refresh indicator
  - **Horizontal Wallet Carousel**: Enhanced wallet section with horizontal scrollable format showing up to 5 wallets
  - **Micro-interactions & Animations**: Smooth animations using Framer Motion with spring physics
  - **Enhanced Visual Elements**: Improved debt summary, reminders, and overall visual hierarchy

- **Floating Action Button (FAB) Enhancements**: 
  - **Optimal Positioning**: Raised FAB position for better thumb reachability
  - **Visual Improvements**: Enhanced shadow effects, ring outlines, and gradient overlays
  - **Hover Animations**: Scale effects and shimmer animations for better interactivity
  - **Responsive Design**: Adaptive positioning based on screen height

- **Subscription Audit & Silent Inflation Detector**:
  - **Automated Audit**: Scans transactions for recurring subscriptions and calculates total monthly burn.
  - **Inflation Alert**: Detects price increases (silent inflation) by comparing recent transactions with historical data.
  - **Visual Insights**: New dashboard card displaying active subscriptions and alerts.

### 🎨 Enhancements

- **Desktop Navigation Consistency**: Unified header and action patterns across Dashboard, Wallets, and Transaction views.
- **Improved Visual Hierarchy**: Better use of white space, gradients, and typography in the desktop wallet management interface.
- **Modern Aesthetics**: Implementation of clean solid design with subtle shadows and depth effects
- **User Experience**: Intuitive pull-to-refresh gesture and smooth touch interactions
- **Performance Optimized**: Efficient animations and optimized build size
- **Accessibility**: Proper ARIA labels and semantic HTML structure

### 🛠 Technical & Bug Fixes

- **Hydration Fix (Goals Page)**: Resolved hydration mismatch errors by implementing client-side mount detection for date formatting.
- **TypeScript Build Stabilization**: Fixed multiple type errors across the codebase (debts, budget status, transaction tables, wallet views) to ensure successful production builds.
- **Component Cleanup**: Removed duplicate state declarations and redundant conditional logic in the Goals feature.
- **Missing Import Fixes**: Added missing component imports (e.g., `Badge` in wallet views) to prevent runtime errors.

## [Version 2.1.0] - January 2026

This release introduces comprehensive net worth tracking and developer tools for AI cost estimation.

### ✨ New Features

- **Assets & Liabilities Tracker**: Monitor your complete financial health by tracking assets (investments, cash, property) and liabilities (loans, credit cards).
    - **Net Worth Dashboard**: Real-time calculation of your total net worth.
    - **Visual Breakdown**: Categorized view of all your assets and liabilities.
- **AI Token Calculator**: A developer-focused tool to estimate token usage and costs for the DeepSeek V3 model.
    - **Cost Estimation**: Calculate input/output costs in IDR based on real-time rates.
    - **Runway Calculator**: Estimate how long your API budget will last based on daily transaction volume.

### 🎨 Enhancements

- **Settings Integration**: Added access points for Token Calculator and Assets management in the Settings/More menu.

## [Version 2.0.0] - 22 September 2025

**Status:** Ready to launch

### 🔍 Experience Audit & Navigation
- Completed a comprehensive design audit covering landing, authentication, and core app flows with new heuristic documentation.
- Added skip links and anchor navigation on the landing page so users can reach features, security, and final CTA sections without excessive scrolling.
- Updated hero copy and benefits list to make Lemon's value proposition easy to understand in seconds.

### 🎨 Visual, Motion & Accessibility
- Standardized all animations to 0.28s `ease-out` duration and added `prefers-reduced-motion` support on the landing page and all authentication modals.
- Strengthened visual hierarchy with a 4/8 px grid, 16–32 px radii, and high-contrast focus rings for keyboard navigation.
- Marked decorative illustrations as `aria-hidden` and provided focus outlines on anchor nav to maintain accessibility.

### 🔐 Authentication & Recovery
- Updated login, sign up, and forgot password bottom sheets with clean solid backgrounds, consistent transitions, and easy-to-read inline error alerts.
- Kept alternative action buttons (Google, biometric) available while presenting clear loading statuses for each method.
- Added permanent success messages in the forgot password flow to assure users that the reset email has been sent.

### 📚 Documentation & Alignment
- Rewrote the **Design Audit** to include heuristic findings, design systems, and full flow evaluations ahead of the 2.0.0 release.
- Updated the **Product Blueprint** with release snapshots, latest experience principles, motion specs, and priority roadmaps.
- Refreshed the **README** with release highlights, key flows, design & accessibility commitments, and important documentation links.

## [Version 1.5.0] - December 2025

This release elevates the mobile experience with proactive guidance and complete visibility over financial obligations.

### ✨ New Features

- **Smart Reminders**: Create one-off or recurring reminders for bills, savings transfers, and follow-ups. Reminders can be linked to wallets, categories, or debts and sync with push notifications for quick completion.
- **Comprehensive Debt & IOU Tracking**: Track money you owe and are owed with dedicated debt profiles, payment schedules, counterparty histories, and interest snapshots. Transactions logged with Catat Cepat now auto-suggest matching debts.

### 🎨 Enhancements & UX Improvements

- **Mobile Home Refresh**: Added an "Upcoming" module to spotlight due reminders and approaching debt payments alongside key balances.
- **Reminder Center**: Introduced a unified calendar and list management view under the More tab for snoozing, completing, and reviewing reminder history.
- **Debt Insights Widget**: The Insights tab now visualizes total owed vs. owed to you, overdue items, and payoff velocity.

### 🧠 AI & Automation

- **Predictive Suggestions**: Catat Cepat classifies reminder intent and proposes linking entries to existing debts when confidence is high.
- **Weekly Digest**: A new AI-generated summary surfaces upcoming reminders, risky debts, and suggested actions every Monday.

### 🛠 Technical

- Added Firestore collections for reminders and debts with indexes optimized for due dates and statuses.
- Scheduled Cloud Functions send push notifications, recalculate debt projections nightly, and roll up weekly reminder stats for Insights.

## [Version 1.4.0] - November 2025

This release introduces a major new authentication feature and focuses heavily on UI consistency and bug fixes based on user feedback.

### ✨ New Features

- **Biometric Login**: Users can now enable and use fingerprint or Face ID to log in securely and quickly. An option to manage this feature has been added to the Settings page.

### 🎨 Enhancements & Bug Fixes

- **Complete Statistics Page Redesign**: The "Statistics" page has been completely overhauled to match the app's consistent design language. This includes standardizing the header, tabs, and card components.
- **Restored Statistics Insights**: All key data insights on the Statistics page—including monthly summaries, daily trends, category distribution, largest category, and largest transaction—have been restored and integrated into the new, consistent design.
- **Biometric Authentication Fixes**:
    - Resolved a `Permissions-Policy` error that blocked WebAuthn API in the development environment by updating Next.js headers.
    - Fixed a race condition (`No document to update` error) for new users enabling biometrics by using a more robust Firestore write method.
- **Animation Standardization**: Replaced `spring` animations for drawers and modals with a uniform `ease-out` transition of 0.2 seconds for a more consistent feel.
- **Hydration Error Fixes**: Resolved React hydration errors on the Statistics and Budget Detail pages, ensuring a stable rendering experience.

### 🐞 Known Bugs

- **Deleting Transfers**: The application currently does not support the deletion of "Transfer" type transactions from the transaction history. Attempting to do so will show an error message.

## [Version 1.3.0] - November 2025

This release introduces major performance optimizations, cost-saving AI enhancements, and the completion of core financial features.

### ✨ New Features

- **Full CRUD for Financial Goals**: Users can now create, read, update, and delete their financial targets. A target date has been added to make goals more specific and trackable.
- **New "Health" Category**: Added "Kesehatan" as a primary expense category with relevant sub-categories like "Dokter & RS" and "Obat & Vitamin".

### ⚡️ Performance & Optimizations

- **AI Cost Reduction**: The "Catat Cepat" (Quick Add) AI flow has been completely refactored to use Genkit Tools instead of passing large data objects in prompts. This drastically reduces token usage and lowers operational costs.
- **Page Flicker Fixed**: Resolved a major page flickering issue during navigation by centralizing the global `AppProvider` in the root layout, ensuring a stable and smooth user experience.
- **Optimized Font Loading**: Improved initial page load times and prevented layout shift by optimizing the way custom fonts are loaded via CSS variables.
- **Refactored Transactions Page**: Removed a redundant transaction history page and consolidated functionality into a single, more efficient page with an improved filtering UI.

### 🎨 Enhancements & Bug Fixes

- **New Zoom Transition**: Replaced the page slide animation with a more modern and subtle zoom-in/zoom-out effect for a smoother feel.
- **Z-Index Fix**: Permanently fixed the bug where page content would scroll over sticky headers by applying a consistent z-index strategy across the app.
- **UI & Form Fixes**:
    - Removed shadows from all `Card` components for a cleaner, flatter design.
    - Fixed a bug where the edit transaction form would not display the correct categories after changing the transaction type.
    - Resolved a Next.js error by correcting the component export on the Settings page.
    - Enhanced UI consistency by adding an underline effect to link-style buttons on hover.

## [Version 1.2.0] - October 2025

This release focuses on significant UI/UX enhancements and the introduction of AI-powered features to make transaction logging faster and more intuitive.

### ✨ New Features

- **"Catat Cepat" with AI**: A new way to add transactions using natural language.
    - **Text Input**: Type or paste transaction details like "beli kopi 25rb pake GoPay".
    - **Voice Input**: Use your voice to dictate transactions for a hands-free experience.
    - **Receipt Scanning**: Snap a photo of a receipt, and the AI will extract the details automatically.
- **Smart Transaction Defaults**: The AI will now intelligently default to "Tunai" (Cash) for the wallet and "today" for the date if not specified, reducing manual input.
- **Instant Transaction Insights**: When using "Catat Cepat", the app now provides instant, non-AI insights on how the new transaction will affect your budget and wallet balance before you even save it.
- **Animated Counters**: Key financial numbers like total balance, income, and expenses on the homepage now animate when they change, providing a more dynamic and satisfying user experience.

### 🎨 Enhancements & Fixes

- **Intuitive Budget Creation**: The "Add Budget" flow has been revamped with a slider and quick-select buttons, making it easier and more interactive to set a target amount.
- **Streamlined Transaction History**: The transaction history page now features a cleaner header with a compact, icon-based filter sheet, providing more space for content. Filters are now progressively disclosed for a tidier interface.
- **Improved Budget Visualization**: The progress bar on the budget detail page now dynamically changes color (blue, yellow, red) to indicate whether spending is safe, nearing the limit, or has exceeded it.
- **UI Consistency & Fixes**:
    - Addressed a key `z-index` issue where page content would scroll over the header.
    - Fixed a page-flickering issue during navigation by optimizing the global state provider's location.
    - Resolved several React warnings and errors, including `indicatorClassName` prop and initialization errors.
    - Improved the touch target and visual design of the filter removal "X" button.
    - Removed the inconsistent "Back" button from the main Budgeting page header.

## [Version 1.1.0] - September 2025

This is our first major feature release focused on improving tracking details and user experience.

### ✨ New Features

- **Sub-Categories**: You can now add sub-categories for each transaction, providing deeper insights into your spending and income. Simply select a main category, and a panel will appear to choose a sub-category.
- **Transaction Location/Store**: Add a location or store name as an optional field when creating a transaction to remember where you made the purchase.
- **Updated Category Structure**: We've revamped and added several new, more relevant categories for digital workers and freelancers, such as "Subscriptions" (for software, cloud, etc.) and "Side Hustle" as a primary income category.

### 🎨 Enhancements & Fixes

- **UI Consistency**: The transaction history is now always grouped by date (`Today`, `Yesterday`, etc.) across all sections of the app for a more consistent experience.
- **Cleaner Layout**: Long category names in the transaction form will now be truncated with an ellipsis (...) to keep the layout clean.
- **Homepage Background**: The homepage now uses a light gray background (`bg-muted`) to be uniform with other pages.
- **Simplified Header**: The duplicate "Settings" button in the homepage header has been removed to simplify navigation.

