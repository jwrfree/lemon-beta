-- 1. TABLES & RLS SETUP
-- Enable RLS
ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reminders ENABLE ROW LEVEL SECURITY;

-- Universal Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own wallets') THEN
        CREATE POLICY "Users can manage their own wallets" ON wallets FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own transactions') THEN
        CREATE POLICY "Users can manage their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own budgets') THEN
        CREATE POLICY "Users can manage their own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own debts') THEN
        CREATE POLICY "Users can manage their own debts" ON debts FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own goals') THEN
        CREATE POLICY "Users can manage their own goals" ON goals FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own reminders') THEN
        CREATE POLICY "Users can manage their own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own audit logs') THEN
        CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert audit logs') THEN
        CREATE POLICY "Users can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 2. TRANSACTION LOGIC (RPC)
CREATE OR REPLACE FUNCTION create_transaction_v1(p_amount NUMERIC, p_category TEXT, p_date TIMESTAMP, p_description TEXT, p_type TEXT, p_wallet_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_tx_id UUID;
BEGIN
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id)
  VALUES (p_amount, p_category, p_date, p_description, p_type, p_wallet_id, p_user_id) RETURNING id INTO v_new_tx_id;
  IF p_type = 'income' THEN UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
  ELSE UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id; END IF;
  RETURN jsonb_build_object('id', v_new_tx_id, 'status', 'success');
END; $$;

CREATE OR REPLACE FUNCTION delete_transaction_v1(p_transaction_id UUID, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_old_amount NUMERIC; v_old_type TEXT; v_old_wallet_id UUID;
BEGIN
  SELECT amount, type, wallet_id INTO v_old_amount, v_old_type, v_old_wallet_id FROM transactions WHERE id = p_transaction_id AND user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  DELETE FROM transactions WHERE id = p_transaction_id;
  IF v_old_type = 'income' THEN UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
  ELSE UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id; END IF;
END; $$;

CREATE OR REPLACE FUNCTION update_transaction_v1(p_transaction_id UUID, p_new_amount NUMERIC, p_new_category TEXT, p_new_date TIMESTAMP, p_new_description TEXT, p_new_type TEXT, p_new_wallet_id UUID, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_old_amount NUMERIC; v_old_type TEXT; v_old_wallet_id UUID;
BEGIN
  SELECT amount, type, wallet_id INTO v_old_amount, v_old_type, v_old_wallet_id FROM transactions WHERE id = p_transaction_id AND user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF v_old_type = 'income' THEN UPDATE wallets SET balance = balance - v_old_amount WHERE id = v_old_wallet_id;
  ELSE UPDATE wallets SET balance = balance + v_old_amount WHERE id = v_old_wallet_id; END IF;
  UPDATE transactions SET amount = p_new_amount, category = p_new_category, date = p_new_date, description = p_new_description, type = p_new_type, wallet_id = p_new_wallet_id WHERE id = p_transaction_id;
  IF p_new_type = 'income' THEN UPDATE wallets SET balance = balance + p_new_amount WHERE id = p_new_wallet_id;
  ELSE UPDATE wallets SET balance = balance - p_new_amount WHERE id = p_new_wallet_id; END IF;
END; $$;

CREATE OR REPLACE FUNCTION create_transfer_v1(p_from_wallet_id UUID, p_to_wallet_id UUID, p_amount NUMERIC, p_date TIMESTAMP, p_description TEXT, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_from_wallet_name TEXT; v_to_wallet_name TEXT;
BEGIN
  SELECT name INTO v_from_wallet_name FROM wallets WHERE id = p_from_wallet_id;
  SELECT name INTO v_to_wallet_name FROM wallets WHERE id = p_to_wallet_id;
  IF v_from_wallet_name IS NULL OR v_to_wallet_name IS NULL THEN RAISE EXCEPTION 'Wallets not found'; END IF;
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id) VALUES (p_amount, 'Transfer', p_date, 'Transfer ke ' || v_to_wallet_name || ': ' || p_description, 'expense', p_from_wallet_id, p_user_id);
  INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id) VALUES (p_amount, 'Transfer', p_date, 'Transfer dari ' || v_from_wallet_name || ': ' || p_description, 'income', p_to_wallet_id, p_user_id);
  UPDATE wallets SET balance = balance - p_amount WHERE id = p_from_wallet_id;
  UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;
END; $$;

CREATE OR REPLACE FUNCTION pay_debt_v1(p_debt_id UUID, p_payment_amount NUMERIC, p_payment_date TIMESTAMP, p_wallet_id UUID, p_notes TEXT, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_debt RECORD; v_new_outstanding NUMERIC; v_new_status TEXT; v_new_payments JSONB; v_payment_record JSONB; v_is_owed BOOLEAN;
BEGIN
  SELECT * INTO v_debt FROM debts WHERE id = p_debt_id AND user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Debt not found'; END IF;
  v_new_outstanding := GREATEST(0, (v_debt.outstanding_balance - p_payment_amount));
  v_new_status := CASE WHEN v_new_outstanding <= 0 THEN 'settled' ELSE v_debt.status END;
  v_payment_record := jsonb_build_object('id', gen_random_uuid(), 'amount', p_payment_amount, 'paymentDate', p_payment_date, 'walletId', p_wallet_id, 'method', 'manual', 'notes', p_notes, 'createdAt', NOW());
  IF v_debt.payments IS NULL THEN v_new_payments := jsonb_build_array(v_payment_record);
  ELSE v_new_payments := v_debt.payments || v_payment_record; END IF;
  UPDATE debts SET payments = v_new_payments, outstanding_balance = v_new_outstanding, status = v_new_status WHERE id = p_debt_id;
  IF p_wallet_id IS NOT NULL THEN
    v_is_owed := (v_debt.direction = 'owed');
    IF v_is_owed THEN
      UPDATE wallets SET balance = balance - p_payment_amount WHERE id = p_wallet_id;
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id) VALUES (p_payment_amount, 'Bayar Hutang', p_payment_date, 'Pembayaran ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 'expense', p_wallet_id, p_user_id);
    ELSE
      UPDATE wallets SET balance = balance + p_payment_amount WHERE id = p_wallet_id;
      INSERT INTO transactions (amount, category, date, description, type, wallet_id, user_id) VALUES (p_payment_amount, 'Terima Piutang', p_payment_date, 'Penerimaan ' || v_debt.title || ': ' || COALESCE(p_notes, ''), 'income', p_wallet_id, p_user_id);
    END IF;
  END IF;
END; $$;

-- 3. BALANCE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_transaction_balance_update() RETURNS TRIGGER AS $$
DECLARE current_balance BIGINT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'income') THEN UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'expense') THEN UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id; END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'income') THEN UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'expense') THEN UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id; END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.type = 'income') THEN UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'expense') THEN UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id; END IF;
        IF (NEW.type = 'income') THEN UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'expense') THEN UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id; END IF;
    END IF;
    RETURN NULL;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change AFTER INSERT OR UPDATE OR DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_balance_update();

-- 4. PROFILES & BIOMETRIC
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  is_biometric_enabled BOOLEAN DEFAULT FALSE,
  biometric_credential_id TEXT,
  biometric_credential_public_key TEXT,
  biometric_counter BIGINT DEFAULT 0,
  login_challenge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, photo_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
