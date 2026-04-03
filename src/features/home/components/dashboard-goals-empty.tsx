'use client';

import { Target } from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { EmptyState } from '@/components/empty-state';

export const DashboardGoalsEmpty = () => {
    const { setIsGoalModalOpen } = useUI();

    return (
        <EmptyState
            title="Target Keuangan"
            description="Wujudkan impianmu dengan target finansial yang terukur dan terarah."
            actionLabel="Buat Target"
            onAction={() => setIsGoalModalOpen(true)}
            icon={Target}
            className="pt-0 px-0"
        />
    );
};

