"use server";

import {
  summarizeTransactions,
  SummarizeTransactionsInput,
  SummarizeTransactionsOutput,
} from "@/ai/flows/summarize-transactions";
import { transactions as allTransactions } from "@/lib/data";

const timePeriodToDays: Record<string, number> = {
    "last-7-days": 7,
    "last-30-days": 30,
    "last-quarter": 90,
}

export async function generateSummaryAction(input: {
  category: string;
  timePeriod: string;
}): Promise<SummarizeTransactionsOutput> {
  const days = timePeriodToDays[input.timePeriod] || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filteredTransactions = allTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return t.category === input.category && transactionDate >= cutoffDate;
  });

  if (filteredTransactions.length === 0) {
    return {
      summary: `No transactions found for the category "${input.category}" in the selected time period.`,
    };
  }

  const transactionsString = filteredTransactions
    .map(
      (t) =>
        `- ${t.date}: ${t.description} (${t.type}) - ${t.amount.toFixed(2)}`
    )
    .join("\n");
  
  const flowInput: SummarizeTransactionsInput = {
    category: input.category,
    timePeriod: input.timePeriod.replace(/-/g, ' '),
    transactions: transactionsString
  };

  try {
    const result = await summarizeTransactions(flowInput);
    return result;
  } catch(e) {
    console.error(e);
    return {
        summary: "Sorry, I was unable to generate a summary for your transactions."
    }
  }
}
