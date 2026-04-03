import { formatCurrency } from "@/lib/utils";
import { UnifiedFinancialContext } from "@/lib/services/financial-context-service";
import { composeSystemPrompt, FINANCIAL_FRAMEWORK } from "@/ai/prompts";

/**
 * Chat-specific instructions for the Lemon Coach agent.
 */
const CHAT_SPECIFIC_INSTRUCTIONS = `${FINANCIAL_FRAMEWORK}

### AKSES DATA (TOOLS)
Anda memiliki akses ke tools finansial untuk mendapatkan data saldo, budget, pengeluaran, progres tabungan, dan mencari transaksi spesifik user.
SELALU gunakan tool yang relevan sebelum menjawab pertanyaan yang membutuhkan data finansial (misal: "berapa saldo saya?").
Untuk pertanyaan transaksi spesifik seperti "kapan terakhir beli kopi?", "ada transaksi Netflix?", atau "berapa terakhir bayar listrik?", gunakan tool pencarian transaksi dulu. Jangan menolak kalau data transaksi spesifik bisa dicari.
Jika ada tindak lanjut yang sebaiknya dilakukan di aplikasi (misal buka halaman budget, buka form tambah transaksi, atau sorot section tertentu), gunakan tool 'app_action' agar UI bisa menampilkan chip aksi yang bisa diklik user.

### FORMAT RESPONS TERSTRUKTUR
Saat jawabanmu membutuhkan rich component, action, atau suggestion, bungkus seluruh jawaban dalam SATU blok XML berikut:
<response>
{"text":"...", "components":[...], "actions":[...], "suggestions":[...]}
</response>

Untuk jawaban plain text biasa, balas normal tanpa wrapper. Hanya keluarkan 'components' jika benar-benar menambah nilai di luar teks.

Aturan skema:
- 'text' wajib diisi. Ini adalah jawaban utama untuk user, tetap ringkas dan natural.
- 'components' opsional. Gunakan hanya jika data tool tersedia dan relevan.
- 'actions' opsional. Jika Anda ingin UI menampilkan chip aksi, utamakan tool 'app_action'. Anda boleh menyalin aksi yang sama ke dalam 'actions' agar klien typed tetap bisa membacanya.
- 'suggestions' opsional. Isi 0-2 pertanyaan lanjutan singkat.

Komponen yang valid:
- 'BudgetStatus'
- 'RecentTransactions'
- 'WealthSummary'
- 'ScenarioSimulation' dengan 'data' persis hasil tool 'simulate_financial_scenario'
- 'SubscriptionAnalysis' dengan 'data' persis hasil tool 'analyze_subscriptions'
- 'FinancialHealth' dengan 'data' persis hasil tool 'get_financial_health'

### REVIEW ANOMALI
Jika konteks server berisi anomaly review:
- Jelaskan tiap anomali dengan label severity yang eksplisit: high = perlu tindakan sekarang, medium = perlu dipantau, low = informasi.
- Sebutkan angka sekarang versus angka referensi secara spesifik, jangan samar.
- Tutup tiap anomali dengan satu langkah lanjut yang bisa user lakukan hari ini.
- Jika metadata berisi target_action, gunakan tool 'app_action' atau isi actions agar UI bisa memberi pintasan ke area yang relevan.

## Coaching Directives
- Pattern recognition: ketika data finansial menunjukkan tren 3 bulan atau lebih, sebutkan polanya secara eksplisit. Jangan hanya melaporkan angka.
- Goal progress framing: selalu kaitkan pengeluaran dengan goal aktif. Jika goal berisiko meleset, katakan secara langsung.
- Actionable next steps: setiap jawaban analisis harus ditutup dengan 1-3 langkah konkret yang bisa user lakukan hari ini.
- Tone: tetap suportif tapi jujur. Jangan melunakkan kabar buruk sampai kehilangan makna.
- Cross-tool chaining: untuk pertanyaan budget, gunakan juga konteks goal progress dan risk score yang sudah disiapkan server. Untuk pertanyaan goal, gunakan juga budget health. Jangan menjawab pertanyaan finansial secara terisolasi.

### DATA MANAGEMENT (EDIT/DELETE)
- Jika user ingin mengubah transaksi (misal: "ganti harga kopi tadi jadi 20rb"), gunakan find_transactions dulu untuk cari ID-nya, lalu gunakan update_transaction.
- Jika user ingin menghapus, gunakan find_transactions dulu, lalu delete_transaction. Panggilan delete pertama hanya untuk menyiapkan penghapusan. Setelah user mengonfirmasi secara eksplisit, panggil delete_transaction lagi dengan \`confirm: true\` untuk transaksi yang sama.

### PRIORITAS JAWABAN
1. Inti jawaban di kalimat pertama dengan angka/fakta kunci dari tool.
2. Jawaban ideal: 2-4 kalimat singkat dan langsung pada intinya. Gunakan poin hanya jika diminta.
3. Bahasa Indonesia natural, empati, suportif, dan fokus pada tindakan praktis (actionable).
4. Gunakan cetak tebal (**bold**) khusus untuk menyoroti nominal uang atau persentase, agar mudah dibaca. JANGAN gunakan heading, italic, atau list yang rumit.
5. Jika relevan, isi 'suggestions' dengan 1-2 pertanyaan lanjutan yang relevan.

JIKA data dari tool kosong atau tidak cukup, katakan dengan jujur bahwa Anda belum memiliki data tersebut.
Jangan sebut nama tool internal atau istilah teknis ke user.`;

export const CHAT_SYSTEM_PROMPT = composeSystemPrompt(CHAT_SPECIFIC_INSTRUCTIONS);

export type ChatUserFinancialProfile = {
    spending_patterns?: Record<string, unknown> | null;
    coaching_notes?: string | null;
};

export type BuildChatSystemPromptOptions = {
    memorySummary?: string | null;
    userProfile?: ChatUserFinancialProfile | null;
    supplementalContext?: Record<string, unknown> | null;
};

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
    | { kind: 'anomaly-review' }
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
    | { kind: 'subscription-analysis' }
    | { kind: 'financial-health' }
    | { kind: 'memory' }
    | { kind: 'llm' };

export function buildChatSystemPrompt(options?: string | BuildChatSystemPromptOptions): string {
    const normalizedOptions = typeof options === 'string'
        ? { memorySummary: options }
        : (options ?? {});

    const sections = [CHAT_SYSTEM_PROMPT];

    if (normalizedOptions.memorySummary?.trim()) {
        sections.push(`### MEMORI PERCAKAPAN
Gunakan ringkasan berikut sebagai konteks percakapan lama. Jangan mengulang semuanya ke user kecuali relevan.
${normalizedOptions.memorySummary.trim()}`);
    }

    if (normalizedOptions.userProfile && (normalizedOptions.userProfile.coaching_notes || normalizedOptions.userProfile.spending_patterns)) {
        sections.push(`## User Financial Profile
Spending patterns: ${JSON.stringify(normalizedOptions.userProfile.spending_patterns ?? {}, null, 0)}
Coaching notes: ${normalizedOptions.userProfile.coaching_notes ?? ''}`);
    }

    if (normalizedOptions.supplementalContext && Object.keys(normalizedOptions.supplementalContext).length > 0) {
        sections.push(`## SERVER-PREPARED CONTEXT
Gunakan konteks siap pakai berikut sebagai data pendukung yang sudah dirangkai server. Jangan sebut nama tool internal ke user.
${JSON.stringify(normalizedOptions.supplementalContext, null, 2)}`);
    }

    return sections.join('\n\n');
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

const hasAny = (text: string, keywords: string[]) => keywords.some(k => text.includes(k));
const hasAllGroups = (text: string, keywordGroups: string[][]) => keywordGroups.every(group => hasAny(text, group));

export function classifyChatIntent(question: string): ChatIntent {
    const normalized = normalizeQuestion(question);
    if (!normalized || normalized.length < 2) {
        return { kind: 'unclear' };
    }

    const isGibberish = !normalized.includes(' ') && normalized.length > 8 && !/[aeiou]/i.test(normalized);
    if (isGibberish) {
        return { kind: 'gibberish' };
    }

    // Compound Sentence Detection: If the user asks multiple things (e.g. "saldo berapa dan apakah boros"),
    // fallback to LLM so it can run multiple tools and provide a comprehensive answer.
    const wordCount = normalized.split(/\s+/).length;
    const hasConjunction = hasAny(normalized, [' dan ', ' sekalian ', ' terus ', ' lalu ']);
    if (wordCount >= 6 && hasConjunction) {
        return { kind: 'llm' };
    }

    if (hasAllGroups(normalized, [
        ['mutasi', 'transaksi', 'riwayat', 'history', 'catatan'],
        ['terbaru', 'terakhir', 'recent', 'cek', 'apa', 'gimana']
    ])) {
        return { kind: 'recent-transactions' };
    }

    if (
        hasAny(normalized, [
            'bagaimana kondisi keuangan saya',
            'gimana kondisi keuanganku',
            'ada yang perlu aku perhatikan',
            'ada yang perlu saya perhatikan',
            'cek keuanganku',
            'cek keuangan saya',
            'how am i doing',
            'how am i doing financially',
        ]) ||
        hasAllGroups(normalized, [
            ['cek', 'review', 'audit', 'ringkas'],
            ['keuangan', 'finansial', 'dompet', 'pengeluaran']
        ])
    ) {
        return { kind: 'anomaly-review' };
    }

    const transactionSearchQuery = extractTransactionSearchQuery(question);
    if (transactionSearchQuery) {
        return { kind: 'transaction-search', query: transactionSearchQuery };
    }

    if (hasAny(normalized, ['total saldo', 'saldo saya', 'uang saya berapa', 'sisa uang', 'duit saya']) || 
        hasAllGroups(normalized, [['saldo', 'uang', 'duit'], ['dompet', 'kantong', 'rekening', 'kas']])) {
        return { kind: 'total-balance' };
    }

    if (hasAllGroups(normalized, [
        ['total pengeluaran', 'total belanja', 'habis berapa', 'total outflow', 'sudah keluar berapa', 'pengeluaran saya'],
        ['bulan ini', 'saat ini', 'sekarang']
    ])) {
        return { kind: 'total-expense' };
    }

    if (hasAllGroups(normalized, [
        ['pengeluaran terbesar', 'expense terbesar', 'kategori terbesar', 'paling banyak', 'paling boros', 'paling gede'],
        ['bulan ini', 'saat ini', 'sekarang']
    ])) {
        return { kind: 'largest-expense' };
    }

    if (hasAllGroups(normalized, [
        ['budget', 'bujet', 'bajet', 'anggaran', 'kebocoran', 'bocor', 'sisa'],
        ['aman', 'bahaya', 'boncos', 'boros', 'kritis', 'hampir habis', 'limit', 'batas']
    ])) {
        return { kind: 'budget-risk' };
    }

    if (hasAny(normalized, ['lebih besar dari bulan lalu', 'dibandingkan bulan lalu', 'perbandingan bulan lalu', 'banding bulan lalu'])) {
        return { kind: 'comparison' };
    }

    if (hasAllGroups(normalized, [
        ['hari apa'],
        ['boros', 'paling banyak', 'sering belanja', 'paling sering']
    ])) {
        return { kind: 'busiest-day' };
    }

    if (hasAllGroups(normalized, [
        ['pengeluaran', 'belanja', 'habis'],
        ['minggu ini', '7 hari terakhir', 'seminggu ini']
    ])) {
        return { kind: 'weekly-expense' };
    }

    if (hasAny(normalized, ['transaksi terakhir', 'belanjaan terakhir', 'apa belanjaan terakhir', 'terakhir beli apa'])) {
        return { kind: 'last-transaction' };
    }

    if (hasAllGroups(normalized, [
        ['terakhir belanja', 'terakhir transaksi'],
        ['berapa hari', 'kapan', 'sudah berapa lama']
    ])) {
        return { kind: 'time-since-last-expense' };
    }

    if (hasAllGroups(normalized, [
        ['naik paling banyak', 'peningkatan terbesar', 'paling melonjak'],
        ['kategori']
    ])) {
        return { kind: 'categorical-top-increase' };
    }

    if (hasAllGroups(normalized, [
        ['langganan', 'netflix', 'spotify', 'youtube premium', 'rutin', 'subscription'],
        ['cek', 'apa', 'daftar', 'deteksi', 'ada']
    ])) {
        return { kind: 'subscription-analysis' };
    }

    if (hasAllGroups(normalized, [
        ['sehat', 'health', 'skor', 'audit kesehatan', 'health check'],
        ['keuangan', 'finansial', 'saya', 'dompet']
    ])) {
        return { kind: 'financial-health' };
    }

    if (hasAllGroups(normalized, [
        ['hapus', 'delete', 'bersihkan', 'ilangin'],
        ['semua', 'seluruh', 'transaksi', 'riwayat']
    ])) {
        return { kind: 'destructive-action' };
    }

    const isDataEntryKw = hasAny(normalized, [
        'rb', 'ribu', 'jt', 'juta', 'pengeluaran', 'pemasukan', 'belanja', 
        'transaksi', 'makan', 'minum', 'kopi', 'gaji', 'bensin', 'bayar', 
        'beli', 'transfer', 'top up'
    ]) || /\d/.test(normalized);

    if (hasAny(normalized, ['catat', 'tambah', 'input', 'masukkan', 'tulis']) && isDataEntryKw) {
        return { kind: 'add-transaction' };
    }

    if (hasAny(normalized, ['tadi kamu bilang apa', 'ingat pesan sebelumnya', 'apa yang baru kita bahas', 'diatas tadi'])) {
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
                `[RENDER_COMPONENT:WealthSummary]`
            ].join(' ');
        case 'total-expense':
            return `Total pengeluaran kamu bulan ini adalah **${formatCurrency(context.monthly.expense)}** dari **${context.expense_transaction_count}** transaksi.\n[RENDER_COMPONENT:RecentTransactions]`;
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
                return 'Semua anggaran kamu masih aman terkendali di bawah 50%. Teruskan manajemen budget yang baik ya!\n[RENDER_COMPONENT:BudgetStatus]';
            }

            if (riskiestBudget.percent >= 100) {
                return `Anggaran **${riskiestBudget.name}** kamu sudah habis terpakai (**${riskiestBudget.percent}%**). Sebaiknya tunda pengeluaran non-esensial di kategori ini.\n[RENDER_COMPONENT:BudgetStatus]`;
            }

            if (riskiestBudget.percent >= 80) {
                return `Hati-hati, anggaran **${riskiestBudget.name}** kamu sudah sangat kritis, terpakai **${riskiestBudget.percent}%**. Tinggal sedikit lagi sebelum overbudget.\n[RENDER_COMPONENT:BudgetStatus]`;
            }

            return `Anggaran **${riskiestBudget.name}** kamu sudah terpakai **${riskiestBudget.percent}%**. Masih aman tapi tetap pantau ya.\n[RENDER_COMPONENT:BudgetStatus]`;
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
