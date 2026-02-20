-- =============================================
-- LEMON BETA - DEBT NORMALIZATION MIGRATION
-- Task: Move debt payments from JSONB to separate table
-- =============================================

-- 1. Create debt_payments table
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    method TEXT DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own debt payments" ON public.debt_payments
    FOR ALL USING (auth.uid() = user_id);

-- 3. Data Migration (JSONB -> Table)
-- We extract existing payments from the JSONB array and insert them into the new table
DO $$
DECLARE
    r RECORD;
    p JSONB;
BEGIN
    FOR r IN SELECT id, user_id, payments FROM public.debts WHERE payments IS NOT NULL AND jsonb_array_length(payments) > 0 LOOP
        FOR p IN SELECT jsonb_array_elements(r.payments) LOOP
            INSERT INTO public.debt_payments (
                id, debt_id, user_id, amount, payment_date, wallet_id, method, notes, created_at
            ) VALUES (
                COALESCE((p->>'id')::UUID, gen_random_uuid()),
                r.id,
                r.user_id,
                (p->>'amount')::NUMERIC,
                COALESCE((p->>'paymentDate')::TIMESTAMPTZ, (p->>'createdAt')::TIMESTAMPTZ, NOW()),
                (p->>'walletId')::UUID,
                COALESCE(p->>'method', 'manual'),
                p->>'notes',
                COALESCE((p->>'createdAt')::TIMESTAMPTZ, NOW())
            );
        END LOOP;
    END LOOP;
END $$;

-- 4. Update RPC: pay_debt_v1
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
BEGIN
  SELECT * INTO v_debt FROM debts WHERE id = p_debt_id AND user_id = v_auth_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Debt not found or access denied'; END IF;

  IF p_wallet_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE id = p_wallet_id AND user_id = v_auth_user_id) THEN
      RAISE EXCEPTION 'Wallet not found or access denied';
    END IF;
  END IF;

  v_new_outstanding := GREATEST(0, (v_debt.outstanding_balance - p_payment_amount));
  v_new_status := CASE WHEN v_new_outstanding <= 0 THEN 'settled' ELSE v_debt.status END;
  
  -- Insert into new table instead of JSONB
  INSERT INTO public.debt_payments (
    debt_id, user_id, amount, payment_date, wallet_id, method, notes
  ) VALUES (
    p_debt_id, v_auth_user_id, p_payment_amount, p_payment_date, p_wallet_id, 'manual', p_notes
  );

  UPDATE debts SET
    outstanding_balance = v_new_outstanding, 
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_debt_id AND user_id = v_auth_user_id;

  IF p_wallet_id IS NOT NULL THEN
    v_is_owed := (v_debt.direction = 'owed');
    IF v_is_owed THEN
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
      VALUES (p_payment_amount, 'Bayar Hutang', p_payment_date, 'Pembayaran ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 'expense', p_wallet_id, v_auth_user_id);
    ELSE
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
      VALUES (p_payment_amount, 'Terima Piutang', p_payment_date, 'Penerimaan ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 'income', p_wallet_id, v_auth_user_id);
    END IF;
  END IF;
END;
$$;

-- 5. Update RPC: delete_debt_payment_v1
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
BEGIN
  -- 1. Get payment amount and verify ownership
  SELECT amount INTO v_payment_amount
  FROM debt_payments
  WHERE id = p_payment_id AND debt_id = p_debt_id AND user_id = v_auth_user_id;

  IF v_payment_amount IS NULL THEN RAISE EXCEPTION 'Payment not found or access denied'; END IF;

  -- 2. Delete payment record
  DELETE FROM debt_payments WHERE id = p_payment_id;

  -- 3. Restore debt balance
  UPDATE debts SET
    outstanding_balance = outstanding_balance + v_payment_amount,
    status = 'active',
    updated_at = NOW()
  WHERE id = p_debt_id AND user_id = v_auth_user_id;
END;
$$;

-- 6. Cleanup: Drop old payments column
-- Uncomment this line ONLY after verifying data migration
-- ALTER TABLE public.debts DROP COLUMN IF EXISTS payments;
