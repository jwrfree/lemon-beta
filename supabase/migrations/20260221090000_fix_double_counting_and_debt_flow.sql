-- Migration: Fix Double Counting and Debt Flow Integrity
-- Version: 2.3.1
-- Date: 2026-02-21

-- 1. FIX DOUBLE COUNTING: Remove manual balance updates from RPCs
-- These RPCs were accidentally re-adding manual updates that are already handled by triggers.

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
  -- Security check
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = v_auth_user_id) THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;

  INSERT INTO transactions (amount, category, sub_category, date, description, type, wallet_id, user_id, is_need)
  VALUES (p_amount, p_category, p_sub_category, p_date, p_description, p_type, p_wallet_id, v_auth_user_id, p_is_need)
  RETURNING id INTO v_new_tx_id;

  -- Manual balance update REMOVED. Handled by trigger 'on_transaction_change'.

  RETURN jsonb_build_object('id', v_new_tx_id, 'status', 'success');
END;
$$;

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
  
  -- Manual balance update REMOVED. Handled by trigger 'on_transaction_change'.
END;
$$;

-- 2. IMPROVE DEBT FLOW: Link payments to transactions
-- Add transaction_id column to debt_payments for traceablity
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debt_payments' AND column_name='transaction_id') THEN
        ALTER TABLE public.debt_payments ADD COLUMN transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update pay_debt_v1 to store the transaction_id
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
  v_is_owed BOOLEAN;
  v_auth_user_id UUID := auth.uid();
  v_tx_id UUID := NULL;
BEGIN
  SELECT * INTO v_debt FROM debts WHERE id = p_debt_id AND user_id = v_auth_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Debt not found or access denied'; END IF;

  IF p_wallet_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = v_auth_user_id) THEN
      RAISE EXCEPTION 'Wallet not found or access denied';
    END IF;
    
    v_is_owed := (v_debt.direction = 'owed');
    
    -- Create the money transaction first
    INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
    VALUES (
      p_payment_amount, 
      CASE WHEN v_is_owed THEN 'Bayar Hutang' ELSE 'Terima Piutang' END, 
      p_payment_date, 
      (CASE WHEN v_is_owed THEN 'Pembayaran ' ELSE 'Penerimaan ' END) || v_debt.title || ': ' || COALESCE(p_notes, ''), 
      CASE WHEN v_is_owed THEN 'expense' ELSE 'income' END, 
      p_wallet_id, 
      v_auth_user_id
    ) RETURNING id INTO v_tx_id;
  END IF;

  v_new_outstanding := GREATEST(0, (v_debt.outstanding_balance - p_payment_amount));
  v_new_status := CASE WHEN v_new_outstanding <= 0 THEN 'settled' ELSE v_debt.status END;
  
  -- Insert into payment table with transaction link
  INSERT INTO public.debt_payments (
    debt_id, user_id, amount, payment_date, wallet_id, method, notes, transaction_id
  ) VALUES (
    p_debt_id, v_auth_user_id, p_payment_amount, p_payment_date, p_wallet_id, 'manual', p_notes, v_tx_id
  );

  UPDATE debts SET
    outstanding_balance = v_new_outstanding, 
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_debt_id AND user_id = v_auth_user_id;

END;
$$;

-- Update delete_debt_payment_v1 to delete associated transaction
CREATE OR REPLACE FUNCTION delete_debt_payment_v1(
  p_debt_id UUID,
  p_payment_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user_id UUID := auth.uid();
  v_payment_amount NUMERIC;
  v_tx_id UUID;
BEGIN
  -- 1. Get payment info
  SELECT amount, transaction_id INTO v_payment_amount, v_tx_id
  FROM debt_payments
  WHERE id = p_payment_id AND debt_id = p_debt_id AND user_id = v_auth_user_id;

  IF v_payment_amount IS NULL THEN RAISE EXCEPTION 'Payment not found or access denied'; END IF;

  -- 2. Delete the associated money transaction if exists (Trigger will revert wallet balance automatically)
  IF v_tx_id IS NOT NULL THEN
    DELETE FROM transactions WHERE id = v_tx_id AND user_id = v_auth_user_id;
  END IF;

  -- 3. Delete payment record
  DELETE FROM debt_payments WHERE id = p_payment_id;

  -- 4. Restore debt balance
  UPDATE debts SET
    outstanding_balance = outstanding_balance + v_payment_amount,
    status = 'active',
    updated_at = NOW()
  WHERE id = p_debt_id AND user_id = v_auth_user_id;
END;
$$;
