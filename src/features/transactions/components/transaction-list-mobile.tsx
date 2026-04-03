'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TransactionListItem } from './transaction-list-item';
import { formatRelativeDate } from '@/lib/utils';
import { parseISO } from 'date-fns';
import type { Transaction, Wallet } from '@/types/models';
import type { CategoryVisuals } from '@/types/visuals';

interface TransactionListMobileProps {
 groupedTransactions: [string, Transaction[]][];
 wallets: Wallet[];
 getCategoryVisuals: (name: string) => CategoryVisuals;
}

export const TransactionListMobile = ({
 groupedTransactions,
 wallets,
 getCategoryVisuals,
}: TransactionListMobileProps) => {
 return (
 <div className="space-y-6">
 {groupedTransactions.map(([date, transactionsForDay]) => (
 <div key={date} className="space-y-3">
 <h3 className="text-label-sm text-muted-foreground/50 px-5 mb-2">
 {formatRelativeDate(parseISO(date))}
 </h3>
 <Card className="overflow-hidden">
 <CardContent className="p-0">
 {transactionsForDay.map((transaction, index) => (
 <TransactionListItem
 key={transaction.id}
 transaction={{ ...transaction, showDivider: index !== transactionsForDay.length - 1 }}
 wallets={wallets}
 getCategoryVisuals={getCategoryVisuals}
 hideDate
 />
 ))}
 </CardContent>
 </Card>
 </div>
 ))}
 </div>
 );
};
