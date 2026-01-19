-- Function to update wallet balance based on transaction changes
CREATE OR REPLACE FUNCTION public.handle_transaction_balance_update()
RETURNS TRIGGER AS $$
DECLARE
    current_balance BIGINT;
BEGIN
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'income') THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'expense') THEN
            -- Check balance before update
            SELECT balance INTO current_balance FROM public.wallets WHERE id = NEW.wallet_id;
            IF current_balance < NEW.amount THEN
                RAISE EXCEPTION 'Saldo tidak mencukupi di dompet ini.';
            END IF;
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;

    -- Handle DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'income') THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'expense') THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        END IF;
        RETURN OLD;

    -- Handle UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        -- 1. Revert OLD amount from OLD wallet
        IF (OLD.type = 'income') THEN
            UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
        ELSIF (OLD.type = 'expense') THEN
            UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
        END IF;

        -- 2. Apply NEW amount to NEW wallet
        IF (NEW.type = 'income') THEN
            UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
        ELSIF (NEW.type = 'expense') THEN
            -- Check balance before update
            SELECT balance INTO current_balance FROM public.wallets WHERE id = NEW.wallet_id;
            IF current_balance < NEW.amount THEN
                RAISE EXCEPTION 'Saldo tidak mencukupi untuk memperbarui transaksi ini.';
            END IF;
            UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after any change in transactions table
DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_balance_update();
