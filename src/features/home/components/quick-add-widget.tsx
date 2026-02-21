import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PlusCircle, Send, Loader2, Check, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { extractTransaction, type SingleTransactionOutput } from '@/ai/flows/extract-transaction-flow';
import { useActions } from '@/providers/action-provider';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { getVisualDNA } from '@/lib/visual-dna';

export const QuickAddWidget = () => {
    const { setIsTxModalOpen, showToast } = useUI();
    const { addTransaction } = useActions();
    const { wallets } = useWallets();
    const router = useRouter();

    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedData, setParsedData] = useState<SingleTransactionOutput | null>(null);

    const handleQuickAdd = async () => {
        if (!inputValue.trim()) return;
        
        setIsAnalyzing(true);
        try {
            const result = await extractTransaction(inputValue);
            if (result.transactions && result.transactions.length > 0) {
                setParsedData(result.transactions[0]);
            } else if (result.clarificationQuestion) {
                showToast(result.clarificationQuestion, 'info');
            }
        } catch (error) {
            showToast('Gagal menganalisis transaksi', 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const confirmTransaction = async () => {
        if (!parsedData) return;

        try {
            // Find wallet ID by name or use default
            const wallet = wallets.find(w => w.name.toLowerCase() === parsedData.wallet.toLowerCase()) || wallets.find(w => w.isDefault) || wallets[0];
            
            await addTransaction({
                amount: parsedData.amount,
                description: parsedData.description,
                category: parsedData.category,
                walletId: wallet?.id || '',
                date: new Date(parsedData.date).toISOString(),
                type: parsedData.type as 'income' | 'expense'
            });

            showToast('Transaksi berhasil dicatat!', 'success');
            setParsedData(null);
            setInputValue('');
        } catch (error) {
            showToast('Gagal menyimpan transaksi', 'error');
        }
    };

    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-card rounded-[32px] overflow-hidden relative">
            {/* Ambient Accent */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] -rotate-12 pointer-events-none">
                <Sparkles className="h-20 w-20" />
            </div>

            <CardHeader className="pb-3 flex flex-row items-center justify-between px-6 pt-6 relative z-10">
                <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-muted-foreground/60 uppercase tracking-[0.2em]">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    Intelligence Input
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full"
                    onClick={() => setIsTxModalOpen(true)}
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
                                className="pr-12 h-12 bg-muted/30 border-none rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner transition-all"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                                disabled={isAnalyzing}
                            />
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className={cn(
                                    "absolute right-1.5 top-1.5 h-9 w-9 rounded-xl transition-all",
                                    inputValue.trim() ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground/40"
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
                            className="bg-muted/30 rounded-2xl p-4 border border-border/10 shadow-inner relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest mb-1">Verify Entry</span>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-xl font-bold tracking-tighter tabular-nums",
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
                                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-background/50 hover:bg-rose-500/10 hover:text-rose-500 shadow-sm" onClick={() => setParsedData(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="default" className="h-10 w-10 rounded-full shadow-lg shadow-primary/20" onClick={confirmTransaction}>
                                        <Check className="h-4 w-4" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/60 bg-background/50 backdrop-blur-sm py-1.5 px-3 rounded-full w-fit border border-border/20 shadow-sm">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{parsedData.category}</span>
                                <ArrowRight className="h-3 w-3 opacity-30" />
                                <span className="italic uppercase tracking-widest">{parsedData.wallet}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
    );
};

