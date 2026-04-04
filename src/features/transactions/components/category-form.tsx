'use client';

import React, { useState } from 'react';
import { Check } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/features/transactions/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategoryData {
    name: string;
    type: 'expense' | 'income';
    icon: string;
    color: string;
    bg_color: string;
}

type SaveCategoryHandler = (data: CategoryData) => Promise<void>;

interface CategoryFormProps {
    initialData?: CategoryData;
    onClose: () => void;
    onSave: SaveCategoryHandler;
}

export const CategoryForm = ({ initialData, onClose, onSave }: CategoryFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<'expense' | 'income'>(initialData?.type || 'expense');
    const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Wrench');
    const [selectedColor, setSelectedColor] = useState(initialData?.color || 'text-muted-foreground');
    const [selectedBg, setSelectedBg] = useState(initialData?.bg_color || 'bg-muted');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isMobile = useIsMobile();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                name,
                type,
                icon: selectedIcon,
                color: selectedColor,
                bg_color: selectedBg,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isMobile === undefined) return null;

    const title = initialData ? 'Edit Kategori' : 'Kategori Baru';

    const formContent = (
        <>
            <div className="flex items-center justify-between bg-background p-6 shadow-elevation-2">
                <h2 className="text-title-lg">{title}</h2>
                {isMobile && (
                    <CloseButton
                        ariaLabel="Tutup"
                        tone="muted"
                        className="bg-muted rounded-full"
                        onClick={onClose}
                    />
                )}
            </div>

            <form id="category-form" onSubmit={handleSubmit} className="space-y-6 overflow-y-auto bg-muted/25 p-6">
                <div className="space-y-2">
                    <Label htmlFor="cat-name">Nama Kategori</Label>
                    <Input
                        id="cat-name"
                        placeholder="Contoh: Kopi, Hobi, dll"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Tipe</Label>
                    <Select value={type} onValueChange={(v: 'expense' | 'income') => setType(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Pengeluaran</SelectItem>
                            <SelectItem value="income">Pemasukan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label>Pilih Ikon</Label>
                    <div className="grid grid-cols-6 gap-2">
                        {CATEGORY_ICONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = selectedIcon === opt.name;
                            return (
                                <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => setSelectedIcon(opt.name)}
                                    aria-label={`Pilih ikon ${opt.name}`}
                                    className={cn(
                                        "rounded-lg p-3 transition-all shadow-elevation-2",
                                        isSelected ? "bg-primary/10 ring-2 ring-primary/25" : "bg-secondary hover:bg-muted"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Warna Tema</Label>
                    <div className="grid grid-cols-6 gap-2">
                        {CATEGORY_COLORS.map((opt) => {
                            const isSelected = selectedColor === opt.color || (selectedColor && opt.color.startsWith(selectedColor));
                            return (
                                <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => {
                                        setSelectedColor(opt.color);
                                        setSelectedBg(opt.bg);
                                    }}
                                    className={cn(
                                        "flex h-10 w-full items-center justify-center rounded-lg transition-all border border-border/15",
                                        opt.bg,
                                        isSelected ? "ring-2 ring-primary/25" : ""
                                    )}
                                >
                                    {isSelected && <Check className={cn("h-5 w-5", opt.color)} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </form>

            <div className="bg-background p-6 shadow-elevation-3">
                <Button form="category-form" type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </Button>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Sheet open onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    side="bottom"
                    hideCloseButton
                    className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-card border-t border-border/20 bg-background p-0 shadow-elevation-4"
                >
                    <div className="pointer-events-none flex justify-center pt-3">
                        <div className="h-1.5 w-12 rounded-full bg-border/80" />
                    </div>
                    <SheetHeader className="sr-only">
                        <SheetTitle>{title}</SheetTitle>
                    </SheetHeader>
                    {formContent}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="p-0 overflow-hidden w-full max-w-md">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {formContent}
            </DialogContent>
        </Dialog>
    );
};
