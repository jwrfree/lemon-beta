import { transactions, wallets } from "@/lib/data";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ArrowDownLeft, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CategorySpendChart } from "@/components/dashboard/category-spend-chart";

export default function DashboardPage() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:col-span-2 xl:col-span-3">
        <StatsCard
          title="Total Balance"
          amount={totalBalance}
          icon={Wallet}
          description="Across all wallets"
        />
        <StatsCard
          title="Total Income"
          amount={totalIncome}
          icon={ArrowUpRight}
          description="This month"
        />
        <StatsCard
          title="Total Expenses"
          amount={totalExpense}
          icon={ArrowDownLeft}
          description="This month"
        />
      </div>
      <div className="xl:col-span-2">
        <OverviewChart />
      </div>
      <div>
        <CategorySpendChart />
      </div>
      <div className="xl:col-span-3">
        <RecentTransactions />
      </div>
    </div>
  );
}
