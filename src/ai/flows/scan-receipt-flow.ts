'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import { 
  LEMON_COACH_IDENTITY, 
  TONE_AND_LANGUAGE, 
  INDONESIAN_FORMAT_RULES 
} from "@/ai/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ReceiptSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  category: z.string(),
  merchant: z.string().optional(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ScanReceiptOutput = z.infer<typeof ReceiptSchema>;

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0, // Accuracy over creativity
    responseMimeType: "application/json",
  }
});

export type ScanReceiptInput = {
  photoDataUri: string;
  availableCategories: string[];
};

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  const base64Data = input.photoDataUri.split(",")[1];
  const mimeType = input.photoDataUri.substring(input.photoDataUri.indexOf(":") + 1, input.photoDataUri.indexOf(";"));

  const systemPrompt = `## LEMON VISION: RECEIPT ANALYST ##
${LEMON_COACH_IDENTITY}

${TONE_AND_LANGUAGE}

Ekstrak data dari gambar struk ke dalam format JSON yang valid.
Tanggal hari ini: ${new Date().toISOString().slice(0, 10)}.

${INDONESIAN_FORMAT_RULES}

### ATURAN EKSTRAKSI:
1. **Amount**: Harus nilai FINAL total (setelah diskon/pajak).
2. **Date**: Harus format YYYY-MM-DD. Cari tanggal transaksi pada struk.
3. **Category**: WAJIB pilih salah satu dari: ${JSON.stringify(input.availableCategories)}.
4. **Description**: Gunakan format "Belanja di [Nama Merchant]".
5. **Need vs Want (Internal Logic)**: 
   - Jika struk belanja supermarket (beras, telur, sabun) -> Masukkan ke kategori 'Konsumsi' (Need).
   - Jika struk kafe/kopi/hiburan -> Tandai sebagai 'Want' secara implisit melalui kategori.

### OUTPUT JSON:
{
  "amount": number,
  "description": "string",
  "category": "string",
  "merchant": "string",
  "transactionDate": "YYYY-MM-DD"
}`;

  try {
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);
    
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    
    // Validate with Zod
    return ReceiptSchema.parse(parsed);
  } catch (error) {
    console.error("Gemini Vision API Error:", error);
    if (error instanceof z.ZodError) {
        throw new Error("AI gagal membaca detail struk dengan benar.");
    }
    throw new Error("Gagal memproses struk dengan AI.");
  }
}
