import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    getUserFinancialProfile,
    upsertUserFinancialProfile,
} from './user-financial-profile-service';

describe('userFinancialProfileService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads a normalized coaching profile', async () => {
        const client = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                user_id: 'user-1',
                                spending_patterns: { food: 'sering impulsif' },
                                coaching_notes: 'Perlu lebih konsisten menabung.',
                                last_updated: '2026-04-03T12:00:00.000Z',
                            },
                            error: null,
                        }),
                    }),
                }),
            }),
        };

        const profile = await getUserFinancialProfile(client as any, 'user-1');

        expect(profile).toEqual({
            user_id: 'user-1',
            spending_patterns: { food: 'sering impulsif' },
            coaching_notes: 'Perlu lebih konsisten menabung.',
            last_updated: '2026-04-03T12:00:00.000Z',
        });
    });

    it('upserts the profile payload with a fresh timestamp', async () => {
        const upsert = vi.fn().mockResolvedValue({ error: null });
        const client = {
            from: vi.fn().mockReturnValue({ upsert }),
        };

        await upsertUserFinancialProfile(client as any, 'user-1', {
            spending_patterns: { subscriptions: 'naik' },
            coaching_notes: 'Pantau budget hiburan.',
        });

        expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'user-1',
            spending_patterns: { subscriptions: 'naik' },
            coaching_notes: 'Pantau budget hiburan.',
            last_updated: expect.any(String),
        }));
    });
});
