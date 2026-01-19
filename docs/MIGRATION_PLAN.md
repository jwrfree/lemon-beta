# Migration Plan: Lemon Beta

This document outlines the technical steps required to address the critical architectural findings from the Audit Report.

## Objective 1: Unify Backend (Remove Firebase)
**Goal**: Remove `src/lib/firebase.ts` and all dependencies on Firebase SDKs, consolidating solely on Supabase.

### Steps:
1.  **Audit Usage**:
    *   Check `src/hooks/use-biometric.ts`: It imports `auth` from firebase. Migrate this to WebAuthn via Supabase or a library like `@simplewebauthn` that works with any backend.
    *   Check `src/features/auth/components/forgot-password-page.tsx`.
    *   Search globally for `firebase` imports.
2.  **Replace Auth Calls**:
    *   Replace `firebase/auth` calls with `supabase.auth`.
3.  **Uninstall Dependencies**:
    *   `npm uninstall firebase firebase-admin`.
4.  **Cleanup**:
    *   Delete `src/lib/firebase.ts`, `src/lib/firebase-admin.ts`, `firebase.json`, `.firebaserc`.

## Objective 2: Server-Side Business Logic (Safe Balances)
**Goal**: Prevent client-side data corruption by moving wallet balance calculations to the database.

### Steps:
1.  **Create Database Trigger (SQL)**:
    *   Write a Postgres Trigger that listens to `INSERT`, `UPDATE`, `DELETE` on the `transactions` table.
    *   Logic:
        *   On `INSERT`: Update `wallets` balance (+/- amount).
        *   On `DELETE`: Revert `wallets` balance.
        *   On `UPDATE`: Revert old amount, Apply new amount.
2.  **Deploy Trigger**:
    *   Run the SQL in Supabase SQL Editor.
3.  **Refactor Client Hooks**:
    *   Modify `src/features/transactions/hooks/use-transaction-actions.ts`.
    *   **Remove** the lines that call `supabase.from('wallets').update(...)`.
    *   Trust the database to handle the update.
4.  **Realtime UI Updates**:
    *   Ensure `useWallets` subscribes to the `wallets` table changes so the UI reflects the new balance automatically after the trigger fires.

## Objective 3: Performance & Context Refactoring
**Goal**: Reduce bundle size and re-renders.

### Steps:
1.  **Optimize `/charts`**:
    *   Refactor `src/features/charts/page.tsx` (or components) to use `next/dynamic` for Recharts, similar to the Dashboard fix.
2.  **Split `AppProvider`**:
    *   Extract `UserContext` (Auth).
    *   Extract `DataContext` (Wallets, Categories).
    *   Wrap the application in these separate providers to isolate state updates.

---
**Timeline Estimate**:
*   **Obj 1 (Firebase Removal)**: 2 Days
*   **Obj 2 (Server Logic)**: 1 Day
*   **Obj 3 (Optimization)**: 1 Day
