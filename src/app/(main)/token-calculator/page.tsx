
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, LoaderCircle, Sparkles, Calendar, Coins } from 'lucide-react';
import { countTransactionTokens } from '@/ai/flows/count-tokens-flow';
import { useUI } from '@/components/ui-provider';
import { AnimatePresence, motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

const DEEPSEEK_V3_INPUT_PRICE_PER_1M = 0.14; // USD
const DEEPSEEK_V3_OUTPUT_PRICE_PER_1M = 0.28; // USD
const USD_TO_IDR_RATE = 16250; // Perkiraan rate saat ini

export default function TokenCalculatorPage() {
    const router = useRouter();
    const { showToast } = useUI();
    const [inputText, setInputText] = useState('Beli 2 kopi di Starbucks pake GoPay 50rb');
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<{ input: number; output: number } | null>(null);
    
    // Estimation State
    const [budgetUSD, setBudgetUSD] = useState<string>('2');
    const [dailyTx, setDailyTx] = useState<string>('5');

    const calculateCost = (inputTokens: number, outputTokens: number) => {
        const inputCostUSD = (inputTokens / 1_000_000) * DEEPSEEK_V3_INPUT_PRICE_PER_1M;
        const outputCostUSD = (outputTokens / 1_000_000) * DEEPSEEK_V3_OUTPUT_PRICE_PER_1M;
        const totalCostUSD = inputCostUSD + outputCostUSD;
        const totalCostIDR = totalCostUSD * USD_TO_IDR_RATE;
        return { totalCostIDR, totalCostUSD };
    };

    const calculateRunway = () => {
        if (!result) return null;
        const { totalCostUSD } = calculateCost(result.input, result.output);
        if (totalCostUSD === 0) return null;

        const budget = parseFloat(budgetUSD) || 0;
        const daily = parseFloat(dailyTx) || 1;

        const totalTransactions = Math.floor(budget / totalCostUSD);
        const totalDays = Math.floor(totalTransactions / daily);
        
        return { totalTransactions, totalDays };
    };

    const runway = calculateRunway();

    const handleCalculate = async () => {
        if (!inputText.trim()) {
            showToast('Harap masukkan teks untuk dihitung.', 'error');
            return;
        }
        setIsCalculating(true);
        setResult(null);
        try {
            const tokenCounts = await countTransactionTokens(inputText);
            setResult(tokenCounts);
        } catch (error) {
            console.error('Token calculation failed:', error);
            showToast('Gagal menghitung token. Coba lagi.', 'error');
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-muted">
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
                <h1 className="text-xl font-bold text-center w-full">Kalkulator Token AI</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Hitung Token & Biaya (DeepSeek V3)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Masukkan teks transaksi untuk melihat perkiraan jumlah token dan biaya menggunakan model DeepSeek V3 (deepseek-chat).
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="input-text">Teks Transaksi</Label>
                            <Textarea
                                id="input-text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Contoh: Beli bensin 150rb di Shell"
                                rows={3}
                            />
                        </div>
                        <Button onClick={handleCalculate} disabled={isCalculating} className="w-full">
                            {isCalculating ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            {isCalculating ? 'Menghitung...' : 'Hitung Estimasi'}
                        </Button>
                    </CardContent>
                </Card>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Hasil Estimasi Per Transaksi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Input Token</p>
                                            <p className="text-2xl font-bold">{result.input}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Output Token</p>
                                            <p className="text-2xl font-bold">{result.output}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-primary/10 rounded-lg space-y-3">
                                        <div className="flex justify-between items-center border-b border-primary/20 pb-2">
                                            <span className="text-sm font-medium">Total Token</span>
                                            <span className="text-xl font-bold">{result.input + result.output}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">Estimasi Biaya</span>
                                                <span className="text-xs text-muted-foreground">($0.14/1M in, $0.28/1M out)</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xl font-bold text-primary">
                                                    {calculateCost(result.input, result.output).totalCostIDR < 1 
                                                        ? `Rp ${calculateCost(result.input, result.output).totalCostIDR.toFixed(4)}`
                                                        : formatCurrency(calculateCost(result.input, result.output).totalCostIDR)
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-center text-muted-foreground">
                                        *Sudah termasuk estimasi overhead system prompt (~200 token).
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Estimasi Runway (Daya Tahan Saldo)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="budget">Top Up (USD)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input 
                                                    id="budget" 
                                                    type="number" 
                                                    value={budgetUSD} 
                                                    onChange={(e) => setBudgetUSD(e.target.value)}
                                                    className="pl-7"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="daily">Transaksi / Hari</Label>
                                            <Input 
                                                id="daily" 
                                                type="number" 
                                                value={dailyTx} 
                                                onChange={(e) => setDailyTx(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {runway && (
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                             <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg flex flex-col justify-center items-center">
                                                <Coins className="h-6 w-6 text-teal-600 mb-2" />
                                                <p className="text-xs text-teal-700 uppercase tracking-wider mb-1">Total Transaksi</p>
                                                <p className="text-2xl font-bold text-teal-700">{runway.totalTransactions.toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex flex-col justify-center items-center">
                                                <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                                                <p className="text-xs text-blue-700 uppercase tracking-wider mb-1">Estimasi Waktu</p>
                                                <div className="flex items-baseline gap-1">
                                                     <p className="text-2xl font-bold text-blue-700">{runway.totalDays.toLocaleString()}</p>
                                                     <span className="text-sm text-blue-600">hari</span>
                                                </div>
                                                <p className="text-xs text-blue-600/80 mt-1">({(runway.totalDays / 365).toFixed(1)} tahun)</p>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-center text-muted-foreground">
                                        Estimasi ini berdasarkan panjang teks transaksi di atas.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
