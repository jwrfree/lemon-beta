import { transactions } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";

export default function TransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              View and manage all your transactions.
            </CardDescription>
          </div>
          <AddTransactionSheet />
        </div>
      </CardHeader>
      <CardContent>
        <TransactionsTable data={transactions} />
      </CardContent>
    </Card>
  );
}
