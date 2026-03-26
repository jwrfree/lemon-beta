-- =============================================
-- LEMON BETA - UNIFIED FINANCIAL CONTEXT (UFC)
-- Purpose: Consolidate all financial entities for holistic analysis
-- =============================================

-- 1. Unified Budget Status View
-- Maps MTD spending to budgets via categories
CREATE OR REPLACE VIEW public.vw_budget_performance AS
SELECT 
    b.user_id,
    b.id as budget_id,
    b.name as budget_name,
    b.amount as budget_limit,
    b.category,
    COALESCE(SUM(t.amount), 0) as actual_spent,
    CASE 
        WHEN b.amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.amount) * 100 
        ELSE 0 
    END as utilization_percent
FROM public.budgets b
LEFT JOIN public.transactions t ON 
    t.user_id = b.user_id AND 
    t.category = b.category AND 
    t.type = 'expense' AND 
    date_trunc('month', t.date) = date_trunc('month', NOW())
GROUP BY b.user_id, b.id, b.name, b.amount, b.category;

-- 2. Wealth Index View
-- Aggregates Cash, Assets, and Liabilities/Debts
CREATE OR REPLACE VIEW public.vw_wealth_summary AS
WITH cash AS (
    SELECT user_id, SUM(balance) as total_cash FROM public.wallets GROUP BY user_id
),
assets AS (
    SELECT user_id, SUM(value) as total_assets FROM public.assets GROUP BY user_id
),
liabilities AS (
    SELECT user_id, SUM(value) as total_liabilities FROM public.liabilities GROUP BY user_id
),
debts AS (
    SELECT user_id, SUM(outstanding_balance) as total_debts FROM public.debts WHERE direction = 'owed' GROUP BY user_id
)
SELECT 
    u.id as user_id,
    COALESCE(c.total_cash, 0) as cash,
    COALESCE(a.total_assets, 0) as assets,
    COALESCE(l.total_liabilities, 0) + COALESCE(d.total_debts, 0) as total_liabilities,
    COALESCE(c.total_cash, 0) + COALESCE(a.total_assets, 0) - (COALESCE(l.total_liabilities, 0) + COALESCE(d.total_debts, 0)) as net_worth
FROM auth.users u
LEFT JOIN cash c ON c.user_id = u.id
LEFT JOIN assets a ON a.user_id = u.id
LEFT JOIN liabilities l ON l.user_id = u.id
LEFT JOIN debts d ON d.user_id = u.id;

-- 3. Master RPC: get_unified_context
-- Returns everything in a single JSON call
CREATE OR REPLACE FUNCTION public.get_unified_context(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_wealth JSONB;
    v_budgets JSONB;
    v_goals JSONB;
    v_risk JSONB;
    v_mtd_summary JSONB;
BEGIN
    -- 1. Get Wealth Summary
    SELECT jsonb_build_object(
        'cash', cash,
        'assets', assets,
        'liabilities', total_liabilities,
        'net_worth', net_worth
    ) INTO v_wealth FROM public.vw_wealth_summary WHERE user_id = p_user_id;

    -- 2. Get Budget Performance
    SELECT jsonb_agg(jsonb_build_object(
        'name', budget_name,
        'limit', budget_limit,
        'spent', actual_spent,
        'percent', utilization_percent
    )) INTO v_budgets FROM public.vw_budget_performance WHERE user_id = p_user_id;

    -- 3. Get Goal Progress
    SELECT jsonb_agg(jsonb_build_object(
        'name', name,
        'target', target_amount,
        'current', current_amount,
        'percent', (current_amount / GREATEST(target_amount, 1)) * 100
    )) INTO v_goals FROM public.goals WHERE user_id = p_user_id;

    -- 4. Get Spending Risk (Leverage existing function)
    v_risk := public.get_spending_risk_score(p_user_id);

    -- 5. Get MTD Summary
    SELECT jsonb_build_object(
        'income', total_income,
        'expense', total_expense,
        'cashflow', net_cashflow,
        'velocity', velocity_score
    ) INTO v_mtd_summary 
    FROM public.monthly_summaries 
    WHERE user_id = p_user_id AND month_date = date_trunc('month', NOW())::DATE;

    RETURN jsonb_build_object(
        'wealth', COALESCE(v_wealth, '{}'::jsonb),
        'budgets', COALESCE(v_budgets, '[]'::jsonb),
        'goals', COALESCE(v_goals, '[]'::jsonb),
        'risk', COALESCE(v_risk, '{}'::jsonb),
        'monthly', COALESCE(v_mtd_summary, '{}'::jsonb),
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
