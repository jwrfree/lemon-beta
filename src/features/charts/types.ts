export interface DailyExpense {
    date: string;
    expense: number;
}

export interface DailyMetric extends DailyExpense {
    count: number;
}

export interface MonthlyMetric {
    month: string;
    income: number;
    expense: number;
    net: number;
}

export interface CategoryTotal {
    name: string;
    value: number;
}

export interface MonthData {
    income: number;
    expense: number;
    net: number;
    expenseCategories: CategoryTotal[];
}
