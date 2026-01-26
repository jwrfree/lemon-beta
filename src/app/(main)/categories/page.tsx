'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Plus, Pencil, Trash2, 
    Utensils, ShoppingCart, Car, Phone, 
    Gamepad2, Home, GraduationCap, HeartPulse,
    Briefcase, Gift, PiggyBank, Search, Wrench,
    ReceiptText, ShieldCheck, Sparkles, HandCoins, ArrowRightLeft, Handshake
} from 'lucide-react';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUI } from '@/components/ui-provider';
import { Input } from '@/components/ui/input';
import { CategoryForm } from '@/features/transactions/components/category-form';
import { AnimatePresence } from 'framer-motion';
import { PageHeader } from "@/components/page-header";

const iconMap: Record<string, any> = {
    Utensils, ShoppingCart, Car, Phone, Gamepad2, Home, GraduationCap, HeartPulse, 
    Briefcase, Gift, PiggyBank, ReceiptText, ShieldCheck, Sparkles, HandCoins, 
    ArrowRightLeft, Handshake, Wrench
};

export default function CategoriesPage() {
    const router = useRouter();
    const { categories, isLoading, deleteCategory, addCategory, updateCategory } = useCategories();
    const { showToast } = useUI();
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const filteredCategories = categories.filter(c => 
        c.type === activeTab && 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (cat: any) => {
        setEditingCategory(cat);
        setIsFormOpen(true);
    };

    const handleSave = async (data: any) => {
        if (editingCategory) {
            const { error } = await updateCategory(editingCategory.id, data);
            if (error) showToast("Gagal update kategori.", 'error');
            else showToast("Kategori berhasil diupdate.", 'success');
        } else {
            const result = await addCategory(data);
            if (!result) showToast("Gagal menambah kategori: pengguna belum login.", 'error');
            else if (result.error) showToast("Gagal menambah kategori.", 'error');
            else showToast("Kategori baru ditambahkan.", 'success');
        }
    };

    const handleDelete = async (id: string, isDefault: boolean) => {
        if (isDefault) {
            showToast("Kategori bawaan tidak bisa dihapus.", 'error');
            return;
        }
        
        if (confirm("Hapus kategori ini? Transaksi lama mungkin akan kehilangan kategori ini.")) {
            const { error } = await deleteCategory(id);
            if (error) showToast("Gagal menghapus kategori.", 'error');
            else showToast("Kategori berhasil dihapus.", 'success');
        }
    };

    return (
        <div className="h-full flex flex-col relative">
            <PageHeader 
                title="Kelola Kategori" 
                extraActions={
                    <Button variant="ghost" size="icon" className="rounded-full text-primary" onClick={handleOpenAdd}>
                        <Plus className="h-6 w-6" />
                    </Button>
                }
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 pb-24">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-auto">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'expense' | 'income')} className="w-full md:w-[320px]">
                            <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full grid grid-cols-2">
                                <TabsTrigger value="expense" className="h-full rounded-xl font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Pengeluaran</TabsTrigger>
                                <TabsTrigger value="income" className="h-full rounded-xl font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Pemasukan</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari kategori..." 
                            className="pl-9 rounded-xl bg-background shadow-sm h-11 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
                    {isLoading ? (
                        [1,2,3,4].map(i => <div key={i} className="h-24 bg-card animate-pulse rounded-3xl" />)
                    ) : filteredCategories.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-muted-foreground space-y-2">
                            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                <Search className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="font-medium">Belum ada kategori yang ditemukan.</p>
                        </div>
                    ) : (
                        filteredCategories.map((cat) => {
                            const IconComp = iconMap[cat.icon] || Wrench;
                            return (
                                <Card key={cat.id} className="border-none shadow-sm hover:shadow-md transition-all group rounded-3xl overflow-hidden bg-card border border-white/20">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-3.5 rounded-2xl shadow-inner", cat.bg_color)}>
                                                <IconComp className={cn("h-6 w-6", cat.color)} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-base tracking-tight">{cat.name}</p>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {cat.sub_categories?.length > 0 ? (
                                                        cat.sub_categories.slice(0, 2).map((s: string) => (
                                                            <span key={s} className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 px-1.5 rounded-md">
                                                                {s}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground/60 font-medium italic">Klik edit untuk tambah sub-kategori</span>
                                                    )}
                                                    {(cat.sub_categories?.length || 0) > 2 && <span className="text-[10px] text-muted-foreground">...</span>}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenEdit(cat)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {!cat.is_default && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleDelete(cat.id, cat.is_default)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </main>

            <AnimatePresence>
                {isFormOpen && (
                    <CategoryForm 
                        initialData={editingCategory}
                        onClose={() => setIsFormOpen(false)}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
