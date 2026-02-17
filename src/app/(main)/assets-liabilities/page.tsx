
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Landmark, TrendingUp, MinusCircle, PlusCircle, WalletCards } from 'lucide-react';
import { useAssets } from '@/features/assets/hooks/use-assets';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { formatCurrency, cn } from '@/lib/utils';
import { AssetLiabilityList } from '@/features/assets/components/asset-liability-list';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetLiabilityForm } from '@/features/assets/components/asset-liability-form';
import { AnimatedCounter } from '@/components/animated-counter';
import { PageHeader } from '@/components/page-header';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAssetCategoryInfo } from '@/features/assets/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Asset, Liability } from '@/types/models';

type AssetOrLiabilityWithMeta = (Asset & { type: 'asset' }) | (Liability & { type: 'liability' });
type AssetOrLiabilityFormInitialData = (Partial<Asset> & { type: 'asset' }) | (Partial<Liability> & { type: 'liability' });

export default function AssetsLiabilitiesPage() {
    const { assets, liabilities, goldPrice } = useAssets();
    const { wallets } = useWallets();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formInitialData, setFormInitialData] = useState<AssetOrLiabilityFormInitialData | null>(null);
    const isMobile = useIsMobile();

    const totals = useMemo(() => {
        const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

        const totalManualAssets = assets.reduce((sum, item) => {
            if (item.categoryKey === 'gold' && item.quantity && goldPrice) {
                return sum + (item.quantity * goldPrice);
            }
            return sum + item.value;
        }, 0);

        const totalAssets = totalManualAssets + totalWalletBalance;

        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.value, 0);
        const netWorth = totalAssets - totalLiabilities;

        // Rich Dad Logic: Real Assets (Appreciating + Liquid) vs Depreciating Assets
        const realAssets = assets.filter(a => {
            const info = getAssetCategoryInfo(a.categoryKey);
            return info.type === 'appreciating' || info.type === 'liquid';
        });

        const depreciatingAssets = assets.filter(a => {
            const info = getAssetCategoryInfo(a.categoryKey);
            return info.type === 'depreciating';
        });

        const realAssetsValue = realAssets.reduce((sum, item) => {
            if (item.categoryKey === 'gold' && item.quantity && goldPrice) {
                return sum + (item.quantity * goldPrice);
            }
            return sum + item.value;
        }, 0);

        const depreciatingAssetsValue = depreciatingAssets.reduce((sum, item) => sum + item.value, 0);

        const chartData = [
        const chartData = [
            { name: 'Kas & Bank', value: totalWalletBalance, color: '#3b82f6' }, // blue-500
            { name: 'Investasi', value: realAssetsValue, color: '#0d9488' }, // teal-600
            { name: 'Aset Fisik', value: depreciatingAssetsValue, color: '#e11d48' }, // rose-600
            { name: 'Utang', value: totalLiabilities, color: '#6366f1' }, // indigo-500
        ].filter(item => item.value > 0);
        ].filter(item => item.value > 0);

    return {
        totalAssets,
        totalLiabilities,
        netWorth,
        realAssets,
        depreciatingAssets,
        realAssetsValue,
        depreciatingAssetsValue,
        totalWalletBalance,
        chartData
    };
}, [assets, liabilities, goldPrice]);

const handleOpenForm = (initialData: AssetOrLiabilityFormInitialData | null = null) => {
    setFormInitialData(initialData);
    setIsFormOpen(true);
};

const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormInitialData(null);
};

const handleEdit = (item: Asset | Liability, type: 'asset' | 'liability') => {
    handleOpenForm({ ...item, type } as AssetOrLiabilityWithMeta);
};

return (
    <div className="h-full flex flex-col">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-primary text-primary-foreground border-none shadow-lg shadow-primary/30 rounded-3xl overflow-hidden relative min-h-[200px] flex flex-col justify-between p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">Total Kekayaan Bersih</p>
                            <AnimatedCounter value={totals.netWorth} className="text-5xl md:text-6xl font-black mt-2 tracking-tighter text-white" />
                        </div>
                        <div className="relative z-10 grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70 mb-1">Aset Produktif</p>
                                <p className="text-xl font-bold">{formatCurrency(totals.realAssetsValue)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70 mb-1">Aset Konsumtif</p>
                                <p className="text-xl font-bold">{formatCurrency(totals.depreciatingAssetsValue)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-card border border-white/20 p-6 flex flex-col items-center justify-center min-h-[200px]">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 self-start">Distribusi Aset</p>
                        <div className="w-full h-[180px]">
                            {totals.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={totals.chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {totals.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic">
                                    Belum ada data
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full mt-4">
                            {totals.chartData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full",
                                            entry.name === 'Kas & Bank' ? 'bg-blue-500' :
                                                entry.name === 'Investasi' ? 'bg-teal-600' :
                                                    entry.name === 'Aset Fisik' ? 'bg-rose-600' :
                                                        'bg-indigo-500'
                                        )} />
                                        <span className="text-muted-foreground">{entry.name}</span>
                                    </div>
                                    <span>{Math.round((entry.value / (totals.totalAssets + totals.totalLiabilities)) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

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
                        <Card className="border-none shadow-sm rounded-3xl h-full overflow-hidden bg-card border border-white/20">
                            <Tabs defaultValue="all" className="h-full flex flex-col">
                                <CardHeader className="flex flex-col gap-4 pb-2">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                                <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                                                    <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                </div>
                                                Aset
                                            </CardTitle>
                                            <p className="text-3xl font-black tracking-tighter text-teal-600 dark:text-teal-400">
                                                {formatCurrency(totals.totalAssets)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600"
                                            onClick={() => handleOpenForm({ type: 'asset' })}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <TabsList className="bg-muted p-1 rounded-2xl h-11 w-full grid grid-cols-3">
                                        <TabsTrigger value="all" className="h-full rounded-xl text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Semua</TabsTrigger>
                                        <TabsTrigger value="productive" className="h-full rounded-xl text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Produktif</TabsTrigger>
                                        <TabsTrigger value="consumptive" className="h-full rounded-xl text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Konsumtif</TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent className="px-0 flex-1 overflow-hidden">
                                    <TabsContent value="all" className="mt-0 h-full">
                                        <div className="px-4 mb-2">
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                                        <WalletCards className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Kas & Setara Kas</p>
                                                        <p className="text-[10px] text-muted-foreground">Saldo Dompet & Bank</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(totals.totalWalletBalance)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <AssetLiabilityList
                                            items={assets}
                                            type="asset"
                                            onEdit={(item) => handleEdit(item, 'asset')}
                                        />
                                    </TabsContent>
                                    <TabsContent value="productive" className="mt-0 h-full">
                                        <div className="px-4 pb-2">
                                            <p className="text-xs text-muted-foreground mb-2">Aset yang nilainya bertambah/tetap (Emas, Saham, Kas).</p>
                                            <p className="text-lg font-bold text-teal-600">{formatCurrency(totals.realAssetsValue)}</p>
                                        </div>
                                        <AssetLiabilityList
                                            items={totals.realAssets}
                                            type="asset"
                                            onEdit={(item) => handleEdit(item, 'asset')}
                                        />
                                    </TabsContent>
                                    <TabsContent value="consumptive" className="mt-0 h-full">
                                        <div className="px-4 pb-2">
                                            <p className="text-xs text-muted-foreground mb-2">Aset yang nilainya menurun (Kendaraan, Gadget).</p>
                                            <p className="text-lg font-bold text-rose-600">{formatCurrency(totals.depreciatingAssetsValue)}</p>
                                        </div>
                                        <AssetLiabilityList
                                            items={totals.depreciatingAssets}
                                            type="asset"
                                            onEdit={(item) => handleEdit(item, 'asset')}
                                        />
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>

                        <Card className="border-none shadow-sm rounded-3xl h-full overflow-hidden bg-card border border-white/20">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                        <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                                            <MinusCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        Liabilitas
                                    </CardTitle>
                                    <p className="text-3xl font-black tracking-tighter text-rose-600 dark:text-rose-400">
                                        {formatCurrency(totals.totalLiabilities)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"
                                    onClick={() => handleOpenForm({ type: 'liability' })}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="px-0">
                                <AssetLiabilityList
                                    items={liabilities}
                                    type="liability"
                                    onEdit={(item) => handleEdit(item, 'liability')}
                                />
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
