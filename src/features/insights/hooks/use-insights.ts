import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { insightService } from '@/lib/services/insight-service';
import type { SpendingRisk, MonthlySummary } from '@/types/models';

export const useInsights = () => {
    const { user, userData } = useAuth();
    const { showToast } = useUI();
    const [risk, setRisk] = useState<SpendingRisk | null>(null);
    const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
    const [briefing, setBriefing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshInsights = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [riskData, summariesData, briefingData] = await Promise.all([
                insightService.getSpendingRisk(user.id),
                insightService.getMonthlySummaries(user.id),
                insightService.getDailyBriefing(user.id, userData?.displayName || 'Sobat Lemon')
            ]);
            setRisk(riskData);
            setSummaries(summariesData);
            setBriefing(briefingData);
        } catch (error) {
            console.error('[useInsights] Hook Error:', error);
            showToast('Gagal memuat insight keuangan. Coba lagi.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, userData?.displayName]); // Only re-create if user.id or displayName changes

    useEffect(() => {
        refreshInsights();
    }, [refreshInsights]);

    return {
        risk,
        summaries,
        briefing,
        isLoading,
        refreshInsights
    };
};
