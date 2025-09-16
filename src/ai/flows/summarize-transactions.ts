'use server';

/**
 * @fileOverview Summarizes transactions for a given category and time period using GenAI.
 *
 * - summarizeTransactions - A function that generates a summary of transactions.
 * - SummarizeTransactionsInput - The input type for the summarizeTransactions function.
 * - SummarizeTransactionsOutput - The return type for the summarizeTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTransactionsInputSchema = z.object({
  category: z.string().describe('The category of transactions to summarize.'),
  timePeriod: z.string().describe('The time period for the summary (e.g., last month, last quarter).'),
  transactions: z.string().describe('The list of transactions to summarize'),
});
export type SummarizeTransactionsInput = z.infer<
  typeof SummarizeTransactionsInputSchema
>;

const SummarizeTransactionsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the transactions.'),
});
export type SummarizeTransactionsOutput = z.infer<
  typeof SummarizeTransactionsOutputSchema
>;

export async function summarizeTransactions(
  input: SummarizeTransactionsInput
): Promise<SummarizeTransactionsOutput> {
  return summarizeTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTransactionsPrompt',
  input: {schema: SummarizeTransactionsInputSchema},
  output: {schema: SummarizeTransactionsOutputSchema},
  prompt: `You are a financial expert who can provide concise summaries of transactions for journaling and reflection.

  Summarize the following transactions for the category '{{category}}' during the time period '{{timePeriod}}'.  The transactions are listed below:

  {{transactions}}

  Provide a brief summary suitable for journaling or reflection.
  `,
});

const summarizeTransactionsFlow = ai.defineFlow(
  {
    name: 'summarizeTransactionsFlow',
    inputSchema: SummarizeTransactionsInputSchema,
    outputSchema: SummarizeTransactionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
