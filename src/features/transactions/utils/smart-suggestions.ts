import type { Transaction } from '@/types/models';

export type RankedSuggestion = {
    text: string;
    reason: string;
    confidence: 'low' | 'medium' | 'high';
    score: number;
    amountHint?: string;
    sequenceHint?: string;
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

const formatCurrency = (val: number): string => Math.round(val).toLocaleString('id-ID');

const median = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

const getAmountHint = (amounts: number[]): string | undefined => {
    if (amounts.length < 2) return undefined;
    const med = median(amounts);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    if (Math.abs(max - min) <= med * 0.15) {
        return `Biasanya sekitar Rp${formatCurrency(med)}`;
    }

    return `Rentang Rp${formatCurrency(min)}–Rp${formatCurrency(max)}`;
};

const getTopTransitionCategory = (transactions: Transaction[], anchorCategory: string): string | undefined => {
    const sorted = [...transactions].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const transitionCounts = new Map<string, number>();

    for (let i = 0; i < sorted.length - 1; i += 1) {
        if (sorted[i].category !== anchorCategory) continue;
        const nextCategory = sorted[i + 1].category;
        transitionCounts.set(nextCategory, (transitionCounts.get(nextCategory) ?? 0) + 1);
    }

    let topCategory: string | undefined;
    let topCount = 0;
    for (const [cat, count] of transitionCounts.entries()) {
        if (count > topCount) {
            topCount = count;
            topCategory = cat;
        }
    }

    return topCount >= 2 ? topCategory : undefined;
};

const scoreTransaction = (
    tx: Transaction,
    now: Date,
    previousTx: Transaction | undefined,
    allTransactions: Transaction[]
): RankedSuggestion => {
    const txDate = new Date(tx.date);
    const ageHours = Math.max(1, (now.getTime() - txDate.getTime()) / (1000 * 60 * 60));

    const recencyScore = Math.max(0, 4 - Math.min(4, ageHours / 12));
    const timeMatchScore = getTimeBucket(txDate) === getTimeBucket(now) ? 2 : 0;
    const dayContextScore =
        (isWeekend(txDate) === isWeekend(now) ? 1 : 0) +
        (isPaydayWindow(txDate) === isPaydayWindow(now) ? 1 : 0);

    const sequenceScore = previousTx && previousTx.category === tx.category ? 1.5 : 0;

    const categoryAmounts = allTransactions
        .filter(item => item.category === tx.category && item.amount > 0)
        .map(item => item.amount);

    const amountHint = getAmountHint(categoryAmounts);
    const amountSimilarityScore = amountHint ? 1 : 0;

    const topTransitionCategory = getTopTransitionCategory(allTransactions, tx.category);
    const sequenceHint = topTransitionCategory ? `Biasanya lanjut ke kategori ${topTransitionCategory}` : undefined;
    const transitionScore = sequenceHint ? 1 : 0;

    const score = Number((
        recencyScore + timeMatchScore + dayContextScore + sequenceScore + amountSimilarityScore + transitionScore
    ).toFixed(2));

    const confidence: RankedSuggestion['confidence'] =
        score >= 7.5 ? 'high' : score >= 5 ? 'medium' : 'low';

    const reasonParts: string[] = [];
    if (timeMatchScore > 0) reasonParts.push(`sering muncul di waktu ${getTimeBucket(now)}`);
    if (isWeekend(txDate) === isWeekend(now)) reasonParts.push('pola hari mirip');
    if (isPaydayWindow(txDate) === isPaydayWindow(now)) reasonParts.push('periode gajian serupa');
    if (sequenceScore > 0) reasonParts.push(`biasanya setelah kategori ${previousTx?.category}`);
    if (amountHint) reasonParts.push('nominal kebiasaan terdeteksi');
    if (reasonParts.length === 0) reasonParts.push('transaksi terbaru kamu');

    return {
        text: formatSuggestionText(tx),
        reason: reasonParts.join(' • '),
        confidence,
        score,
        amountHint,
        sequenceHint,
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

    const scored = sortedByDate.map(tx => scoreTransaction(tx, now, previousTx, sortedByDate));

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
