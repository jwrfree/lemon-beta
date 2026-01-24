'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRightLeft } from 'lucide-react';

interface TransactionTypeSelectorProps {
    type: 'expense' | 'income';
    onTypeChange: (type: string) => void;
}

export const TransactionTypeSelector = ({ type, onTypeChange }: TransactionTypeSelectorProps) => {
    return (
        <div className="grid grid-cols-3 gap-2 rounded-full bg-muted p-1">
            <Button
                type="button"
                onClick={() => onTypeChange('expense')}
                className={cn(
                    "rounded-full transition-all duration-200",
                    type === 'expense' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-transparent text-muted-foreground hover:bg-background/50'
                )}
            >
                Pengeluaran
            </Button>
            <Button
                type="button"
                onClick={() => onTypeChange('income')}
                className={cn(
                    "rounded-full transition-all duration-200",
                    type === 'income' ? 'bg-teal-600 text-white shadow-sm' : 'bg-transparent text-muted-foreground hover:bg-background/50'
                )}
            >
                Pemasukan
            </Button>
            <Button
                type="button"
                onClick={() => onTypeChange('transfer')}
                className="rounded-full bg-transparent text-muted-foreground hover:bg-background/50 flex items-center gap-1"
            >
                <ArrowRightLeft className="h-4 w-4" /> Transfer
            </Button>
        </div>
    );
};
