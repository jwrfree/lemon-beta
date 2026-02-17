'use server';

import OpenAI from "openai";
import { z } from "zod";
import { config } from "@/lib/config";

const openai = new OpenAI({
  apiKey: config.ai.deepseek.apiKey,
  baseURL: config.ai.deepseek.baseURL,
});

const PatchOutputSchema = z.object({
  amount: z.number().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  walletId: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  confidence: z.number().min(0).max(1),
  explanation: z.string().optional(), // Brief micro-copy for UI
});

export type LiquidPatchOutput = z.infer<typeof PatchOutputSchema>;

export async function patchTransactionLiquid(
  userInput: string,
  currentState: any,
  context: { wallets: { id: string, name: string }[], categories: string[] }
): Promise<LiquidPatchOutput> {
  
  const walletList = context.wallets.map(w => `${w.name} (ID: ${w.id})`).join(', ');
  const categoryList = context.categories.join(', ');

  const systemPrompt = `## LEMON LIQUID ENGINE: SEMANTIC PATCHER ##
Anda adalah modul "Intelligent Patching" untuk aplikasi keuangan Lemon. 
Tugas Anda: Menerima 'userInput' dan 'currentState' transaksi, lalu mengembalikan HANYA field yang perlu diperbarui.

### DATA SAAT INI (STATE):
${JSON.stringify(currentState, null, 2)}

### KONTEKS SISTEM:
- **Dompet (PENTING: Gunakan ID)**: ${walletList}
- **Kategori**: ${categoryList}

### ATURAN PATCHING:
1. **IDENTIFIKASI INTENT:** 
   - Jika user berkata "harganya...", "jadi...", atau angka saja -> Update 'amount'.
   - Jika user menyebut tempat/lokasi -> Update 'location'.
   - Jika user menyebut "pake [dompet]", "ganti ke [dompet]" -> Cari ID dompet yang cocok di daftar dan update 'walletId'.
   - Jika user mengoreksi kategori -> Update 'category'.

2. **BAHASA KOREKTIF:**
   - User mungkin menggunakan kata: "eh", "maksudnya", "tadi", "bukan", "ganti". Pahami bahwa ini adalah instruksi perubahan terhadap state saat ini.

3. **NOMINAL:**
   - Konversi 'rb' ke ribu, 'jt' ke juta.

4. **EXPLANATION (MICRO-COPY):**
   - Berikan penjelasan sangat singkat (max 5 kata) tentang apa yang Anda ubah untuk ditampilkan di UI. Contoh: "Harga diubah ke 50rb", "Kategori jadi Jajan".

### OUTPUT FORMAT (JSON):
Kembalikan HANYA objek JSON yang berisi field yang berubah. Jangan sertakan field yang tidak berubah.
{
  "amount": number,
  "description": "string",
  "category": "string",
  "subCategory": "string",
  "walletId": "string (UUID)",
  "location": "string",
  "confidence": number (0-1),
  "explanation": "string"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Input: "${userInput}"` }
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(responseText);
    
    return PatchOutputSchema.parse(parsed);
  } catch (error) {
    console.error("[LiquidPatch] Error:", error);
    return { confidence: 0 };
  }
}
