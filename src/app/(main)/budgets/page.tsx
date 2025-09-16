import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { budgets, categories, transactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function BudgetsPage() {
  const spendingByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
        <CardDescription>
          Manage your monthly spending budgets for each category.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          if (!category) return null;

          const spent = spendingByCategory[category.name] || 0;
          const progress = (spent / budget.amount) * 100;
          const remaining = budget.amount - spent;

          return (
            <div key={budget.id} className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                </span>
              </div>
              <Progress value={progress} aria-label={`${category.name} budget progress`} />
              <div className="text-right text-sm text-muted-foreground">
                {remaining >= 0
                  ? `${formatCurrency(remaining)} left`
                  : `${formatCurrency(Math.abs(remaining))} over`}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
