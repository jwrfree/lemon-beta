'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Landmark, TrendingUp, MinusCircle, WalletCards } from '@/lib/icons';
import { useAssets } from '@/features/assets/hooks/use-assets';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { formatCurrency, cn } from '@/lib/utils';
import { AssetLiabilityList } from '@/features/assets/components/asset-liability-list';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetLiabilityForm } from '@/features/assets/components/asset-liability-form';
import { AnimatedCounter } from '@/components/animated-counter';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAssetCategoryInfo } from '@/features/assets/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Asset, Liability } from '@/types/models';

type AssetOrLiabilityWithMeta = (Asset & { type: 'asset'}) | (Liability & { type: 'liability'});
type AssetOrLiabilityFormInitialData = (Partial<Asset> & { type: 'asset'}) | (Partial<Liability> & { type: 'liability'});

const chartConfig = {
 assets: {
 label: "Aset",
 },
} satisfies ChartConfig;

export function AssetsLiabilitiesDashboard() {
 const { assets, liabilities, goldPrice } = useAssets();
 const { wallets } = useWallets();
 const [isFormOpen, setIsFormOpen] = useState(false);
 const [formInitialData, setFormInitialData] = useState<AssetOrLiabilityFormInitialData | null>(null);
 const isMobile = useIsMobile();

 const totals = useMemo(() => {
 const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
 const totalManualAssets = assets.reduce((sum, item) => {
 if (item.categoryKey === 'gold'&& item.quantity && goldPrice) {
 return sum + (item.quantity * goldPrice);
 }
 return sum + item.value;
 }, 0);
 const totalAssets = totalManualAssets + totalWalletBalance;
 const totalLiabilities = liabilities.reduce((sum, item) => sum + item.value, 0);
 const netWorth = totalAssets - totalLiabilities;

 const realAssets = assets.filter(a => {
 const info = getAssetCategoryInfo(a.categoryKey);
 return info.type === 'appreciating'|| info.type === 'liquid';
 });

 const depreciatingAssets = assets.filter(a => {
 const info = getAssetCategoryInfo(a.categoryKey);
 return info.type === 'depreciating';
 });

 const manualRealAssetsValue = realAssets.reduce((sum, item) => {
 if (item.categoryKey === 'gold'&& item.quantity && goldPrice) {
 return sum + (item.quantity * goldPrice);
 }
 return sum + item.value;
 }, 0);

 const realAssetsValue = manualRealAssetsValue + totalWalletBalance;
 const depreciatingAssetsValue = depreciatingAssets.reduce((sum, item) => sum + item.value, 0);

 const chartData = [
 { name: 'Kas & Bank', value: totalWalletBalance, color: '#3b82f6'},
 { name: 'Investasi', value: manualRealAssetsValue, color: '#0d9488'},
 { name: 'Aset Fisik', value: depreciatingAssetsValue, color: '#e11d48'},
 { name: 'Utang', value: totalLiabilities, color: '#6366f1'},
 ].filter(item => item.value > 0);

 return { totalAssets, totalLiabilities, netWorth, realAssets, depreciatingAssets, realAssetsValue, depreciatingAssetsValue, totalWalletBalance, chartData };
 }, [assets, liabilities, goldPrice, wallets]);

 const handleOpenForm = (initialData: AssetOrLiabilityFormInitialData | null = null) => {
 setFormInitialData(initialData);
 setIsFormOpen(true);
 };

 const handleCloseForm = () => {
 setIsFormOpen(false);
 setFormInitialData(null);
 };

 const handleEdit = (item: Asset | Liability, type: 'asset'| 'liability') => {
 handleOpenForm({ ...item, type } as AssetOrLiabilityWithMeta);
 };

 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <Card className="lg:col-span-2 bg-primary text-primary-foreground border-none shadow-lg shadow-primary/30 rounded-card overflow-hidden relative min-h-[200px] flex flex-col justify-between p-8">
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"/>
 <div className="relative z-10">
 <p className="text-label-md font-medium text-primary-foreground/80">Total Kekayaan Bersih</p>
 <AnimatedCounter value={totals.netWorth} className="text-display-lg md:text-6xl font-medium mt-2 tracking-tighter text-white"/>
 </div>
 <div className="relative z-10 grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-white/10">
 <div>
 <p className="text-label-md font-medium text-primary-foreground/70 mb-1">Aset Produktif</p>
 <p className="text-display-sm font-medium">{formatCurrency(totals.realAssetsValue)}</p>
 </div>
 <div>
 <p className="text-label-md font-medium text-primary-foreground/70 mb-1">Aset Konsumtif</p>
 <p className="text-display-sm font-medium">{formatCurrency(totals.depreciatingAssetsValue)}</p>
 </div>
 </div>
 </Card>

 <Card className="border-none shadow-md rounded-card bg-card border border-border p-6 flex flex-col items-center justify-center min-h-[200px]">
 <p className="text-label-md font-medium text-muted-foreground mb-4 self-start">Distribusi Aset</p>
 <div className="w-full h-[180px]">
 {totals.chartData.length > 0 ? (
 <ChartContainer config={chartConfig} className="h-full w-full">
 <PieChart>
 <Pie data={totals.chartData} cx="50%"cy="50%"innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value"nameKey="name"stroke="none">
 {totals.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
 </Pie>
 <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot"formatter={(value) => formatCurrency(Number(value))} />} />
 </PieChart>
 </ChartContainer>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-muted-foreground text-label-md italic">Tambahkan aset untuk melihat distribusi</div>
 )}
 </div>
 </Card>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="border-none shadow-md rounded-card overflow-hidden bg-card border border-border">
 <Tabs defaultValue="all"className="h-full flex flex-col">
 <CardHeader className="flex flex-col gap-4 pb-2">
 <div className="flex flex-row items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-body-md font-medium flex items-center gap-2 text-muted-foreground">
 <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg"><TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400"/></div>
 Aset
 </CardTitle>
 <p className="text-display-lg font-medium tracking-tighter text-teal-600 dark:text-teal-400">{formatCurrency(totals.totalAssets)}</p>
 </div>
 <Button variant="ghost"size="icon"className="h-10 w-10 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600"onClick={() => handleOpenForm({ type: 'asset'})}><Plus className="h-5 w-5"/></Button>
 </div>
 <TabsList className="bg-muted p-1 rounded-lg h-11 w-full grid grid-cols-3">
 <TabsTrigger value="all"className="h-full rounded-md text-label-md font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground">Semua</TabsTrigger>
 <TabsTrigger value="productive"className="h-full rounded-md text-label-md font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground">Produktif</TabsTrigger>
 <TabsTrigger value="consumptive"className="h-full rounded-md text-label-md font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground">Konsumtif</TabsTrigger>
 </TabsList>
 </CardHeader>
 <CardContent className="px-0 flex-1">
 <TabsContent value="all"className="mt-0"><AssetLiabilityList items={assets} type="asset"onEdit={(item) => handleEdit(item, 'asset')} onAdd={() => handleOpenForm({ type: 'asset'})} /></TabsContent>
 <TabsContent value="productive"className="mt-0"><AssetLiabilityList items={totals.realAssets} type="asset"onEdit={(item) => handleEdit(item, 'asset')} onAdd={() => handleOpenForm({ type: 'asset'})} /></TabsContent>
 <TabsContent value="consumptive"className="mt-0"><AssetLiabilityList items={totals.depreciatingAssets} type="asset"onEdit={(item) => handleEdit(item, 'asset')} onAdd={() => handleOpenForm({ type: 'asset'})} /></TabsContent>
 </CardContent>
 </Tabs>
 </Card>

 <Card className="border-none shadow-md rounded-card overflow-hidden bg-card border border-border">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <div className="space-y-1">
 <CardTitle className="text-body-md font-medium flex items-center gap-2 text-muted-foreground">
 <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg"><MinusCircle className="h-4 w-4 text-rose-600 dark:text-rose-400"/></div>
 Liabilitas
 </CardTitle>
 <p className="text-display-lg font-medium tracking-tighter text-rose-600 dark:text-rose-400">{formatCurrency(totals.totalLiabilities)}</p>
 </div>
 <Button variant="ghost"size="icon"className="h-10 w-10 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"onClick={() => handleOpenForm({ type: 'liability'})}><Plus className="h-5 w-5"/></Button>
 </CardHeader>
 <CardContent className="px-0"><AssetLiabilityList items={liabilities} type="liability"onEdit={(item) => handleEdit(item, 'liability')} onAdd={() => handleOpenForm({ type: 'liability'})} /></CardContent>
 </Card>
 </div>

 <AnimatePresence>
 {isFormOpen && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4"onClick={handleCloseForm}>
 <motion.div initial={isMobile ? { y: "100%"} : { scale: 0.95, opacity: 0 }} animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }} exit={isMobile ? { y: "100%"} : { scale: 0.95, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut"}} className="w-full max-w-md bg-background rounded-t-card md:rounded-card shadow-xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh]"onClick={(e) => e.stopPropagation()}>
 <AssetLiabilityForm onClose={handleCloseForm} initialData={formInitialData} />
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
