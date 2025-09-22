import {googleAI} from '@genkit-ai/googleai';
import {genkit} from 'genkit';

const createGoogleAiClient = (model: string) =>
  genkit({
    plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
    model,
  });

export const aiVision = createGoogleAiClient('googleai/gemini-2.5-flash');
export const aiText = createGoogleAiClient('googleai/gemini-1.5-flash-8b');
