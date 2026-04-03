import React, { useState } from 'react';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, Loader2, Check, X, ArrowRight } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import {
    extractTransaction,
    parseSimpleTransactionInput,
    type SingleTransactionOutput,
} from '@/ai/flows/extract-transaction-flow';
import { useActions } from '@/providers/action-provider';
import { useWallets } from '@/features/wallets';
import { normalizeTransactionTimestamp } from '@/lib/utils/transaction-timestamp';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/lib/categories';

export const QuickAddWidget = () => {
    const { openTransactionSheet, showToast } = useUI();
    const { addTransaction } = useActions();
    const { wallets } = useWallets();

    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedData, setParsedData] = useState<SingleTransactionOutput | null>(null);

    const preferredCashWallet =
        wallets.find((wallet) => ['tunai', 'dompet', 'cash', 'kas'].includes(wallet.name.trim().toLowerCase())) ||
        wallets.find((wallet) => ['tunai', 'dompet', 'cash', 'kas'].some((alias) => wallet.name.trim().toLowerCase().includes(alias))) ||
        wallets.find((wallet) => wallet.isDefault) ||
        wallets[0];

    const handleQuickAdd = async () => {
        if (!inputValue.trim()) return;
        
        setIsAnalyzing(true);
        try {
            const result = await parseSimpleTransactionInput(inputValue, {
                wallets: wallets.map((wallet) => wallet.name),
            }, {
                allowBareInput: true,
            }) ?? await extractTransaction(inputValue, {
                wallets: wallets.map((wallet) => wallet.name),
                categories: [
                    ...categories.expense.map((category) => category.name),
                    ...categories.income.map((category) => category.name),
                ],
            });

            if (result.transactions && result.transactions.length > 0) {
                setParsedData(result.transactions[0]);
            } else if (result.clarificationQuestion) {
                showToast(result.clarificationQuestion, 'info');
            } else {
                showToast('Transaksi belum kebaca. Coba tulis seperti "kopi 18rb" atau "gaji 5jt".', 'info');
            }
        } catch {
            showToast('Gagal menganalisis transaksi', 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const confirmTransaction = async () => {
        if (!parsedData) return;

        try {
            // Find wallet ID by name or use default
            const wallet =
                wallets.find(w => w.name.toLowerCase() === parsedData.wallet.toLowerCase()) ||
                wallets.find(w => parsedData.wallet && (w.name.toLowerCase().includes(parsedData.wallet.toLowerCase()) || parsedData.wallet.toLowerCase().includes(w.name.toLowerCase()))) ||
                preferredCashWallet;
            
            const transactionId = await addTransaction({
                amount: parsedData.amount,
                description: parsedData.description,
                category: parsedData.category,
                subCategory: parsedData.subCategory || undefined,
                walletId: wallet?.id || '',
                date: normalizeTransactionTimestamp(parsedData.date),
                type: parsedData.type as 'income' | 'expense',
                location: parsedData.location || undefined,
                isNeed: parsedData.isNeed ?? parsedData.type !== 'income',
            }, {
                silentSuccessToast: true,
            });

            if (!transactionId) {
                showToast('Gagal menyimpan transaksi', 'error');
                return;
            }

            showToast('Transaksi berhasil dicatat!', 'success');
            setParsedData(null);
            setInputValue('');
        } catch {
            showToast('Gagal menyimpan transaksi', 'error');
        }
    };

    return (
        <Card className="border-none shadow-none border border-border/40 bg-card rounded-card-premium overflow-hidden relative">
            {/* Ambient Accent */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] -rotate-12 pointer-events-none">
                <Sparkles className="h-20 w-20" />
            </div>

            <CardHeader className="pb-3 flex flex-row items-center justify-between px-6 pt-6 relative z-10">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground/60 text-label">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    Intelligence Input
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-xs font-semibold text-label text-primary hover:bg-primary/5 rounded-full"
                    onClick={() => openTransactionSheet()}
                >
                    Manual Entry
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 px-6 relative z-10">
                <AnimatePresence mode="wait">
                    {!parsedData ? (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative group"
                        >
                            <Input 
                                placeholder="e.g. 'coffee 25k' or 'salary 5m'" 
                                className="pr-12 h-12 bg-muted/30 border-none rounded-card focus-visible:ring-4 focus-visible:ring-primary/5 transition-all"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                                disabled={isAnalyzing}
                            />
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className={cn(
                                    "absolute right-1.5 top-1.5 h-9 w-9 rounded-md transition-all",
                                    inputValue.trim() ? "bg-primary text-primary-foreground" : "text-muted-foreground/40"
                                )}
                                onClick={handleQuickAdd}
                                disabled={isAnalyzing || !inputValue.trim()}
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-muted/30 rounded-card p-4 border border-border/10 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground/50 font-semibold text-label mb-1">Verify Entry</span>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-xl font-semibold tracking-tighter tabular-nums",
                                            parsedData.type === 'income' ? "text-emerald-600" : "text-foreground"
                                        )}>
                                            {formatCurrency(parsedData.amount)}
                                        </span>
                                        <span className="text-xs font-semibold text-muted-foreground italic truncate max-w-[140px]">
                                            "{parsedData.description}"
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-background/50 hover:bg-rose-500/10 hover:text-rose-500" onClick={() => setParsedData(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="default" className="h-10 w-10 rounded-full shadow-lg shadow-primary/20" onClick={confirmTransaction}>
                                        <Check className="h-4 w-4" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 bg-background/50 backdrop-blur-sm py-1.5 px-3 rounded-full w-fit border border-border/20">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-label">{parsedData.category}</span>
                                <ArrowRight className="h-3 w-3 opacity-30" />
                                <span className="italic text-label">{parsedData.wallet || preferredCashWallet?.name || 'Tunai'}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};



