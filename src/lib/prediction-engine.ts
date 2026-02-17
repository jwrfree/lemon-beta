import { Transaction } from '@/types/models';
import { eachDayOfInterval, format, addDays, differenceInDays, getDay, isAfter, isBefore, parseISO } from 'date-fns';

export interface DataPoint {
    date: string;
    actual?: number;        // The historical value
    forecast?: number;      // The fitted/predicted value
    lowerBound?: number;    // 95% Confidence Interval Lower
    upperBound?: number;    // 95% Confidence Interval Upper
    trend?: number;         // Underlying trend component
    seasonality?: number;   // Seasonal component (if applicable)
    anomaly?: boolean;      // detected anomaly
}

export interface ForecastConfig {
    alpha?: number; // Level smoothing (0-1)
    beta?: number;  // Trend smoothing (0-1)
    gamma?: number; // Seasonal smoothing (0-1)
    period?: number; // Seasonality period (e.g., 7 for weekly)
    confidenceLevel?: number; // 0.95 default
}

/**
 * ProphetEngine (Beta)
 * 
 * An advanced time-series forecasting engine for client-side financial data.
 * Implements:
 * 1. Double Exponential Smoothing (Holt's Linear) for trend detection.
 * 2. Triple Exponential Smoothing (Holt-Winters) for seasonality (e.g., weekly spending patterns).
 * 3. Anomaly Detection based on residual analysis.
 */
export class ProphetEngine {
    private transactions: Transaction[];
    private config: ForecastConfig;

    constructor(transactions: Transaction[], config: ForecastConfig = {}) {
        this.transactions = transactions;
        this.config = {
            alpha: 0.3,
            beta: 0.1,
            gamma: 0.2, // Seasonality smoothing
            period: 7,  // Weekly seasonality is most common in personal finance
            confidenceLevel: 1.96, // ~95%
            ...config
        };
    }

    /**
     * Aggregates transactions into daily signed amounts (Income - Expense)
     */
    private aggregateDailyData(start: Date, end: Date): Map<string, number> {
        const dailyMap = new Map<string, number>();

        // Initialize all days with 0 to ensure continuity
        const days = eachDayOfInterval({ start, end });
        days.forEach(day => {
            dailyMap.set(format(day, 'yyyy-MM-dd'), 0);
        });

        // O(N) aggregation
        // We filter transactions first to ensure they are within range, strictly speaking efficient
        // But iterating all is fine if N is < 10000.
        for (const t of this.transactions) {
            // "yyyy-MM-dd" is the first 10 chars of ISO string usually, but let's be safe
            // Assuming t.date is ISO string or YYYY-MM-DD
            const dateKey = t.date.substring(0, 10);

            if (dailyMap.has(dateKey)) {
                const current = dailyMap.get(dateKey) || 0;
                // Income is positive, Expense is negative
                const amount = t.type === 'income' ? t.amount : -t.amount;
                dailyMap.set(dateKey, current + amount);
            }
        }

        return dailyMap;
    }

    /**
     * Core Forecasting Logic
     */
    public generate(historyStart: Date, historyEnd: Date, forecastDays: number = 30): DataPoint[] {
        const dailyMap = this.aggregateDailyData(historyStart, historyEnd);
        const dates = Array.from(dailyMap.keys()).sort();
        const values = dates.map(d => dailyMap.get(d) ?? 0);

        if (values.length < 2) return [];

        // Decide Model: Holt-Winters (Seasonal) vs Holt's Linear (Trend only)
        // We need at least 2 full periods for reasonably stable seasonality
        const useSeasonality = values.length >= (this.config.period! * 2);

        if (useSeasonality) {
            return this.holtWintersAdditive(dates, values, forecastDays);
        } else {
            return this.holtLinear(dates, values, forecastDays);
        }
    }

    /**
     * Holt's Linear Trend Method (Double Exponential Smoothing)
     * Good for data with trend but no clear seasonality (or short history).
     */
    private holtLinear(dates: string[], values: number[], forecastHorizon: number): DataPoint[] {
        const { alpha, beta, confidenceLevel } = this.config;
        const n = values.length;

        let level = values[0];
        let trend = values[1] - values[0];

        const fitted: number[] = [level]; // Fitted values for history
        const residuals: number[] = [0];

        // Training
        for (let i = 1; i < n; i++) {
            const actual = values[i];
            const lastLevel = level;
            const lastTrend = trend;

            level = alpha! * actual + (1 - alpha!) * (lastLevel + lastTrend);
            trend = beta! * (level - lastLevel) + (1 - beta!) * lastTrend;

            const fit = lastLevel + lastTrend;
            fitted.push(fit);
            residuals.push(actual - fit);
        }

        // Calculate sigma for intervals
        const sigma = this.calculateSigma(residuals);

        const output: DataPoint[] = [];

        // History Output
        dates.forEach((date, i) => {
            output.push({
                date,
                actual: values[i],
                forecast: fitted[i],
                lowerBound: fitted[i] - confidenceLevel! * sigma,
                upperBound: fitted[i] + confidenceLevel! * sigma,
                trend: undefined, // Could expose if needed
                anomaly: Math.abs(values[i] - fitted[i]) > (3 * sigma) // Simple 3-sigma anomaly rule
            });
        });

        // Forecast Output
        const lastDate = parseISO(dates[n - 1]);
        for (let h = 1; h <= forecastHorizon; h++) {
            const forecast = level + h * trend;
            const futureDate = addDays(lastDate, h);

            // Uncertainty grows with time (square root of time rule for random walk, adapted)
            const uncertainty = sigma * Math.sqrt(h) * confidenceLevel!;

            output.push({
                date: format(futureDate, 'yyyy-MM-dd'),
                forecast: forecast,
                lowerBound: forecast - uncertainty,
                upperBound: forecast + uncertainty
            });
        }

        return output;
    }

    /**
     * Holt-Winters Additive Method (Triple Exponential Smoothing)
     * Handles Trend + Seasonality.
     */
    private holtWintersAdditive(dates: string[], values: number[], forecastHorizon: number): DataPoint[] {
        const { alpha, beta, gamma, period, confidenceLevel } = this.config;
        const p = period!;
        const n = values.length;

        // Initialization
        // Initial Level: Average of first season
        let level = this.mean(values.slice(0, p));
        // Initial Trend: Average slope between first and second season (roughly)
        let trend = (this.mean(values.slice(p, 2 * p)) - this.mean(values.slice(0, p))) / p;

        // Initial Seasonality Indices
        const seasonals: number[] = [];
        for (let i = 0; i < p; i++) {
            seasonals.push(values[i] - level);
        }

        const fitted: number[] = [];
        const residuals: number[] = [];
        const components: { l: number, t: number, s: number }[] = [];

        // We need to store history of components for recursive updates
        // To make it simple, we'll store them in arrays aligned with time
        // This is a bit memory heavy but clean.
        // Actually, we process iteratively.

        // Pre-fill undefineds/initials for 0..p-1? 
        // Standard HW algorithm starts updating at t=p (if we used p points for init)
        // or we can start at t=0 if we have initial priors. Since we used data for priors, let's just 'fit' from start
        // but that's bias. Let's do standard 'online' update.

        // Re-initialize for the loop
        // We will iterate from t=0. But we need S_{t-p}.
        // So we treat the 'seasonals' array as the ring buffer of past seasonalities.

        // Let's refine initialization to be more robust for short data:
        // Use the Classical Decomposition method for initialization? Too complex.
        // Simple method:
        // L_0 = Y_0
        // T_0 = Y_1 - Y_0 ? No, too noisy.
        // Let's stick to the mean method above but apply it as 'priors' before the loop.

        // Reset state to 'before data'
        // We'll trust the 'seasonals' computed from first cycle as S_{-p}...S_{-1}
        // But wait, the loop updates seasonals.

        // Let's iterate from t=0.
        // Prediction for Y_t is: L_{t-1} + T_{t-1} + S_{t-p}
        // We need L_{-1}, T_{-1}, and S_{-p}...S_{-1}

        // Let L_prev = level (from init)
        // Let T_prev = trend (from init)
        // seasonals = initial seasonal indices

        // Wait, if we init using first P points, we shouldn't predict them, we just accept them?
        // No, we can run the filter over them to refine the state.

        // Let's use the 'Backcasting' or just simple iterative approach.
        // Current State:
        let L = level;
        let T = trend;
        const S = [...seasonals]; // size P

        // Loop
        for (let i = 0; i < n; i++) {
            const actual = values[i];
            const seasonalIndex = i % p;
            const s_prev = S[seasonalIndex]; // This is essentially S_{t-p} because we overwrite it after usage

            // Forecast for this point (Training Error)
            const fit = L + T + s_prev;
            fitted.push(fit);
            residuals.push(actual - fit);

            // Update Steps
            const L_new = alpha! * (actual - s_prev) + (1 - alpha!) * (L + T);
            const T_new = beta! * (L_new - L) + (1 - beta!) * T;
            const S_new = gamma! * (actual - L_new) + (1 - gamma!) * s_prev;

            // Store new state
            L = L_new;
            T = T_new;
            S[seasonalIndex] = S_new; // Update the seasonal component for this slot
        }

        const sigma = this.calculateSigma(residuals);
        const output: DataPoint[] = [];

        // History
        dates.forEach((date, i) => {
            output.push({
                date,
                actual: values[i],
                forecast: fitted[i],
                lowerBound: fitted[i] - confidenceLevel! * sigma,
                upperBound: fitted[i] + confidenceLevel! * sigma,
                anomaly: Math.abs(values[i] - fitted[i]) > (3 * sigma)
            });
        });

        // Forecast
        const lastDate = parseISO(dates[n - 1]);
        for (let h = 1; h <= forecastHorizon; h++) {
            const seasonalIndex = (n + h - 1) % p;
            // Note: In standard HW we use the LAST available seasonal indices (from the end of training).
            // Our S array contains the standard indices updated up to the last point.
            // S[seasonalIndex] corresponds to the most recent estimate for that 'day of week'.

            const forecast = L + h * T + S[seasonalIndex];
            const futureDate = addDays(lastDate, h);

            // Uncertainty
            const uncertainty = sigma * Math.sqrt(h) * confidenceLevel!; // Simplified uncertainty

            output.push({
                date: format(futureDate, 'yyyy-MM-dd'),
                forecast: forecast,
                lowerBound: forecast - uncertainty,
                upperBound: forecast + uncertainty
            });
        }

        return output;
    }

    private calculateSigma(residuals: number[]): number {
        const sumSq = residuals.reduce((a, b) => a + b * b, 0);
        return Math.sqrt(sumSq / (residuals.length || 1));
    }

    private mean(values: number[]): number {
        return values.reduce((a, b) => a + b, 0) / (values.length || 1);
    }
}

/**
 * Legacy/Simple entry point for compatibility
 * Now powered by ProphetEngine class
 */
export function generateForecast(
    transactions: Transaction[],
    historyStart: Date,
    historyEnd: Date,
    forecastDays: number = 30
): DataPoint[] {
    const engine = new ProphetEngine(transactions);
    return engine.generate(historyStart, historyEnd, forecastDays);
}
