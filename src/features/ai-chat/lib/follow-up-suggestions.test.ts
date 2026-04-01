import { describe, expect, it } from 'vitest';
import type { UIMessage } from 'ai';
import { buildFollowUpSuggestions } from './follow-up-suggestions';

const textMessage = (role: UIMessage['role'], text: string): UIMessage => ({
    id: `${role}-${text}`,
    role,
    parts: [{ type: 'text', text }],
});

describe('buildFollowUpSuggestions', () => {
    it('returns budget-oriented suggestions for balance questions', () => {
        const suggestions = buildFollowUpSuggestions([
            textMessage('assistant', 'Halo! Saya Lemon Coach.'),
            textMessage('user', 'Berapa total saldo saya di semua dompet saat ini?'),
            textMessage('assistant', 'Total saldo kas kamu saat ini **Rp2.000.000**. Cashflow bulan ini masih positif.'),
        ]);

        expect(suggestions).toHaveLength(3);
        expect(suggestions.map((item) => item.label)).toContain('Budget kritis');
        expect(suggestions.map((item) => item.label)).toContain('Cashflow bulan ini');
    });

    it('returns fallback suggestions when assistant says data is unavailable', () => {
        const suggestions = buildFollowUpSuggestions([
            textMessage('assistant', 'Halo! Saya Lemon Coach.'),
            textMessage('user', 'Ada data tahun lalu?'),
            textMessage('assistant', 'Maaf, data itu belum tersedia saat ini.'),
        ]);

        expect(suggestions[0]?.label).toBe('Cek saldo');
        expect(suggestions.map((item) => item.label)).toContain('Budget paling rawan');
    });

    it('returns empty array when there is no completed user-assistant turn', () => {
        const suggestions = buildFollowUpSuggestions([
            textMessage('assistant', 'Halo! Saya Lemon Coach.'),
        ]);

        expect(suggestions).toEqual([]);
    });
});
