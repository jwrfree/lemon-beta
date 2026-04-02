-- Fix for Profiles Table Schema - 2026-04-02
-- Ensures consistency between application code and database schema

-- 1. Ensure columns exist with correct names and types
DO $$ 
BEGIN
    -- Add display_name if missing
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'display_name') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    END IF;

    -- Add photo_url if missing
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'photo_url') THEN
        ALTER TABLE public.profiles ADD COLUMN photo_url TEXT;
    END IF;

    -- Add onboarding_status if missing (Crucial for app guidance)
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'onboarding_status') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_status JSONB DEFAULT '{"steps":{"wallet":false,"transaction":false,"goal":false},"isDismissed":false}'::jsonb;
    END IF;

    -- Ensure updated_at exists for sync
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Update handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, photo_url, onboarding_status)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'displayName', 'Setia Lemon'), 
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'photoURL'),
    '{"steps":{"wallet":false,"transaction":false,"goal":false},"isDismissed":false}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    photo_url = COALESCE(EXCLUDED.photo_url, profiles.photo_url);
  RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add Account Deletion Helper (Optional RPC for data privacy)
-- This allows deleting all user data in one transaction if needed by the app
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if it's the current user
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized data deletion attempt';
    END IF;

    -- Delete from all related tables (profiles will be deleted by ON DELETE CASCADE from auth.users)
    DELETE FROM public.transactions WHERE user_id = p_user_id;
    DELETE FROM public.wallets WHERE user_id = p_user_id;
    DELETE FROM public.budgets WHERE user_id = p_user_id;
    DELETE FROM public.debts WHERE user_id = p_user_id;
    DELETE FROM public.goals WHERE user_id = p_user_id;
    DELETE FROM public.reminders WHERE user_id = p_user_id;
    DELETE FROM public.audit_logs WHERE user_id = p_user_id;
    DELETE FROM public.assets WHERE user_id = p_user_id;
    DELETE FROM public.liabilities WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
