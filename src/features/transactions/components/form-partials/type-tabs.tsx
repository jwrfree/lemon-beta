import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';

export type TransactionType = 'expense' | 'income' | 'transfer';

interface TransactionTypeTabsProps {
    value: TransactionType;
    onChange: (type: TransactionType) => void;
}

export const TransactionTypeTabs = ({ value, onChange }: TransactionTypeTabsProps) => {
    return (
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-1.5 border border-border/50">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onChange('expense')}
                className={cn(
                    "rounded-lg transition-all duration-200 h-9",
                    value === 'expense'
                        ? 'bg-background text-red-500 shadow-sm font-semibold ring-1 ring-border/10'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                )}
            >
                <TrendingDown className="mr-2 h-4 w-4" />
                Pengeluaran
            </Button>
            <Button
                type="button"
                variant="ghost"
                onClick={() => onChange('income')}
                className={cn(
                    "rounded-lg transition-all duration-200 h-9",
                    value === 'income'
                        ? 'bg-background text-emerald-600 shadow-sm font-semibold ring-1 ring-border/10'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                )}
            >
                <TrendingUp className="mr-2 h-4 w-4" />
                Pemasukan
            </Button>
            <Button
                type="button"
                variant="ghost"
                onClick={() => onChange('transfer')}
                className={cn(
                    "rounded-lg transition-all duration-200 h-9",
                    value === 'transfer'
                        ? 'bg-background text-blue-600 shadow-sm font-semibold ring-1 ring-border/10'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                )}
            >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                <span className="truncate">Transfer</span>
            </Button>
        </div>
    );
};
