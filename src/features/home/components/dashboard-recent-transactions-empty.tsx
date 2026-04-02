'use client';

import { Receipt } from '@phosphor-icons/react';
import { useUI } from '@/components/ui-provider';
import { EmptyState } from '@/components/empty-state';

export const DashboardRecentTransactionsEmpty = () => {
    const { openTransactionSheet } = useUI();

    return (
        <EmptyState
            title="Transaksi Terakhir"
            description="Mulai kelola keuangan dengan mencatat pengeluaran dan pemasukan hari ini."
            actionLabel="Catat Sekarang"
            onAction={() => openTransactionSheet()}
            icon={Receipt}
            className="md:min-h-[350px] pt-0 px-0"
        />
    );
};
