'use server';

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { z } from "zod";

import { config } from "@/lib/config";
import { categories } from "@/lib/categories";
import {
  getCurrentIsoTimestamp,
  normalizeTransactionTimestamp,
} from "@/lib/utils/transaction-timestamp";
import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
  INDONESIAN_FORMAT_RULES, 
  FINANCIAL_FRAMEWORK 
} from "@/ai/prompts";

const deepseek = createDeepSeek({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

const assertDeepSeekApiKey = () => {
  if (!config.ai.deepseek.apiKey) {
    throw new Error('DeepSeek API key not found. Smart Add tidak tersedia.');
  }
};

// Define flexible output schema with defaults to prevent validation crashes
const SingleTransactionSchema = z.object({
  amount: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    // Handle Indonesian formatting: "10.000" or "10rb" or "10k"
    let cleaned = val.toString().toLowerCase().replace(/\s/g, '');

    // Handle thousand multiplier
    if (cleaned.includes('rb') || cleaned.includes('k')) {
      const numPart = parseFloat(cleaned.replace('rb', '').replace('k', '').replace(',', '.'));
      return isNaN(numPart) ? 0 : numPart * 1000;
    }

    // Handle million multiplier
    if (cleaned.includes('jt')) {
      const numPart = parseFloat(cleaned.replace('jt', '').replace(',', '.'));
      return isNaN(numPart) ? 0 : numPart * 1000000;
    }

    // Default: strip non-digits except first dot/comma for decimal
    const numericOnly = cleaned.replace(/[^\d]/g, '');
    const num = parseInt(numericOnly, 10);
    return isNaN(num) ? 0 : num;
  }).default(0),
  description: z.string().optional().nullable().transform(v => v || "Transaksi Baru"),
  merchant: z.string().optional().nullable(), // New field for brand intelligence
  merchantDomain: z.string().optional().nullable(), // AI guesses domain for free logo APIs
  category: z.string().optional().nullable().transform(v => v || "Lain-lain"),
  subCategory: z.string().optional().nullable(),
  wallet: z.string().optional().nullable().transform(v => v || "Tunai"),
  sourceWallet: z.string().optional().nullable(),
  destinationWallet: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  date: z.string().optional().nullable().transform((v) => normalizeTransactionTimestamp(v)),
  type: z.enum(['income', 'expense']).optional().nullable().transform(v => v || 'expense'),
  // Debt integration
  isDebtPayment: z.boolean().optional().default(false),
  debtId: z.string().optional().nullable(),
  counterparty: z.string().optional().nullable(),
  isNeed: z.boolean().optional().default(true),
});

const ExtractionSchema = z.object({
  transactions: z.array(SingleTransactionSchema).optional().default([]),
  clarificationQuestion: z.string().optional().nullable(),
  socraticInsight: z.string().optional().nullable(), // For proactive feedback/coaching
});

export type TransactionExtractionOutput = z.infer<typeof ExtractionSchema>;
export type SingleTransactionOutput = z.infer<typeof SingleTransactionSchema>;

export type ExtractionContext = {
  wallets: string[];
  categories: string[];
  recentTransactions?: { description: string, amount: number, category: string, wallet: string, date: string }[];
  budgetSummary?: { category: string, limit: number, spent: number, remaining: number }[];
};

type SimpleParseOptions = {
  allowBareInput?: boolean;
};

const CASH_WALLET_ALIASES = ['tunai', 'dompet', 'cash', 'kas'];
const ALL_CATEGORIES = [...categories.expense, ...categories.income];
const SUBCATEGORY_BY_CATEGORY = new Map(
  ALL_CATEGORIES.map((category) => [category.name, category.sub_categories ?? []])
);

const normalizeText = (value?: string | null) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/&()-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const findPreferredCashWalletName = (wallets?: string[]) => {
  if (!wallets?.length) return 'Tunai';

  const exactMatch = wallets.find((wallet) =>
    CASH_WALLET_ALIASES.includes(wallet.trim().toLowerCase())
  );
  if (exactMatch) return exactMatch;

  const partialMatch = wallets.find((wallet) => {
    const normalized = wallet.trim().toLowerCase();
    return CASH_WALLET_ALIASES.some((alias) => normalized.includes(alias));
  });
  if (partialMatch) return partialMatch;

  return wallets[0];
};

const SIMPLE_COMMAND_PREFIX = /\b(catat|tambah|input|masukkan)\b/iu;

const parseAmountToken = (rawAmount: string, rawUnit?: string | null) => {
  const unit = (rawUnit || '').toLowerCase();
  const compact = rawAmount.replace(/\s/g, '');

  if (unit) {
    const normalized = compact.replace(/\./g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return 0;

    if (unit === 'jt' || unit === 'juta') return Math.round(parsed * 1_000_000);
    if (unit === 'rb' || unit === 'ribu' || unit === 'k') return Math.round(parsed * 1_000);
  }

  const digitsOnly = compact.replace(/[^\d]/g, '');
  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const inferSubCategory = (
  category: string,
  sourceText: string,
  requestedSubCategory?: string | null
) => {
  const normalizedSource = normalizeText(sourceText);
  const normalizedRequested = normalizeText(requestedSubCategory);
  const allowedSubCategories = SUBCATEGORY_BY_CATEGORY.get(category) ?? [];

  if (normalizedRequested) {
    const directMatch = allowedSubCategories.find((subCategory) => {
      const normalizedSubCategory = normalizeText(subCategory);
      return (
        normalizedRequested === normalizedSubCategory ||
        normalizedRequested.includes(normalizedSubCategory) ||
        normalizedSubCategory.includes(normalizedRequested)
      );
    });
    if (directMatch) return directMatch;
  }

  const keywordRules: Record<string, Array<{ pattern: RegExp; subCategory: string }>> = {
    'Konsumsi & F&B': [
      { pattern: /\b(gofood|grabfood)\b/iu, subCategory: 'Gofood/Grabfood' },
      { pattern: /\b(kopi|coffee|kapal api|kapalapi|starbucks|fore|kenangan|tuku|janji jiwa|point coffee)\b/iu, subCategory: 'Jajanan & Kopi' },
      { pattern: /\b(hokben|kfc|mcd|mcdonald'?s|burger king|pizza hut|domino'?s|solaria|sushi tei|marugame)\b/iu, subCategory: 'Restoran & Kafe' },
      { pattern: /\b(alfamart|indomaret|superindo|hypermart|transmart|hero|lotte mart)\b/iu, subCategory: 'Bahan Masakan (Grocery)' },
      { pattern: /\b(resto|restaurant|restoran|cafe|kafe|bistro|sushi|pizza|burger)\b/iu, subCategory: 'Restoran & Kafe' },
      { pattern: /\b(indomaret|alfamart|supermarket|minimarket|sayur|beras|telur|daging|buah|grocery|sembako)\b/iu, subCategory: 'Bahan Masakan (Grocery)' },
      { pattern: /\b(catering)\b/iu, subCategory: 'Catering' },
      { pattern: /\b(makan|sarapan|lunch|dinner|snack|jajan|bakso|warteg|nasi goreng|mie ayam)\b/iu, subCategory: 'Makan Harian/Warteg' },
    ],
    'Transportasi': [
      { pattern: /\b(gojek|grab|gocar|goride|go ride|go car)\b/iu, subCategory: 'Ojek Online (Gojek/Grab)' },
      { pattern: /\b(pertamina|shell|bp|vivo)\b/iu, subCategory: 'Bensin' },
      { pattern: /\b(bensin|pertalite|pertamax|shell|spbu)\b/iu, subCategory: 'Bensin' },
      { pattern: /\b(parkir|tol|etoll|e-toll)\b/iu, subCategory: 'Parkir & Tol' },
      { pattern: /\b(servis|service|cuci mobil|cuci motor|oli|bengkel)\b/iu, subCategory: 'Servis & Cuci Kendaraan' },
      { pattern: /\b(krl|mrt|lrt|transjakarta|bus|kereta|angkot)\b/iu, subCategory: 'Transportasi Umum' },
      { pattern: /\b(pesawat|airasia|citilink|lion air|travel|tiket)\b/iu, subCategory: 'Travel & Tiket Pesawat' },
    ],
    'Tagihan & Utilitas': [
      { pattern: /\b(pln mobile)\b/iu, subCategory: 'Listrik (Token/Tagihan)' },
      { pattern: /\b(listrik|token|pln)\b/iu, subCategory: 'Listrik (Token/Tagihan)' },
      { pattern: /\b(telkomsel|indosat|xl|axis|tri|3\b|smartfren)\b/iu, subCategory: 'Pulsa & Paket Data' },
      { pattern: /\b(indihome|biznet|first media|myrepublic|cbn)\b/iu, subCategory: 'Internet & TV Kabel' },
      { pattern: /\b(pulsa|paket data|data)\b/iu, subCategory: 'Pulsa & Paket Data' },
      { pattern: /\b(internet|wifi|tv kabel|indihome|biznet|first media)\b/iu, subCategory: 'Internet & TV Kabel' },
      { pattern: /\b(air|pdam)\b/iu, subCategory: 'Air (PDAM)' },
      { pattern: /\b(keamanan|lingkungan|ipl)\b/iu, subCategory: 'Iuran Keamanan/Lingkungan' },
      { pattern: /\b(bpjs)\b/iu, subCategory: 'BPJS Kesehatan' },
    ],
    'Langganan Digital': [
      { pattern: /\b(netflix|spotify)\b/iu, subCategory: 'Hiburan (Netflix/Spotify)' },
      { pattern: /\b(icloud|google one)\b/iu, subCategory: 'Cloud (iCloud/Google One)' },
      { pattern: /\b(chatgpt|notion|figma|canva|midjourney|cursor|premium app|premium apps)\b/iu, subCategory: 'SaaS (ChatGPT/Premium Apps)' },
      { pattern: /\b(youtube premium)\b/iu, subCategory: 'Youtube Premium' },
    ],
    'Belanja & Lifestyle': [
      { pattern: /\b(shopee|tokopedia|tokped|bukalapak|blibli|lazada)\b/iu, subCategory: 'Marketplace (Tokped/Shopee)' },
      { pattern: /\b(zara|uniqlo|hm|h&m|matahari|cotton on|baju|celana|sepatu|kaos|kemeja|jaket|tas)\b/iu, subCategory: 'Fashion & Pakaian' },
      { pattern: /\b(erafone|ibox|digimap|samsung store|mi store|hp|gadget|laptop|charger|headset)\b/iu, subCategory: 'Elektronik & Gadget' },
      { pattern: /\b(watsons|guardian|sociolla|skincare|skin care|face wash|sabun muka|kahf|wardah|somethinc|make up|makeup|parfum|shampoo|sabun mandi|odol|pasta gigi)\b/iu, subCategory: 'Skin Care & Perawatan' },
      { pattern: /\b(ace hardware|ikea|mr diy|perabot|panci|piring|sapu|pel)\b/iu, subCategory: 'Keperluan Rumah Tangga' },
    ],
    'Hiburan & Wisata': [
      { pattern: /\b(top up ml|mobile legends|free fire|ff\b|pubg|valorant|steam|roblox|genshin|psn|playstation|xbox|nintendo)\b/iu, subCategory: 'Game & Top Up' },
      { pattern: /\b(cgv|xxi|cinepolis|bioskop)\b/iu, subCategory: 'Bioskop' },
      { pattern: /\b(hotel|traveloka hotel|airbnb|staycation)\b/iu, subCategory: 'Staycation' },
      { pattern: /\b(konser|festival|event)\b/iu, subCategory: 'Event & Konser' },
    ],
    'Gaji & Tetap': [
      { pattern: /\b(gaji|salary|gajian)\b/iu, subCategory: 'Gaji Pokok' },
      { pattern: /\b(bonus|thr)\b/iu, subCategory: 'Bonus & THR' },
      { pattern: /\b(tunjangan|allowance)\b/iu, subCategory: 'Tunjangan' },
      { pattern: /\b(lembur|overtime)\b/iu, subCategory: 'Lembur' },
      { pattern: /\b(uang makan|uang transport|transport)\b/iu, subCategory: 'Uang Makan/Transport' },
    ],
    'Pendapatan Lain': [
      { pattern: /\b(lain|lainnya)\b/iu, subCategory: 'Lainnya' },
    ],
    'Biaya Lain-lain': [
      { pattern: /\b(top up gopay|topup gopay|isi gopay|top up ovo|topup ovo|isi ovo|top up dana|topup dana|isi dana|top up linkaja|topup linkaja|isi linkaja|top up shopeepay|topup shopeepay|isi shopeepay)\b/iu, subCategory: 'Lainnya' },
      { pattern: /\b(admin|biaya admin)\b/iu, subCategory: 'Biaya Admin Bank' },
      { pattern: /\b(pajak)\b/iu, subCategory: 'Pajak' },
      { pattern: /\b(mendadak|darurat)\b/iu, subCategory: 'Kebutuhan Mendadak' },
      { pattern: /\b(lain|lainnya)\b/iu, subCategory: 'Lainnya' },
    ],
  };

  const inferredMatch = keywordRules[category]?.find((rule) => rule.pattern.test(normalizedSource));
  if (inferredMatch) return inferredMatch.subCategory;

  return allowedSubCategories[0] ?? null;
};

export const parseSimpleTransactionInput = async (
  text: string,
  context?: Pick<ExtractionContext, 'wallets'>,
  options?: SimpleParseOptions
): Promise<TransactionExtractionOutput | null> => {
  const normalized = text.toLowerCase().trim();
  const hasCommandPrefix = SIMPLE_COMMAND_PREFIX.test(text);
  const looksLikeBareTransaction =
    !!options?.allowBareInput &&
    /\d/.test(normalized) &&
    !/[?]$/.test(normalized) &&
    !/\b(berapa|kenapa|mengapa|gimana|bagaimana|kapan|apa)\b/iu.test(normalized);

  if (!hasCommandPrefix && !looksLikeBareTransaction) return null;

  const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta|rb|ribu|k)?/iu);
  const amount = amountMatch ? parseAmountToken(amountMatch[1], amountMatch[2]) : 0;

  const availableWallets = context?.wallets ?? [];
  const matchedWallet = availableWallets.find((wallet) => normalized.includes(wallet.toLowerCase()));

  const type = /\b(gaji|bonus|thr|income|pemasukan|pendapatan|terima|dapat|dikasih|pemberian|masuk|angpao|amplop|refund)\b/iu.test(normalized)
    ? 'income'
    : 'expense';

  const categoryMap = [
    { 
      pattern: /\b(kopi|coffee|kapal api|kapalapi|starbucks|fore|kenangan|tuku|janji jiwa|point coffee|makan|sarapan|lunch|dinner|snack|jajan|bakso|warteg|nasi goreng|mie ayam|sate|ayam geprek|nasi padang|gofood|grabfood|hokben|kfc|mcd|mcdonald'?s|burger king|pizza hut|domino'?s|solaria|sushi tei|marugame|resto|restoran|cafe|kafe|alfamart|indomaret|superindo|hypermart|transmart|hero|lotte mart|grocery|sembako|sayur|beras|telur|daging|buah|catering|bubur|pecel|ketoprak|seblak|martabak|soto|rawon|gule|gulai|rendang|gorengan|cimol|cilok|batagor|siomay|mie gacuan|mixue|esteh|jus|juice|chatime|richeese|bebek|pecel lele|kantin|kantin kantor|kantin sekolah)\b/iu, 
      category: 'Konsumsi & F&B' 
    },
    { 
      pattern: /\b(shopee|tokopedia|tokped|bukalapak|blibli|lazada|zara|uniqlo|hm|h&m|matahari|cotton on|erafone|ibox|digimap|samsung store|mi store|watsons|guardian|sociolla|ace hardware|ikea|mr diy|skincare|skin care|face wash|sabun muka|kahf|wardah|somethinc|make up|makeup|parfum|shampoo|sabun mandi|odol|pasta gigi|baju|celana|sepatu|kaos|kemeja|jaket|tas|hp|gadget|laptop|charger|headset|perabot|panci|piring|sapu|pel|kaos kaki|topi|kacamata|jam tangan|perhiasan|emall|miniso|daiso|dechatlon|sport station|planet sport|eiger|consina|tas sekolah|buku tulis|pensil|pulpen|atk)\b/iu, 
      category: 'Belanja & Lifestyle' 
    },
    { 
      pattern: /\b(gojek|grab|pertamina|shell|bp|vivo|bensin|parkir|tol|kereta|bus|mrt|krl|travel|tiket|servis|bengkel|gocar|goride|go ride|go car|grabcar|grabride|ojek|ojol|angkot|transjakarta|lrt|tj|jaklingko|bluebird|blue bird|maxim|indriver|pesawat|tiketux|redbus|traveloka|tiket com|cuci mobil|cuci motor|oli|tambal ban|variasi motor|aksesoris mobil)\b/iu, 
      category: 'Transportasi' 
    },
    { 
      pattern: /\b(listrik|token|pulsa|internet|wifi|air|pdam|bpjs|pln|pln mobile|tv kabel|telkomsel|indosat|xl|axis|tri|3\b|smartfren|indihome|biznet|first media|myrepublic|cbn|iuran|iuran warga|keamanan|lingkungan|ipl|pajak stnk|pajak motor|pajak mobil|pajak bumi bangunan|pbb|gas|gas lpg|gas elpiji|galon|aqua galon|vit galon)\b/iu, 
      category: 'Tagihan & Utilitas' 
    },
    { 
      pattern: /\b(netflix|spotify|chatgpt|youtube premium|google one|icloud|notion|figma|canva|midjourney|cursor|zoom|vimeo|disney|disney hotstar|hbo|hbo go|viu|vidio|wetv|iqiyi|amazon prime|itunes|app store|play store|adobe|office 365|microsoft 365)\b/iu, 
      category: 'Langganan Digital' 
    },
    { 
      pattern: /\b(top up ml|mobile legends|free fire|ff\b|pubg|valorant|steam|roblox|genshin|psn|playstation|xbox|nintendo|cgv|xxi|cinepolis|bioskop|hotel|airbnb|staycation|konser|festival|event|tiket konser|museum|kebun binatang|dufan|ancol|karaoke|billiar|futsal|badminton|gym|fitness|membership gym)\b/iu, 
      category: 'Hiburan & Wisata' 
    },
    { 
      pattern: /\b(dokter|obat|apotek|apotik|kimia farma|k24|rumah sakit|rs|rsud|klinik|puskesmas|halodoc|alodokter|masker|vitamin|suplemen|madu|biaya periksa|cek lab|cek darah|dokter gigi|scaling|softlens|optik|melahirkan|persalinan)\b/iu, 
      category: 'Kesehatan & Medis' 
    },
    { 
      pattern: /\b(uang saku|uang jajan anak|susu bayi|diapers|pampers|popok|baju bayi|mainan anak|tk|sd|smp|sma|kuliah|spp|uang sekolah|buku pelajaran|bimbel|les|kursus|udemy|coursera|seragam)\b/iu, 
      category: 'Keluarga & Anak' 
    },
    { 
      pattern: /\b(sedekah|infaq|zakat|donasi|kotak amal|sumbangan|kondangan|amplop nikah|kado|hadiah|titip beli|kitabisa|baznas|act)\b/iu, 
      category: 'Sosial & Donasi' 
    },
    { 
      pattern: /\b(investasi|saham|reksadana|reksa dana|crypto|kripto|bibit|ajaib|pluang|pintu|indodax|logam mulia|emas|antam|tabungan|deposito)\b/iu, 
      category: 'Investasi & Aset' 
    },
    { 
      pattern: /\b(cicilan|pinjaman|kredit|kpr|kpa|kredit motor|kredit mobil|pinjol|akulaku|kredivo|spaylater|shopee paylater|lazpaylater|paylater|home credit|indodana|kartu kredit|credit card)\b/iu, 
      category: 'Cicilan & Pinjaman' 
    },
    { 
      pattern: /\b(gaji|bonus|thr|salary|tunjangan|lembur|gajian|payout|penghasilan|honor|komisi)\b/iu, 
      category: 'Gaji & Tetap' 
    },
    { 
      pattern: /\b(top up gopay|topup gopay|isi gopay|top up ovo|topup ovo|isi ovo|top up dana|topup dana|isi dana|top up linkaja|topup linkaja|isi linkaja|top up shopeepay|topup shopeepay|isi shopeepay|admin|biaya admin|biaya transfer|admin bank|materai|parkir|denda|tilang)\b/iu, 
      category: 'Biaya Lain-lain' 
    },
  ].find((entry) => entry.pattern.test(normalized));

  const category = categoryMap?.category ?? (type === 'income' ? 'Pendapatan Lain' : 'Biaya Lain-lain');

  let description = text
    .replace(/\b(catat|tambah|input|masukkan)\b/giu, ' ')
    .replace(/(\d+(?:[.,]\d+)?)\s*(jt|juta|rb|ribu|k)?/giu, ' ')
    .replace(/\b(pakai|pakai dompet|dari|ke)\b.+$/iu, ' ')
    .replace(/\b(pengeluaran|pemasukan|transaksi|expense|income)\b/giu, ' ')
    .replace(/\b(beli|bayar|jajan|bayarin|buat|untuk)\b/giu, ' ') // Remove action verbs
    .replace(/\s+/g, ' ')
    .trim();

  // Sentence case: Capitalize ONLY the first letter, leave the rest of the string exactly as the user typed it
  // This prevents "PLN" from becoming "Pln", and avoids unnatural "Mie Ayam Pak Min" (Title Case)
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  // Auto-capitalize known acronyms and brands that people often type in lowercase
  const acronyms = /\b(pln|bpjs|pdam|krl|mrt|lrt|bca|bni|bri|bsi|btn|ovo|gopay|dana|shopeepay|shopee|tokopedia|gojek|grab)\b/giu;
  description = description.replace(acronyms, (match) => {
    // For specific mixed-case brands
    const lowerMatch = match.toLowerCase();
    if (lowerMatch === 'gopay') return 'GoPay';
    if (lowerMatch === 'shopeepay') return 'ShopeePay';
    if (lowerMatch === 'tokopedia') return 'Tokopedia';
    if (lowerMatch === 'shopee') return 'Shopee';
    if (lowerMatch === 'gojek') return 'Gojek';
    if (lowerMatch === 'grab') return 'Grab';
    
    // Default: FULL UPPERCASE for acronyms like PLN, BPJS, BCA
    return match.toUpperCase();
  });

  const subCategory = inferSubCategory(category, description || text, null);

  if (amount <= 0) {
    return {
      transactions: [],
      clarificationQuestion: "Nominalnya belum kebaca. Coba tulis seperti `catat makan 25rb`.",
    };
  }

  return {
    transactions: [{
      amount,
      description: description || category,
      merchant: null,
      merchantDomain: null,
      category,
      subCategory,
      wallet: matchedWallet || findPreferredCashWalletName(availableWallets),
      sourceWallet: null,
      destinationWallet: null,
      location: null,
      date: getCurrentIsoTimestamp(),
      type,
      isDebtPayment: false,
      debtId: null,
      counterparty: null,
      isNeed: type === 'expense',
    }],
    clarificationQuestion: null,
    socraticInsight: null,
  };
};

export async function extractTransaction(text: string, context?: ExtractionContext): Promise<TransactionExtractionOutput> {
  assertDeepSeekApiKey();

  const currentTimestamp = getCurrentIsoTimestamp();
  const currentDate = currentTimestamp.slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const walletList = context?.wallets?.join(', ') || 'Tunai, BCA, Mandiri, GoPay, OVO';
  const categoryList = context?.categories?.join(', ') || 'Konsumsi & F&B, Belanja & Lifestyle, Transportasi, Tagihan & Utilitas, Langganan Digital, Hiburan & Wisata, Rumah & Properti, Kesehatan & Medis, Pendidikan, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Biaya Lain-lain';

  // 1. STATIC INSTRUCTION (Cacheable)
  const systemPrompt = `## INSTRUKSI PARSING TRANSAKSI ##
${LEMON_COACH_IDENTITY}

${TONE_AND_LANGUAGE}

${FINANCIAL_FRAMEWORK}

${INDONESIAN_FORMAT_RULES}

### ATURAN EKSTRAKSI (CRITICAL):
1. **CLARIFICATION FIRST**: Jika input ambigu, tanyakan via 'clarificationQuestion'. HARUS SINGKAT (max 1 kalimat).
2. **VALUABLE INSIGHT**: Gunakan 'socraticInsight' untuk memberikan feedback edukatif sangaaat singkat (max 10-15 kata). 
3. **HISTORY MATCHING**: Jika input user mirip dengan transaksi di 'Recent Transactions', prioritaskan menggunakan 'category' and 'wallet' yang sama.
4. **BUDGET AWARENESS**: Gunakan data 'Budget Status' untuk memberikan insight. Jika budget menipis, beri peringatan halus.
5. **INCOME DETECTION**: Tentukan 'type' sebagai 'income' (bukan 'expense') secara otomatis jika narasi mengindikasikan penerimaan uang (gaji, masuk, dapat, dikasih, pemberian, angpao).

### OUTPUT JSON FORMAT:
Wajib mengembalikan objek JSON sesuai skema transaksi.`;

  // 2. DYNAMIC CONTEXT (User Messaging)
  const userPrompt = `### KONTEKS USER:
- Tanggal hari ini: ${currentDate}
- Jam sekarang: ${currentTime}
- Dompet Tersedia: ${walletList}
- Kategori Tersedia: ${categoryList}

### KONTEKS HISTORIS & BUDGET:
- **Recent Transactions (Last 5)**: ${JSON.stringify(context?.recentTransactions || [], null, 1)}
- **Budget Status**: ${JSON.stringify(context?.budgetSummary || [], null, 1)}

### INPUT USER:
"${text}"`;

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: ExtractionSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0,
    });

    // Amount recovery logic
    object.transactions = (object.transactions || []).map((tx: SingleTransactionOutput) => {
      const normalizedCategory = tx.category || (tx.type === 'income' ? 'Pendapatan Lain' : 'Biaya Lain-lain');
      const normalizedTransaction = {
        ...tx,
        category: normalizedCategory,
        subCategory: inferSubCategory(
          normalizedCategory,
          [tx.description, tx.merchant, tx.subCategory, text].filter(Boolean).join(' '),
          tx.subCategory
        ),
        date: normalizeTransactionTimestamp(tx.date),
      };

      if (tx.amount === 0) {
        const match = text.match(/(\d+)/);
        if (match) {
          let val = parseInt(match[1]);
          if (text.toLowerCase().includes('rb') || text.toLowerCase().includes('k')) val *= 1000;
          return { ...normalizedTransaction, amount: val };
        }
      }
      return normalizedTransaction;
    });

    return object;
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return {
      transactions: [{
        amount: 0,
        description: text,
        category: "Lain-lain",
        wallet: "Tunai",
        date: currentTimestamp,
        type: "expense",
        isDebtPayment: false,
        isNeed: true
      }]
    };
  }
}

export async function refineTransaction(
  previousData: TransactionExtractionOutput,
  userMessage: string,
  context?: ExtractionContext
): Promise<TransactionExtractionOutput> {
  assertDeepSeekApiKey();

  const walletList = context?.wallets?.join(', ') || 'Tunai, BCA, Mandiri, GoPay, OVO';
  const categoryList = context?.categories?.join(', ') || 'Konsumsi & F&B, Belanja & Lifestyle, Transportasi, Tagihan & Utilitas, Langganan Digital, Hiburan & Wisata, Rumah & Properti, Kesehatan & Medis, Pendidikan, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Biaya Lain-lain';

  const systemPrompt = `## INSTRUKSI REFINEMENT ##
${LEMON_COACH_IDENTITY}

${TONE_AND_LANGUAGE}

### DATA SAAT INI (STATE):
${JSON.stringify(previousData, null, 2)}

### KONTEKS SISTEM:
- **Dompet Tersedia**: ${walletList}
- **Kategori Tersedia**: ${categoryList}
- **Recent Transactions**: ${JSON.stringify(context?.recentTransactions || [], null, 1)}
- **Budget Status**: ${JSON.stringify(context?.budgetSummary || [], null, 1)}

${INDONESIAN_FORMAT_RULES}

### TUGAS ANDA:
1. Perbarui data transaksi berdasarkan instruksi user.
2. Sertakan 'socraticInsight' singkat (max 15 kata). 
3. Gunakan personamu sebagai Lemon Coach.`;

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: ExtractionSchema,
      system: systemPrompt,
      prompt: `Instruksi User: "${userMessage}"`,
      temperature: 0,
    });

    return object;
  } catch (error) {
    console.error("AI Refinement Error:", error);
    return previousData;
  }
}
