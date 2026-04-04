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
   * Analyzes a structured set of prompt parts and returns a breakdown of token usage.
   */
  analyzePromptStructure(parts: Record<string, any>): Record<string, number> {
    const breakdown: Record<string, number> = {};
    let total = 0;

    for (const [key, value] of Object.entries(parts)) {
      const content = typeof value === 'string' ? value : JSON.stringify(value);
      const count = this.countTokens(content);
      breakdown[key] = count;
      total += count;
    }

    breakdown.total = total;
    return breakdown;
  },

  /**
   * Identifies high-value messages based on presence of financial keywords or intent patterns.
   */
  filterHighValueMessages(messages: any[]): any[] {
    const highValueKeywords = [
      'budget', 'saldo', 'transaksi', 'bayar', 'tagih', 'hutang', 'piutang', 
      'goal', 'tabungan', 'kategori', 'investasi', 'aset'
    ];
    
    return messages.filter(m => {
      const content = m.parts?.[0]?.text?.toLowerCase() || '';
      return highValueKeywords.some(keyword => content.includes(keyword));
    });
  },

  scoreContext(parts: any[]) {
    // Scoring logic could go here to rank contextual pieces
    return parts;
  },

  trackTransformation(step: string, before: number, after: number) {
    if (before === after) return '';
    const diff = before - after;
    return `[AI Chat] PRUNING (${step}): -${diff > 1000 ? (diff/1000).toFixed(1) + 'k' : diff} tokens\n`;
  }
};
