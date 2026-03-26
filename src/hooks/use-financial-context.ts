import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { financialContextService, type UnifiedFinancialContext } from '@/lib/services/financial-context-service';

export const useFinancialContext = () => {
    const { user } = useAuth();
    const [context, setContext] = useState<UnifiedFinancialContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refreshContext = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await financialContextService.getUnifiedContext(user.id);
            if (data) {
                setContext(data);
                setError(null);
            } else {
                throw new Error('Gagal mengambil konteks finansial.');
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshContext();
    }, [refreshContext]);

    const getRecommendationFactor = () => {
        if (!context) return null;
        
        // Example logic: Prioritize debt if risk is high, or goals if cash is high
        const factors = [];
        if (context.risk.level === 'Critical') factors.push('URGENT_CASH_CONSERVATION');
        if (context.wealth.net_worth > context.wealth.cash * 2) factors.push('ASSET_ALLOCATION_OPTIMIZATION');
        
        return factors;
    };

    return {
        context,
        isLoading,
        error,
        refreshContext,
        getRecommendationFactor
    };
};
