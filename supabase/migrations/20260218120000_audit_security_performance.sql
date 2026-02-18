-- Security & Performance Audit Fixes - 2026-02-18
-- Addresses: Missing Indexes, Double-counting bug, Insecure RPCs

-- 1. ADD MISSING INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);

-- 2. ENSURE UNIQUE EMAIL FOR PROFILE (Critical for biometric login)
-- This might fail if there are already duplicate emails, but on a clean setup it's fine.
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- 3. REDEFINE RPCS (Fixing security and double-counting bug)
-- We keep parameters for backward compatibility but override p_user_id with auth.uid()

-- 3.1 Create Transaction
CREATE OR REPLACE FUNCTION create_transaction_v1(
  p_amount NUMERIC,
  p_category TEXT,
  p_date TIMESTAMP,
  p_description TEXT,
  p_type TEXT, 
  p_wallet_id UUID,
  p_user_id UUID,
  p_sub_category TEXT DEFAULT NULL,
  p_is_need BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_tx_id UUID;
  v_auth_user_id UUID := auth.uid();
BEGIN
  -- Security check: Ensure user owns the wallet
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = v_auth_user_id) THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;

  -- Insert Transaction
  -- Trigger 'on_transaction_change' will handle wallet balance update automatically
  INSERT INTO transactions (amount, category, sub_category, date, description, type, wallet_id, user_id, is_need)
  VALUES (p_amount, p_category, p_sub_category, p_date, p_description, p_type, p_wallet_id, v_auth_user_id, p_is_need)
  RETURNING id INTO v_new_tx_id;

  RETURN jsonb_build_object('id', v_new_tx_id, 'status', 'success');
END;
$$;

-- 3.2 Delete Transaction
CREATE OR REPLACE FUNCTION delete_transaction_v1(
  p_transaction_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user_id UUID := auth.uid();
BEGIN
  -- Delete Transaction - Trigger 'on_transaction_change' will handle reverting wallet balance
  DELETE FROM transactions 
  WHERE id = p_transaction_id AND user_id = v_auth_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or access denied';
  END IF;
END;
$$;

-- 3.3 Update Transaction
CREATE OR REPLACE FUNCTION update_transaction_v1(
  p_transaction_id UUID,
  p_new_amount NUMERIC,
  p_new_category TEXT,
  p_new_date TIMESTAMP,
  p_new_description TEXT,
  p_new_type TEXT,
  p_new_wallet_id UUID,
  p_user_id UUID,
  p_new_sub_category TEXT DEFAULT NULL,
  p_new_is_need BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user_id UUID := auth.uid();
BEGIN
  -- Security checks
  IF NOT EXISTS (SELECT 1 FROM transactions WHERE id = p_transaction_id AND user_id = v_auth_user_id) THEN
    RAISE EXCEPTION 'Transaction not found or access denied';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_new_wallet_id AND user_id = v_auth_user_id) THEN
    RAISE EXCEPTION 'Destination wallet not found or access denied';
  END IF;

  -- Update Transaction - Trigger 'on_transaction_change' will handle wallet balance adjustment
  UPDATE transactions SET
    amount = p_new_amount,
    category = p_new_category,
    sub_category = p_new_sub_category,
    date = p_new_date,
    description = p_new_description,
    type = p_new_type,
    wallet_id = p_new_wallet_id,
    is_need = p_new_is_need
  WHERE id = p_transaction_id AND user_id = v_auth_user_id;
END;
$$;

-- 3.4 Create Transfer
CREATE OR REPLACE FUNCTION create_transfer_v1(
  p_from_wallet_id UUID,
  p_to_wallet_id UUID,
  p_amount NUMERIC,
  p_date TIMESTAMP,
  p_description TEXT,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_wallet_name TEXT;
  v_to_wallet_name TEXT;
  v_auth_user_id UUID := auth.uid();
BEGIN
  -- Security checks
  SELECT name INTO v_from_wallet_name FROM wallets WHERE id = p_from_wallet_id AND user_id = v_auth_user_id;
  SELECT name INTO v_to_wallet_name FROM wallets WHERE id = p_to_wallet_id AND user_id = v_auth_user_id;

  IF v_from_wallet_name IS NULL OR v_to_wallet_name IS NULL THEN
    RAISE EXCEPTION 'One or both wallets not found or access denied';
  END IF;

  -- Create Transactions - Trigger will handle wallet balance updates for both automatically
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, 'Transfer', p_date, 'Transfer ke ' || v_to_wallet_name || ': ' || p_description, 'expense', p_from_wallet_id, v_auth_user_id);

  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, 'Transfer', p_date, 'Transfer dari ' || v_from_wallet_name || ': ' || p_description, 'income', p_to_wallet_id, v_auth_user_id);
END;
$$;

-- 3.5 Pay Debt
CREATE OR REPLACE FUNCTION pay_debt_v1(
  p_debt_id UUID,
  p_payment_amount NUMERIC,
  p_payment_date TIMESTAMP,
  p_wallet_id UUID,
  p_notes TEXT,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_debt RECORD;
  v_new_outstanding NUMERIC;
  v_new_status TEXT;
  v_new_payments JSONB;
  v_payment_record JSONB;
  v_is_owed BOOLEAN;
  v_auth_user_id UUID := auth.uid();
BEGIN
  -- 1. Security Check
  SELECT * INTO v_debt FROM debts WHERE id = p_debt_id AND user_id = v_auth_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debt not found or access denied';
  END IF;

  IF p_wallet_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = v_auth_user_id) THEN
      RAISE EXCEPTION 'Wallet not found or access denied';
    END IF;
  END IF;

  -- 2. Calculate New State
  v_new_outstanding := GREATEST(0, (v_debt.outstanding_balance - p_payment_amount));
  v_new_status := CASE WHEN v_new_outstanding <= 0 THEN 'settled' ELSE v_debt.status END;
  
  v_payment_record := jsonb_build_object(
    'id', gen_random_uuid(),
    'amount', p_payment_amount,
    'paymentDate', p_payment_date,
    'walletId', p_wallet_id,
    'method', 'manual',
    'notes', p_notes,
    'createdAt', NOW()
  );

  IF v_debt.payments IS NULL THEN
    v_new_payments := jsonb_build_array(v_payment_record);
  ELSE
    v_new_payments := v_debt.payments || v_payment_record;
  END IF;

  -- 3. Update Debt
  UPDATE debts SET
    payments = v_new_payments,
    outstanding_balance = v_new_outstanding,
    status = v_new_status
  WHERE id = p_debt_id AND user_id = v_auth_user_id;

  -- 4. Create Transaction (Trigger handles wallet balance automatically)
  IF p_wallet_id IS NOT NULL THEN
    v_is_owed := (v_debt.direction = 'owed');
    
    IF v_is_owed THEN
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
      VALUES (
        p_payment_amount, 
        'Bayar Hutang', 
        p_payment_date, 
        'Pembayaran ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 
        'expense', 
        p_wallet_id, 
        v_auth_user_id
      );
    ELSE
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
      VALUES (
        p_payment_amount, 
        'Terima Piutang', 
        p_payment_date, 
        'Penerimaan ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 
        'income', 
        p_wallet_id, 
        v_auth_user_id
      );
    END IF;
  END IF;
END;
$$;
