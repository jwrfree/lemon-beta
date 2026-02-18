-- Migration: Atomic Budget Synchronization - 2026-02-18
-- Automatically updates budgets.spent when transactions are created, modified, or deleted.

CREATE OR REPLACE FUNCTION public.handle_budget_spent_update()
RETURNS TRIGGER AS $$
DECLARE
    v_tx_month DATE;
    v_old_tx_month DATE;
BEGIN
    -- Only process 'expense' transactions for budgets
    -- We use DATE_TRUNC to match the 'monthly' period assumption
    
    -- 1. HANDLE INSERT
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'expense') THEN
            v_tx_month := DATE_TRUNC('month', NEW.date);
            
            UPDATE public.budgets 
            SET spent = spent + NEW.amount
            WHERE user_id = NEW.user_id 
              AND category = NEW.category
              -- Match budgets created in the same month as the transaction
              AND DATE_TRUNC('month', created_at) = v_tx_month;
        END IF;

    -- 2. HANDLE DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.type = 'expense') THEN
            v_old_tx_month := DATE_TRUNC('month', OLD.date);
            
            UPDATE public.budgets 
            SET spent = GREATEST(0, spent - OLD.amount)
            WHERE user_id = OLD.user_id 
              AND category = OLD.category
              AND DATE_TRUNC('month', created_at) = v_old_tx_month;
        END IF;

    -- 3. HANDLE UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        -- A. Revert OLD transaction impact
        IF (OLD.type = 'expense') THEN
            v_old_tx_month := DATE_TRUNC('month', OLD.date);
            
            UPDATE public.budgets 
            SET spent = GREATEST(0, spent - OLD.amount)
            WHERE user_id = OLD.user_id 
              AND category = OLD.category
              AND DATE_TRUNC('month', created_at) = v_old_tx_month;
        END IF;

        -- B. Apply NEW transaction impact
        IF (NEW.type = 'expense') THEN
            v_tx_month := DATE_TRUNC('month', NEW.date);
            
            UPDATE public.budgets 
            SET spent = spent + NEW.amount
            WHERE user_id = NEW.user_id 
              AND category = NEW.category
              AND DATE_TRUNC('month', created_at) = v_tx_month;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to transactions table
DROP TRIGGER IF EXISTS on_transaction_budget_sync ON public.transactions;
CREATE TRIGGER on_transaction_budget_sync
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_budget_spent_update();

-- 4. INITIAL SYNC (Heal existing stale budgets)
-- This updates 'spent' for all budgets based on current transaction history
UPDATE public.budgets b
SET spent = COALESCE((
    SELECT SUM(amount)
    FROM public.transactions t
    WHERE t.user_id = b.user_id
      AND t.category = b.category
      AND t.type = 'expense'
      AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', b.created_at)
), 0);
