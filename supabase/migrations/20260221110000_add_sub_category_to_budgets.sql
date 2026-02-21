-- Migration: Add sub_category to budgets table
-- Date: 2026-02-21

ALTER TABLE IF EXISTS public.budgets ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Update the budget spent calculation trigger to support sub_category
CREATE OR REPLACE FUNCTION public.handle_budget_spent_update()
RETURNS TRIGGER AS $$
DECLARE
    v_tx_month DATE;
    v_old_tx_month DATE;
BEGIN
    -- 1. HANDLE INSERT
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'expense') THEN
            v_tx_month := DATE_TRUNC('month', NEW.date);
            
            UPDATE public.budgets 
            SET spent = spent + NEW.amount
            WHERE user_id = NEW.user_id 
              AND category = NEW.category
              AND (sub_category IS NULL OR sub_category = NEW.sub_category)
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
              AND (sub_category IS NULL OR sub_category = OLD.sub_category)
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
              AND (sub_category IS NULL OR sub_category = OLD.sub_category)
              AND DATE_TRUNC('month', created_at) = v_old_tx_month;
        END IF;

        -- B. Apply NEW transaction impact
        IF (NEW.type = 'expense') THEN
            v_tx_month := DATE_TRUNC('month', NEW.date);
            
            UPDATE public.budgets 
            SET spent = spent + NEW.amount
            WHERE user_id = NEW.user_id 
              AND category = NEW.category
              AND (sub_category IS NULL OR sub_category = NEW.sub_category)
              AND DATE_TRUNC('month', created_at) = v_tx_month;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. INITIAL SYNC (Heal existing budgets)
-- This updates 'spent' for all budgets based on current transaction history, respecting sub_category
UPDATE public.budgets b
SET spent = COALESCE((
    SELECT SUM(amount)
    FROM public.transactions t
    WHERE t.user_id = b.user_id
      AND t.category = b.category
      AND (b.sub_category IS NULL OR b.sub_category = t.sub_category)
      AND t.type = 'expense'
      AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', b.created_at)
), 0);
