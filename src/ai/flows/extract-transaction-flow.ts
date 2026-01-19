'use server';

import OpenAI from "openai";
import { z } from "zod";

import { config } from "@/lib/config";

const openai = new OpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

// Define flexible output schema with defaults to prevent validation crashes
const ExtractionSchema = z.object({
  amount: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    
    // Handle Indonesian formatting: "10.000" or "10rb" or "10k"
    let cleaned = val.toLowerCase().replace(/\s/g, '');
    
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
  category: z.string().nullable().transform(v => v || "Lain-lain"),
  subCategory: z.string().optional().nullable(),
  wallet: z.string().nullable().transform(v => v || "Tunai"),
  sourceWallet: z.string().optional().nullable(),
  destinationWallet: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  date: z.string().nullable().transform(v => v || new Date().toISOString().slice(0, 10)),
  type: z.enum(['income', 'expense']).nullable().transform(v => v || 'expense')
});

export type TransactionExtractionOutput = z.infer<typeof ExtractionSchema>;

/**
 * Helper to extract JSON from a string that might contain markdown or extra text
 */
function parseRawAiResponse(text: string): any {
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

export async function extractTransaction(text: string): Promise<TransactionExtractionOutput> {
  const currentDate = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  const systemPrompt = `## INSTRUKSI PARSING TRANSAKSI LEMON AI ##
Anda adalah parsing expert untuk input bahasa Indonesia sehari-hari. Tangkap makna implisit!
Tanggal hari ini: ${currentDate}
Jam sekarang: ${currentTime}

### ATURAN DETEKSI OTOMATIS:
1. **DETEKSI JENIS & TIPE:**
   - **Expense**: beli, bayar, jajan, keluar, makan, isi pulsa.
   - **Income**: gaji, dapat, terima, bonus, cashback, refund, masuk.
   - **Transfer**: pindah, kirim, tf, dari [A] ke [B], mutasi.

2. **DETEKSI NOMINAL (MANDATORY):**
   - 'rb'/'ribu'/'k' = x1000, 'jt'/'juta' = x1000000.

3. **DETEKSI KATEGORI:**
   - Sesuaikan dengan tipe. Jika Transfer, kategori HARUS 'Transfer'.
   - Pemasukan: 'Gaji', 'Bonus', 'Investasi', 'Lain-lain'.
   - Pengeluaran: 'Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan'.

4. **LOGIKA TRANSFER (KHUSUS):**
   - Jika mendeteksi transfer:
     - 'sourceWallet': Dompet asal (dari ...).
     - 'destinationWallet': Dompet tujuan (ke ...).
     - 'type': 'expense' (sebagai trigger sistem).

5. **DETEKSI SUMBER DANA (NON-TRANSFER):**
   - 'pakai', 'via', 'dari' -> masukkan ke field 'wallet'.
   - Default: 'Tunai'.

6. **DETEKSI WAKTU:**
   - 'kemarin' -> ${new Date(Date.now() - 86400000).toISOString().slice(0, 10)}
   - Default: ${currentDate}

### OUTPUT JSON FLAT:
{"type":"income|expense","category":"...","description":"...","amount":number,"date":"YYYY-MM-DD","wallet":"...","sourceWallet":"...","destinationWallet":"..."}

Langsung parse tanpa tanya balik!`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Input: "${text}"` }
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
        if (parsed[key] && typeof parsed[key] === 'object') {
            parsed = parsed[key];
            break;
        }
    }

    // Validate with Zod
    const result = ExtractionSchema.safeParse(parsed);
    
    if (!result.success) {
        console.error("Zod Validation Failed (Using Fallbacks):", result.error.format());
        // Return defaults using Zod itself
        return ExtractionSchema.parse({}); 
    }

    // Ensure amount is actually greater than 0 for better UX, even if AI failed
    if (result.data.amount === 0) {
        // Simple manual scan for numbers if AI missed it
        const match = text.match(/(\d+)/);
        if (match) {
            let val = parseInt(match[1]);
            if (text.toLowerCase().includes('rb') || text.toLowerCase().includes('k')) val *= 1000;
            result.data.amount = val;
        }
    }

    return result.data;
  } catch (error: any) {
    console.error("AI Extraction Error:", error);
    return {
        amount: 0,
        description: text,
        category: "Lain-lain",
        wallet: "Tunai",
        date: currentDate,
        type: "expense"
    };
  }
}