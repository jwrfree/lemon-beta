'use server';

import OpenAI from "openai";
import { z } from "zod";

import { config } from "@/lib/config";

const openai = new OpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

// Define flexible output schema with defaults to prevent validation crashes
const SingleTransactionSchema = z.object({
  amount: z.union([z.number(), z.string()]).transform((val) => {
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
  description: z.string().nullable().transform(v => v || "Transaksi Baru"),
  merchant: z.string().optional().nullable(), // New field for brand intelligence
  merchantDomain: z.string().optional().nullable(), // AI guesses domain for free logo APIs
  category: z.string().nullable().transform(v => v || "Lain-lain"),
  subCategory: z.string().optional().nullable(),
  wallet: z.string().nullable().transform(v => v || "Tunai"),
  sourceWallet: z.string().optional().nullable(),
  destinationWallet: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  date: z.string().nullable().transform(v => v || new Date().toISOString().slice(0, 10)),
  type: z.enum(['income', 'expense']).nullable().transform(v => v || 'expense'),
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

/**
 * Helper to extract JSON from a string that might contain markdown or extra text
 */
function parseRawAiResponse(text: string): unknown {
  try {
    // 1. Try to find JSON block first (most reliable)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // 2. Fallback to direct parse
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Text:", text);
    return {}; // Return empty to let Zod fill defaults
  }
}

export type ExtractionContext = {
  wallets: string[];
  categories: string[];
};

export async function extractTransaction(text: string, context?: ExtractionContext): Promise<TransactionExtractionOutput> {
  const currentDate = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const walletList = context?.wallets?.join(', ') || 'Tunai, BCA, Mandiri, GoPay, OVO';
  const categoryList = context?.categories?.join(', ') || 'Konsumsi & F&B, Belanja & Lifestyle, Transportasi, Tagihan & Utilitas, Langganan Digital, Hiburan & Wisata, Rumah & Properti, Kesehatan & Medis, Pendidikan, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Biaya Lain-lain, Gaji & Tetap, Bisnis & Freelance, Investasi & Pasif, Pemberian & Hadiah, Refund & Cashback, Penjualan Aset, Terima Piutang, Pendapatan Lain';

  // 1. STATIC INSTRUCTION (Cacheable)
  const systemPrompt = `## INSTRUKSI PARSING TRANSAKSI LEMON AI ##
Anda adalah parsing expert untuk input bahasa Indonesia sehari-hari. Tangkap makna implisit!

### ATURAN SOCRATIC (CRITICAL):
1. **CLARIFICATION FIRST**: Jika input ambigu (misal: "beli makan" tanpa nominal, atau "topup" tanpa dompet tujuan), JANGAN menebak. Tanyakan via 'clarificationQuestion' dengan nada Socratic.
2. **VALUABLE INSIGHT**: Gunakan 'socraticInsight' untuk memberikan feedback edukatif cepat (misal: apresiasi jika itu 'Need' yang hemat, atau tanya urgensi jika itu 'Want' mahal).
3. **50/30/20 LOGIC**: Masukkan logika dana darurat dan rasio budget dalam insight jika memungkinkan.
4. **MULTI-TRANSACTION**: Pecah array 'transactions' jika ada lebih dari satu.

### OUTPUT JSON FORMAT:
{
  "transactions": [...],
  "clarificationQuestion": "Tanya balik jika kurang data...",
  "socraticInsight": "Edukasi singkat ala Lemon Coach..."
}`;

  // 2. DYNAMIC CONTEXT (User Messaging)
  const userPrompt = `### KONTEKS USER:
- Tanggal hari ini: ${currentDate}
- Jam sekarang: ${currentTime}
- Dompet Tersedia: ${walletList}
- Kategori Tersedia: ${categoryList}

### INPUT USER:
"${text}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    console.log("Raw AI Response:", responseText);

    let parsed = parseRawAiResponse(responseText);

    // Auto-unwrap common nested keys
    const wrapperKeys = ['transaction', 'transaksi', 'data'];
    for (const key of wrapperKeys) {
      if (parsed && typeof parsed === 'object' && key in parsed) {
        const val = (parsed as Record<string, unknown>)[key];
        if (val && typeof val === 'object') {
          parsed = val;
          break;
        }
      }
    }

    // Validate with Zod
    const result = ExtractionSchema.safeParse(parsed);

    if (!result.success) {
      console.error("Zod Validation Failed (Using Fallbacks):", result.error.format());
      // Return default structure with one empty transaction
      return {
        transactions: [{
          amount: 0,
          description: text,
          category: "Lain-lain",
          wallet: "Tunai",
          date: currentDate,
          type: "expense",
          isDebtPayment: false,
          isNeed: true
        }]
      };
    }

    // Ensure amount is actually greater than 0 for each transaction if AI failed but text has numbers
    result.data.transactions = result.data.transactions.map(tx => {
      if (tx.amount === 0) {
        const match = text.match(/(\d+)/);
        if (match) {
          let val = parseInt(match[1]);
          if (text.toLowerCase().includes('rb') || text.toLowerCase().includes('k')) val *= 1000;
          return { ...tx, amount: val };
        }
      }
      return tx;
    });

    return result.data;
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return {
      transactions: [{
        amount: 0,
        description: text,
        category: "Lain-lain",
        wallet: "Tunai",
        date: currentDate,
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
  const currentDate = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const walletList = context?.wallets?.join(', ') || 'Tunai, BCA, Mandiri, GoPay, OVO';
  const categoryList = context?.categories?.join(', ') || 'Konsumsi & F&B, Belanja & Lifestyle, Transportasi, Tagihan & Utilitas, Langganan Digital, Hiburan & Wisata, Rumah & Properti, Kesehatan & Medis, Pendidikan, Bisnis & Produktivitas, Keluarga & Anak, Sosial & Donasi, Investasi & Aset, Cicilan & Pinjaman, Biaya Lain-lain, Gaji & Tetap, Bisnis & Freelance, Investasi & Pasif, Pemberian & Hadiah, Refund & Cashback, Penjualan Aset, Terima Piutang, Pendapatan Lain';

  const systemPrompt = `## INSTRUKSI REFINEMENT TRANSAKSI LEMON AI ##
Anda adalah asisten keuangan yang membantu memperbaiki data transaksi berdasarkan feedback user.
Tanggal hari ini: ${currentDate}
Jam sekarang: ${currentTime}

### DATA SAAT INI:
${JSON.stringify(previousData, null, 2)}

### KONTEKS SISTEM:
- **Dompet Tersedia**: ${walletList}
- **Kategori Tersedia**: ${categoryList}

### TUGAS ANDA:
1. Perbarui data transaksi di atas berdasarkan instruksi terbaru dari user.
2. **SOCRATIC DIALOGUE**: Bersikaplah seperti pelatih. Jika user memperbaiki data, berikan feedback di 'socraticInsight' (misal: "Oke, Lemon ganti ke kategori Jajan ya. Hati-hati, minggu ini pengeluaran jajannya sudah cukup tinggi lho!").
3. **KOREKSI SUMBER DANA (WALLET)**: Update 'wallet' jika user menyebutkan.
4. **KOREKSI NEED VS WANT**: Update 'isNeed' berdasarkan konteks percakapan.
5. Tetap gunakan format JSON yang sama.

### OUTPUT JSON FORMAT:
Sama seperti sebelumnya, wajib sertakan 'socraticInsight' setiap kali ada interaksi.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Instruksi User: "${userMessage}"` }
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    let parsed = parseRawAiResponse(responseText);
    const result = ExtractionSchema.safeParse(parsed);

    return result.success ? result.data : previousData;
  } catch (error) {
    console.error("AI Refinement Error:", error);
    return previousData;
  }
}