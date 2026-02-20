import { SpendingRisk } from '@/types/models';

/**
 * GENERATIVE INSIGHTS (The "Meaning" Layer)
 * 
 * This is where we define Lemon's personality. 
 * Tone: Socratic, Contextual, Calm, and Empowering.
 */
export function generateSpendingInsight(risk: SpendingRisk): string {
    const { level, velocity, survivalDays } = risk;

    // 1. Critical Level (Survival focus)
    if (level === 'Critical') {
        if (survivalDays <= 3) {
            return `Status Kritis. Dengan pola ini, saldo diprediksi hanya cukup untuk ${survivalDays} hari ke depan. Pertimbangkan untuk membatasi semua pengeluaran non-prioritas segera.`;
        }
        return `Velocity pengeluaranmu sangat tinggi. Jika kecepatan ini berlanjut, dana cadangan akan habis dalam ${survivalDays} hari.`;
    }

    // 2. Moderate Level (Velocity focus)
    if (level === 'Moderate') {
        const velocityIncrease = Math.round((velocity - 1) * 100);
        if (velocityIncrease > 0) {
            return `Pengeluaranmu ${velocityIncrease}% lebih cepat dari biasanya. Momentum belanja sedang naik, waspadai pembelian impulsif agar sisa bulan tetap aman.`;
        }
        return `Ada sedikit peningkatan aktivitas belanja. Tetap pantau pengeluaran harianmu untuk menjaga stabilitas.`;
    }

    // 3. Low Level (Stability focus)
    if (survivalDays > 30) {
        return `Kesehatan keuangan sangat stabil. Pola belanjamu memungkinkan keamanan saldo hingga bulan depan. Pertahankan disiplin ini!`;
    }

    return `Momentum keuanganmu dalam kondisi stabil. Pola pengeluaran saat ini selaras dengan ketersediaan dana cadangan.`;
}
