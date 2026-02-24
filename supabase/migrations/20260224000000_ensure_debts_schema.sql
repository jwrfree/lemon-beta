-- Migration: Ensure complete debts table schema
-- Date: 2026-02-24
-- Purpose: The debts table may have been created via the Supabase dashboard without
--          all the columns the application requires. This migration safely adds any
--          missing columns using ADD COLUMN IF NOT EXISTS and ensures correct defaults.

-- 1. Create debts table if it does not exist yet
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    counterparty TEXT NOT NULL DEFAULT '',
    principal NUMERIC NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC NOT NULL DEFAULT 0,
    direction TEXT NOT NULL DEFAULT 'owed',
    category TEXT NOT NULL DEFAULT 'personal',
    status TEXT NOT NULL DEFAULT 'active',
    interest_rate NUMERIC,
    payment_frequency TEXT NOT NULL DEFAULT 'monthly',
    custom_interval INTEGER,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add any missing columns to an existing table (idempotent)
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'owed';
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'personal';
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS interest_rate NUMERIC;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS payment_frequency TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS custom_interval INTEGER;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMPTZ;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS counterparty TEXT NOT NULL DEFAULT '';
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Add CHECK constraints (safe with IF NOT EXISTS pattern via DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'debts_direction_check'
          AND constraint_schema = 'public'
    ) THEN
        ALTER TABLE public.debts
            ADD CONSTRAINT debts_direction_check CHECK (direction IN ('owed', 'owing'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'debts_status_check'
          AND constraint_schema = 'public'
    ) THEN
        ALTER TABLE public.debts
            ADD CONSTRAINT debts_status_check CHECK (status IN ('active', 'settled', 'overdue'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints
        WHERE constraint_name = 'debts_payment_frequency_check'
          AND constraint_schema = 'public'
    ) THEN
        ALTER TABLE public.debts
            ADD CONSTRAINT debts_payment_frequency_check
            CHECK (payment_frequency IN ('one_time', 'weekly', 'biweekly', 'monthly', 'custom'));
    END IF;
END $$;

-- 4. Enable RLS (idempotent)
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can manage their own debts'
          AND tablename = 'debts'
    ) THEN
        CREATE POLICY "Users can manage their own debts" ON public.debts
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Create index for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_direction ON public.debts(direction);

-- 7. Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_debts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS debts_updated_at_trigger ON public.debts;
CREATE TRIGGER debts_updated_at_trigger
    BEFORE UPDATE ON public.debts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_debts_updated_at();
