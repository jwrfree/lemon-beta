
'use server';
/**
 * @fileOverview A utility flow for counting tokens for the transaction extraction process.
 *
 * - countTransactionTokens - A function that calculates input and output tokens.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { extractTransaction, TransactionExtractionInput } from './extract-transaction-flow';

const prompt = ai.lookupPrompt('extractTransactionPrompt');

export const countTransactionTokens = ai.defineFlow(
  {
    name: 'countTransactionTokens',
    inputSchema: z.string(),
    outputSchema: z.object({
      input: z.number(),
      output: z.number(),
    }),
  },
  async (text) => {
    // 1. Calculate input tokens
    const inputData: TransactionExtractionInput = { text, availableWallets: [] }; // availableWallets is empty as per our optimization
    const { totalTokens: inputTokens } = await prompt.countTokens({
      input: inputData,
    });

    // 2. Get the actual output from the model
    const extractedData = await extractTransaction(inputData);

    // 3. Convert output to a string and count its tokens
    // This is an estimation, as the exact output tokenization depends on the model's internal representation,
    // but counting tokens of the stringified JSON is a very close approximation.
    const outputString = JSON.stringify(extractedData);
    const { totalTokens: outputTokens } = await ai.countTokens(outputString);

    return {
      input: inputTokens,
      output: outputTokens,
    };
  }
);
