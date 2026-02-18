-- Migration: Atomic Debt Payment Deletion - 2026-02-18
-- Prevents race conditions when deleting payments from JSONB arrays

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
  v_debt RECORD;
  v_payment RECORD;
  v_new_payments JSONB;
  v_payment_amount NUMERIC;
BEGIN
  -- 1. Get Debt & Verify Ownership
  SELECT * INTO v_debt FROM debts WHERE id = p_debt_id AND user_id = v_auth_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debt not found or access denied';
  END IF;

  -- 2. Find and extract the payment amount from the JSONB array
  -- We use a subquery to find the specific payment object
  SELECT (elem->>'amount')::NUMERIC INTO v_payment_amount
  FROM jsonb_array_elements(v_debt.payments) AS elem
  WHERE (elem->>'id')::UUID = p_payment_id;

  IF v_payment_amount IS NULL THEN
    RAISE EXCEPTION 'Payment not found in debt record';
  END IF;

  -- 3. Create the new payments array excluding the target payment
  SELECT jsonb_agg(elem) INTO v_new_payments
  FROM jsonb_array_elements(v_debt.payments) AS elem
  WHERE (elem->>'id')::UUID <> p_payment_id;

  -- Handle case where last payment is deleted (jsonb_agg returns null)
  IF v_new_payments IS NULL THEN
    v_new_payments := '[]'::JSONB;
  END IF;

  -- 4. Atomic Update: Revert balance, update array, and reset status to active
  UPDATE debts SET
    payments = v_new_payments,
    outstanding_balance = outstanding_balance + v_payment_amount,
    status = 'active',
    updated_at = NOW()
  WHERE id = p_debt_id AND user_id = v_auth_user_id;

END;
$$;
