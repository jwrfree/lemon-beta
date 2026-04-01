'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/features/transactions/constants';

interface CategoryData {
    name: string;
    type: 'expense' | 'income';
    icon: string;
    color: string;
    bg_color: string;
}

interface CategoryFormProps {
    initialData?: CategoryData;
    onClose: () => void;
    onSave: (data: CategoryData) => Promise<void>;
}

export const CategoryForm = ({ initialData, onClose, onSave }: CategoryFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<'expense' | 'income'>(initialData?.type || 'expense');
    const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Wrench');
    const [selectedColor, setSelectedColor] = useState(initialData?.color || 'text-muted-foreground');
    const [selectedBg, setSelectedBg] = useState(initialData?.bg_color || 'bg-muted');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                animate={typeof window !== 'undefined' && window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
                exit={typeof window !== 'undefined' && window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-card bg-background/98 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.35)] md:rounded-card"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between bg-background/96 p-6 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.2)]">
                    <h2 className="text-lg font-medium">{initialData ? 'Edit Kategori' : 'Kategori Baru'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted" aria-label="Tutup">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
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
                                            "rounded-lg p-3 transition-all shadow-[0_10px_22px_-20px_rgba(15,23,42,0.16)]",
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
                                            "flex h-10 w-full items-center justify-center rounded-lg transition-all shadow-[0_10px_22px_-20px_rgba(15,23,42,0.16)]",
                                            opt.bg,
                                            isSelected ? "ring-2 ring-primary/25 shadow-inner" : ""
                                        )}
                                    >
                                        {isSelected && <Check className={cn("h-5 w-5", opt.color)} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </form>

                <div className="bg-background/96 p-6 shadow-[0_-10px_30px_-28px_rgba(15,23,42,0.2)]">
                    <Button type="submit" className="w-full h-12 rounded-lg text-base font-medium" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};


