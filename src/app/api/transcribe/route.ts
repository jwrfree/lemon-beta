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

        const prompt = `Anda adalah "Lemon Voice", asisten transkripsi. 
Tolong transkripsikan rekaman audio bahasa Indonesia ini menjadi teks dengan sangat akurat. 
Abaikan suara noise atau jeda. Berikan HANYA teks transkripsinya saja tanpa embel-embel kalimat lain.`;

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
