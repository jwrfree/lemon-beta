import { tool } from 'ai';
import { z } from 'zod';
import { financialContextService } from '@/lib/services/financial-context-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UnifiedFinancialContext } from '@/lib/services/financial-context-service';
import {
  deleteTransactionWithClient,
  getTransactionRowById,
  mapTransactionRowToUnifiedValues,
  updateTransactionWithClient,
} from '@/features/transactions/services/transaction.service';
import { getCurrentDate } from '@/lib/utils/current-date';

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

        const now = getCurrentDate();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

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

    update_transaction: tool({
      description: 'Mengubah detail transaksi yang sudah ada (misal: ganti nominal, kategori, atau deskripsi). Gunakan find_transactions dulu untuk mendapatkan ID transaksi.',
      inputSchema: z.object({
        transaction_id: z.string().uuid(),
        updates: z.object({
          amount: z.number().optional(),
          category: z.string().optional(),
          description: z.string().optional(),
          date: z.string().optional(),
        }),
      }),
      execute: async ({ transaction_id, updates }) => {
        const existingTransaction = await getTransactionRowById(
          supabase,
          userId,
          transaction_id,
        );

        if (!existingTransaction.data) {
          return {
            success: false,
            error: existingTransaction.error || 'Transaksi tidak ditemukan.',
          };
        }

        const nextValues = mapTransactionRowToUnifiedValues(existingTransaction.data);

        if (typeof updates.amount === 'number') nextValues.amount = updates.amount;
        if (typeof updates.category === 'string') nextValues.category = updates.category;
        if (typeof updates.description === 'string') nextValues.description = updates.description;
        if (typeof updates.date === 'string') {
          const parsedDate = new Date(updates.date);
          if (Number.isNaN(parsedDate.getTime())) {
            return { success: false, error: 'Tanggal transaksi tidak valid.' };
          }
          nextValues.date = parsedDate;
        }

        const result = await updateTransactionWithClient(
          supabase,
          userId,
          transaction_id,
          nextValues,
        );

        if (result.error) return { success: false, error: result.error };
        return { success: true };
      },
    }),

    delete_transaction: tool({
      description: 'Menghapus transaksi tertentu. HANYA gunakan jika user secara eksplisit meminta menghapus transaksi spesifik. Gunakan find_transactions dulu untuk mendapatkan ID.',
      inputSchema: z.object({
        transaction_id: z.string().uuid(),
      }),
      execute: async ({ transaction_id }) => {
        const result = await deleteTransactionWithClient(
          supabase,
          userId,
          transaction_id,
        );

        if (result.error) return { success: false, error: result.error };
        return { success: true };
      },
    }),

    analyze_subscriptions: tool({
      description: 'Menganalisis pengeluaran untuk mendeteksi langganan (Netflix, Spotify, internet, dll) atau pengeluaran berulang.',
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'expense')
          .order('date', { ascending: false })
          .limit(100);

        if (error || !data) return { error: 'Gagal mengambil data transaksi.' };

        // Simple frequency detection for chat purposes
        const groups: Record<string, any[]> = {};
        data.forEach(tx => {
          const key = (tx.merchant || tx.description || 'unknown').toLowerCase();
          if (!groups[key]) groups[key] = [];
          groups[key].push(tx);
        });

        const subscriptions = Object.entries(groups)
          .filter(([_, txs]) => {
            if (txs.length < 2) return false;
            
            // Sort ascending by date to calculate intervals
            const sortedTxs = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            // Check amount consistency (max 30% variance from minimum)
            const amounts = sortedTxs.map(t => t.amount);
            const maxAmt = Math.max(...amounts);
            const minAmt = Math.min(...amounts);
            if (minAmt > 0 && maxAmt > minAmt * 1.3) return false;

            // Check time interval consistency
            const intervalsDays = [];
            for (let i = 1; i < sortedTxs.length; i++) {
              const diffMs = new Date(sortedTxs[i].date).getTime() - new Date(sortedTxs[i-1].date).getTime();
              intervalsDays.push(diffMs / (1000 * 60 * 60 * 24));
            }
            
            const avgInterval = intervalsDays.reduce((a, b) => a + b, 0) / intervalsDays.length;
            
            // Allow weekly (~7), monthly (~30), or yearly (~365) with some margin
            const isWeekly = avgInterval >= 5 && avgInterval <= 9;
            const isMonthly = avgInterval >= 25 && avgInterval <= 35;
            const isYearly = avgInterval >= 350 && avgInterval <= 380;
            
            return isWeekly || isMonthly || isYearly;
          })
          .map(([name, txs]) => ({
            name,
            count: txs.length,
            average_amount: txs.reduce((s, t) => s + t.amount, 0) / txs.length,
            last_date: txs[0].date // The original txs array was already sorted descending
          }))
          .sort((a, b) => b.average_amount - a.average_amount);

        return { subscriptions };
      },
    }),

    get_financial_health: tool({
      description: 'Melakukan "Health Check" atau audit kesehatan finansial user secara menyeluruh.',
      inputSchema: z.object({}),
      execute: async () => {
        const context = await getContext();
        if (!context) return { error: 'Gagal mendapatkan konteks finansial.' };

        const { wealth, monthly, risk } = context;
        const income = Math.max(monthly.income, 1);
        const expense = monthly.expense;
        const savingsRate = ((income - expense) / income) * 100;
        const survivalDays = risk.survival_days;
        const debtRatio = (wealth.liabilities / Math.max(wealth.assets + wealth.cash, 1)) * 100;

        let score = 70; // Base score
        const recs: string[] = [];

        // Evaluate Savings Rate
        if (savingsRate > 20) { score += 10; }
        else if (savingsRate < 5) { score -= 15; recs.push('Tabungan kamu di bawah 5%, coba tekan pengeluaran non-esensial.'); }

        // Evaluate Emergency Fund (Survival Days)
        if (survivalDays > 90) { score += 10; }
        else if (survivalDays < 30) { score -= 20; recs.push('Dana cadangan kamu cukup kritis (kurang dari 30 hari).'); }

        // Evaluate Debt
        if (debtRatio < 10) { score += 5; }
        else if (debtRatio > 40) { score -= 15; recs.push('Rasio hutang terhadap aset cukup tinggi, prioritaskan pelunasan.'); }

        if (recs.length === 0) recs.push('Kondisi kamu sangat baik! Pertahankan pola ini dan mulai investasi lebih agresif.');

        return {
          score: Math.min(Math.max(score, 0), 100),
          labels: {
            savings_rate: savingsRate > 0 ? `${Math.round(savingsRate)}%` : '0%',
            emergency_fund: survivalDays > 365 ? '>1 Tahun' : `${survivalDays} Hari`,
            debt_ratio: `${Math.round(debtRatio)}%`
          },
          recommendations: recs.slice(0, 3)
        };
      },
    }),
  };
};
