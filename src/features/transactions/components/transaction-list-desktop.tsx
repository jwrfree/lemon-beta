'use client';

import { DesktopTransactionTable } from './desktop-transaction-table';
import type { Transaction, Wallet } from '@/types/models';

interface TransactionListDesktopProps {
    transactions: Transaction[];
    wallets: Wallet[];
}

export const TransactionListDesktop = ({ transactions, wallets }: TransactionListDesktopProps) => {
    return <DesktopTransactionTable transactions={transactions} wallets={wallets} />;
};
