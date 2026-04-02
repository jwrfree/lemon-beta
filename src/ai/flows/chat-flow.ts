import { formatCurrency } from "@/lib/utils";
import { UnifiedFinancialContext } from "@/lib/services/financial-context-service";
import { composeSystemPrompt } from "@/ai/prompts";

/**
 * Chat-specific instructions for the Lemon Coach agent.
 */
const CHAT_SPECIFIC_INSTRUCTIONS = `### AKSES DATA (TOOLS)
Anda memiliki akses ke tools finansial untuk mendapatkan data saldo, budget, pengeluaran, progres tabungan, dan mencari transaksi spesifik user.
SELALU gunakan tool yang relevan sebelum menjawab pertanyaan yang membutuhkan data finansial (misal: "berapa saldo saya?").
Untuk pertanyaan transaksi spesifik seperti "kapan terakhir beli kopi?", "ada transaksi Netflix?", atau "berapa terakhir bayar listrik?", gunakan tool pencarian transaksi dulu. Jangan menolak kalau data transaksi spesifik bisa dicari.

### KOMPONEN VISUAL (RICH REPLIES)
Gunakan tag khusus di akhir jawaban Anda untuk menampilkan komponen visual yang relevan. HANYA gunakan jika data dari tool tersedia dan relevan:
- **BudgetStatus**: \`[RENDER_COMPONENT:BudgetStatus]\` (Gunakan jika user bertanya tentang budget/anggaran).
- **RecentTransactions**: \`[RENDER_COMPONENT:RecentTransactions]\` (Gunakan jika user bertanya tentang mutasi/transaksi terbaru).
- **WealthSummary**: \`[RENDER_COMPONENT:WealthSummary]\` (Gunakan jika user bertanya tentang total kekayaan/net worth/aset).

### PRIORITAS JAWABAN
1. Inti jawaban di kalimat pertama dengan angka/fakta kunci dari tool.
2. Jawaban ideal: 2-4 kalimat singkat dan langsung pada intinya. Gunakan poin hanya jika diminta.
3. Bahasa Indonesia natural, empati, suportif, dan fokus pada tindakan praktis (actionable).
4. Gunakan cetak tebal (**bold**) khusus untuk menyoroti nominal uang atau persentase, agar mudah dibaca. JANGAN gunakan heading, italic, atau list yang rumit.

JIKA data dari tool kosong atau tidak cukup, katakan dengan jujur bahwa Anda belum memiliki data tersebut.
Jangan sebut nama tool internal atau istilah teknis ke user.`;

export const CHAT_SYSTEM_PROMPT = composeSystemPrompt(CHAT_SPECIFIC_INSTRUCTIONS);

const stripControlChars = (value: string) =>
    Array.from(value)
        .filter((char) => {
            const code = char.charCodeAt(0);
            return code >= 32 && code !== 127;
        })
        .join('');

const sanitizeContextText = (value: string, maxLength = 80) =>
    stripControlChars(value)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);

const normalizeQuestion = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const cleanTransactionSearchQuery = (value: string) =>
    value
        .replace(/\b(saya|aku|gue|gua|yang|itu|ini|di|ke|untuk|dong|nih|ya)\b/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const transactionSearchNoiseWords = new Set([
    'apa',
    'mutasi',
    'riwayat',
    'transaksi',
    'terbaru',
    'terakhir',
    'recent',
]);

const percentOf = (part: number, total: number) => {
    if (!total) return 0;
    return Math.round((part / total) * 100);
};

export type ChatIntent =
    | { kind: 'unclear' }
    | { kind: 'gibberish' }
    | { kind: 'recent-transactions' }
    | { kind: 'add-transaction' }
    | { kind: 'transaction-search'; query: string }
    | { kind: 'total-balance' }
    | { kind: 'total-expense' }
    | { kind: 'largest-expense' }
    | { kind: 'budget-risk' }
    | { kind: 'comparison' }
    | { kind: 'busiest-day' }
    | { kind: 'weekly-expense' }
    | { kind: 'last-transaction' }
    | { kind: 'time-since-last-expense' }
    | { kind: 'categorical-top-increase' }
    | { kind: 'destructive-action' }
    | { kind: 'data-entry' }
    | { kind: 'memory' }
    | { kind: 'llm' };

export function buildChatSystemPrompt(): string {
    return CHAT_SYSTEM_PROMPT;
}

export function extractTransactionSearchQuery(question: string): string | null {
    const normalized = normalizeQuestion(question);
    if (!normalized) return null;

    const patterns = [
        /(?:beli|bayar|pesan|langganan|top up|isi|cek)\s+(?:mutasi|transaksi|belanja|apa)?\s*(.+)$/u,
        /terakhir\s+(?:kali\s+)?(?:beli|bayar|pesan|langganan|top up|isi)?\s*(.+)$/u,
        /(?:mutasi|transaksi|belanja)\s+(?:terakhir|terbaru|saya)\s*(.+)?$/u,
    ];

    for (const pattern of patterns) {
        const match = normalized.match(pattern);
        const rawMatch = match?.[1] ?? '';
        const candidate = cleanTransactionSearchQuery(rawMatch);
        const meaningfulTokens = candidate
            .split(' ')
            .filter((token) => token.length >= 2 && !transactionSearchNoiseWords.has(token));

        if (candidate && candidate.length >= 2 && meaningfulTokens.length > 0) {
            return candidate;
        }
    }

    return null;
}

export function classifyChatIntent(question: string): ChatIntent {
    const normalized = normalizeQuestion(question);
    if (!normalized || normalized.length < 2) {
        return { kind: 'unclear' };
    }

    const isGibberish = !normalized.includes(' ') && normalized.length > 8 && !/[aeiou]/i.test(normalized);
    if (isGibberish) {
        return { kind: 'gibberish' };
    }

    const asksRecentTransactions =
        (normalized.includes('mutasi') || normalized.includes('transaksi') || normalized.includes('riwayat')) &&
        (normalized.includes('terbaru') || normalized.includes('terakhir') || normalized.includes('recent') || normalized.includes('cek') || normalized.includes('apa'));

    if (asksRecentTransactions) {
        return { kind: 'recent-transactions' };
    }

    const transactionSearchQuery = extractTransactionSearchQuery(question);
    if (transactionSearchQuery) {
        return { kind: 'transaction-search', query: transactionSearchQuery };
    }

    const asksTotalBalance =
        normalized.includes('total saldo') ||
        (normalized.includes('saldo') && (normalized.includes('dompet') || normalized.includes('kantong') || normalized.includes('rekening'))) ||
        normalized.includes('saldo saya') ||
        normalized.includes('uang saya berapa') ||
        normalized.includes('saldo kas');

    if (asksTotalBalance) {
        return { kind: 'total-balance' };
    }

    const asksTotalExpense =
        (normalized.includes('total pengeluaran') || normalized.includes('total belanja') || normalized.includes('habis berapa') || normalized.includes('total outflow') || normalized.includes('sudah keluar berapa')) &&
        (normalized.includes('bulan ini') || normalized.includes('saat ini') || normalized.includes('sekarang'));

    if (asksTotalExpense) {
        return { kind: 'total-expense' };
    }

    const asksLargestExpense =
        (normalized.includes('pengeluaran terbesar') || normalized.includes('expense terbesar') || normalized.includes('kategori terbesar') || normalized.includes('paling banyak menghabiskan')) &&
        (normalized.includes('bulan ini') || normalized.includes('saat ini'));

    if (asksLargestExpense) {
        return { kind: 'largest-expense' };
    }

    const asksAboutBudgetRisks =
        (normalized.includes('budget') || normalized.includes('anggaran') || normalized.includes('kebocoran') || normalized.includes('sisa')) &&
        (normalized.includes('aman') || normalized.includes('bahaya') || normalized.includes('boncos') || normalized.includes('boros') || normalized.includes('kritis') || normalized.includes('hampir habis'));

    if (asksAboutBudgetRisks) {
        return { kind: 'budget-risk' };
    }

    const asksComparison =
        normalized.includes('lebih besar dari bulan lalu') ||
        normalized.includes('dibandingkan bulan lalu') ||
        normalized.includes('perbandingan bulan lalu');

    if (asksComparison) {
        return { kind: 'comparison' };
    }

    const asksBusiestDay =
        normalized.includes('hari apa') &&
        (normalized.includes('boros') || normalized.includes('paling banyak belanja') || normalized.includes('sering belanja'));

    if (asksBusiestDay) {
        return { kind: 'busiest-day' };
    }

    const asksWeeklyExpense =
        (normalized.includes('pengeluaran') || normalized.includes('belanja')) &&
        (normalized.includes('minggu ini') || normalized.includes('7 hari terakhir'));

    if (asksWeeklyExpense) {
        return { kind: 'weekly-expense' };
    }

    const asksLastTransaction =
        normalized.includes('transaksi terakhir') ||
        normalized.includes('apa belanjaan terakhir');

    if (asksLastTransaction) {
        return { kind: 'last-transaction' };
    }

    const asksTimeSinceLastExpense =
        normalized.includes('terakhir belanja') &&
        (normalized.includes('berapa hari') || normalized.includes('kapan'));

    if (asksTimeSinceLastExpense) {
        return { kind: 'time-since-last-expense' };
    }

    const asksCategoricalTopIncrease =
        (normalized.includes('naik paling banyak') || normalized.includes('peningkatan terbesar')) &&
        normalized.includes('kategori');

    if (asksCategoricalTopIncrease) {
        return { kind: 'categorical-top-increase' };
    }

    const asksDestructiveAction =
        (normalized.includes('hapus') || normalized.includes('delete') || normalized.includes('bersihkan')) &&
        (normalized.includes('semua') || normalized.includes('seluruh') || normalized.includes('transaksi'));

    if (asksDestructiveAction) {
        return { kind: 'destructive-action' };
    }

    const asksAboutDataEntry =
        (normalized.includes('catat') || normalized.includes('tambah') || normalized.includes('input') || normalized.includes('masukkan')) &&
        (
            /\d/.test(normalized) ||
            normalized.includes('rb') ||
            normalized.includes('ribu') ||
            normalized.includes('jt') ||
            normalized.includes('pengeluaran') ||
            normalized.includes('pemasukan') ||
            normalized.includes('belanja') ||
            normalized.includes('transaksi') ||
            normalized.includes('makan') ||
            normalized.includes('minum') ||
            normalized.includes('kopi') ||
            normalized.includes('gaji') ||
            normalized.includes('bensin') ||
            normalized.includes('bayar') ||
            normalized.includes('beli') ||
            normalized.includes('transfer') ||
            normalized.includes('top up')
        );

    if (asksAboutDataEntry) {
        return { kind: 'add-transaction' };
    }

    const asksAboutPastMemory =
        normalized.includes('tadi kamu bilang apa') ||
        normalized.includes('ingat pesan sebelumnya') ||
        normalized.includes('apa yang baru kita bahas');

    if (asksAboutPastMemory) {
        return { kind: 'memory' };
    }

    return { kind: 'llm' };
}

export function buildStaticChatReply(intent: ChatIntent): string | null {
    switch (intent.kind) {
        case 'unclear':
            return "Hmm, pesannya sepertinya kurang jelas nih. Coba tanya sesuatu tentang keuangan kamu (misal: 'berapa pengeluaran saya?').";
        case 'gibberish':
            return "Ups, saya kurang mengerti pesan itu. Bisa diulangi dengan bahasa yang lebih santai? Saya siap bantu cek keuangan kamu kok.";
        case 'destructive-action':
            return 'Maaf, demi keamanan data kamu, saya tidak punya akses untuk menghapus transaksi secara massal. Kamu bisa mengelola data melalui menu **Profil & Akun** atau menghapus transaksi satu per satu di tab **Riwayat**.';
        default:
            return null;
    }
}

export function intentNeedsUnifiedContext(intent: ChatIntent): boolean {
    switch (intent.kind) {
        case 'total-balance':
        case 'total-expense':
        case 'largest-expense':
        case 'budget-risk':
        case 'comparison':
        case 'busiest-day':
        case 'weekly-expense':
        case 'last-transaction':
        case 'time-since-last-expense':
        case 'categorical-top-increase':
            return true;
        default:
            return false;
    }
}

export function tryBuildDeterministicChatReply(
    question: string,
    context: UnifiedFinancialContext | null,
    intent: ChatIntent = classifyChatIntent(question)
): string | null {
    const staticReply = buildStaticChatReply(intent);
    if (staticReply) {
        return staticReply;
    }

    if (!context) return null;

    const topCategory = context.top_categories[0] ?? null;
    const largestExpense = context.largest_expense;
    const riskiestBudget = [...context.budget_alerts].sort((left, right) => right.percent - left.percent)[0]
        ?? [...context.budgets].sort((left, right) => right.percent - left.percent)[0];
    switch (intent.kind) {
        case 'total-balance':
            return [
                `Total saldo kas kamu di semua dompet saat ini **${formatCurrency(context.wealth.cash)}**.`,
                context.monthly.cashflow >= 0
                    ? `Cashflow bulan ini masih positif **${formatCurrency(context.monthly.cashflow)}**.`
                    : `Cashflow bulan ini masih negatif **${formatCurrency(Math.abs(context.monthly.cashflow))}**.`,
            ].join(' ');
        case 'total-expense':
            return `Total pengeluaran kamu bulan ini adalah **${formatCurrency(context.monthly.expense)}** dari **${context.expense_transaction_count}** transaksi.`;
        case 'largest-expense': {
            if (!topCategory || topCategory.amount <= 0) {
                return context.monthly.expense > 0
                    ? `Total pengeluaran bulan ini **${formatCurrency(context.monthly.expense)}**, tapi rincian kategori terbesarnya belum cukup lengkap untuk dipastikan.`
                    : 'Belum ada pengeluaran yang tercatat untuk bulan ini.';
            }

            const share = percentOf(topCategory.amount, context.monthly.expense);
            const example = largestExpense && largestExpense.amount > 0
                ? ` Contoh transaksi terbesar adalah ${sanitizeContextText(largestExpense.description, 60)} sebesar **${formatCurrency(largestExpense.amount)}**.`
                : '';

            return [
                `Kategori yang paling banyak menghabiskan uangmu bulan ini adalah **${topCategory.category}**, sebesar **${formatCurrency(topCategory.amount)}** (sekitar **${share}%** dari total pengeluaran).`,
                example,
            ].join(' ');
        }
        case 'budget-risk':
            if (!riskiestBudget || riskiestBudget.percent < 50) {
                return 'Semua anggaran kamu masih aman terkendali di bawah 50%. Teruskan manajemen budget yang baik ya!';
            }

            if (riskiestBudget.percent >= 100) {
                return `Anggaran **${riskiestBudget.name}** kamu sudah habis terpakai (**${riskiestBudget.percent}%**). Sebaiknya tunda pengeluaran non-esensial di kategori ini.`;
            }

            if (riskiestBudget.percent >= 80) {
                return `Hati-hati, anggaran **${riskiestBudget.name}** kamu sudah sangat kritis, terpakai **${riskiestBudget.percent}%**. Tinggal sedikit lagi sebelum overbudget.`;
            }

            return `Anggaran **${riskiestBudget.name}** kamu sudah terpakai **${riskiestBudget.percent}%**. Masih aman tapi tetap pantau ya.`;
        case 'comparison': {
            const diff = context.monthly.expense - context.previous_month.expense;
            const trend = diff > 0 ? 'meningkat' : 'menurun';
            return [
                `Pengeluaranmu bulan ini (**${formatCurrency(context.monthly.expense)}**) ${trend} sebesar **${formatCurrency(Math.abs(diff))}** dibandingkan bulan lalu (**${formatCurrency(context.previous_month.expense)}**).`,
                diff > 0 ? 'Coba cek lagi apakah ada pengeluaran non-esensial yang bisa dikurangi.' : 'Bagus! Kamu berhasil menekan pengeluaran dibanding bulan lalu.'
            ].join(' ');
        }
        case 'busiest-day':
            return `Berdasarkan pola transaksi bulan ini, kamu biasanya paling boros di hari **${context.spending_pattern.busiest_day}**.`;
        case 'weekly-expense':
            return `Total pengeluaran kamu dalam 7 hari terakhir adalah **${formatCurrency(context.spending_pattern.weekly_expense)}**.`;
        case 'last-transaction':
            if (!context.last_transaction) return 'Sepertinya belum ada transaksi yang tercatat nih.';
            return `Transaksi terakhirmu adalah **${context.last_transaction.description}** sebesar **${formatCurrency(context.last_transaction.amount)}** pada tanggal **${new Date(context.last_transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}**.`;
        case 'time-since-last-expense':
            if (!context.spending_pattern.last_expense_date) return 'Kamu belum mencatat pengeluaran di Lemon nih.';
            {
                const lastDate = new Date(context.spending_pattern.last_expense_date);
                const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) return 'Kamu baru saja belanja hari ini! Masih hangat nih catatannya.';
                return `Sudah **${diffDays} hari** sejak terakhir kali kamu mencatat pengeluaran.`;
            }
        case 'categorical-top-increase': {
            const increases = context.top_categories.map((current) => {
                const prev = context.previous_month.top_categories.find((item) => item.category === current.category);
                const prevAmount = prev?.amount || 0;
                return {
                    category: current.category,
                    increase: current.amount - prevAmount,
                    percent: prevAmount > 0 ? ((current.amount - prevAmount) / prevAmount) * 100 : 100
                };
            }).sort((left, right) => right.increase - left.increase);

            const top = increases[0];
            if (!top || top.increase <= 0) return 'Tidak ada kenaikan pengeluaran kategori yang signifikan dibanding bulan lalu.';
            return `Kategori yang pengeluarannya naik paling banyak adalah **${top.category}**, naik sebesar **${formatCurrency(top.increase)}** (**+${Math.round(top.percent)}%**) dibanding bulan lalu.`;
        }
        default:
            return null;
    }
}
