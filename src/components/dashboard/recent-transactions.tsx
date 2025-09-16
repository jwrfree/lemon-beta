import { transactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddTransactionSheet } from "../transactions/add-transaction-sheet";

export function RecentTransactions() {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
                The last 5 transactions are shown below.
            </CardDescription>
        </div>
        <div className="ml-auto gap-1">
            <AddTransactionSheet />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="font-medium">{t.description}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {t.wallet}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant={t.type === 'expense' ? 'destructive' : 'secondary'}>
                    {t.type}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    {t.category}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    {new Date(t.date).toLocaleDateString()}
                </TableCell>
                <TableCell className={`text-right ${t.type === 'expense' ? 'text-destructive' : 'text-green-600'}`}>
                    {t.type === 'expense' ? '-' : '+'}
                    {formatCurrency(t.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
