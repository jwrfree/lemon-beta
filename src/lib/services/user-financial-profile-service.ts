import type { SupabaseClient } from '@supabase/supabase-js';

type UserFinancialProfileClient = Pick<SupabaseClient, 'from'>;

export type UserFinancialProfileRecord = {
    user_id: string;
    spending_patterns: Record<string, unknown>;
    coaching_notes: string | null;
    last_updated: string | null;
};

type UserFinancialProfilePayload = {
    spending_patterns: Record<string, unknown>;
    coaching_notes: string | null;
};

export const getUserFinancialProfile = async (
    client: UserFinancialProfileClient,
    userId: string,
): Promise<UserFinancialProfileRecord | null> => {
    const { data, error } = await client
        .from('user_financial_profile')
        .select('user_id,spending_patterns,coaching_notes,last_updated')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('[UserFinancialProfile] Failed to load profile:', error);
        return null;
    }

    if (!data) {
        return null;
    }

    return {
        user_id: data.user_id,
        spending_patterns: typeof data.spending_patterns === 'object' && data.spending_patterns !== null
            ? data.spending_patterns as Record<string, unknown>
            : {},
        coaching_notes: typeof data.coaching_notes === 'string' ? data.coaching_notes : null,
        last_updated: typeof data.last_updated === 'string' ? data.last_updated : null,
    };
};

export const upsertUserFinancialProfile = async (
    client: UserFinancialProfileClient,
    userId: string,
    payload: UserFinancialProfilePayload,
) => {
    const { error } = await client
        .from('user_financial_profile')
        .upsert({
            user_id: userId,
            spending_patterns: payload.spending_patterns,
            coaching_notes: payload.coaching_notes,
            last_updated: new Date().toISOString(),
        });

    if (error) {
        console.error('[UserFinancialProfile] Failed to upsert profile:', error);
    }
};
