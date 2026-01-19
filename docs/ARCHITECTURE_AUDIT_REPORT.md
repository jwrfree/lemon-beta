# Architecture Audit Report: Lemon Beta

**Date:** 19 Januari 2026
**System:** Lemon Beta (Personal Finance PWA)
**Auditor:** Gemini CLI Agent

---

## 1. Scope & System Boundaries
*   **System:** Personal Finance Management Progressive Web App (PWA).
*   **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Shadcn/UI.
*   **Backend Services**: 
    *   **Primary**: Supabase (Auth, Database, Realtime).
    *   **Legacy/Debt**: Firebase (Auth, Firestore) - *Found in codebase, indicates partial migration.*
*   **External Integrations**:
    *   Google Gemini AI (Generative AI).
    *   WebAuthn (Biometric Security).

## 2. Component Architecture
The project follows a **Feature-Based Architecture**, which is highly recommended for scalability.

*   **`src/features/`**: Encapsulates domain logic.
    *   `auth`: Authentication flows.
    *   `transactions`: Core ledger logic (Paginated).
    *   `wallets`: Asset management.
    *   `budgets`, `debts`, `goals`, `reminders`: Auxiliary financial features.
    *   `home`: Dashboard aggregation.
*   **`src/components/ui/`**: Reusable atomic components (Shadcn/UI).
*   **`src/ai/`**: AI Agents and flows for receipt scanning and insights.
*   **`src/lib/`**: Core infrastructure adapters (Supabase, Firebase, Utilities).

## 3. Data Flow & State Management
*   **Read Strategy**: 
    *   Hybrid approach. `useData` (Global Context) fetches high-level metadata (Wallets, Categories).
    *   `usePaginatedTransactions` fetches list data on-demand (Server-side Pagination).
*   **Write Strategy**: 
    *   Optimistic UI updates are partially used.
    *   **Critical Issue**: Business logic (e.g., `newBalance = oldBalance + amount`) is executed on the **Client Side** inside `useTransactionActions.ts`.
    *   **Risk**: Race conditions, data inconsistency, and security bypass capability.

## 4. Security Audit
| Area | Status | Findings | Action Required |
| :--- | :--- | :--- | :--- |
| **Dependencies** | ✅ Secure | 0 Vulnerabilities (post-fix). | Maintain regular audits. |
| **Authentication** | ⚠️ Mixed | **Split Brain**: Both Firebase and Supabase clients are active. | **CRITICAL**: Deprecate Firebase immediately. |
| **Data Integrity** | ❌ High Risk | Client-side balance calculations. | Move logic to Database Triggers or RPC Functions. |
| **API Security** | ⚠️ Review | Ensure RLS policies in Supabase cover all tables. | Audit `firestore.rules` and Supabase Policies. |

## 5. Performance Baseline
*   **Bundle Size**:
    *   Global JS: ~102 kB.
    *   Dashboard (`/home`): **243 kB** (Optimized from 345 kB via Lazy Loading).
    *   Charts Page: ~360 kB (Heavy).
*   **Bottlenecks**: 
    *   `AppProvider` is a "God Context" causing global re-renders.
    *   `recharts` library size is significant.

## 6. Scalability Assessment
*   **Strengths**: Modular folder structure, Next.js App Router, Server-side pagination for transactions.
*   **Weaknesses**: Client-side business logic will fail under concurrency. Dual backend dependencies increase maintenance burden.

## 7. Recommendations Roadmap

### Phase 1: Stabilization (Immediate)
1.  **Remove Firebase**: Identify all usages (Biometric hook) and migrate to Supabase fully. Delete `src/lib/firebase.ts`.
2.  **Server-Side Logic**: Create Supabase Database Functions (RPC) or Triggers to handle Wallet Balance updates automatically when a Transaction is created.

### Phase 2: Optimization
1.  **Context Splitting**: Break `AppProvider` into `AuthProvider`, `WalletProvider`, etc., to reduce re-renders.
2.  **Chart Lazy Loading**: Apply the same `next/dynamic` optimization used in Dashboard to the `/charts` page.

### Phase 3: Testing & Quality
1.  **E2E Testing**: Add Playwright for critical flows (Login -> Add Transaction).
2.  **Unit Tests**: Continue expanding coverage for Hooks (currently only Actions are tested).

---
**Conclusion**: The codebase is modern and well-structured but suffers from a "Split Brain" backend issue and insecure client-side business logic. Addressing these two points is critical for a production-ready system.
