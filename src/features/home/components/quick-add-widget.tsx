import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PlusCircle, Send, Loader2, Check, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { useApp } from '@/providers/app-provider';
import { useData } from '@/hooks/use-data';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickAddWidget = () => {
    const { setIsTxModalOpen, showToast } = useUI();
    const { addTransaction } = useApp();
    const { wallets } = useData();
    const router = useRouter();

    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedData, setParsedData] = useState<any>(null);

    const handleQuickAdd = async () => {
        if (!inputValue.trim()) return;
        
        setIsAnalyzing(true);
        try {
            const result = await extractTransaction(inputValue);
            setParsedData(result);
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
        <Card className="border-none shadow-sm bg-gradient-to-br from-card to-secondary/5 overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Input Cepat AI
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] font-medium tracking-wide text-muted-foreground"
                    onClick={() => setIsTxModalOpen(true)}
                >
                    Manual <PlusCircle className="ml-1 h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                <AnimatePresence mode="wait">
                    {!parsedData ? (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative"
                        >
                            <Input 
                                placeholder="Contoh: 'kopi 25rb' atau 'gaji 5jt'" 
                                className="pr-12 h-11 bg-background/50 border-primary/10 focus-visible:ring-primary/20"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                                disabled={isAnalyzing}
                            />
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="absolute right-1 top-1 h-9 w-9 text-primary"
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
                            className="bg-primary/5 rounded-xl p-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Konfirmasi</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-lg font-bold",
                                            parsedData.type === 'income' ? "text-emerald-600" : "text-foreground"
                                        )}>
                                            {formatCurrency(parsedData.amount)}
                                        </span>
                                        <span className="text-sm font-medium text-muted-foreground truncate max-w-[120px]">
                                            {parsedData.description}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setParsedData(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="default" className="h-8 w-8 rounded-full shadow-lg shadow-primary/20" onClick={confirmTransaction}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-background/50 py-1 px-2 rounded-lg w-fit">
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">{parsedData.category}</span>
                                <ArrowRight className="h-2 w-2" />
                                <span className="font-medium italic">{parsedData.wallet}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
