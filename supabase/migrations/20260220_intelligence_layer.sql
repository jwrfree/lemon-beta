-- =============================================
-- LEMON BETA - INTELLIGENCE LAYER (Complexity Control)
-- Task: Implement Spending Velocity & Risk Scoring
-- =============================================

-- 1. Daily Spending Summary (View for Trend Analysis)
CREATE OR REPLACE VIEW public.vw_daily_spending AS
SELECT 
    user_id,
    date_trunc('day', date) as day,
    category,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM public.transactions
WHERE type = 'expense'
GROUP BY user_id, day, category;

-- 2. Monthly Summary Table (Precomputed for performance)
CREATE TABLE IF NOT EXISTS public.monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_date DATE NOT NULL, -- First day of the month
    total_income NUMERIC DEFAULT 0,
    total_expense NUMERIC DEFAULT 0,
    net_cashflow NUMERIC DEFAULT 0,
    velocity_score NUMERIC DEFAULT 1, -- 1 = Normal, >1 = Faster, <1 = Slower
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_date)
);

-- 3. Function to Recalculate Monthly Summary
CREATE OR REPLACE FUNCTION public.refresh_monthly_summary(p_user_id UUID, p_month DATE)
RETURNS VOID AS $$
DECLARE
    v_income NUMERIC;
    v_expense NUMERIC;
    v_prev_expense NUMERIC;
    v_velocity NUMERIC := 1;
    v_days_passed INTEGER;
    v_days_in_month INTEGER;
BEGIN
    -- 1. Get totals for current month
    SELECT COALESCE(SUM(amount), 0) INTO v_income FROM transactions 
    WHERE user_id = p_user_id AND type = 'income' AND date_trunc('month', date) = p_month;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_expense FROM transactions 
    WHERE user_id = p_user_id AND type = 'expense' AND date_trunc('month', date) = p_month;

    -- 2. Calculate Velocity (MTD comparison)
    v_days_passed := EXTRACT(DAY FROM LEAST(NOW(), p_month + interval '1 month' - interval '1 day'));
    v_days_in_month := EXTRACT(DAY FROM (p_month + interval '1 month' - interval '1 day'));

    -- Get previous month total for same period (MTD)
    SELECT COALESCE(SUM(amount), 0) INTO v_prev_expense FROM transactions 
    WHERE user_id = p_user_id 
    AND type = 'expense' 
    AND date >= (p_month - interval '1 month')
    AND date <= (p_month - interval '1 month' + (v_days_passed || ' days')::interval);

    IF v_prev_expense > 0 THEN
        v_velocity := v_expense / v_prev_expense;
    END IF;

    -- 3. Upsert into summary table
    INSERT INTO public.monthly_summaries (user_id, month_date, total_income, total_expense, net_cashflow, velocity_score, updated_at)
    VALUES (p_user_id, p_month, v_income, v_expense, v_income - v_expense, v_velocity, NOW())
    ON CONFLICT (user_id, month_date) DO UPDATE SET
        total_income = EXCLUDED.total_income,
        total_expense = EXCLUDED.total_expense,
        net_cashflow = EXCLUDED.net_cashflow,
        velocity_score = EXCLUDED.velocity_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to keep Summary Updated
CREATE OR REPLACE FUNCTION public.trig_update_monthly_summary()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.refresh_monthly_summary(
        COALESCE(NEW.user_id, OLD.user_id), 
        date_trunc('month', COALESCE(NEW.date, OLD.date))::DATE
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_summary_update ON public.transactions;
CREATE TRIGGER on_transaction_summary_update
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.trig_update_monthly_summary();

-- 5. Risk Scoring Function
CREATE OR REPLACE FUNCTION public.get_spending_risk_score(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_balance NUMERIC;
    v_month_expense NUMERIC;
    v_velocity NUMERIC;
    v_burn_rate NUMERIC; -- Average daily spending
    v_days_passed INTEGER;
    v_risk_level TEXT := 'Low';
    v_risk_score INTEGER := 0;
    v_insight TEXT;
BEGIN
    -- Get current state
    SELECT COALESCE(SUM(balance), 0) INTO v_total_balance FROM wallets WHERE user_id = p_user_id;
    
    -- Ambil summary terbaru, jika belum ada buat dulu
    SELECT total_expense, velocity_score INTO v_month_expense, v_velocity 
    FROM monthly_summaries 
    WHERE user_id = p_user_id AND month_date = date_trunc('month', NOW())::DATE;
    
    IF NOT FOUND THEN
        PERFORM public.refresh_monthly_summary(p_user_id, date_trunc('month', NOW())::DATE);
        SELECT total_expense, velocity_score INTO v_month_expense, v_velocity 
        FROM monthly_summaries 
        WHERE user_id = p_user_id AND month_date = date_trunc('month', NOW())::DATE;
    END IF;

    v_days_passed := EXTRACT(DAY FROM NOW());
    v_burn_rate := COALESCE(v_month_expense / GREATEST(v_days_passed, 1), 0);

    -- Weighted Scoring Logic
    -- Velocity weight
    IF COALESCE(v_velocity, 0) > 1.2 THEN v_risk_score := v_risk_score + 40; ELSIF COALESCE(v_velocity, 0) > 1.05 THEN v_risk_score := v_risk_score + 20; END IF;
    
    -- Balance vs Burn weight (Survival days)
    IF v_burn_rate > 0 THEN
        IF (v_total_balance / v_burn_rate) < 7 THEN v_risk_score := v_risk_score + 50;
        ELSIF (v_total_balance / v_burn_rate) < 14 THEN v_risk_score := v_risk_score + 30;
        END IF;
    END IF;

    -- Final Risk Determination
    IF v_risk_score >= 70 THEN v_risk_level := 'Critical';
    ELSIF v_risk_score >= 40 THEN v_risk_level := 'Moderate';
    ELSE v_risk_level := 'Low';
    END IF;

    RETURN jsonb_build_object(
        'level', v_risk_level,
        'score', v_risk_score,
        'burn_rate', v_burn_rate,
        'velocity', COALESCE(v_velocity, 1),
        'balance', v_total_balance,
        'survival_days', ROUND(v_total_balance / GREATEST(v_burn_rate, 1))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Security (RLS)
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own monthly summaries" ON public.monthly_summaries;
CREATE POLICY "Users can view their own monthly summaries"
    ON public.monthly_summaries FOR SELECT
    USING (auth.uid() = user_id);
