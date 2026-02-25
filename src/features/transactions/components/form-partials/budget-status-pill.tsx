
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useInsights } from '@/features/insights/hooks/use-insights';
import { AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

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
                    "flex items-center justify-between px-4 py-3 rounded-md text-xs font-semibold border transition-colors duration-500",
                    isOverBudget
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                )}
                >
                    <div className="flex items-center gap-2">
                        {isOverBudget ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        <span className="uppercase tracking-widest">Sisa {category}:</span>
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
                        <TrendingUp className="h-3 w-3" />
                        <span className="uppercase tracking-widest">Velocity Tinggi: Kamu belanja lebih cepat dari biasanya!</span>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

