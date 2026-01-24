
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Plus, Landmark, TrendingUp, MinusCircle, PlusCircle } from 'lucide-react';
import { useAssets } from '@/features/assets/hooks/use-assets';
import { formatCurrency } from '@/lib/utils';
import { AssetLiabilityList } from '@/features/assets/components/asset-liability-list';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetLiabilityForm } from '@/features/assets/components/asset-liability-form';
import { AnimatedCounter } from '@/components/animated-counter';
import { PageHeader } from '@/components/page-header';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AssetsLiabilitiesPage() {
    const router = useRouter();
    const { assets, liabilities } = useAssets();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formInitialData, setFormInitialData] = useState<any | null>(null);
    const isMobile = useIsMobile();

    const totals = useMemo(() => {
        const totalAssets = assets.reduce((sum, item) => sum + item.value, 0);
        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.value, 0);
        const netWorth = totalAssets - totalLiabilities;
        return { totalAssets, totalLiabilities, netWorth };
    }, [assets, liabilities]);

    const handleOpenForm = (initialData: any | null = null) => {
        setFormInitialData(initialData);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setFormInitialData(null);
    };

    const handleEdit = (item: any, type: 'asset' | 'liability') => {
        handleOpenForm({ ...item, type });
    };

    return (
        <div className="h-full bg-muted/30 flex flex-col">
            <PageHeader 
                title="Aset & Liabilitas" 
                actionButton={{
                    icon: Plus,
                    label: 'Tambah entri baru',
                    onClick: () => handleOpenForm()
                }}
            />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Card className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground border-none shadow-md rounded-xl md:rounded-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-sm font-medium text-primary-foreground/80 tracking-wide uppercase">Total Kekayaan Bersih</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <AnimatedCounter value={totals.netWorth} className="text-4xl md:text-5xl font-bold tracking-tight" />
                        </CardContent>
                    </Card>

                    {assets.length === 0 && liabilities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center pt-16">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <Landmark className="h-12 w-12 text-primary" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Lacak Kekayaan Bersih Anda</h2>
                            <p className="text-muted-foreground mt-2 mb-8 max-w-sm">Mulai dengan menambahkan aset atau liabilitas pertama Anda.</p>
                            <Button onClick={() => handleOpenForm()} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                                <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                                Tambah Entri Baru
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm rounded-xl md:rounded-lg h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-md">
                                                <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                            </div>
                                            Aset
                                        </CardTitle>
                                        <p className="text-2xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
                                            {formatCurrency(totals.totalAssets)}
                                        </p>
                                    </div>
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600"
                                        onClick={() => handleOpenForm({ type: 'asset' })}
                                        aria-label="Tambah aset"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <AssetLiabilityList items={assets} type="asset" onEdit={handleEdit} />
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-xl md:rounded-lg h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-md">
                                                <MinusCircle className="h-4 w-4 text-destructive" />
                                            </div>
                                            Liabilitas
                                        </CardTitle>
                                        <p className="text-2xl font-bold tracking-tight text-destructive">
                                            {formatCurrency(totals.totalLiabilities)}
                                        </p>
                                    </div>
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-destructive"
                                        onClick={() => handleOpenForm({ type: 'liability' })}
                                        aria-label="Tambah liabilitas"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <AssetLiabilityList items={liabilities} type="liability" onEdit={handleEdit} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
            
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4"
                        onClick={handleCloseForm}
                    >
                        <motion.div
                        initial={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
                        exit={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full max-w-md bg-background rounded-t-xl md:rounded-xl shadow-xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                            <AssetLiabilityForm onClose={handleCloseForm} initialData={formInitialData} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
