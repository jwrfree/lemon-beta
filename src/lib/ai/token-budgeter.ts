import { encode } from "gpt-tokenizer";

/**
 * Utility to manage and enforce token budgets for AI requests.
 */
export const TokenBudgeter = {
  /**
   * Estimates token count for a string.
   */
  countTokens(text: string): number {
    try {
      return encode(text).length;
    } catch (e) {
      // Fallback to rough estimation (4 chars per token) if tokenizer fails
      return Math.ceil(text.length / 4);
    }
  },

  /**
   * Truncates a string to fit within a token limit.
   */
  truncateToBudget(text: string, maxTokens: number): string {
    const tokens = encode(text);
    if (tokens.length <= maxTokens) return text;

    // This is a simple truncation. Ideally, we'd decode the sliced tokens,
    // but gpt-tokenizer's decode can be heavy. For a budgeter, 
    // a safe character-based harvest is often enough if we want to be fast.
    const ratio = maxTokens / tokens.length;
    const estimatedChars = Math.floor(text.length * ratio);
    return text.slice(0, estimatedChars) + "... [truncated]";
  },

  /**
   * Validates if a set of inputs is within a total budget.
   */
  isWithinBudget(inputs: string[], totalBudget: number): boolean {
    const total = inputs.reduce((sum, input) => sum + this.countTokens(input), 0);
    return total <= totalBudget;
  }
};
