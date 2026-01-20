'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
    Utensils, ShoppingCart, Car, Phone, 
    Gamepad2, Home, GraduationCap, HeartPulse,
    Briefcase, Gift, PiggyBank, Wrench, ReceiptText, 
    ShieldCheck, Sparkles, HandCoins, ArrowRightLeft, Handshake
} from 'lucide-react';

const iconOptions = [
    { name: 'Utensils', icon: Utensils },
    { name: 'ShoppingCart', icon: ShoppingCart },
    { name: 'Car', icon: Car },
    { name: 'Phone', icon: Phone },
    { name: 'Gamepad2', icon: Gamepad2 },
    { name: 'Home', icon: Home },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'HeartPulse', icon: HeartPulse },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Gift', icon: Gift },
    { name: 'PiggyBank', icon: PiggyBank },
    { name: 'ReceiptText', icon: ReceiptText },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'HandCoins', icon: HandCoins },
    { name: 'ArrowRightLeft', icon: ArrowRightLeft },
    { name: 'Handshake', icon: Handshake },
    { name: 'Wrench', icon: Wrench },
];

const colorOptions = [
    { name: 'Yellow', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Blue', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Purple', color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Cyan', color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Orange', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Pink', color: 'text-pink-600', bg: 'bg-pink-100' },
    { name: 'Green', color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Indigo', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Red', color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Teal', color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: 'Stone', color: 'text-stone-600', bg: 'bg-stone-100' },
];

interface CategoryFormProps {
    initialData?: any;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export const CategoryForm = ({ initialData, onClose, onSave }: CategoryFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<'expense' | 'income'>(initialData?.type || 'expense');
    const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Wrench');
    const [selectedColor, setSelectedColor] = useState(initialData?.color || 'text-stone-600');
    const [selectedBg, setSelectedBg] = useState(initialData?.bg_color || 'bg-stone-100');
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
                className="w-full max-w-md bg-background rounded-t-3xl md:rounded-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b flex items-center justify-between bg-background sticky top-0 z-10">
                    <h2 className="text-xl font-bold">{initialData ? 'Edit Kategori' : 'Kategori Baru'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted">
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
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
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
                            {iconOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = selectedIcon === opt.name;
                                return (
                                    <button
                                        key={opt.name}
                                        type="button"
                                        onClick={() => setSelectedIcon(opt.name)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all border-2",
                                            isSelected ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-muted"
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
                            {colorOptions.map((opt) => {
                                const isSelected = selectedColor === opt.color;
                                return (
                                    <button
                                        key={opt.name}
                                        type="button"
                                        onClick={() => {
                                            setSelectedColor(opt.color);
                                            setSelectedBg(opt.bg);
                                        }}
                                        className={cn(
                                            "h-10 w-full rounded-xl transition-all border-2 flex items-center justify-center",
                                            opt.bg,
                                            isSelected ? "border-primary shadow-inner" : "border-transparent"
                                        )}
                                    >
                                        {isSelected && <Check className={cn("h-5 w-5", opt.color)} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t bg-background">
                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};
