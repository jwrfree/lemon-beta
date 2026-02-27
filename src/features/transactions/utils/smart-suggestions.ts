import type { Transaction } from '@/types/models';

export type RankedSuggestion = {
    text: string;
    reason: string;
    confidence: 'low' | 'medium' | 'high';
    score: number;
};

type TimeBucket = 'pagi' | 'siang' | 'sore' | 'malam';

const getTimeBucket = (date: Date): TimeBucket => {
    const hour = date.getHours();
    if (hour >= 4 && hour < 11) return 'pagi';
    if (hour >= 11 && hour < 15) return 'siang';
    if (hour >= 15 && hour < 19) return 'sore';
    return 'malam';
};

const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

const isPaydayWindow = (date: Date): boolean => {
    const d = date.getDate();
    return d >= 25 || d <= 5;
};

const normalizeText = (text: string): string => text.trim().toLowerCase();

const formatSuggestionText = (tx: Transaction): string => {
    const amount = Math.round(tx.amount).toLocaleString('id-ID');
    return `${tx.description} ${amount}`;
};

const scoreTransaction = (tx: Transaction, now: Date, previousTx?: Transaction): RankedSuggestion => {
    const txDate = new Date(tx.date);
    const ageHours = Math.max(1, (now.getTime() - txDate.getTime()) / (1000 * 60 * 60));

    // Recency: newer transactions get higher score.
    const recencyScore = Math.max(0, 4 - Math.min(4, ageHours / 12));

    // Time context alignment.
    const timeMatchScore = getTimeBucket(txDate) === getTimeBucket(now) ? 2 : 0;

    // Day context alignment (weekday/weekend + payday window).
    const dayContextScore =
        (isWeekend(txDate) === isWeekend(now) ? 1 : 0) +
        (isPaydayWindow(txDate) === isPaydayWindow(now) ? 1 : 0);

    // Habit sequencing (very lightweight phase 1): same category as previous transaction.
    const sequenceScore = previousTx && previousTx.category === tx.category ? 1.5 : 0;

    const score = Number((recencyScore + timeMatchScore + dayContextScore + sequenceScore).toFixed(2));

    const confidence: RankedSuggestion['confidence'] =
        score >= 6.5 ? 'high' : score >= 4 ? 'medium' : 'low';

    const reasonParts: string[] = [];
    if (timeMatchScore > 0) reasonParts.push(`sering muncul di waktu ${getTimeBucket(now)}`);
    if (isWeekend(txDate) === isWeekend(now)) reasonParts.push('pola hari mirip');
    if (isPaydayWindow(txDate) === isPaydayWindow(now)) reasonParts.push('periode gajian serupa');
    if (sequenceScore > 0) reasonParts.push(`biasanya setelah kategori ${previousTx?.category}`);
    if (reasonParts.length === 0) reasonParts.push('transaksi terbaru kamu');

    return {
        text: formatSuggestionText(tx),
        reason: reasonParts.join(' • '),
        confidence,
        score,
    };
};

export const rankPersonalizedSuggestions = (
    transactions: Transaction[],
    now: Date = new Date(),
    limit: number = 3
): RankedSuggestion[] => {
    const valid = transactions.filter(tx => tx.amount > 0 && tx.description?.trim());
    if (valid.length === 0) return [];

    const sortedByDate = [...valid].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const previousTx = sortedByDate[0];

    const scored = sortedByDate.map(tx => scoreTransaction(tx, now, previousTx));

    const deduped = new Map<string, RankedSuggestion>();
    for (const suggestion of scored) {
        const key = normalizeText(suggestion.text);
        const existing = deduped.get(key);
        if (!existing || suggestion.score > existing.score) {
            deduped.set(key, suggestion);
        }
    }

    return [...deduped.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};
