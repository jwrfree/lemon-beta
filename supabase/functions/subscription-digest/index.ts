/* global Deno */
/// <reference lib="deno.ns" />

// supabase/functions/subscription-digest/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { startOfMonth, subMonths, endOfMonth, parseISO, compareDesc } from "https://esm.sh/date-fns@2.30.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Transaction {
  description: string;
  amount: number;
  category: string;
  date: string;
  tags?: string[];
}

interface SubscriptionAnomaly {
  merchantName: string;
  previousAmount: number;
  currentAmount: number;
  difference: number;
}

// --- Logika Analisis (Diadaptasi dari subscription-analysis.ts) ---
const analyzeSubscriptions = (transactions: Transaction[]) => {
  // 1. Filter kategori langganan
  const subTx = transactions.filter(t => 
      ['Subscriptions', 'Langganan', 'Tagihan', 'Bills'].includes(t.category) ||
      t.tags?.includes('subscription')
  );

  const merchantGroups: Record<string, Transaction[]> = {};
  
  // 2. Group by Merchant
  subTx.forEach(tx => {
      const name = tx.description.toLowerCase().trim();
      if (!merchantGroups[name]) merchantGroups[name] = [];
      merchantGroups[name].push(tx);
  });

  const anomalies: SubscriptionAnomaly[] = [];
  let totalMonthlyBurn = 0;
  let activeSubscriptions = 0;
  
  // Tanggal referensi adalah akhir bulan lalu (karena cron jalan tgl 1 bulan baru)
  const referenceDate = endOfMonth(subMonths(new Date(), 1)); 

  Object.entries(merchantGroups).forEach(([_name, txs]) => {
      // Sort by date desc
      txs.sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
      
      const latest = txs[0];
      const latestDate = parseISO(latest.date);

      // Cek apakah aktif di bulan yang dianalisis (bulan lalu)
      // Buffer 40 hari dari tanggal referensi
      const isActive = latestDate >= subMonths(referenceDate, 1.3); 
      
      if (isActive) {
          totalMonthlyBurn += latest.amount;
          activeSubscriptions++;

          // Cek Silent Inflation
          if (txs.length >= 2) {
              const previous = txs[1];
              const diff = latest.amount - previous.amount;
              if (diff > 0) {
                  anomalies.push({
                      merchantName: latest.description,
                      previousAmount: previous.amount,
                      currentAmount: latest.amount,
                      difference: diff
                  });
              }
          }
      }
  });

  return { totalMonthlyBurn, activeSubscriptions, anomalies };
};

interface SubscriptionSummary {
  totalMonthlyBurn: number;
  activeSubscriptions: number;
  anomalies: SubscriptionAnomaly[];
}

// --- Format Email HTML ---
const generateEmailHtml = (userName: string, summary: SubscriptionSummary) => {
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  
  let anomaliesHtml = '';
  if (summary.anomalies.length > 0) {
    anomaliesHtml = `
      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #be123c; margin-top: 0;">⚠️ Deteksi Kenaikan Harga</h3>
        <ul style="padding-left: 20px; color: #881337;">
          ${summary.anomalies.map((a: SubscriptionAnomaly) => `
            <li>
              <strong>${a.merchantName}</strong> naik 
              <span style="color: #e11d48; font-weight: bold;">${formatter.format(a.difference)}</span> 
              (Sekarang: ${formatter.format(a.currentAmount)})
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #0D9488;">Rekap Langganan Bulan Ini</h1>
      <p>Halo ${userName}, ini laporan pengeluaran langgananmu bulan lalu.</p>
      
      <div style="background-color: #f0fdfa; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; color: #0f766e; font-size: 14px;">Total Tagihan Bulanan</p>
        <h2 style="margin: 5px 0; color: #0D9488; font-size: 32px;">${formatter.format(summary.totalMonthlyBurn)}</h2>
        <p style="margin: 0; color: #0f766e; font-size: 14px;">dari ${summary.activeSubscriptions} layanan aktif</p>
      </div>

      ${anomaliesHtml}

      <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
        Dibuat otomatis oleh Lemon Finance 🍋
      </p>
    </div>
  `;
};

// --- Main Handler ---
serve(async (_req: Request) => {
  try {
    // 1. Ambil semua user (gunakan pagination jika user banyak)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    // 2. Tentukan rentang waktu (2 bulan terakhir untuk perbandingan)
    const now = new Date();
    const twoMonthsAgo = startOfMonth(subMonths(now, 2)).toISOString();
    const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

    const emailResults = [];

    for (const user of users) {
      if (!user.email) continue;

      // 3. Ambil transaksi user
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('description, amount, category, date, tags')
        .eq('user_id', user.id)
        .gte('date', twoMonthsAgo)
        .lte('date', lastMonthEnd);

      if (txError) {
        console.error(`Error fetching transactions for ${user.email}:`, txError);
        continue;
      }

      if (!transactions || transactions.length === 0) continue;

      // 4. Analisis
      const summary = analyzeSubscriptions(transactions);

      // 5. Kirim Email jika ada langganan aktif
      if (summary.activeSubscriptions > 0 && RESEND_API_KEY) {
        const emailHtml = generateEmailHtml(user.user_metadata?.full_name || 'User Lemon', summary);
        
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Lemon Finance <noreply@lemon.finance>", // Ganti dengan domain terverifikasi Anda
            to: [user.email],
            subject: "🍋 Rekap Langganan Bulan Ini",
            html: emailHtml,
          }),
        });

        const resData = await res.json();
        emailResults.push({ email: user.email, status: res.ok ? 'sent' : 'failed', data: resData });
      }
    }

    return new Response(JSON.stringify({ message: "Job completed", results: emailResults }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
