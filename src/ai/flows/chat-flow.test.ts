import { describe, expect, it } from 'vitest';
import {
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
    });
});

describe('classifyChatIntent', () => {
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
});

describe('buildStaticChatReply', () => {
    it('returns a direct reply for non-data intents', () => {
        expect(buildStaticChatReply({ kind: 'data-entry' })).toContain('belum bisa mencatat transaksi');
    });
});
