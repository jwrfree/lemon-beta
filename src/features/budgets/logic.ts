import { startOfMonth, differenceInDays } from 'date-fns';
import { daysInMonth as getDaysInMonth } from '@/lib/utils';
import type { Budget, Transaction } from '@/types/models';

export type BudgetHealthStatus = 'stable' | 'warning' | 'critical' | 'over';

export interface BudgetStats {
    spent: number;
    remaining: number;
    progress: number;
    dailyRate: number;
    daysToZero: number;
    safeDailyLimit: number;
    healthStatus: BudgetHealthStatus;
    projectionStatus: 'stable' | 'warning' | 'critical';
}

/**
 * Centrally calculates budget statistics to ensure consistency across the UI.
 */
export function calculateBudgetStats(budget: Budget, transactions: Transaction[]): BudgetStats {
    const today = new Date();
    const start = startOfMonth(today);
    const dayOfMonth = today.getDate();
    const daysInMonth = getDaysInMonth(today);
    const daysElapsed = Math.max(1, differenceInDays(today, start) + 1);
    const daysLeft = Math.max(0, daysInMonth - dayOfMonth + 1);

    // 1. Calculate Spent
    const spent = transactions
        .filter(t => {
            const categoryMatches = budget.categories.includes(t.category);
            const subCategoryMatches = !budget.subCategory || budget.subCategory === t.subCategory;
            return t.type === 'expense' && categoryMatches && subCategoryMatches;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    // 2. Core Metrics
    const remaining = budget.targetAmount - spent;
    const progress = (spent / budget.targetAmount) * 100;

    // 3. Burn Rate Analysis
    const dailyRate = spent / daysElapsed;
    const daysToZero = dailyRate > 0 ? Math.floor(remaining / dailyRate) : Infinity;

    // Determine projection status based on speed of spending
    let projectionStatus: 'stable' | 'warning' | 'critical' = 'stable';
    if (remaining > 0) {
        if (daysToZero <= 3) projectionStatus = 'critical';
        else if (daysToZero <= 7) projectionStatus = 'warning';
    }

    // 4. Budget Health (Combines progress and projection)
    let healthStatus: BudgetHealthStatus = 'stable';
    if (remaining < 0) {
        healthStatus = 'over';
    } else {
        healthStatus = projectionStatus;
    }

    // 5. Safe Daily Limit
    const safeDailyLimit = remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

    return {
        spent,
        remaining,
        progress,
        dailyRate,
        daysToZero,
        safeDailyLimit,
        healthStatus,
        projectionStatus
    };
}

/**
 * Calculates global budget overview
 */
export function calculateGlobalBudgetOverview(budgets: Budget[], transactions: Transaction[]) {
    const totalBudget = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
    const relevantCategories = Array.from(new Set(budgets.flatMap(b => b.categories)));

    const totalSpent = transactions
        .filter(t => {
            if (t.type !== 'expense') return false;
            // Check if transaction matches ANY budget's category + subCategory
            return budgets.some(b => {
                const categoryMatches = b.categories.includes(t.category);
                const subCategoryMatches = !b.subCategory || b.subCategory === t.subCategory;
                return categoryMatches && subCategoryMatches;
            });
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const totalRemaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
        totalBudget,
        totalSpent,
        totalRemaining,
        percentUsed
    };
}
