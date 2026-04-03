
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { useBudgets } from '@/features/budgets';
import { useInsights } from '@/features/insights';
import { CheckCircle, TrendUp, WarningCircle } from '@/lib/icons';

interface BudgetStatusPillProps {
    category: string;
}

export const BudgetStatusPill = ({ category }: BudgetStatusPillProps) => {
    const { budgets } = useBudgets();
    const { risk } = useInsights();

    if (!category) return null;

    const relevantBudget = budgets.find(b => b.categories.includes(category));
    if (!relevantBudget) return null;

    const spent = relevantBudget.spent || 0;
    const remainingBudget = relevantBudget.targetAmount - spent;
    const isOverBudget = remainingBudget <= 0;
    const isHighVelocity = (risk?.velocity || 1) > 1.1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="space-y-2"
            >
                <div className={cn(
                    "flex items-center justify-between rounded-md px-4 py-3 text-xs font-semibold shadow-[0_12px_24px_-22px_rgba(15,23,42,0.18)] transition-colors duration-500",
                    isOverBudget
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-emerald-500/10 text-emerald-600"
                )}
                >
                    <div className="flex items-center gap-2">
                        {isOverBudget ? <WarningCircle size={14} weight="regular" /> : <CheckCircle size={14} weight="regular" />}
                        <span className="text-label">Sisa {category}:</span>
                    </div>
                    <span className="tabular-nums text-sm font-medium">
                        {formatCurrency(remainingBudget)}
                    </span>
                </div>

                {isHighVelocity && !isOverBudget && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-1 text-xs font-semibold text-amber-600"
                    >
                        <TrendUp size={12} weight="regular" />
                        <span className="text-label">Velocity Tinggi: Kamu belanja lebih cepat dari biasanya!</span>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};



