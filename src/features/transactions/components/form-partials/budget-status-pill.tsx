
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';

interface BudgetStatusPillProps {
    category: string;
}

export const BudgetStatusPill = ({ category }: BudgetStatusPillProps) => {
    const { budgets } = useBudgets();

    // Only proceed if category is selected
    if (!category) return null;

    const relevantBudget = budgets.find(b => b.categories.includes(category));

    // Only proceed if a budget exists for this category
    if (!relevantBudget) return null;

    const spent = relevantBudget.spent || 0;
    const remainingBudget = relevantBudget.targetAmount - spent;
    // Over budget if remaining is 0 or less (though exact 0 is "at limit", usually treated as warning)
    const isOverBudget = remainingBudget <= 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium border w-full",
                    isOverBudget
                        ? "bg-destructive/5 text-destructive border-destructive/20"
                        : "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                )}
            >
                <span>Sisa Anggaran {category}:</span>
                <span className="font-medium tabular-nums">
                    Rp {new Intl.NumberFormat('id-ID').format(remainingBudget)}
                </span>
            </motion.div>
        </AnimatePresence>
    );
};

