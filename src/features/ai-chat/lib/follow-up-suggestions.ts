import { type UIMessage } from 'ai';

export interface FollowUpSuggestion {
    label: string;
    value: string;
}

const TOPIC_RULES: Array<{
    keywords: string[];
    suggestions: FollowUpSuggestion[];
}> = [
    {
        keywords: ['saldo', 'dompet', 'rekening', 'uang saya', 'cashflow'],
        suggestions: [
            { label: 'Budget kritis', value: 'Budget mana yang paling kritis sekarang?' },
            { label: 'Cashflow bulan ini', value: 'Cashflow bulan ini masih aman atau sudah mepet?' },
            { label: 'Transaksi terakhir', value: 'Transaksi terakhir saya apa?' },
        ],
    },
    {
        keywords: ['budget', 'anggaran', 'hampir habis', 'overbudget'],
        suggestions: [
            { label: 'Kategori paling rawan', value: 'Kategori budget mana yang paling cepat habis bulan ini?' },
            { label: 'Risiko overbudget', value: 'Kalau pola ini lanjut, saya berisiko overbudget di mana?' },
            { label: 'Saran hemat', value: 'Apa saran hemat yang paling relevan dari budget saya sekarang?' },
        ],
    },
    {
        keywords: ['pengeluaran', 'belanja', 'boros', 'expense', 'outflow'],
        suggestions: [
            { label: 'Kategori terbesar', value: 'Kategori pengeluaran terbesar saya bulan ini apa?' },
            { label: 'Banding bulan lalu', value: 'Pengeluaran saya dibanding bulan lalu gimana?' },
            { label: '7 hari terakhir', value: 'Total pengeluaran saya dalam 7 hari terakhir berapa?' },
        ],
    },
    {
        keywords: ['transaksi', 'mutasi', 'belanjaan terakhir'],
        suggestions: [
            { label: 'Belanja terakhir', value: 'Belanja terakhir saya apa?' },
            { label: 'Kategori terbesar', value: 'Kategori pengeluaran terbesar saya bulan ini apa?' },
            { label: 'Pengeluaran mingguan', value: 'Total pengeluaran saya minggu ini berapa?' },
        ],
    },
    {
        keywords: ['tabungan', 'saving', 'goal', 'target', 'dana darurat'],
        suggestions: [
            { label: 'Progress goal', value: 'Progress tabungan dan goal saya sekarang bagaimana?' },
            { label: 'Simulasi target', value: 'Berapa lama lagi target saya akan tercapai kalau saya nabung 1 juta tiap bulan?' },
            { label: 'Saldo akhir tahun', value: 'Berapa proyeksi saldo saya di akhir tahun nanti?' },
        ],
    },
];

const ANSWER_RULES: Array<{
    keywords: string[];
    suggestions: FollowUpSuggestion[];
}> = [
    {
        keywords: ['simulasi', 'proyeksi', 'tercapai', 'bulan'],
        suggestions: [
            { label: 'Naikin tabungan', value: 'Kalau saya tambah tabungan 500rb lagi sebulan, jadi kapan tercapainya?' },
            { label: 'Proyeksi saldo', value: 'Berapa saldo saya 12 bulan lagi kalau gaya hidup tetap?' },
        ],
    },
    {
        keywords: ['budget', 'anggaran', 'overbudget', 'kritis'],
        suggestions: [
            { label: 'Cari penghematannya', value: 'Pengeluaran mana yang paling bisa saya tekan dulu?' },
            { label: 'Kategori rawan', value: 'Kategori mana yang paling berisiko bikin saya boncos?' },
        ],
    },
    {
        keywords: ['cashflow', 'negatif', 'positif'],
        suggestions: [
            { label: 'Penyebab utama', value: 'Apa penyebab utama cashflow saya seperti ini?' },
            { label: 'Langkah minggu ini', value: 'Langkah paling penting minggu ini buat memperbaiki cashflow apa?' },
        ],
    },
    {
        keywords: ['kategori', 'pengeluaran terbesar', 'boros'],
        suggestions: [
            { label: 'Banding bulan lalu', value: 'Kategori ini dibanding bulan lalu naik atau turun?' },
            { label: 'Batas aman', value: 'Batas aman pengeluaran saya untuk kategori ini berapa?' },
        ],
    },
];

const EMPTY_DATA_KEYWORDS = ['belum', 'tidak ada', 'tidak tersedia', 'belum cukup', 'terbatas'];

const FALLBACK_SUGGESTIONS: FollowUpSuggestion[] = [
    { label: 'Ringkas hari ini', value: 'Bisa ringkas kondisi keuangan saya hari ini secara singkat?' },
    { label: 'Yang perlu diwaspadai', value: 'Apa yang paling perlu saya waspadai dari kondisi keuangan saya sekarang?' },
    { label: 'Cek mutasi terbaru', value: 'Apa mutasi terbaru saya?' },
];

const normalizeText = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const getMessageText = (message?: UIMessage) =>
    message?.parts
        .filter((part): part is Extract<UIMessage['parts'][number], { type: 'text' }> => part.type === 'text')
        .map((part) => part.text)
        .join(' ')
        .trim() ?? '';

const includesAnyKeyword = (text: string, keywords: string[]) =>
    keywords.some((keyword) => text.includes(keyword));

const dedupeSuggestions = (suggestions: FollowUpSuggestion[], max: number) => {
    const seen = new Set<string>();
    const unique: FollowUpSuggestion[] = [];

    for (const suggestion of suggestions) {
        const key = suggestion.value.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(suggestion);
        if (unique.length >= max) break;
    }

    return unique;
};

const findLatestAssistantTurn = (messages: UIMessage[]) => {
    const lastAssistantIndex = messages.findLastIndex((message) => message.role === 'assistant' && getMessageText(message));
    if (lastAssistantIndex <= 0) return null;

    const assistantMessage = messages[lastAssistantIndex];
    const userMessage = [...messages.slice(0, lastAssistantIndex)]
        .reverse()
        .find((message) => message.role === 'user' && getMessageText(message));

    if (!userMessage) return null;

    return { assistantMessage, userMessage };
};

export const buildFollowUpSuggestions = (messages: UIMessage[], max = 3): FollowUpSuggestion[] => {
    const latestTurn = findLatestAssistantTurn(messages);
    if (!latestTurn) return [];

    const rawAnswerText = getMessageText(latestTurn.assistantMessage);
    const normalizedQuestion = normalizeText(getMessageText(latestTurn.userMessage));
    const normalizedAnswer = normalizeText(rawAnswerText);
    const suggestions: FollowUpSuggestion[] = [];

    // Parse dynamic suggestions from LLM
    const dynamicRegex = /\[SUGGESTION:([^\]]+)\]/g;
    let match;
    while ((match = dynamicRegex.exec(rawAnswerText)) !== null) {
        if (match[1].trim()) {
            suggestions.push({ label: match[1].trim(), value: match[1].trim() });
        }
    }

    if (!normalizedQuestion || !normalizedAnswer) {
        return [];
    }

    if (includesAnyKeyword(normalizedAnswer, EMPTY_DATA_KEYWORDS)) {
        suggestions.push(
            { label: 'Cek saldo', value: 'Berapa total saldo saya di semua dompet saat ini?' },
            { label: 'Budget paling rawan', value: 'Budget mana yang paling kritis sekarang?' },
            { label: 'Mutasi terbaru', value: 'Apa mutasi terbaru saya?' }
        );
    }

    for (const rule of TOPIC_RULES) {
        if (includesAnyKeyword(normalizedQuestion, rule.keywords)) {
            suggestions.push(...rule.suggestions);
        }
    }

    for (const rule of ANSWER_RULES) {
        if (includesAnyKeyword(normalizedAnswer, rule.keywords)) {
            suggestions.push(...rule.suggestions);
        }
    }

    suggestions.push(...FALLBACK_SUGGESTIONS);

    return dedupeSuggestions(suggestions, max);
};
