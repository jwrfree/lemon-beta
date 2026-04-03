import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowsLeftRight, TrendDown, TrendUp } from '@/lib/icons';

export type TransactionType = 'expense' | 'income' | 'transfer';

interface TransactionTypeTabsProps {
    value: TransactionType;
    onChange: (type: TransactionType) => void;
}

export const TransactionTypeTabs = ({ value, onChange }: TransactionTypeTabsProps) => {
    return (
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/55 p-1.5">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onChange('expense')}
                className={cn(
                    "rounded-md transition-all duration-200 h-9",
                    value === 'expense'
                        ? 'bg-card text-destructive font-medium shadow-elevation-2'
                        : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
                )}
            >
                <TrendDown size={16} weight="regular" className="mr-2" />
                Pengeluaran
            </Button>
            <Button
                type="button"
                variant="ghost"
                onClick={() => onChange('income')}
                className={cn(
                    "rounded-md transition-all duration-200 h-9",
                    value === 'income'
                        ? 'bg-card text-success font-medium shadow-elevation-2'
                        : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
                )}
            >
                <TrendUp size={16} weight="regular" className="mr-2" />
                Pemasukan
            </Button>
            <Button
                type="button"
                variant="ghost"
                onClick={() => onChange('transfer')}
                className={cn(
                    "rounded-md transition-all duration-200 h-9",
                    value === 'transfer'
                        ? 'bg-card text-info font-medium shadow-elevation-2'
                        : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
                )}
            >
                <ArrowsLeftRight size={16} weight="regular" className="mr-2" />
                <span className="truncate">Transfer</span>
            </Button>
        </div>
    );
};


