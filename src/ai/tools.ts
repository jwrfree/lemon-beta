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
      description: 'Melihat daftar anggaran (budget), berapa yang sudah terpakai, sisa limit, dan estimasi kapan budget akan habis berdasarkan kecepatan belanja.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        if (!context) return [];

        const dayOfMonth = new Date().getDate();
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

        return context.budgets.map(b => {
          const dailySpend = b.spent / Math.max(dayOfMonth, 1);
          const remaining = b.limit - b.spent;
          const projectedDaysLeft = dailySpend > 0 ? Math.floor(remaining / dailySpend) : 999;
          const status = b.percent > 100 ? 'overbudget' : b.percent > 80 ? 'critical' : 'safe';

          return {
            ...b,
            status,
            projected_days_until_limit: projectedDaysLeft,
            is_trending_over: (dayOfMonth + projectedDaysLeft) < daysInMonth
          };
        });
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

    simulate_financial_scenario: tool({
      description: 'Melakukan simulasi atau proyeksi masa depan berdasarkan data saat ini. Gunakan untuk pertanyaan "kapan target X tercapai?", "berapa saldo saya akhir tahun?", atau simulasi kenaikan pengeluaran/tabungan.',
      inputSchema: z.object({
        scenario_type: z.enum(['goal_achievement', 'balance_projection', 'savings_impact']),
        monthly_adjustment: z.number().describe('Nilai tambahan tabungan atau pengeluaran per bulan (positif untuk nabung, negatif untuk pengeluaran).'),
        target_goal_name: z.string().optional().describe('Nama goal spesifik jika ingin simulasi target tertentu.'),
        projection_months: z.number().int().min(1).max(60).default(12).describe('Berapa bulan ke depan proyeksi dilakukan.'),
      }),
      execute: async ({ scenario_type, monthly_adjustment, target_goal_name, projection_months }) => {
        const context = await getContext();
        if (!context) return { error: 'Gagal mendapatkan konteks finansial.' };

        const currentCash = context.wealth.cash;
        const currentMonthlyNet = context.monthly.cashflow;
        const projectedMonthlyNet = currentMonthlyNet + monthly_adjustment;

        if (scenario_type === 'goal_achievement' && target_goal_name) {
          const goal = context.goals.find(g => g.name.toLowerCase().includes(target_goal_name.toLowerCase()));
          if (!goal) return { error: `Goal "${target_goal_name}" tidak ditemukan.` };

          const remaining = goal.target - goal.current;
          const monthsToReach = projectedMonthlyNet > 0 ? Math.ceil(remaining / projectedMonthlyNet) : Infinity;

          return {
            scenario_type,
            goal_name: goal.name,
            remaining_amount: remaining,
            current_monthly_net: currentMonthlyNet,
            projected_monthly_net: projectedMonthlyNet,
            months_to_reach: monthsToReach === Infinity ? null : monthsToReach,
            is_possible: projectedMonthlyNet > 0
          };
        }

        const projectedBalance = currentCash + (projectedMonthlyNet * projection_months);

        return {
          scenario_type,
          current_balance: currentCash,
          projected_balance: projectedBalance,
          projection_months,
          monthly_net: projectedMonthlyNet,
          total_growth: projectedMonthlyNet * projection_months
        };
      },
    }),
  };
};
