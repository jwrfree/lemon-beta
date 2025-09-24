
'use server';
/**
 * @fileOverview A utility flow for counting tokens for the transaction extraction process.
 *
 * - countTransactionTokens - A function that calculates input and output tokens.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { extractTransaction, TransactionExtractionInput, extractTransactionPrompt } from './extract-transaction-flow';


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
    const inputData: TransactionExtractionInput = { text };
    const { totalTokens: inputTokens } = await ai.countTokens({
      prompt: extractTransactionPrompt,
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
