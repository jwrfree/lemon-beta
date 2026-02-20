import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { insightService } from '@/lib/services/insight-service';
import type { SpendingRisk, MonthlySummary } from '@/types/models';

export const useInsights = () => {
    const { user } = useAuth();
    const [risk, setRisk] = useState<SpendingRisk | null>(null);
    const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshInsights = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [riskData, summariesData] = await Promise.all([
                insightService.getSpendingRisk(user.id),
                insightService.getMonthlySummaries(user.id)
            ]);
            setRisk(riskData);
            setSummaries(summariesData);
        } catch (error) {
            console.error('[useInsights] Hook Error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshInsights();
    }, [refreshInsights]);

    return {
        risk,
        summaries,
        isLoading,
        refreshInsights
    };
};
