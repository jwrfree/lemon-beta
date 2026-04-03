import { describe, expect, it } from 'vitest';
import {
    buildChatSystemPrompt,
    buildStaticChatReply,
    classifyChatIntent,
    extractTransactionSearchQuery,
    intentNeedsUnifiedContext,
} from './chat-flow';

describe('extractTransactionSearchQuery', () => {
    it('extracts a purchase keyword from last purchase questions', () => {
        expect(extractTransactionSearchQuery('kapan terakhir beli kopi?')).toBe('kopi');
        expect(extractTransactionSearchQuery('kapan terakhir bayar netflix')).toBe('netflix');
    });

    it('returns null when there is no specific transaction keyword', () => {
        expect(extractTransactionSearchQuery('berapa total saldo saya?')).toBeNull();
        expect(extractTransactionSearchQuery('apa transaksi terbaru saya?')).toBeNull();
    });
});

describe('classifyChatIntent', () => {
    it('routes transaction capture requests to add-transaction', () => {
        expect(classifyChatIntent('catat makan 25rb pakai BCA')).toEqual({
            kind: 'add-transaction',
        });
    });

    it('routes recent mutation questions to the recent-transactions path', () => {
        expect(classifyChatIntent('Apa mutasi terbaru saya?')).toEqual({
            kind: 'recent-transactions',
        });
    });

    it('routes transaction-specific questions before aggregate context', () => {
        expect(classifyChatIntent('kapan terakhir beli kopi?')).toEqual({
            kind: 'transaction-search',
            query: 'kopi',
        });
    });

    it('marks aggregate finance questions as unified-context intents', () => {
        const intent = classifyChatIntent('berapa total saldo saya sekarang?');
        expect(intent).toEqual({ kind: 'total-balance' });
        expect(intentNeedsUnifiedContext(intent)).toBe(true);
    });

    it('keeps memory/follow-up style questions on the llm path', () => {
        const intent = classifyChatIntent('tadi kamu bilang apa?');
        expect(intent).toEqual({ kind: 'memory' });
        expect(intentNeedsUnifiedContext(intent)).toBe(false);
    });

    it('routes general financial check-in prompts to anomaly-review before health-check intents', () => {
        expect(classifyChatIntent('cek keuanganku')).toEqual({ kind: 'anomaly-review' });
        expect(classifyChatIntent('ada yang perlu aku perhatikan?')).toEqual({ kind: 'anomaly-review' });
    });
});

describe('buildStaticChatReply', () => {
    it('returns a direct reply for static non-data intents only', () => {
        expect(buildStaticChatReply({ kind: 'destructive-action' })).toContain('tidak punya akses');
        expect(buildStaticChatReply({ kind: 'add-transaction' })).toBeNull();
    });
});

describe('buildChatSystemPrompt', () => {
    it('includes the financial framework exactly once for Lemon Coach chat', () => {
        const prompt = buildChatSystemPrompt();
        const occurrences = prompt.match(/50\/30\/20 Rule/g) ?? [];

        expect(occurrences).toHaveLength(1);
    });

    it('injects persisted memory summary into the chat prompt when provided', () => {
        const prompt = buildChatSystemPrompt('User sering menanyakan budget makan.');

        expect(prompt).toContain('MEMORI PERCAKAPAN');
        expect(prompt).toContain('User sering menanyakan budget makan.');
    });

    it('instructs the chat model to use the typed response envelope only when rich UI adds value', () => {
        const prompt = buildChatSystemPrompt();

        expect(prompt).toContain('<response>');
        expect(prompt).toContain('"components"');
        expect(prompt).toContain('"suggestions"');
        expect(prompt).toContain('Untuk jawaban plain text biasa, balas normal tanpa wrapper');
    });

    it('includes anomaly review guidance when server-prepared anomaly context is present', () => {
        const prompt = buildChatSystemPrompt();

        expect(prompt).toContain('REVIEW ANOMALI');
        expect(prompt).toContain('high = perlu tindakan sekarang');
        expect(prompt).toContain('target_action');
    });

    it('includes explicit coaching directives for pattern recognition and actionable next steps', () => {
        const prompt = buildChatSystemPrompt();

        expect(prompt).toContain('## Coaching Directives');
        expect(prompt).toContain('Pattern recognition');
        expect(prompt).toContain('Actionable next steps');
        expect(prompt).toContain('Cross-tool chaining');
    });
});
