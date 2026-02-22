-- Migration: Drop old JSONB payments column from debts table
-- Date: 2026-02-22
-- Purpose: Remove the legacy `payments` JSONB column from the `debts` table.
--          Debt payments were normalized to a separate `debt_payments` table in
--          migration 20260220130000_normalize_debt_payments.sql. That migration
--          included the DROP but left it commented out pending data verification.
--          Data has since been verified and subsequent migrations use `debt_payments`
--          exclusively. Dropping the column resolves the PostgREST naming conflict
--          with the `payments:debt_payments(*)` embed used in the application.

ALTER TABLE public.debts DROP COLUMN IF EXISTS payments;
