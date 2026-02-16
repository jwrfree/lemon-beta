import { Transaction } from '@/types/models';
import { eachDayOfInterval, format, addDays, parseISO, differenceInDays } from 'date-fns';

interface DataPoint {
    date: string;
    actual?: number;
    forecast?: number;
    lowerBound?: number;
    upperBound?: number;
}

/**
 * Holt's Linear Trend Method Implementation for Client-Side Forecasting
 * Alpha: Level smoothing factor (0-1)
 * Beta: Trend smoothing factor (0-1)
 */
export function generateForecast(
    transactions: Transaction[],
    historyStart: Date,
    historyEnd: Date,
    forecastDays: number = 30
): DataPoint[] {
    // 1. Preprocess: Aggregate daily net cashflow (Income - Expense) or just Expense?
    // Let's forecast Net Cashflow to see solvency.

    const days = eachDayOfInterval({ start: historyStart, end: historyEnd });
    const dailyValues: number[] = [];
    const dateMap: string[] = [];

    days.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        dateMap.push(dateKey);

        let dailyNet = 0;
        transactions.forEach(t => {
            if (t.date.startsWith(dateKey)) {
                if (t.type === 'income') dailyNet += t.amount;
                if (t.type === 'expense') dailyNet -= t.amount;
            }
        });
        dailyValues.push(dailyNet);
    });

    if (dailyValues.length < 2) return [];

    // 2. Holt's Algorithm Initialization
    let level = dailyValues[0];
    let trend = dailyValues[1] - dailyValues[0];

    // Hyperparameters (Optimized for financial data generally)
    const alpha = 0.3; // Reacts moderately to recent changes
    const beta = 0.1;  // Trend changes slowly

    // Store smoothed values / residuals for confidence interval
    const fittedValues: number[] = [level];
    const residuals: number[] = [];

    // 3. Training Phase (Fit to History)
    for (let i = 1; i < dailyValues.length; i++) {
        const actual = dailyValues[i];
        const lastLevel = level;
        const lastTrend = trend;

        // Update Level & Trend
        level = alpha * actual + (1 - alpha) * (lastLevel + lastTrend);
        trend = beta * (level - lastLevel) + (1 - beta) * lastTrend;

        const forecast = lastLevel + lastTrend;
        fittedValues.push(forecast);
        residuals.push(actual - forecast);
    }

    // Calculate Standard Deviation of Residuals (Sigma)
    const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r * r, 0);
    const sigma = Math.sqrt(sumSquaredResiduals / (dailyValues.length - 2)); // DOF correction

    // 4. Generate Output Data (History + Forecast)
    const output: DataPoint[] = [];

    // Add History
    dailyValues.forEach((val, idx) => {
        output.push({
            date: dateMap[idx],
            actual: val,
            forecast: fittedValues[idx], // Fitted value
            // lowerBound: fittedValues[idx] - 1.96 * sigma, // Optional: show bounds on history too
            // upperBound: fittedValues[idx] + 1.96 * sigma
        });
    });

    // 5. Forecast Phase (Predict Future)
    const lastDate = days[days.length - 1];

    for (let h = 1; h <= forecastDays; h++) {
        const forecast = level + h * trend;
        const futureDate = addDays(lastDate, h);

        // Confidence Interval expands as we look further (uncertainty grows)
        // Formula: Sigma * sqrt(h) * 1.96 (95% CI standard)
        const uncertainty = sigma * Math.sqrt(h) * 1.96;

        output.push({
            date: format(futureDate, 'yyyy-MM-dd'),
            forecast: forecast,
            lowerBound: forecast - uncertainty,
            upperBound: forecast + uncertainty
        });
    }

    return output;
}
