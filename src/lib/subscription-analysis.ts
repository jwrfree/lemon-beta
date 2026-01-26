import { parseISO, subMonths, isSameMonth, compareDesc } from 'date-fns';
import type { Transaction } from '@/types/models';

export interface SubscriptionAnomaly {
    merchantName: string;
    previousAmount: number;
    currentAmount: number;
    difference: number;
    type: 'inflation' | 'deflation' | 'new';
    lastDate: string;
}

export interface SubscriptionSummary {
    totalMonthlyBurn: number;
    activeSubscriptions: number;
    anomalies: SubscriptionAnomaly[];
}

/**
 * Menganalisis transaksi untuk menemukan pola langganan dan anomali harga.
 * Fokus pada kategori 'Subscriptions', 'Langganan', atau transaksi berulang.
 */
export const analyzeSubscriptions = (transactions: Transaction[]): SubscriptionSummary => {
    // 1. Filter transaksi kategori langganan (bisa disesuaikan dengan ID kategori riil)
    const subTx = transactions.filter(t => 
        ['Subscriptions', 'Langganan', 'Tagihan', 'Bills'].includes(t.category) ||
        t.tags?.includes('subscription')
    );

    // 2. Group by Merchant (Simple normalization)
    const merchantGroups: Record<string, Transaction[]> = {};
    
    subTx.forEach(tx => {
        // Normalisasi nama: "Netflix Premium" -> "netflix"
        // Mengambil kata pertama atau kedua sebagai identifier sederhana
        const name = tx.description.toLowerCase().trim();
        // Logic fuzzy match sederhana bisa ditambahkan di sini
        // Untuk sekarang kita group by exact normalized description
        if (!merchantGroups[name]) {
            merchantGroups[name] = [];
        }
        merchantGroups[name].push(tx);
    });

    const anomalies: SubscriptionAnomaly[] = [];
    let totalMonthlyBurn = 0;
    let activeSubscriptions = 0;
    const now = new Date();

    // 3. Analisis per Merchant
    Object.entries(merchantGroups).forEach(([name, txs]) => {
        // Sort by date desc
        txs.sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
        
        const latest = txs[0];
        const latestDate = parseISO(latest.date);

        // Hitung burn rate (jika transaksi terjadi dalam 30-40 hari terakhir)
        const isActive = latestDate >= subMonths(now, 1.5); // Buffer 1.5 bulan
        if (isActive) {
            totalMonthlyBurn += latest.amount;
            activeSubscriptions++;
        }

        // Cek Silent Inflation (Bandingkan dengan transaksi sebelumnya)
        if (txs.length >= 2) {
            const previous = txs[1];
            const diff = latest.amount - previous.amount;

            // Jika naik > 0 (atau threshold tertentu, misal Rp1.000)
            if (diff > 0) {
                anomalies.push({
                    merchantName: latest.description, // Pakai nama asli untuk display
                    previousAmount: previous.amount,
                    currentAmount: latest.amount,
                    difference: diff,
                    type: 'inflation',
                    lastDate: latest.date
                });
            }
        }
    });

    return {
        totalMonthlyBurn,
        activeSubscriptions,
        anomalies
    };
};