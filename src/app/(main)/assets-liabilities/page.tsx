
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Plus, Landmark, TrendingUp, MinusCircle, PlusCircle } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { formatCurrency } from '@/lib/utils';
import { AssetLiabilityList } from '@/components/asset-liability-list';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetLiabilityForm } from '@/components/asset-liability-form';
import { AnimatedCounter } from '@/components/animated-counter';

export default function AssetsLiabilitiesPage() {
    const router = useRouter();
    const { assets, liabilities } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formInitialData, setFormInitialData] = useState<any | null>(null);

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
        <div className="h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4"
                    onClick={() => router.back()}
                    aria-label="Kembali"
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Aset & Liabilitas</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4"
                    onClick={() => handleOpenForm()}
                    aria-label="Tambah entri baru"
                >
                    <Plus className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Tambah entri baru</span>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                <Card className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-base font-medium text-primary-foreground/80">Total Kekayaan Bersih</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnimatedCounter value={totals.netWorth} className="text-4xl font-bold" />
                    </CardContent>
                </Card>

                {assets.length === 0 && liabilities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center pt-16">
                        <div className="p-3 bg-primary/10 rounded-full mb-3">
                            <Landmark className="h-8 w-8 text-primary" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold">Lacak Kekayaan Bersih Anda</h2>
                        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Mulai dengan menambahkan aset atau liabilitas pertama Anda.</p>
                        <Button onClick={() => handleOpenForm()}>
                            <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                            Tambah Entri Baru
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" /> Aset</CardTitle>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenForm({ type: 'asset' })}
                                    aria-label="Tambah aset"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="sr-only">Tambah aset</span>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold mb-4">{formatCurrency(totals.totalAssets)}</p>
                                <AssetLiabilityList items={assets} type="asset" onEdit={handleEdit} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2"><MinusCircle className="h-5 w-5 text-destructive" /> Liabilitas</CardTitle>
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleOpenForm({ type: 'liability' })}
                                    aria-label="Tambah liabilitas"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="sr-only">Tambah liabilitas</span>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold mb-4">{formatCurrency(totals.totalLiabilities)}</p>
                                <AssetLiabilityList items={liabilities} type="liability" onEdit={handleEdit} />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
            
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
                        onClick={handleCloseForm}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[85vh]"
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
