
'use client';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface TransactionFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: { type: string | null; categories: string[] }) => void;
    currentFilters: { type: string | null; categories: string[] };
    expenseCategories: any[];
    incomeCategories: any[];
}

export const TransactionFilterSheet = ({
    isOpen,
    onClose,
    onApply,
    currentFilters,
    expenseCategories,
    incomeCategories,
}: TransactionFilterSheetProps) => {
    const [type, setType] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setType(currentFilters.type);
            setSelectedCategories(currentFilters.categories);
        }
    }, [isOpen, currentFilters]);

    const handleTypeChange = (newType: string | null) => {
        setType(newType);
        setSelectedCategories([]); // Reset categories when type changes
    };

    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleApplyClick = () => {
        onApply({ type, categories: selectedCategories });
    };
    
    const handleResetClick = () => {
        setType(null);
        setSelectedCategories([]);
        onApply({ type: null, categories: [] });
    };

    const categoriesToShow = type === 'expense' ? expenseCategories : (type === 'income' ? incomeCategories : []);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Filter Transaksi</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 pr-6 -mr-6">
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Tipe Transaksi</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={type === null ? 'default' : 'outline'}
                                    onClick={() => handleTypeChange(null)}
                                >
                                    Semua
                                </Button>
                                <Button
                                    variant={type === 'expense' ? 'default' : 'outline'}
                                    className={type === 'expense' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                                    onClick={() => handleTypeChange('expense')}
                                >
                                    Pengeluaran
                                </Button>
                                <Button
                                    variant={type === 'income' ? 'default' : 'outline'}
                                    className={type === 'income' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                                    onClick={() => handleTypeChange('income')}
                                >
                                    Pemasukan
                                </Button>
                            </div>
                        </div>

                        {type && (
                            <div className="space-y-2 animate-in fade-in">
                                <Label>Kategori</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categoriesToShow.map(cat => (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => handleCategoryToggle(cat.name)}
                                            className={cn(
                                                "p-2 text-center border rounded-lg flex flex-col items-center gap-2 aspect-square justify-center",
                                                selectedCategories.includes(cat.name) ? 'border-primary bg-primary/10' : 'border-muted'
                                            )}
                                        >
                                            <cat.icon className={cn("h-6 w-6", selectedCategories.includes(cat.name) ? 'text-primary' : 'text-muted-foreground')} />
                                            <span className="text-xs text-center">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <SheetFooter className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleResetClick}>Reset</Button>
                    <Button onClick={handleApplyClick}>Terapkan</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
