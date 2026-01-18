'use server';

// DeepSeek doesn't expose a public token counting endpoint in the OpenAI SDK.
// We'll use a standard estimation of 1 token ~= 4 characters.
// For the output (JSON extraction), it's usually around 60-100 tokens.
// System prompt overhead is roughly 200 tokens.
export async function countTransactionTokens(text: string): Promise<{ input: number; output: number }> {
  const systemPromptOverhead = 200;
  const estimatedInputTokens = Math.ceil(text.length / 4) + systemPromptOverhead;
  // Estimate output tokens for the JSON response (amount, description, category, etc.)
  const estimatedOutputTokens = 60; 
  return { input: estimatedInputTokens, output: estimatedOutputTokens };
}
