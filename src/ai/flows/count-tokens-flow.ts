import { encode } from 'gpt-tokenizer/encoding/cl100k_base';

/**
 * DeepSeek-V3 uses a vocabulary similar to GPT-4 (cl100k_base).
 * The system prompt overhead is roughly 400 tokens based on our current Lemon Coach persona.
 * Output for simple transaction extraction is usually 60-100 tokens.
 */
export async function countTransactionTokens(text: string): Promise<{ input: number; output: number }> {
    const systemPromptOverhead = 400; 
    const tokens = encode(text || '');
    const estimatedInputTokens = tokens.length + systemPromptOverhead;
    
    // Estimate output tokens for the JSON response (amount, description, category, etc.)
    const estimatedOutputTokens = 85; 
    
    return { input: estimatedInputTokens, output: estimatedOutputTokens };
}
