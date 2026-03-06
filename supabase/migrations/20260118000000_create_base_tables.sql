-- Bootstrap migration: Create base tables that were originally created via Supabase dashboard.
-- These tables are required by subsequent migrations (RLS policies, triggers, RPC functions).

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    balance NUMERIC NOT NULL DEFAULT 0,
    icon TEXT,
    color TEXT,
    type TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    merchant TEXT,
    location TEXT,
    linked_debt_id UUID,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    spent NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    period TEXT DEFAULT 'monthly',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    counterparty TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('owed', 'owing')),
    category TEXT,
    principal NUMERIC NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC NOT NULL DEFAULT 0,
    interest_rate NUMERIC,
    payment_frequency TEXT DEFAULT 'one_time',
    custom_interval INTEGER,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'settled', 'overdue')),
    payments JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL DEFAULT 0,
    current_amount NUMERIC NOT NULL DEFAULT 0,
    target_date TEXT,
    icon TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    due_date TIMESTAMPTZ,
    type TEXT NOT NULL DEFAULT 'one_time',
    category TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    repeat_rule JSONB,
    snooze_count INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    channels TEXT[] DEFAULT '{}',
    target_id TEXT,
    target_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
