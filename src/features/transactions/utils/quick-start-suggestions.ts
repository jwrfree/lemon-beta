import type { Transaction, Wallet } from '@/types/models';

export type QuickStartSuggestionKind = 'repeat' | 'habit' | 'action';
export type QuickStartAction = 'scan-receipt' | 'manual-assist';
export type QuickStartTimeBucket = 'pagi' | 'siang' | 'sore' | 'malam';

export interface QuickStartSuggestion {
    id: string;
    kind: QuickStartSuggestionKind;
    label: string;
    description: string;
    reason: string;
    inputText: string;
    amount?: number;
    walletId?: string;
    walletName?: string;
    category?: string;
    subCategory?: string;
    type?: 'income' | 'expense';
    merchant?: string | null;
    location?: string | null;
    isNeed?: boolean;
    action?: QuickStartAction;
    score?: number;
}

export interface QuickStartSuggestionGroups {
    repeats: QuickStartSuggestion[];
    habits: QuickStartSuggestion[];
    actions: QuickStartSuggestion[];
}

interface BuildQuickStartSuggestionsOptions {
    transactions: Transaction[];
    wallets: Pick<Wallet, 'id' | 'name'>[];
    now?: Date;
}

const MAX_REPEAT_EXPENSE_AMOUNT = 2_000_000;
const MAX_REPEAT_INCOME_AMOUNT = 25_000_000;

const normalizeText = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const toTitleCase = (value: string) =>
    value
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const getTimeBucket = (date: Date): QuickStartTimeBucket => {
    const hour = date.getHours();
    if (hour >= 4 && hour < 11) return 'pagi';
    if (hour >= 11 && hour < 15) return 'siang';
    if (hour >= 15 && hour < 19) return 'sore';
    return 'malam';
};

const getBucketLabel = (bucket: QuickStartTimeBucket) => {
    switch (bucket) {
        case 'pagi':
            return 'pagi hari';
        case 'siang':
            return 'jam makan siang';
        case 'sore':
            return 'menjelang sore';
        case 'malam':
        default:
            return 'malam hari';
    }
};

const formatCompactAmount = (amount: number) => {
    if (amount >= 1_000_000) {
        const formatted = Number((amount / 1_000_000).toFixed(1)).toString().replace('.', ',');
        return `${formatted}jt`;
    }
    if (amount >= 1_000) {
        return `${Math.round(amount / 1_000)}rb`;
    }
    return `${amount}`;
};

const getWalletName = (walletId: string | undefined, wallets: Pick<Wallet, 'id' | 'name'>[]) =>
    wallets.find((wallet) => wallet.id === walletId)?.name || 'Dompet utama';

const isSuggestionEligible = (transaction: Transaction) => {
    if (transaction.linkedDebtId) return false;
    if (transaction.amount <= 0) return false;
    if (transaction.type === 'expense' && transaction.amount > MAX_REPEAT_EXPENSE_AMOUNT) return false;
    if (transaction.type === 'income' && transaction.amount > MAX_REPEAT_INCOME_AMOUNT) return false;

    const normalizedDescription = normalizeText(transaction.description || '');
    if (!normalizedDescription) return false;
    if (normalizedDescription.includes('transfer')) return false;

    return true;
};

const getFreshnessScore = (date: Date, now: Date) => {
    const diffInDays = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86_400_000));
    if (diffInDays <= 1) return 44;
    if (diffInDays <= 3) return 36;
    if (diffInDays <= 7) return 26;
    if (diffInDays <= 14) return 16;
    return 8;
};

const buildRepeatSignature = (transaction: Transaction) => {
    const baseDescription = normalizeText(transaction.description || transaction.category);
    return [
        transaction.type,
        baseDescription,
        normalizeText(transaction.category || ''),
        normalizeText(transaction.subCategory || ''),
        transaction.walletId,
    ].join('|');
};

const buildHabitSignature = (transaction: Transaction) => {
    const baseDescription = normalizeText(transaction.description || transaction.category);
    return [
        transaction.type,
        baseDescription,
        normalizeText(transaction.category || ''),
    ].join('|');
};

const fallbackContextualHabits: Record<QuickStartTimeBucket, Array<{ label: string; amount: number; category: string }>> = {
    pagi: [
        { label: 'Sarapan', amount: 15_000, category: 'Konsumsi & F&B' },
        { label: 'Kopi pagi', amount: 20_000, category: 'Konsumsi & F&B' },
        { label: 'Ojek ke kantor', amount: 25_000, category: 'Transportasi' },
    ],
    siang: [
        { label: 'Makan siang', amount: 25_000, category: 'Konsumsi & F&B' },
        { label: 'Es teh', amount: 5_000, category: 'Konsumsi & F&B' },
        { label: 'Parkir', amount: 3_000, category: 'Transportasi' },
    ],
    sore: [
        { label: 'Belanja minimarket', amount: 50_000, category: 'Belanja & Lifestyle' },
        { label: 'Ojek pulang', amount: 20_000, category: 'Transportasi' },
        { label: 'Ngemil sore', amount: 12_000, category: 'Konsumsi & F&B' },
    ],
    malam: [
        { label: 'Makan malam', amount: 30_000, category: 'Konsumsi & F&B' },
        { label: 'Bayar listrik', amount: 200_000, category: 'Tagihan & Utilitas' },
        { label: 'Langganan Netflix', amount: 54_000, category: 'Langganan Digital' },
    ],
};

export const buildQuickStartSuggestionGroups = ({
    transactions,
    wallets,
    now = new Date(),
}: BuildQuickStartSuggestionsOptions): QuickStartSuggestionGroups => {
    const eligibleTransactions = transactions.filter(isSuggestionEligible);
    const currentBucket = getTimeBucket(now);
    const currentWeekday = now.getDay();

    const repeatMap = new Map<string, {
        transaction: Transaction;
        count: number;
        latestDate: Date;
        matchingBucketCount: number;
        matchingWeekdayCount: number;
    }>();

    eligibleTransactions.forEach((transaction) => {
        const signature = buildRepeatSignature(transaction);
        const txDate = new Date(transaction.date);
        const bucket = getTimeBucket(txDate);
        const entry = repeatMap.get(signature);

        if (!entry) {
            repeatMap.set(signature, {
                transaction,
                count: 1,
                latestDate: txDate,
                matchingBucketCount: bucket === currentBucket ? 1 : 0,
                matchingWeekdayCount: txDate.getDay() === currentWeekday ? 1 : 0,
            });
            return;
        }

        entry.count += 1;
        entry.matchingBucketCount += bucket === currentBucket ? 1 : 0;
        entry.matchingWeekdayCount += txDate.getDay() === currentWeekday ? 1 : 0;

        if (txDate > entry.latestDate) {
            entry.transaction = transaction;
            entry.latestDate = txDate;
        }
    });

    const repeats = [...repeatMap.values()]
        .map((entry) => {
            const walletName = getWalletName(entry.transaction.walletId, wallets);
            const score =
                (entry.count * 30) +
                getFreshnessScore(entry.latestDate, now) +
                (entry.matchingBucketCount > 0 ? 18 : 0) +
                (entry.matchingWeekdayCount > 0 ? 8 : 0) +
                (entry.transaction.type === 'expense' ? 5 : 0);

            return {
                id: `repeat-${buildRepeatSignature(entry.transaction)}`,
                kind: 'repeat' as const,
                label: entry.transaction.description || entry.transaction.category,
                description: `${walletName} • ${entry.transaction.category}${entry.transaction.subCategory ? ` • ${entry.transaction.subCategory}` : ''}`,
                reason: entry.matchingBucketCount > 0
                    ? `Sering dicatat ${getBucketLabel(currentBucket)}`
                    : `Baru dipakai ${entry.count}x`,
                inputText: `${entry.transaction.description} ${formatCompactAmount(entry.transaction.amount)}`,
                amount: entry.transaction.amount,
                walletId: entry.transaction.walletId,
                walletName,
                category: entry.transaction.category,
                subCategory: entry.transaction.subCategory,
                type: entry.transaction.type,
                merchant: entry.transaction.merchant,
                location: entry.transaction.location,
                isNeed: entry.transaction.isNeed,
                score,
            };
        })
        .sort((left, right) => (right.score || 0) - (left.score || 0))
        .slice(0, 2);

    const repeatLabels = new Set(repeats.map((suggestion) => normalizeText(suggestion.label)));

    const habitMap = new Map<string, {
        transaction: Transaction;
        count: number;
        matchingBucketCount: number;
        matchingWeekdayCount: number;
        latestDate: Date;
    }>();

    eligibleTransactions.forEach((transaction) => {
        const signature = buildHabitSignature(transaction);
        const normalizedLabel = normalizeText(transaction.description || transaction.category);
        if (repeatLabels.has(normalizedLabel)) return;

        const txDate = new Date(transaction.date);
        const bucket = getTimeBucket(txDate);
        const entry = habitMap.get(signature);

        if (!entry) {
            habitMap.set(signature, {
                transaction,
                count: 1,
                matchingBucketCount: bucket === currentBucket ? 1 : 0,
                matchingWeekdayCount: txDate.getDay() === currentWeekday ? 1 : 0,
                latestDate: txDate,
            });
            return;
        }

        entry.count += 1;
        entry.matchingBucketCount += bucket === currentBucket ? 1 : 0;
        entry.matchingWeekdayCount += txDate.getDay() === currentWeekday ? 1 : 0;

        if (txDate > entry.latestDate) {
            entry.transaction = transaction;
            entry.latestDate = txDate;
        }
    });

    const habits = [...habitMap.values()]
        .map((entry) => {
            const walletName = getWalletName(entry.transaction.walletId, wallets);
            const score =
                (entry.count * 24) +
                getFreshnessScore(entry.latestDate, now) +
                (entry.matchingBucketCount > 0 ? 20 : 0) +
                (entry.matchingWeekdayCount > 0 ? 10 : 0);

            return {
                id: `habit-${buildHabitSignature(entry.transaction)}`,
                kind: 'habit' as const,
                label: toTitleCase(entry.transaction.description || entry.transaction.category),
                description: `Biasanya ${formatCompactAmount(entry.transaction.amount)} • ${walletName}`,
                reason: entry.matchingBucketCount > 0 ? `Cocok untuk ${getBucketLabel(currentBucket)}` : 'Sering kamu catat',
                inputText: `${entry.transaction.description} ${formatCompactAmount(entry.transaction.amount)}`,
                amount: entry.transaction.amount,
                walletId: entry.transaction.walletId,
                walletName,
                category: entry.transaction.category,
                subCategory: entry.transaction.subCategory,
                type: entry.transaction.type,
                merchant: entry.transaction.merchant,
                location: entry.transaction.location,
                isNeed: entry.transaction.isNeed,
                score,
            };
        })
        .filter((entry) => (entry.score || 0) > 28)
        .sort((left, right) => (right.score || 0) - (left.score || 0))
        .slice(0, 3);

    const fallbackHabits = habits.length > 0
        ? habits
        : fallbackContextualHabits[currentBucket].map((fallback, index) => ({
            id: `fallback-${currentBucket}-${index}`,
            kind: 'habit' as const,
            label: fallback.label,
            description: `Mulai dari template ${getBucketLabel(currentBucket)}`,
            reason: 'Contoh yang cocok untuk saat ini',
            inputText: `${fallback.label} ${formatCompactAmount(fallback.amount)}`,
            amount: fallback.amount,
            category: fallback.category,
            type: 'expense' as const,
            score: 10 - index,
        }));

    const actions: QuickStartSuggestion[] = [
        {
            id: 'action-scan',
            kind: 'action',
            action: 'scan-receipt',
            label: 'Scan struk',
            description: 'Pindai struk dan isi detail otomatis',
            reason: 'Aksi cepat',
            inputText: '',
        },
        {
            id: 'action-manual',
            kind: 'action',
            action: 'manual-assist',
            label: 'Coba bilang "Beli bensin 20 ribu"',
            description: 'Mulai dari intent natural lalu biarkan AI bantu isi',
            reason: 'Prompt cepat',
            inputText: 'Beli bensin 20 ribu',
        },
    ];

    return {
        repeats,
        habits: fallbackHabits,
        actions,
    };
};
