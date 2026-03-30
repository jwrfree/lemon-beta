import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface UnifiedFinancialContext {
    wealth: {
        cash: number;
        assets: number;
        liabilities: number;
        net_worth: number;
    };
    budgets: {
        name: string;
        limit: number;
        spent: number;
        percent: number;
    }[];
    goals: {
        name: string;
        target: number;
        current: number;
        percent: number;
    }[];
    risk: {
        level: 'Low' | 'Moderate' | 'Critical';
        score: number;
        burn_rate: number;
        velocity: number;
        balance: number;
        survival_days: number;
    };
    monthly: {
        income: number;
        expense: number;
        cashflow: number;
        velocity: number;
    };
    top_categories: {
        category: string;
        amount: number;
    }[];
    largest_expense: {
        description: string;
        category: string;
        amount: number;
    } | null;
    budget_alerts: {
        name: string;
        limit: number;
        spent: number;
        percent: number;
    }[];
    expense_transaction_count: number;
    timestamp: string;
}

type ContextClient = Pick<SupabaseClient, 'rpc' | 'from'>;

type RpcErrorLike = {
    message?: string;
    code?: string;
    hint?: string | null;
    details?: string | null;
};

type BudgetRow = {
    name: string;
    amount: number | string | null;
    spent: number | string | null;
    category: string | null;
};

type GoalRow = {
    name: string;
    target_amount: number | string | null;
    current_amount: number | string | null;
};

type SummaryRow = {
    total_income: number | string | null;
    total_expense: number | string | null;
    net_cashflow: number | string | null;
    velocity_score: number | string | null;
};

type TransactionRow = {
    amount: number | string | null;
    category: string | null;
    type: 'income' | 'expense' | string | null;
    description?: string | null;
};

type WalletRow = {
    balance: number | string | null;
};

type AssetRow = {
    value: number | string | null;
};

type LiabilityRow = {
    value: number | string | null;
};

type DebtRow = {
    outstanding_balance: number | string | null;
    direction: string | null;
};

const toNumber = (value: unknown) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const monthRange = () => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        monthDate: start.toISOString().slice(0, 10),
    };
};

const normalizeContext = (data: Partial<UnifiedFinancialContext> | null): UnifiedFinancialContext | null => {
    if (!data) return null;

    return {
        wealth: {
            cash: toNumber(data.wealth?.cash),
            assets: toNumber(data.wealth?.assets),
            liabilities: toNumber(data.wealth?.liabilities),
            net_worth: toNumber(data.wealth?.net_worth),
        },
        budgets: Array.isArray(data.budgets)
            ? data.budgets.map((budget) => ({
                name: budget.name ?? 'Tanpa Nama',
                limit: toNumber(budget.limit),
                spent: toNumber(budget.spent),
                percent: toNumber(budget.percent),
            }))
            : [],
        goals: Array.isArray(data.goals)
            ? data.goals.map((goal) => ({
                name: goal.name ?? 'Tanpa Nama',
                target: toNumber(goal.target),
                current: toNumber(goal.current),
                percent: toNumber(goal.percent),
            }))
            : [],
        risk: {
            level: data.risk?.level === 'Critical' || data.risk?.level === 'Moderate' ? data.risk.level : 'Low',
            score: toNumber(data.risk?.score),
            burn_rate: toNumber(data.risk?.burn_rate),
            velocity: toNumber(data.risk?.velocity),
            balance: toNumber(data.risk?.balance),
            survival_days: toNumber(data.risk?.survival_days),
        },
        monthly: {
            income: toNumber(data.monthly?.income),
            expense: toNumber(data.monthly?.expense),
            cashflow: toNumber(data.monthly?.cashflow),
            velocity: toNumber(data.monthly?.velocity),
        },
        top_categories: Array.isArray(data.top_categories)
            ? data.top_categories.map((item) => ({
                category: item.category ?? 'Lainnya',
                amount: toNumber(item.amount),
            }))
            : [],
        largest_expense: data.largest_expense
            ? {
                description: data.largest_expense.description ?? 'Transaksi terbesar',
                category: data.largest_expense.category ?? 'Lainnya',
                amount: toNumber(data.largest_expense.amount),
            }
            : null,
        budget_alerts: Array.isArray(data.budget_alerts)
            ? data.budget_alerts.map((budget) => ({
                name: budget.name ?? 'Tanpa Nama',
                limit: toNumber(budget.limit),
                spent: toNumber(budget.spent),
                percent: toNumber(budget.percent),
            }))
            : [],
        expense_transaction_count: toNumber(data.expense_transaction_count),
        timestamp: typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString(),
    };
};

class FinancialContextService {
    private logRpcError(error: RpcErrorLike) {
        console.error('[FinancialContextService] RPC Error:', {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
        });
    }

    private async getRiskContext(userId: string, supabase: ContextClient) {
        const { data, error } = await supabase.rpc('get_spending_risk_score', {
            p_user_id: userId,
        });

        if (error || !data) {
            if (error) {
                this.logRpcError(error);
            }

            return null;
        }

        return {
            level: data.level === 'Critical' || data.level === 'Moderate' ? data.level : 'Low',
            score: toNumber(data.score),
            burn_rate: toNumber(data.burn_rate),
            velocity: toNumber(data.velocity),
            balance: toNumber(data.balance),
            survival_days: toNumber(data.survival_days),
        } as UnifiedFinancialContext['risk'];
    }

    private buildFallbackRisk(monthly: UnifiedFinancialContext['monthly'], cashBalance: number): UnifiedFinancialContext['risk'] {
        const burnRate = monthly.expense > 0 ? monthly.expense / Math.max(new Date().getDate(), 1) : 0;
        const survivalDays = burnRate > 0 ? Math.round(cashBalance / Math.max(burnRate, 1)) : 999;

        let score = 0;
        if (monthly.velocity > 1.2) score += 40;
        else if (monthly.velocity > 1.05) score += 20;

        if (burnRate > 0) {
            if (survivalDays < 7) score += 50;
            else if (survivalDays < 14) score += 30;
        }

        const level: UnifiedFinancialContext['risk']['level'] =
            score >= 70 ? 'Critical' : score >= 40 ? 'Moderate' : 'Low';

        return {
            level,
            score,
            burn_rate: burnRate,
            velocity: monthly.velocity || 1,
            balance: cashBalance,
            survival_days: survivalDays,
        };
    }

    private async getFallbackContext(userId: string, supabase: ContextClient): Promise<UnifiedFinancialContext | null> {
        const { start, end, monthDate } = monthRange();

        const [
            walletsResult,
            assetsResult,
            liabilitiesResult,
            debtsResult,
            budgetsResult,
            goalsResult,
            summaryResult,
            monthlyTransactionsResult,
            riskFromRpc,
        ] = await Promise.all([
            supabase.from('wallets').select('balance').eq('user_id', userId),
            supabase.from('assets').select('value').eq('user_id', userId),
            supabase.from('liabilities').select('value').eq('user_id', userId),
            supabase.from('debts').select('outstanding_balance,direction').eq('user_id', userId).eq('direction', 'owed'),
            supabase.from('budgets').select('name,amount,spent,category').eq('user_id', userId),
            supabase.from('goals').select('name,target_amount,current_amount').eq('user_id', userId),
            supabase
                .from('monthly_summaries')
                .select('total_income,total_expense,net_cashflow,velocity_score')
                .eq('user_id', userId)
                .eq('month_date', monthDate)
                .maybeSingle(),
            supabase
                .from('transactions')
                .select('amount,category,type,description')
                .eq('user_id', userId)
                .gte('date', start)
                .lt('date', end),
            this.getRiskContext(userId, supabase),
        ]);

        const queryErrors = [
            walletsResult.error,
            assetsResult.error,
            liabilitiesResult.error,
            debtsResult.error,
            budgetsResult.error,
            goalsResult.error,
            summaryResult.error,
            monthlyTransactionsResult.error,
        ].filter(Boolean);

        if (queryErrors.length > 0) {
            queryErrors.forEach((error) => {
                console.error('[FinancialContextService] Fallback Query Error:', error);
            });
        }

        const wallets = (walletsResult.data ?? []) as WalletRow[];
        const assets = (assetsResult.data ?? []) as AssetRow[];
        const liabilities = (liabilitiesResult.data ?? []) as LiabilityRow[];
        const debts = (debtsResult.data ?? []) as DebtRow[];
        const budgets = (budgetsResult.data ?? []) as BudgetRow[];
        const goals = (goalsResult.data ?? []) as GoalRow[];
        const monthlyTransactions = (monthlyTransactionsResult.data ?? []) as TransactionRow[];
        const monthlySummary = (summaryResult.data ?? null) as SummaryRow | null;
        const expenseTransactions = monthlyTransactions.filter((transaction) => transaction.type === 'expense');

        const cash = wallets.reduce((sum, wallet) => sum + toNumber(wallet.balance), 0);
        const totalAssets = assets.reduce((sum, asset) => sum + toNumber(asset.value), 0);
        const totalLiabilities =
            liabilities.reduce((sum, liability) => sum + toNumber(liability.value), 0) +
            debts.reduce((sum, debt) => sum + toNumber(debt.outstanding_balance), 0);

        const monthlyIncome =
            toNumber(monthlySummary?.total_income) ||
            monthlyTransactions
                .filter((transaction) => transaction.type === 'income')
                .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

        const monthlyExpense =
            toNumber(monthlySummary?.total_expense) ||
            expenseTransactions
                .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

        const monthly = {
            income: monthlyIncome,
            expense: monthlyExpense,
            cashflow: toNumber(monthlySummary?.net_cashflow) || monthlyIncome - monthlyExpense,
            velocity: Math.max(toNumber(monthlySummary?.velocity_score), 1),
        };

        const topCategoryMap = new Map<string, number>();
        expenseTransactions.forEach((transaction) => {
            const key = transaction.category?.trim() || 'Lainnya';
            topCategoryMap.set(key, (topCategoryMap.get(key) ?? 0) + toNumber(transaction.amount));
        });

        const topCategories = Array.from(topCategoryMap.entries())
            .map(([category, amount]) => ({ category, amount }))
            .sort((left, right) => right.amount - left.amount)
            .slice(0, 5);

        const budgetSpentByCategory = expenseTransactions.reduce((map, transaction) => {
            const key = transaction.category?.trim() || '';
            if (!key) return map;
            map.set(key, (map.get(key) ?? 0) + toNumber(transaction.amount));
            return map;
        }, new Map<string, number>());

        const normalizedBudgets = budgets.map((budget) => {
            const spent = budget.category ? (budgetSpentByCategory.get(budget.category) ?? toNumber(budget.spent)) : toNumber(budget.spent);
            const limit = toNumber(budget.amount);

            return {
                name: budget.name ?? 'Tanpa Nama',
                limit,
                spent,
                percent: limit > 0 ? (spent / limit) * 100 : 0,
            };
        });

        const budgetAlerts = [...normalizedBudgets]
            .filter((budget) => budget.percent >= 80)
            .sort((left, right) => right.percent - left.percent)
            .slice(0, 3);

        const largestExpense = [...expenseTransactions]
            .sort((left, right) => toNumber(right.amount) - toNumber(left.amount))[0];

        return normalizeContext({
            wealth: {
                cash,
                assets: totalAssets,
                liabilities: totalLiabilities,
                net_worth: cash + totalAssets - totalLiabilities,
            },
            budgets: normalizedBudgets,
            goals: goals.map((goal) => ({
                name: goal.name ?? 'Tanpa Nama',
                target: toNumber(goal.target_amount),
                current: toNumber(goal.current_amount),
                percent: toNumber(goal.target_amount) > 0 ? (toNumber(goal.current_amount) / toNumber(goal.target_amount)) * 100 : 0,
            })),
            risk: riskFromRpc ?? this.buildFallbackRisk(monthly, cash),
            monthly,
            top_categories: topCategories,
            largest_expense: largestExpense
                ? {
                    description: largestExpense.description?.trim() || 'Transaksi terbesar',
                    category: largestExpense.category?.trim() || 'Lainnya',
                    amount: toNumber(largestExpense.amount),
                }
                : null,
            budget_alerts: budgetAlerts,
            expense_transaction_count: expenseTransactions.length,
            timestamp: new Date().toISOString(),
        });
    }

    async getUnifiedContext(
        userId: string,
        client?: ContextClient
    ): Promise<UnifiedFinancialContext | null> {
        const supabase = client ?? createClient();
        const directContext = await this.getFallbackContext(userId, supabase);

        if (directContext) {
            return directContext;
        }

        const { data, error } = await supabase.rpc('get_unified_context', {
            p_user_id: userId,
        });

        if (!error && data) {
            return normalizeContext(data as Partial<UnifiedFinancialContext>);
        }

        if (error) {
            this.logRpcError(error);
        }

        return this.getFallbackContext(userId, supabase);
    }
}

export const financialContextService = new FinancialContextService();
