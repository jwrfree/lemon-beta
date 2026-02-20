-- Migration: Update RPC functions to include is_need support
-- Date: 2026-02-20
-- Description: Updates create_transaction_v1 and update_transaction_v1 to accept p_is_need parameter.

-- Update create_transaction_v1
CREATE OR REPLACE FUNCTION create_transaction_v1(
  p_amount NUMERIC,
  p_category TEXT,
  p_date TIMESTAMP, -- Kept as TIMESTAMP to match existing signature and replace correctly
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
BEGIN
  INSERT INTO transactions (amount, category, sub_category, date, description, type, wallet_id, user_id, is_need)
  VALUES (p_amount, p_category, p_sub_category, p_date, p_description, p_type, p_wallet_id, p_user_id, p_is_need)
  RETURNING id INTO v_new_tx_id;

  IF p_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
  END IF;

  RETURN jsonb_build_object('id', v_new_tx_id, 'status', 'success');
END;
$$;

-- Update update_transaction_v1
CREATE OR REPLACE FUNCTION update_transaction_v1(
  p_transaction_id UUID,
  p_new_amount NUMERIC,
  p_new_category TEXT,
  p_new_date TIMESTAMP, -- Kept as TIMESTAMP
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
  v_old_amount NUMERIC;
  v_old_type TEXT;
  v_old_wallet_id UUID;
BEGIN
  SELECT amount, type, wallet_id INTO v_old_amount, v_old_type, v_old_wallet_id
  FROM transactions
  WHERE id = p_transaction_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Revert old balance effect
  IF v_old_type = 'income' THEN
    UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
  END IF;

  -- Update transaction details
  UPDATE transactions SET
    amount = p_new_amount,
    category = p_new_category,
    sub_category = p_new_sub_category,
    date = p_new_date,
    description = p_new_description,
    type = p_new_type,
    wallet_id = p_new_wallet_id,
    is_need = p_new_is_need
  WHERE id = p_transaction_id;

  -- Apply new balance effect
  IF p_new_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id;
  END IF;
END;
$$;
