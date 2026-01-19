-- =============================================
-- LEMON BETA - TRANSACTION LOGIC (RPC)
-- Run this in your Supabase SQL Editor to fix race conditions
-- =============================================

-- 1. Create Transaction (Atomic)
CREATE OR REPLACE FUNCTION create_transaction_v1(
  p_amount NUMERIC,
  p_category TEXT,
  p_date TIMESTAMP,
  p_description TEXT,
  p_type TEXT, -- 'income' or 'expense'
  p_wallet_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_tx_id UUID;
BEGIN
  -- 1. Insert Transaction
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, p_category, p_date, p_description, p_type, p_wallet_id, p_user_id)
  RETURNING id INTO v_new_tx_id;

  -- 2. Update Wallet Balance
  IF p_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
  END IF;

  RETURN jsonb_build_object('id', v_new_tx_id, 'status', 'success');
END;
$$;

-- 2. Delete Transaction (Atomic)
CREATE OR REPLACE FUNCTION delete_transaction_v1(
  p_transaction_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_amount NUMERIC;
  v_old_type TEXT;
  v_old_wallet_id UUID;
BEGIN
  -- 1. Get old details
  SELECT amount, type, wallet_id INTO v_old_amount, v_old_type, v_old_wallet_id
  FROM transactions
  WHERE id = p_transaction_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or access denied';
  END IF;

  -- 2. Delete Transaction
  DELETE FROM transactions WHERE id = p_transaction_id;

  -- 3. Revert Wallet Balance
  -- If it was income, we subtract. If expense, we add back.
  IF v_old_type = 'income' THEN
    UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
  END IF;
END;
$$;

-- 3. Update Transaction (Atomic)
CREATE OR REPLACE FUNCTION update_transaction_v1(
  p_transaction_id UUID,
  p_new_amount NUMERIC,
  p_new_category TEXT,
  p_new_date TIMESTAMP,
  p_new_description TEXT,
  p_new_type TEXT,
  p_new_wallet_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_amount NUMERIC;
  v_old_type TEXT;
  v_old_wallet_id UUID;
BEGIN
  -- 1. Get old details
  SELECT amount, type, wallet_id INTO v_old_amount, v_old_type, v_old_wallet_id
  FROM transactions
  WHERE id = p_transaction_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or access denied';
  END IF;

  -- 2. Revert Old Wallet Balance
  IF v_old_type = 'income' THEN
    UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
  END IF;

  -- 3. Update Transaction
  UPDATE transactions SET
    amount = p_new_amount,
    category = p_new_category,
    date = p_new_date,
    description = p_new_description,
    type = p_new_type,
    wallet_id = p_new_wallet_id
  WHERE id = p_transaction_id;

  -- 4. Apply New Wallet Balance
  IF p_new_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id;
  END IF;
END;
$$;

-- 4. Create Transfer (Atomic)
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
AS $$
DECLARE
  v_from_wallet_name TEXT;
  v_to_wallet_name TEXT;
BEGIN
  -- Get wallet names for description
  SELECT name INTO v_from_wallet_name FROM wallets WHERE id = p_from_wallet_id;
  SELECT name INTO v_to_wallet_name FROM wallets WHERE id = p_to_wallet_id;

  IF v_from_wallet_name IS NULL OR v_to_wallet_name IS NULL THEN
    RAISE EXCEPTION 'One or both wallets not found';
  END IF;

  -- 1. Create Expense Transaction (Sender)
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, 'Transfer', p_date, 'Transfer ke ' || v_to_wallet_name || ': ' || p_description, 'expense', p_from_wallet_id, p_user_id);

  -- 2. Create Income Transaction (Receiver)
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, 'Transfer', p_date, 'Transfer dari ' || v_from_wallet_name || ': ' || p_description, 'income', p_to_wallet_id, p_user_id);

  -- 3. Update Sender Balance
  UPDATE wallets SET balance = balance - p_amount WHERE id = p_from_wallet_id;

  -- 4. Update Receiver Balance
  UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;
END;
$$;

-- 5. Pay Debt (Atomic)
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
AS $$
DECLARE
  v_debt RECORD;
  v_new_outstanding NUMERIC;
  v_new_status TEXT;
  v_new_payments JSONB;
  v_payment_record JSONB;
  v_is_owed BOOLEAN;
  v_wallet_balance NUMERIC;
BEGIN
  -- 1. Get Debt Details
  SELECT * INTO v_debt FROM debts WHERE id = p_debt_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debt not found';
  END IF;

  -- 2. Calculate New State
  v_new_outstanding := GREATEST(0, (v_debt.outstanding_balance - p_payment_amount));
  v_new_status := CASE WHEN v_new_outstanding <= 0 THEN 'settled' ELSE v_debt.status END;
  
  -- Create Payment Record JSON
  v_payment_record := jsonb_build_object(
    'id', gen_random_uuid(),
    'amount', p_payment_amount,
    'paymentDate', p_payment_date,
    'walletId', p_wallet_id,
    'method', 'manual', -- or dynamic if needed
    'notes', p_notes,
    'createdAt', NOW()
  );

  -- Append to existing payments (handle null case)
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
  WHERE id = p_debt_id;

  -- 4. Update Wallet & Create Transaction (If Wallet Provided)
  IF p_wallet_id IS NOT NULL THEN
    v_is_owed := (v_debt.direction = 'owed');
    
    -- Update Wallet Balance
    IF v_is_owed THEN
      -- I owe someone, so I pay -> Expense
      UPDATE wallets SET balance = balance - p_payment_amount WHERE id = p_wallet_id;
      
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
      VALUES (
        p_payment_amount, 
        'Bayar Hutang', 
        p_payment_date, 
        'Pembayaran ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 
        'expense', 
        p_wallet_id, 
        p_user_id
      );
    ELSE
      -- Someone owes me, they pay -> Income
      UPDATE wallets SET balance = balance + p_payment_amount WHERE id = p_wallet_id;
      
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
      VALUES (
        p_payment_amount, 
        'Terima Piutang', 
        p_payment_date, 
        'Penerimaan ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 
        'income', 
        p_wallet_id, 
        p_user_id
      );
    END IF;
  END IF;
END;
$$;
