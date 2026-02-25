'use client';

import { HandCoins, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';
import { EmptyState } from '@/components/empty-state';

export const DebtsEmptyState = () => {
    const { setIsDebtModalOpen, setDebtToEdit } = useUI();

    return (
        <EmptyState
            icon={HandCoins}
            title="Belum Ada Catatan"
            description="Kelola hutang dan piutangmu dengan rapi dalam satu tempat yang terorganisir."
            actionLabel="Catat Sekarang"
            onAction={() => {
                setDebtToEdit(null);
                setIsDebtModalOpen(true);
            }}
            variant="default"
        />
    );
};