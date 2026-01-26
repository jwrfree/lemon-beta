'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, LoaderCircle, Mic, X, Check, Pencil, Save, Keyboard, Wallet, ArrowRight, TrendingDown, ChevronLeft, AlertTriangle, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, compressImageFile, getDataUrlSizeInBytes } from '@/lib/utils';
import Image from 'next/image';
import { TransactionForm } from '@/features/transactions/components/transaction-form';
import { useUI } from '@/components/ui-provider';
import { useSmartAddFlow } from '@/features/transactions/hooks/use-smart-add-flow';
import { PageHeader } from '@/components/page-header';
import { saveAICorrection } from '@/lib/feedback-service';
import { DynamicSuggestions } from './dynamic-suggestions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CategoryGrid } from '@/features/transactions/components/category-grid';
import { categories } from '@/lib/categories';
import { SuccessAnimation } from '@/components/success-animation';

const textLoadingMessages = ["Menganalisis teks...", "Mengidentifikasi detail...", "Memilih kategori...", "Hampir selesai..."];
const imageLoadingMessages = ["Membaca struk...", "Mengekstrak total & merchant...", "Menebak kategori belanja...", "Menyiapkan hasil..."];



const SpeechRecognition = (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
const MAX_COMPRESSED_IMAGE_BYTES = 1024 * 1024;

export default function SmartAddPage() {
    const router = useRouter();
    const { showToast } = useUI();
    const { getCategoryVisuals } = useData();
    const { 
        pageState, 
        setPageState, 
        messages, 
        parsedData, 
        setParsedData, 
        multiParsedData, 
        removeMultiTransaction,
        insightData, 
        processInput, 
        saveTransaction, 
        saveMultiTransactions, 
        resetFlow 
    } = useSmartAddFlow();

    const [inputValue, setInputValue] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isVoiceInputMode, setIsVoiceInputMode] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef('');
    const originalCategoryRef = useRef<string | null>(null);

    // Haptic feedback utility
    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, []);

    // Auto-focus on mount
    useEffect(() => {
        if (pageState === 'IDLE' && !isVoiceInputMode) {
            textareaRef.current?.focus();
        }
    }, [pageState, isVoiceInputMode]);

    const handleConfirmSave = useCallback(async (andAddAnother = false) => {
        vibrate(50); // Medium haptic for save start
        const success = await saveTransaction(andAddAnother);
        if (success) {
            setShowSuccess(true);
            vibrate([80, 50, 80]); // "Heavy-Light-Heavy" for success satisfaction
            
            // Wait for animation
            setTimeout(() => {
                setShowSuccess(false);
                if (!andAddAnother) {
                    router.back();
                } else {
                    setInputValue('');
                    textareaRef.current?.focus();
                }
            }, 1200);
        }
    }, [saveTransaction, router, vibrate]);

    const handleMultiConfirmSave = useCallback(async () => {
        vibrate(50);
        const success = await saveMultiTransactions();
        if (success) {
            setShowSuccess(true);
            vibrate([80, 50, 80]);
            setTimeout(() => {
                setShowSuccess(false);
                router.back();
            }, 1200);
        }
    }, [saveMultiTransactions, router, vibrate]);

    useEffect(() => {
        if (pageState === 'ANALYZING') {
            vibrate(30); // Light haptic when starting analysis
            const loadingMsgs = messages.some(m => m.type === 'user-image') ? imageLoadingMessages : textLoadingMessages;
            let i = 0;
            setLoadingMessage(loadingMsgs[i]);
            const interval = setInterval(() => {
                i = (i + 1) % loadingMsgs.length;
                setLoadingMessage(loadingMsgs[i]);
            }, 1500);
            return () => clearInterval(interval);
        }
        
        if (pageState === 'CONFIRMING' || pageState === 'MULTI_CONFIRMING') {
            vibrate([20, 30, 20]); // Light double tap when analysis finishes
        }
    }, [pageState, messages, vibrate]);

    useEffect(() => {
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'id-ID';
        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' ';
            }
            finalTranscriptRef.current += transcript;
            setInputValue(finalTranscriptRef.current);
        };
        recognition.onerror = () => { showToast("Oops! Terjadi error pada input suara.", 'error'); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
    }, [showToast]);

    const toggleListening = () => {
        if (!SpeechRecognition) { showToast("Browser tidak mendukung input suara.", 'error'); return; }
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
        else { setInputValue(''); finalTranscriptRef.current = ''; recognitionRef.current?.start(); setIsListening(true); }
    };

    const handleUndoVoice = () => {
        setInputValue(prev => {
            const words = prev.trim().split(' ');
            if (words.length <= 1) return '';
            words.pop();
            return words.join(' ') + ' ';
        });
        finalTranscriptRef.current = finalTranscriptRef.current.trim().split(' ').slice(0, -1).join(' ') + ' ';
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('Pilih foto struk ya.', 'error'); return; }
        try {
            const compressedDataUrl = await compressImageFile(file, { maxDimension: 1280, quality: 0.8 });
            if (getDataUrlSizeInBytes(compressedDataUrl) > MAX_COMPRESSED_IMAGE_BYTES) {
                showToast('Gambar terlalu besar (>1 MB).', 'error');
                return;
            }
            processInput({ type: 'image', dataUrl: compressedDataUrl });
        } catch (error) { showToast('Gagal memproses gambar.', 'error'); }
        finally { e.target.value = ''; }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                if (pageState === 'CONFIRMING') {
                    handleConfirmSave(false);
                } else if (pageState === 'MULTI_CONFIRMING') {
                    handleMultiConfirmSave();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageState, handleConfirmSave, handleMultiConfirmSave]);

    if (pageState === 'EDITING' && parsedData) {
        return <TransactionForm isModal={false} initialData={parsedData} onClose={(data) => { if (data) setParsedData((prev: any) => ({ ...prev, ...data })); setPageState('CONFIRMING'); }} />;
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader 
                title="Catat Cepat"
                backIcon={pageState === 'IDLE' ? ChevronLeft : X}
                onBackClick={() => pageState === 'IDLE' ? router.back() : resetFlow()}
            />

            {isVoiceInputMode ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                        <p className="text-muted-foreground mb-4">Mendengarkan...</p>
                        <div className="relative h-24 w-24 flex items-center justify-center">
                            <motion.div className="absolute inset-0 bg-primary/20 rounded-full" animate={{ scale: isListening ? [1, 1.2, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }} />
                            <Mic className="h-10 w-10 text-primary" />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p 
                                key={inputValue}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="mt-4 min-h-6 text-lg font-medium"
                            >
                                {inputValue || "Silakan bicara..."}
                            </motion.p>
                        </AnimatePresence>
                    </motion.div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4">
                        <Button size="icon" variant="ghost" className="h-11 w-11" onClick={() => { setIsVoiceInputMode(false); toggleListening(); }}><Keyboard className="h-6 w-6" /></Button>
                        {inputValue && (
                            <Button size="icon" variant="ghost" className="h-11 w-11 text-muted-foreground hover:text-destructive" onClick={handleUndoVoice}>
                                <RotateCcw className="h-6 w-6" />
                            </Button>
                        )}
                        <Button size="lg" className="flex-1" onClick={() => { toggleListening(); processInput(inputValue); }}><Check className="mr-2 h-5 w-5" /> Kirim</Button>
                    </div>
                </div>
            ) : (
                <>
                    <main className="flex-1 flex flex-col justify-end overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && pageState === 'IDLE' && (
                                <DynamicSuggestions 
                                    onSuggestionClick={(text) => {
                                        setInputValue(text);
                                        processInput(text);
                                    }} 
                                />
                            )}
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div key={msg.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
                                        {msg.type === 'user' && <div className="flex justify-end"><div className="p-3 bg-primary text-primary-foreground rounded-2xl">{msg.content}</div></div>}
                                        {msg.type === 'user-image' && <div className="flex justify-end"><Card className="p-2 bg-primary max-w-xs"><Image src={msg.content} alt="Receipt" width={200} height={300} className="rounded-md" /></Card></div>}
                                        {msg.type === 'ai-thinking' && (
                                            <div className="flex justify-start">
                                                <div className="p-3 bg-card rounded-2xl flex items-center gap-2.5 shadow-sm border border-border/50">
                                                    <div className="relative flex items-center justify-center">
                                                        <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                                        <motion.div 
                                                            className="absolute inset-0 bg-primary/20 rounded-full"
                                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                        />
                                                    </div>
                                                    <AnimatePresence mode="wait">
                                                        <motion.span 
                                                            key={loadingMessage} 
                                                            initial={{ opacity: 0, x: 5, filter: "blur(4px)" }} 
                                                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} 
                                                            exit={{ opacity: 0, x: -5, filter: "blur(4px)" }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="text-sm font-medium text-muted-foreground"
                                                        >
                                                            {loadingMessage}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {pageState === 'CONFIRMING' && parsedData && (
                                    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <div className="flex justify-start">
                                            <div className="p-3 bg-card rounded-2xl shadow-sm border border-border/50 relative overflow-hidden group">
                                                {/* Category Background Accent */}
                                                <div 
                                                    className="absolute top-0 left-0 w-1 h-full opacity-60" 
                                                    style={{ backgroundColor: getCategoryVisuals(parsedData.category).color }}
                                                />
                                                
                                                <div className="flex items-start gap-3">
                                                    <div 
                                                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                                        style={{ 
                                                            backgroundColor: `${getCategoryVisuals(parsedData.category).color}15`,
                                                            color: getCategoryVisuals(parsedData.category).color
                                                        }}
                                                    >
                                                        {React.createElement(getCategoryVisuals(parsedData.category).icon, { size: 20 })}
                                                    </div>
                                                    
                                                    <div className="flex flex-col">
                                                        <p className="text-sm leading-relaxed text-foreground">
                                                            Oke, catat <span className="font-bold">{parsedData.description}</span> sebesar <span className="font-bold text-primary">{formatCurrency(parsedData.amount)}</span>?
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <button 
                                                                        type="button"
                                                                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform hover:opacity-80"
                                                                        style={{ 
                                                                            backgroundColor: `${getCategoryVisuals(parsedData.category).color}15`,
                                                                            color: getCategoryVisuals(parsedData.category).color,
                                                                            border: `1px solid ${getCategoryVisuals(parsedData.category).color}30`
                                                                        }}
                                                                    >
                                                                        {React.createElement(getCategoryVisuals(parsedData.category).icon, { size: 10 })}
                                                                        {parsedData.category}
                                                                        <Pencil className="h-2 w-2 ml-1 opacity-50" />
                                                                    </button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-80 p-2" align="start">
                                                                    <div className="max-h-[300px] overflow-y-auto">
                                                                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Ganti Kategori Cepat</p>
                                                                        <CategoryGrid 
                                                                            categories={parsedData.type === 'income' ? categories.income : categories.expense}
                                                                            selectedCategory={parsedData.category}
                                                                            onCategorySelect={(cat) => {
                                                                                setParsedData(prev => prev ? ({ ...prev, category: cat.name }) : null);
                                                                                // Close popover logic is handled by standard Popover behavior usually, 
                                                                                // but we might need a controlled state if we want to force close. 
                                                                                // For now, let's rely on the user clicking away or re-clicking trigger if default behavior isn't enough,
                                                                                // or add a simple click handler.
                                                                                // Actually shadcn/radix Popover usually requires a click outside to close if not controlled.
                                                                                // Ideally we'd use an open state, but let's keep it simple first.
                                                                                // To auto-close, we simulate a click on the body or use a ref.
                                                                                // Let's just update the data for now.
                                                                                document.body.click(); // Hacky close
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {parsedData.isDebtPayment && (
                                            <div className="flex justify-start">
                                                <div className="p-2 px-3 bg-orange-500/10 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1.5 border border-orange-500/20">
                                                    <TrendingDown className="h-3.5 w-3.5" />
                                                    Pembayaran hutang: {parsedData.counterparty || 'Tidak diketahui'}
                                                </div>
                                            </div>
                                        )}
                                        {insightData && (
                                            <div className="space-y-3">
                                                {insightData.wallet?.isInsufficient && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.9 }} 
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex justify-start"
                                                    >
                                                        <div className="p-3 bg-destructive/10 text-destructive rounded-2xl text-xs font-medium border border-destructive/20 flex flex-col gap-1 max-w-[85%]">
                                                            <div className="flex items-center gap-1.5">
                                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                                <span className="font-bold">Saldo Tidak Cukup!</span>
                                                            </div>
                                                            <p className="opacity-90">
                                                                Saldo {insightData.wallet.name} kamu akan menjadi minus ({formatCurrency(insightData.wallet.newBalance)}). Tetap catat atau koreksi dompetnya?
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <Card className={cn(
                                                    "p-4 border-primary/20 transition-colors",
                                                    insightData.wallet?.isInsufficient ? "bg-destructive/5 border-destructive/20" : "bg-primary/5"
                                                )}>
                                                    <CardContent className="p-0 space-y-3">
                                                        {insightData.wallet && (
                                                            <div className="flex items-center text-sm">
                                                                <Wallet className={cn("h-5 w-5 mr-3", insightData.wallet.isInsufficient ? "text-destructive" : "text-primary")} />
                                                                <div className="flex flex-col">
                                                                    <span className="text-muted-foreground">Saldo {insightData.wallet.name}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold line-through text-muted-foreground/80">{formatCurrency(insightData.wallet.currentBalance)}</span>
                                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                        <span className={cn("font-semibold", insightData.wallet.isInsufficient ? "text-destructive" : "text-foreground")}>
                                                                            {formatCurrency(insightData.wallet.newBalance)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {insightData.budget && (
                                                            <div className="flex items-center text-sm">
                                                                <TrendingDown className={cn("h-5 w-5 mr-3", insightData.budget.isOverBudget ? "text-destructive" : "text-primary")} />
                                                                <div className="flex flex-col">
                                                                    <span className="text-muted-foreground">Sisa budget &apos;{insightData.budget.name}&apos;</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold line-through text-muted-foreground/80">{formatCurrency(insightData.budget.currentRemaining)}</span>
                                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                        <span className={cn("font-semibold", insightData.budget.isOverBudget ? "text-destructive" : "text-foreground")}>
                                                                            {formatCurrency(insightData.budget.newRemaining)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {pageState === 'MULTI_CONFIRMING' && multiParsedData.length > 0 && (
                                    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <div className="flex justify-start"><div className="p-3 bg-card rounded-2xl">Wah, saya menemukan <span className="font-bold">{multiParsedData.length} transaksi</span> sekaligus!</div></div>
                                        <div className="space-y-2">
                                            {multiParsedData.map((tx, idx) => (
                                                <div key={idx} className="bg-card border rounded-xl p-3 flex justify-between items-center shadow-sm group relative overflow-hidden">
                                                    <div 
                                                        className="absolute top-0 left-0 w-1 h-full opacity-60" 
                                                        style={{ backgroundColor: getCategoryVisuals(tx.category).color }}
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                                            style={{ 
                                                                backgroundColor: `${getCategoryVisuals(tx.category).color}15`,
                                                                color: getCategoryVisuals(tx.category).color
                                                            }}
                                                        >
                                                            {React.createElement(getCategoryVisuals(tx.category).icon, { size: 18 })}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-foreground">{tx.description}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                                {tx.category} • {tx.walletId ? 'Dompet Terpilih' : 'Pilih Dompet'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn("font-bold text-sm", tx.type === 'expense' ? "text-destructive" : "text-emerald-600")}>
                                                            {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                        </span>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                                                            onClick={() => removeMultiTransaction(idx)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </main>
                    <footer className="p-4 border-t bg-background">
                        <AnimatePresence mode="wait">
                            {pageState === 'CONFIRMING' ? (
                                <motion.div 
                                    key="confirming-actions" 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -20 }} 
                                    className="flex flex-col gap-3"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button 
                                            variant="outline" 
                                            className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary" 
                                            onClick={() => setPageState('EDITING')}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Koreksi
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary" 
                                            onClick={() => handleConfirmSave(true)}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Simpan & Lagi
                                        </Button>
                                    </div>
                                    <Button 
                                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" 
                                        size="lg" 
                                        onClick={() => handleConfirmSave(false)}
                                    >
                                        <Check className="mr-2 h-6 w-6" />
                                        Iya, Simpan Sekarang
                                    </Button>
                                </motion.div>
                            ) : pageState === 'MULTI_CONFIRMING' ? (
                                <motion.div 
                                    key="multi-confirming-actions" 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -20 }} 
                                    className="flex flex-col gap-3"
                                >
                                    <Button 
                                        variant="outline" 
                                        className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary" 
                                        onClick={() => resetFlow()}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Batalkan Semua
                                    </Button>
                                    <Button 
                                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" 
                                        size="lg" 
                                        onClick={() => handleMultiConfirmSave()}
                                    >
                                        <Check className="mr-2 h-6 w-6" />
                                        Simpan {multiParsedData.length} Transaksi
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="idle-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <div className="flex items-center gap-2 w-full p-1 border rounded-full bg-card h-14">
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" aria-label="Upload receipt image" />
                                        <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0 rounded-full bg-muted" onClick={() => fileInputRef.current?.click()} aria-label="Attach file"><Paperclip className="h-5 w-5" /></Button>
                                        <Textarea ref={textareaRef} placeholder="Ketik atau rekam suara..." className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium placeholder:text-primary resize-none min-h-0 !p-0" minRows={1} maxRows={5} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processInput(inputValue); setInputValue(''); } }} disabled={pageState !== 'IDLE'} aria-label="Transaction description input" inputMode="text" autoCapitalize="sentences" autoComplete="off" spellCheck="false" />
                                        <div className="flex items-center">
                                            <AnimatePresence>
                                                {pageState === 'ANALYZING' ? <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground mx-3" /> : (
                                                    <motion.div key="actions" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center">
                                                        {!inputValue && <Button size="icon" variant="ghost" className="h-11 w-11 rounded-full bg-muted" onClick={() => { setIsVoiceInputMode(true); toggleListening(); }}><Mic className="h-5 w-5" /></Button>}
                                                        {inputValue && <Button size="icon" variant="default" className="h-11 w-11 rounded-full" onClick={() => processInput(inputValue)}><Send className="h-5 w-5" /></Button>}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </footer>
                </>
            )}
            {showSuccess && <SuccessAnimation />}
        </div>
    );
}