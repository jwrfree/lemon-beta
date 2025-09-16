export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  wallet: string;
};

export type Wallet = {
  id: string;
  name: string;
  balance: number;
};

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: "monthly";
};

export const categories: Category[] = [
  { id: "cat-1", name: "Groceries", type: "expense" },
  { id: "cat-2", name: "Transport", type: "expense" },
  { id: "cat-3", name: "Entertainment", type: "expense" },
  { id: "cat-4", name: "Housing", type: "expense" },
  { id: "cat-5", name: "Healthcare", type: "expense" },
  { id: "cat-6", name: "Salary", type: "income" },
  { id: "cat-7", name: "Freelance", type: "income" },
  { id: "cat-8", name: "Food", type: "expense" },
];

export const wallets: Wallet[] = [
  { id: "wal-1", name: "Main Bank Account", balance: 5210.5 },
  { id: "wal-2", name: "Credit Card", balance: -580.2 },
  { id: "wal-3", name: "Cash", balance: 320.0 },
];

export const budgets: Budget[] = [
    { id: "bud-1", categoryId: "cat-1", amount: 500, period: "monthly" },
    { id: "bud-2", categoryId: "cat-8", amount: 300, period: "monthly" },
    { id: "bud-3", categoryId: "cat-2", amount: 150, period: "monthly" },
    { id: "bud-4", categoryId: "cat-3", amount: 200, period: "monthly" },
];

const today = new Date();
const generateDate = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
};

export const transactions: Transaction[] = [
  { id: "txn-1", date: generateDate(1), description: "Grocery shopping", amount: 75.5, type: "expense", category: "Groceries", wallet: "Main Bank Account" },
  { id: "txn-2", date: generateDate(1), description: "Monthly salary", amount: 3000, type: "income", category: "Salary", wallet: "Main Bank Account" },
  { id: "txn-3", date: generateDate(2), description: "Train ticket", amount: 25.0, type: "expense", category: "Transport", wallet: "Credit Card" },
  { id: "txn-4", date: generateDate(3), description: "Movie night", amount: 42.0, type: "expense", category: "Entertainment", wallet: "Credit Card" },
  { id: "txn-5", date: generateDate(4), description: "Lunch with friends", amount: 35.8, type: "expense", category: "Food", wallet: "Cash" },
  { id: "txn-6", date: generateDate(5), description: "Freelance project payment", amount: 500, type: "income", category: "Freelance", wallet: "Main Bank Account" },
  { id: "txn-7", date: generateDate(7), description: "Rent payment", amount: 1200, type: "expense", category: "Housing", wallet: "Main Bank Account" },
  { id: "txn-8", date: generateDate(8), description: "Weekly groceries", amount: 90.25, type: "expense", category: "Groceries", wallet: "Main Bank Account" },
  { id: "txn-9", date: generateDate(10), description: "Coffee", amount: 4.5, type: "expense", category: "Food", wallet: "Cash" },
  { id: "txn-10", date: generateDate(12), description: "Pharmacy", amount: 22.0, type: "expense", category: "Healthcare", wallet: "Credit Card" },
  { id: "txn-11", date: generateDate(15), description: "Dinner out", amount: 65.0, type: "expense", category: "Food", wallet: "Credit Card" },
  { id: "txn-12", date: generateDate(20), description: "Bus fare", amount: 15.0, type: "expense", category: "Transport", wallet: "Cash" },
  { id: "txn-13", date: generateDate(25), "description": "Concert tickets", amount: 150, type: "expense", category: "Entertainment", wallet: "Credit Card" },
  { id: "txn-14", date: generateDate(28), "description": "Groceries", amount: 60, type: "expense", category: "Groceries", wallet: "Main Bank Account" },
  { id: "txn-15", date: generateDate(32), "description": "Monthly salary", amount: 3000, type: "income", category: "Salary", wallet: "Main Bank Account" },
];
