'use server';
/**
 * @fileOverview A smart flow for extracting transaction details from natural language.
 *
 * - extractTransaction - A function that handles the transaction extraction process.
 * - TransactionExtractionInput - The input type for the extractTransaction function.
 * - TransactionExtractionOutput - The return type for the extractTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { categories } from '@/lib/categories';

const TransactionExtractionInputSchema = z.object({
  text: z.string().describe('The user\'s raw text input about a transaction.'),
  availableCategories: z.array(z.string()).describe('List of available transaction categories for the user.'),
  availableWallets: z.array(z.string()).describe('List of available wallets for the user.'),
});
export type TransactionExtractionInput = z.infer<typeof TransactionExtractionInputSchema>;

const TransactionExtractionOutputSchema = z.object({
  amount: z.number().describe('The transaction amount.'),
  description: z.string().describe('A concise description of the transaction.'),
  category: z.string().describe('The most likely category for this transaction.'),
  wallet: z.string().describe('The wallet used for the transaction, if mentioned.'),
  location: z.string().optional().describe('The store or location where the transaction occurred, if mentioned.'),
});
export type TransactionExtractionOutput = z.infer<typeof TransactionExtractionOutputSchema>;

export async function extractTransaction(input: TransactionExtractionInput): Promise<TransactionExtractionOutput> {
  return extractTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionPrompt',
  input: {schema: TransactionExtractionInputSchema},
  output: {schema: TransactionExtractionOutputSchema},
  prompt: `You are an expert financial assistant. Your task is to extract transaction details from the user's text input.
The current date is ${new Date().toDateString()}.

User input: "{{{text}}}"

Analyze the text and fill in the following fields. The 'amount' and 'description' fields are mandatory.
- amount: The monetary value of the transaction.
- description: A clear and concise summary of what the transaction was for.
- category: From the available categories, choose the one that best fits the transaction. If the user is moving money between their wallets (e.g., "pindah dana", "transfer dari A ke B"), the category MUST be "Transfer".
- wallet: Identify the source wallet for the transaction (e.g., "pake Mandiri", "dari BCA"). If it is a transfer, this is the 'from' wallet.
- location: If a store, place, or merchant is mentioned, extract it.

Available Categories: {{{json availableCategories}}}
Available Wallets: {{{json availableWallets}}}

If the user mentions a specific item, use that as the primary description. For example, if the user says "beli bensin pertamax 150rb", the description should be "Beli bensin Pertamax".
Do not make up information. If a detail (like wallet or location) is not mentioned, leave it empty.
Provide your response in the requested JSON format.`,
});

const extractTransactionFlow = ai.defineFlow(
  {
    name: 'extractTransactionFlow',
    inputSchema: TransactionExtractionInputSchema,
    outputSchema: TransactionExtractionOutputSchema,
  },
  async input => {
    // Add "Transfer" to available categories for the AI to consider
    const allCategories = [...input.availableCategories, "Transfer"];

    const {output} = await prompt({...input, availableCategories: allCategories});
    return output!;
  }
);
