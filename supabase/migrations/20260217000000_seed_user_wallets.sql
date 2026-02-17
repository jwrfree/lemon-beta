-- Migration: Add Unique Constraint and Seed User Wallets
-- Date: 2026-02-17

-- 1. Ensure unique wallet names per user to avoid duplicates
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_wallet_name_per_user') THEN
        ALTER TABLE public.wallets ADD CONSTRAINT unique_wallet_name_per_user UNIQUE (user_id, name);
    END IF;
END $$;

-- 2. Seed Wallets
DO $$ 
DECLARE 
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.wallets (user_id, name, balance, is_default)
    VALUES 
      (v_user_id, 'Dompet', 0, true),
      (v_user_id, 'Bank BRI', 0, false),
      (v_user_id, 'Bank Mandiri', 0, false),
      (v_user_id, 'Bank BCA', 0, false),
      (v_user_id, 'Seabank', 0, false),
      (v_user_id, 'Bank Jago', 0, false),
      (v_user_id, 'Jenius', 0, false),
      (v_user_id, 'Neobank', 0, false),
      (v_user_id, 'Superbank', 0, false),
      (v_user_id, 'DANA', 0, false),
      (v_user_id, 'Shopeepay', 0, false),
      (v_user_id, 'GoPay', 0, false),
      (v_user_id, 'PayPal', 0, false),
      (v_user_id, 'Saldo Pluang', 0, false),
      (v_user_id, 'SPayLater', 0, false),
      (v_user_id, 'Gopay Later', 0, false)
    ON CONFLICT (user_id, name) DO NOTHING;
  END IF;
END $$;
