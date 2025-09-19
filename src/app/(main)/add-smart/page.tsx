
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Camera, Send, LoaderCircle, Mic, X, Check, Pencil, Save, Sparkles, Keyboard, Wallet, ShieldAlert, ArrowRight, TrendingDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';
import Image from 'next/image';
import { TransactionForm } from '@/components/transaction-form';
import { startOfMonth, parseISO } from 'date-fns';

type PageState = 'IDLE' | 'ANALYZING' | 'CONFIRMING' | 'EDITING';

type Message = {
    id: string;
    type: 'user' | 'user-image' | 'ai-thinking' | 'ai-confirmation';
    content: any;
};

type InsightData = {
    wallet: {
        currentBalance: number;
        newBalance: number;
    } | null;
    budget: {
        name: string;
        currentRemaining: number;
        newRemaining: number;
    } | null;
}

const textLoadingMessages = [
    "Menganalisis teks...",
    "Mengidentifikasi detail...",
    "Memilih kategori...",
    "Hampir selesai...",
];

const imageLoadingMessages = [
    "Membaca struk...",
    "Mengekstrak total & merchant...",
    "Menebak kategori belanja...",
    "Menyiapkan hasil...",
];

const WelcomePlaceholder = () => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 animate-in fade-in duration-500">
        <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Catat Cepat dengan AI</h2>
        <p className="mt-1 max-w-xs">
            Ketik transaksi seperti "beli kopi 25rb", rekam suara, atau pindai struk untuk memulai.
        </p>
    </div>
);


const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export default function SmartAddPage() {
    const router = useRouter();
    const {
        addTransaction,
        wallets,
        budgets,
        transactions,
        expenseCategories,
        incomeCategories,
        setIsTransferModalOpen,
        setPreFilledTransfer,
    } = useApp();

    const [pageState, setPageState] = useState<PageState>('IDLE');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [parsedData, setParsedData] = useState<any | null>(null);
    const [insightData, setInsightData] = useState<InsightData | null>(null);


    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef('');
    
    const [isVoiceInputMode, setIsVoiceInputMode] = useState(false);


    const availableCategories = [...expenseCategories.map(c => c.name), ...incomeCategories.map(c => c.name)];
    const availableWallets = wallets.map(w => w.name);

    const resetFlow = (keepInput = false) => {
        setPageState('IDLE');
        setParsedData(null);
        setInsightData(null);
        setMessages([]);
        if (!keepInput) {
            setInputValue('');
            finalTranscriptRef.current = '';
        }
    };
    
    const handleAISuccess = (result: any, isReceipt = false) => {
        // Check for smart transfer
        if (result.category === 'Transfer' && result.sourceWallet && result.destinationWallet) {
            const fromWallet = wallets.find(w => w.name.toLowerCase() === result.sourceWallet?.toLowerCase());
            const toWallet = wallets.find(w => w.name.toLowerCase() === result.destinationWallet?.toLowerCase());

            if (fromWallet && toWallet) {
                setPreFilledTransfer({
                    fromWalletId: fromWallet.id,
                    toWalletId: toWallet.id,
                    amount: result.amount || 0,
                    description: result.description || 'Transfer',
                });
                setIsTransferModalOpen(true);
                resetFlow();
                return;
            }
        }
        
        const matchingWallet = wallets.find(w => w.name.toLowerCase() === ((result.wallet || (result.sourceWallet && result.sourceWallet.toLowerCase())) || '').toLowerCase());
        const walletId = matchingWallet?.id || wallets.find(w=>w.name.toLowerCase() === "tunai")?.id || wallets.find(w=>w.isDefault)?.id || '';
        
        const dataToConfirm = {
            type: result.amount > 0 ? (incomeCategories.some(c => c.name === result.category) ? 'income' : 'expense') : 'expense',
            amount: Math.abs(result.amount || 0),
            description: result.description || (isReceipt ? 'Transaksi dari struk' : 'Transaksi baru'),
            category: result.category || '',
            walletId: walletId,
            location: result.location || result.merchant || '',
            date: result.date ? new Date(result.date).toISOString() : new Date().toISOString(),
        };

        // --- Calculate Insights ---
        const finalWallet = wallets.find(w => w.id === walletId);
        let walletInsight = null;
        if(finalWallet) {
            walletInsight = {
                currentBalance: finalWallet.balance,
                newBalance: dataToConfirm.type === 'expense' ? finalWallet.balance - dataToConfirm.amount : finalWallet.balance + dataToConfirm.amount
            };
        }

        let budgetInsight = null;
        if(dataToConfirm.type === 'expense') {
            const relevantBudget = budgets.find(b => b.categories.includes(dataToConfirm.category));
            if(relevantBudget) {
                 const now = new Date();
                const start = startOfMonth(now);
                const budgetTransactions = transactions.filter(t => 
                    t.type === 'expense' && 
                    relevantBudget.categories.includes(t.category) &&
                    parseISO(t.date) >= start
                );
                const spent = budgetTransactions.reduce((acc, t) => acc + t.amount, 0);
                const currentRemaining = relevantBudget.targetAmount - spent;

                budgetInsight = {
                    name: relevantBudget.name,
                    currentRemaining,
                    newRemaining: currentRemaining - dataToConfirm.amount,
                }
            }
        }

        setInsightData({ wallet: walletInsight, budget: budgetInsight });
        setParsedData(dataToConfirm);
        setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
        setPageState('CONFIRMING');
    };

    const handleAIFailure = (error: any, type: 'text' | 'image' = 'text') => {
        console.error(`AI ${type} processing failed:`, error);
        toast.error(`Oops! Gagal menganalisis ${type === 'image' ? 'struk' : 'teks'}. Coba lagi ya.`);
        resetFlow(true);
    };

    const processInput = async (input: string | { type: 'image', dataUrl: string }) => {
        setIsVoiceInputMode(false);
        if (typeof input === 'string') {
            if (!input.trim()) return;
            setInputValue(input);
            setMessages([{ id: `user-${Date.now()}`, type: 'user', content: input }]);
        } else {
            setMessages([{ id: `user-image-${Date.now()}`, type: 'user-image', content: input.dataUrl }]);
        }
        
        setPageState('ANALYZING');
        setMessages(prev => [...prev, { id: `ai-thinking-${Date.now()}`, type: 'ai-thinking', content: '' }]);

        try {
            if (typeof input === 'string') {
                const result = await extractTransaction({ text: input, availableCategories, availableWallets });
                handleAISuccess(result);
            } else {
                const result = await scanReceipt({ photoDataUri: input.dataUrl, availableCategories });
                handleAISuccess(result, true);
            }
        } catch (error) {
            handleAIFailure(error, typeof input === 'object' ? 'image' : 'text');
        }
    };
    
    useEffect(() => {
        if (pageState === 'ANALYZING') {
            const loadingMsgs = messages.some(m => m.type === 'user-image') ? imageLoadingMessages : textLoadingMessages;
            let i = 0;
            setLoadingMessage(loadingMsgs[i]);
            const interval = setInterval(() => {
                i = (i + 1) % loadingMsgs.length;
                setLoadingMessage(loadingMsgs[i]);
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [pageState, messages]);

    useEffect(() => {
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' ';
            }
            finalTranscriptRef.current += transcript;
            setInputValue(finalTranscriptRef.current);
        };
        recognition.onerror = (event) => {
            toast.error("Oops! Terjadi error pada input suara.");
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
    }, []);

    const toggleListening = () => {
        if (!SpeechRecognition) { toast.error("Browser tidak mendukung input suara."); return; }
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            if (inputValue.trim()) {
                // Let user confirm before sending
            }
        } else {
            setInputValue('');
            finalTranscriptRef.current = '';
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const imageDataUrl = loadEvent.target?.result as string;
            processInput({ type: 'image', dataUrl: imageDataUrl });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset file input
    };

    const handleSave = async (andAddAnother = false) => {
        if (!parsedData) return;
        setPageState('ANALYZING'); // Show loader while saving
        try {
            await addTransaction(parsedData);
            toast.success("Transaksi berhasil disimpan!");
            if (andAddAnother) {
                resetFlow();
            } else {
                router.back();
            }
        } catch (error) {
            console.error("Failed to save transaction:", error);
            toast.error("Gagal menyimpan transaksi.");
            setPageState('CONFIRMING');
        }
    };

    const handleCloseEdit = (updatedData: any | null) => {
        if (updatedData) {
            setParsedData(updatedData);
        }
        setPageState('CONFIRMING');
    }
    
    return (
        <div className="flex flex-col h-full bg-muted">
             <AnimatePresence>
                {pageState === 'EDITING' && parsedData && (
                    <TransactionForm 
                        isModal={false} 
                        initialData={parsedData} 
                        onClose={(data) => handleCloseEdit(data)}
                    />
                )}
            </AnimatePresence>
            <div className={cn("flex flex-col h-full", pageState === 'EDITING' && 'hidden')}>
                <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                     <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => pageState === 'IDLE' ? router.back() : resetFlow()}>
                        <X className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                    <h1 className="text-xl font-bold text-center w-full">Catat Cepat</h1>
                </header>

                {isVoiceInputMode ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                            <p className="text-muted-foreground mb-4">Mendengarkan...</p>
                            <div className="relative h-24 w-24 flex items-center justify-center">
                                 <motion.div 
                                    className="absolute inset-0 bg-primary/20 rounded-full"
                                    animate={{ 
                                        scale: isListening ? [1, 1.2, 1] : 1,
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <Mic className="h-10 w-10 text-primary" />
                            </div>
                            <p className="mt-4 min-h-6 text-lg font-medium">{inputValue}</p>
                        </motion.div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4">
                            <Button size="lg" variant="ghost" className="w-24" onClick={() => { setIsVoiceInputMode(false); toggleListening(); }}>
                                <Keyboard className="h-6 w-6" />
                            </Button>
                            <Button size="lg" className="w-24 rounded-full" onClick={() => { toggleListening(); processInput(inputValue); }}>
                                <Check className="h-6 w-6" />
                            </Button>
                             <Button size="lg" variant="ghost" className="w-24" onClick={() => setIsVoiceInputMode(false)}>
                                Batal
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <main className="flex-1 flex flex-col justify-end overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                 {messages.length === 0 && pageState === 'IDLE' && <WelcomePlaceholder />}
                                <AnimatePresence>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            {msg.type === 'user' && (
                                                <div className="flex justify-end">
                                                    <div className="p-3 bg-primary text-primary-foreground rounded-2xl">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}
                                            {msg.type === 'user-image' && (
                                                <div className="flex justify-end">
                                                    <Card className="p-2 bg-primary max-w-xs sm:max-w-sm">
                                                        <Image src={msg.content} alt="Receipt" width={200} height={300} className="rounded-md object-contain" />
                                                    </Card>
                                                </div>
                                            )}
                                            {msg.type === 'ai-thinking' && (
                                                <div className="flex justify-start">
                                                    <div className="p-3 bg-card rounded-2xl flex items-center gap-2">
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        <AnimatePresence mode="wait">
                                                            <motion.span key={loadingMessage} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                                                {loadingMessage}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {pageState === 'CONFIRMING' && parsedData && (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <div className="flex justify-start">
                                                 <div className="p-3 bg-card rounded-2xl">
                                                    Oke, aku catat <span className="font-bold">{parsedData.description}</span> sebesar <span className="font-bold">{formatCurrency(parsedData.amount)}</span>. Sudah benar?
                                                </div>
                                            </div>
                                             {insightData && (
                                                <Card className="p-4 bg-primary/5 border-primary/20">
                                                    <CardContent className="p-0 space-y-3">
                                                         {insightData.wallet && (
                                                            <div className="flex items-center text-sm">
                                                                <Wallet className="h-5 w-5 text-primary mr-3" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-muted-foreground">Saldo dompet</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold line-through text-muted-foreground/80">{formatCurrency(insightData.wallet.currentBalance)}</span>
                                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="font-semibold text-foreground">{formatCurrency(insightData.wallet.newBalance)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                         )}
                                                          {insightData.budget && (
                                                            <div className="flex items-center text-sm">
                                                                <TrendingDown className="h-5 w-5 text-primary mr-3" />
                                                                <div className="flex flex-col">
                                                                     <span className="text-muted-foreground">Sisa budget '{insightData.budget.name}'</span>
                                                                     <div className="flex items-center gap-2">
                                                                        <span className="font-semibold line-through text-muted-foreground/80">{formatCurrency(insightData.budget.currentRemaining)}</span>
                                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                        <span className={cn("font-semibold", insightData.budget.newRemaining < 0 ? "text-destructive" : "text-foreground")}>{formatCurrency(insightData.budget.newRemaining)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                         )}
                                                    </CardContent>
                                                </Card>
                                             )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </main>

                        <footer className="p-2 border-t bg-background">
                             <AnimatePresence mode="wait">
                                {pageState === 'CONFIRMING' ? (
                                     <motion.div
                                        key="confirming-actions"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20}}
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="flex gap-2">
                                            <Button className="flex-1" size="lg" onClick={() => handleSave(false)}>
                                                <Check className="mr-2 h-5 w-5" /> Iya, simpan
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => setPageState('EDITING')}>
                                                <Pencil className="h-5 w-5" />
                                            </Button>
                                        </div>
                                         <Button variant="ghost" size="sm" className="w-full" onClick={() => handleSave(true)}>
                                            <Save className="mr-2 h-4 w-4" /> Simpan & catat lagi
                                        </Button>
                                    </motion.div>
                                ) : (
                                     <motion.div
                                        key="idle-input"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20}}
                                        className="relative"
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                                        <Textarea
                                            placeholder="Ketik atau rekam suara..."
                                            className="pr-24 min-h-[48px] max-h-48"
                                            rows={1}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    processInput(inputValue);
                                                }
                                            }}
                                            disabled={pageState !== 'IDLE'}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                            {pageState === 'ANALYZING' ? (
                                                <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <>
                                                    <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                                                    <Button size="icon" variant="ghost" onClick={() => { setIsVoiceInputMode(true); toggleListening();}} className={cn(isListening && 'text-red-500')}><Mic className="h-5 w-5" /></Button>
                                                    {inputValue && (
                                                        <Button size="icon" variant="ghost" onClick={() => processInput(inputValue)}>
                                                            <Send className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}

    

    
