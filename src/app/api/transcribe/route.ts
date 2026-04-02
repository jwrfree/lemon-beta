import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@/lib/config';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey as string);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('audio') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Audio file not provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type || 'audio/webm';

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });

        const prompt = `Anda adalah "Lemon Voice", asisten transkripsi khusus untuk aplikasi manajemen keuangan (Lemon App).
Tugas Anda adalah menstranskripsikan rekaman audio bahasa Indonesia ini menjadi teks dengan akurasi tinggi.

PERHATIKAN KONTEKS FINANSIAL BERIKUT:
Audio ini berisi pengguna yang sedang mencatat pengeluaran, mengecek saldo, atau bertanya tentang keuangan.
Harap waspada terhadap kata-kata gaul, slang, dan istilah finansial Indonesia seperti:
- "boncos", "bujet", "bajet", "gaji", "nabung", "paylater"
- E-Wallet/Bank: "GoPay", "OVO", "ShopeePay", "BCA", "Mandiri", "SeaBank", "QRIS"
- Nominal: "rb", "ribu", "jt", "juta", "cepek", "gocap"

ATURAN:
1. Perbaiki salah sebut yang jelas-jelas bermaksud kata finansial (contoh: "buncis" -> "boncos").
2. Ubah angka yang diucapkan menjadi format yang mudah dipahami (contoh: "dua puluh lima ribu" -> "25rb" atau "25 ribu").
3. Berikan HANYA teks transkripsinya saja tanpa embel-embel, perkenalan, tanda kutip, atau markdown. Abaikan suara noise atau jeda.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: base64Audio
                }
            }
        ]);

        const text = result.response.text().trim();

        return NextResponse.json({ text });
    } catch (error) {
        console.error('Transcription API Error:', error);
        return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
    }
}
