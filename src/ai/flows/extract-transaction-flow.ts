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
  const categoryList = context?.categories?.join(', ') || 'Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Gaji, Bonus, Investasi, Keluarga, Sosial';

  // 1. STATIC INSTRUCTION (Cacheable)
  const systemPrompt = `## INSTRUKSI PARSING TRANSAKSI LEMON AI ##
Anda adalah parsing expert untuk input bahasa Indonesia sehari-hari. Tangkap makna implisit!

### ATURAN UTAMA:
1. **MULTI-TRANSACTION SUPPORT**: Jika user menyebut beberapa transaksi (misal: "beli bensin 50rb dan makan 30rb"), pecah menjadi objek terpisah dalam array 'transactions'.
2. **DETEKSI HUTANG/PIUTANG**: Jika mendeteksi pembayaran hutang, set 'isDebtPayment': true dan isi 'counterparty'.
3. **TRANSFER LOGIC**: 
   - Internal: Jika dompet asal/tujuan ada di daftar -> set 'category': 'Transfer'.
   - External: Jika transfer ke orang luar -> set 'type': 'expense' dan masukkan nama ke 'description'.
4. **NEED VS WANT**: 
   - Need: Sembako, cicilan, tagihan dasar, bensin kerja, obat.
   - Want: Makan di mall, kopi kekinian (Starbucks, dll), bioskop, langganan hiburan (Netflix), topup game.
5. **MERCHANT & DOMAIN**: Ekstrak brand (misal: "Gojek", "McD") dan tebak domain resminya (misal: "starbucks.co.id").

### OUTPUT JSON FORMAT:
{
  "transactions": [
    {
      "type": "income|expense",
      "category": "...",
      "merchant": "...",
      "merchantDomain": "...",
      "description": "...",
      "amount": number,
      "date": "YYYY-MM-DD",
      "wallet": "...",
      "isNeed": boolean
    }
  ],
  "clarificationQuestion": "string (optional)"
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
  const categoryList = context?.categories?.join(', ') || 'Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Gaji, Bonus, Investasi, Keluarga, Sosial';

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
2. **KOREKSI SUMBER DANA (WALLET)**:
   - Sangat sensitif terhadap kata kunci seperti: "pake", "ganti dompet", "dari bca", "via gopay", "pindah ke cash", dll.
   - Jika user menyebutkan nama dompet, pastikan field 'wallet' diupdate sesuai daftar: ${walletList}.
3. **KOREKSI NEED VS WANT**:
   - Jika user bilang "ini kebutuhan" -> set 'isNeed': true.
   - Jika user bilang "ini keinginan/hiburan/lifestyle" -> set 'isNeed': false.
4. Jika user memberikan informasi yang memperbaiki field tertentu (nominal, kategori, deskripsi), update field tersebut.
5. Jika user memberikan informasi tambahan untuk transaksi yang belum lengkap, lengkapi datanya.
6. Tetap gunakan format JSON yang sama.
7. Jika instruksi user masih ambigu, Anda boleh menggunakan 'clarificationQuestion'.

### OUTPUT JSON FORMAT:
Sama seperti sebelumnya.`;

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