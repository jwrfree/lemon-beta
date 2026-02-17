-- Migration: Add sub_category to transactions table
-- Date: 2026-02-16

ALTER TABLE IF EXISTS public.transactions ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Update the RPC functions to support sub_category if they exist
-- (Adding defaults to maintain backward compatibility)

CREATE OR REPLACE FUNCTION create_transaction_v1(
  p_amount NUMERIC,
  p_category TEXT,
  p_date TIMESTAMP,
  p_description TEXT,
  p_type TEXT, 
  p_wallet_id UUID,
  p_user_id UUID,
  p_sub_category TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_tx_id UUID;
BEGIN
  INSERT INTO transactions (amount, category, sub_category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, p_category, p_sub_category, p_date, p_description, p_type, p_wallet_id, p_user_id)
  RETURNING id INTO v_new_tx_id;

  IF p_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
  END IF;

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
  p_new_sub_category TEXT DEFAULT NULL
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
  SELECT amount, type, wallet_id INTO v_old_amount, v_old_type, v_old_wallet_id
  FROM transactions
  WHERE id = p_transaction_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_old_type = 'income' THEN
    UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id;
  END IF;

  UPDATE transactions SET
    amount = p_new_amount,
    category = p_new_category,
    sub_category = p_new_sub_category,
    date = p_new_date,
    description = p_new_description,
    type = p_new_type,
    wallet_id = p_new_wallet_id
  WHERE id = p_transaction_id;

  IF p_new_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id;
  END IF;
END;
$$;
