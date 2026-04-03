'use server';

import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { z } from "zod";
import { config } from "@/lib/config";

import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
  INDONESIAN_FORMAT_RULES 
} from "@/ai/prompts";

const deepseek = createDeepSeek({
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
${LEMON_COACH_IDENTITY}

${TONE_AND_LANGUAGE}

Tugas Anda: Menerima 'userInput' dan 'currentState' transaksi, lalu mengembalikan HANYA field yang perlu diperbarui.

### DATA SAAT INI (STATE):
${JSON.stringify(currentState, null, 2)}

### KONTEKS SISTEM:
- **Dompet (PENTING: Gunakan ID)**: ${walletList}
- **Kategori**: ${categoryList}

${INDONESIAN_FORMAT_RULES}

### ATURAN PATCHING:
1. **IDENTIFIKASI INTENT:** 
   - Jika user berkata "harganya...", "jadi...", atau angka saja -> Update 'amount'.
   - Jika user menyebut tempat/lokasi -> Update 'location'.
   - Jika user menyebut "pake [dompet]", "ganti ke [dompet]" -> Cari ID dompet yang cocok di daftar dan update 'walletId'.
   - Jika user mengoreksi kategori -> Update 'category'.

2. **BAHASA KOREKTIF:**
   - User mungkin menggunakan kata: "eh", "maksudnya", "tadi", "bukan", "ganti". Pahami bahwa ini adalah instruksi perubahan terhadap state saat ini.

3. **EXPLANATION (MICRO-COPY):**
   - Berikan penjelasan sangat singkat (max 5-7 kata) yang ramah dan mengonfirmasi perubahan. 
   - Gunakan gaya bahasa "Lemon Coach" yang membantu. 

### OUTPUT FORMAT (JSON):
Kembalikan HANYA objek JSON yang berisi field yang berubah. Jangan sertakan field yang tidak berubah.`;

  try {
    const { object } = await generateObject({
      model: deepseek("deepseek-chat"),
      schema: PatchOutputSchema,
      system: systemPrompt,
      prompt: `User Input: "${userInput}"`,
      temperature: 0,
    });
    
    return object;
  } catch (error) {
    console.error("[LiquidPatch] Error:", error);
    return { confidence: 0 };
  }
}
