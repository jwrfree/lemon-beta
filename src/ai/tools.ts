import { tool } from 'ai';
import { z } from 'zod';
import { financialContextService } from '@/lib/services/financial-context-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UnifiedFinancialContext } from '@/lib/services/financial-context-service';

type FinancialToolClient = Pick<SupabaseClient, 'from' | 'rpc'>;

export const createFinancialTools = (userId: string, supabase: FinancialToolClient) => {
  let contextPromise: Promise<UnifiedFinancialContext | null> | null = null;

  const getContext = () => {
    if (!contextPromise) {
      contextPromise = financialContextService.getUnifiedContext(userId, supabase);
    }

    return contextPromise;
  };

  return {
    get_balance: tool({
      description: 'Mendapat informasi saldo kas, nilai aset, dan total net worth user.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        return context?.wealth || { cash: 0, assets: 0, liabilities: 0, net_worth: 0 };
      },
    }),

    get_budgets: tool({
      description: 'Melihat daftar anggaran (budget), berapa yang sudah terpakai, dan sisa limit.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        return context?.budgets || [];
      },
    }),

    get_top_expenses: tool({
      description: 'Melihat kategori pengeluaran terbesar bulan ini.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        return {
          top_categories: context?.top_categories || [],
          largest_expense: context?.largest_expense || null
        };
      },
    }),

    get_goals: tool({
      description: 'Melihat progres tabungan dan target finansial user.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        return context?.goals || [];
      },
    }),

    get_financial_risk: tool({
      description: 'Mendapat analisis risiko, pola pengeluaran bulanan (termasuk bulan lalu), dan hari paling boros.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        return {
          risk: context?.risk || null,
          monthly: context?.monthly || null,
          previous_month: context?.previous_month || null,
          spending_pattern: context?.spending_pattern || null
        };
      },
    }),

    find_transactions: tool({
      description: 'Mencari transaksi spesifik berdasarkan keyword merchant, deskripsi, sub-kategori, atau kategori. Gunakan ini untuk pertanyaan seperti "kapan terakhir beli kopi?" atau "ada transaksi Netflix?".',
      inputSchema: z.object({
        query: z.string().min(2),
        limit: z.number().int().min(1).max(5).optional(),
      }),
      execute: async ({ query, limit }) => {
        return financialContextService.findTransactionsByQuery(userId, query, supabase, limit ?? 3);
      },
    }),

    get_recent_transactions: tool({
      description: 'Mengambil daftar mutasi atau transaksi terbaru user. Gunakan ini untuk pertanyaan seperti "apa mutasi terbaru saya?" atau "riwayat transaksi terakhir".',
      inputSchema: z.object({
        limit: z.number().int().min(1).max(5).optional(),
      }),
      execute: async ({ limit }) => {
        return financialContextService.getRecentTransactions(userId, supabase, limit ?? 3);
      },
    }),
  };
};
