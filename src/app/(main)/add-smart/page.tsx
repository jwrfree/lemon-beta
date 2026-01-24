'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, LoaderCircle, Mic, X, Check, Pencil, Save, Sparkles, Keyboard, Wallet, ArrowRight, TrendingDown, ChevronLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency, compressImageFile, getDataUrlSizeInBytes } from '@/lib/utils';
import Image from 'next/image';
import { TransactionForm } from '@/features/transactions/components/transaction-form';
import { useUI } from '@/components/ui-provider';
import { useSmartAddFlow, PageState, Message, InsightData } from '@/features/transactions/hooks/use-smart-add-flow';

const textLoadingMessages = ["Menganalisis teks...", "Mengidentifikasi detail...", "Memilih kategori...", "Hampir selesai..."];
const imageLoadingMessages = ["Membaca struk...", "Mengekstrak total & merchant...", "Menebak kategori belanja...", "Menyiapkan hasil..."];

const WelcomePlaceholder = () => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 animate-in fade-in duration-500">
        <div className="p-3 bg-primary/10 rounded-lg mb-4"><Sparkles className="h-10 w-10 text-primary" strokeWidth={1.5} /></div>
        <h2 className="text-lg font-semibold text-foreground">Catat Cepat dengan AI</h2>
        <p className="mt-1 max-w-xs">Ketik transaksi seperti &quot;beli kopi 25rb&quot;, rekam suara, atau pindai struk untuk memulai.</p>
    </div>
);

const SpeechRecognition = (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
const MAX_COMPRESSED_IMAGE_BYTES = 1024 * 1024;

export default function SmartAddPage() {
    const router = useRouter();
    const { showToast } = useUI();
    const { pageState, setPageState, messages, parsedData, setParsedData, insightData, processInput, saveTransaction, resetFlow } = useSmartAddFlow();

    const [inputValue, setInputValue] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isVoiceInputMode, setIsVoiceInputMode] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef('');

    const handleConfirmSave = async (andAddAnother = false) => {
        const success = await saveTransaction(andAddAnother);
        if (success && !andAddAnother) router.back();
        if (success && andAddAnother) setInputValue('');
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

    if (pageState === 'EDITING' && parsedData) {
        return <TransactionForm isModal={false} initialData={parsedData} onClose={(data) => { if (data) setParsedData((prev: any) => ({ ...prev, ...data })); setPageState('CONFIRMING'); }} />;
    }

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="absolute left-4 md:hidden" onClick={() => pageState === 'IDLE' ? router.back() : resetFlow()}>
                    {pageState === 'IDLE' ? <ChevronLeft className="h-6 w-6" strokeWidth={1.75} /> : <X className="h-6 w-6" strokeWidth={1.75} />}
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Catat Cepat</h1>
            </header>

            {isVoiceInputMode ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                        <p className="text-muted-foreground mb-4">Mendengarkan...</p>
                        <div className="relative h-24 w-24 flex items-center justify-center">
                            <motion.div className="absolute inset-0 bg-primary/20 rounded-full" animate={{ scale: isListening ? [1, 1.2, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }} />
                            <Mic className="h-10 w-10 text-primary" />
                        </div>
                        <p className="mt-4 min-h-6 text-lg font-medium">{inputValue}</p>
                    </motion.div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4">
                        <Button size="icon" variant="ghost" className="h-11 w-11" onClick={() => { setIsVoiceInputMode(false); toggleListening(); }}><Keyboard className="h-6 w-6" /></Button>
                        <Button size="lg" className="flex-1" onClick={() => { toggleListening(); processInput(inputValue); }}><Check className="mr-2 h-5 w-5" /> Kirim</Button>
                    </div>
                </div>
            ) : (
                <>
                    <main className="flex-1 flex flex-col justify-end overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && pageState === 'IDLE' && <WelcomePlaceholder />}
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div key={msg.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
                                        {msg.type === 'user' && <div className="flex justify-end"><div className="p-3 bg-primary text-primary-foreground rounded-2xl">{msg.content}</div></div>}
                                        {msg.type === 'user-image' && <div className="flex justify-end"><Card className="p-2 bg-primary max-w-xs"><Image src={msg.content} alt="Receipt" width={200} height={300} className="rounded-md" /></Card></div>}
                                        {msg.type === 'ai-thinking' && <div className="flex justify-start"><div className="p-3 bg-card rounded-2xl flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /><AnimatePresence mode="wait"><motion.span key={loadingMessage} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>{loadingMessage}</motion.span></AnimatePresence></div></div>}
                                    </motion.div>
                                ))}
                                {pageState === 'CONFIRMING' && parsedData && (
                                    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                        <div className="flex justify-start"><div className="p-3 bg-card rounded-2xl">Oke, catat <span className="font-bold">{parsedData.description}</span> sebesar <span className="font-bold">{formatCurrency(parsedData.amount)}</span>?</div></div>
                                        {insightData && (
                                            <Card className="p-4 bg-primary/5 border-primary/20">
                                                <CardContent className="p-0 space-y-3">
                                                    {insightData.wallet && <div className="flex items-center text-sm"><Wallet className="h-5 w-5 text-primary mr-3" /><div className="flex flex-col"><span className="text-muted-foreground">Saldo dompet</span><div className="flex items-center gap-2"><span className="font-semibold line-through text-muted-foreground/80">{formatCurrency(insightData.wallet.currentBalance)}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className="font-semibold text-foreground">{formatCurrency(insightData.wallet.newBalance)}</span></div></div></div>}
                                                    {insightData.budget && <div className="flex items-center text-sm"><TrendingDown className="h-5 w-5 text-primary mr-3" /><div className="flex flex-col"><span className="text-muted-foreground">Sisa budget &apos;{insightData.budget.name}&apos;</span><div className="flex items-center gap-2"><span className="font-semibold line-through text-muted-foreground/80">{formatCurrency(insightData.budget.currentRemaining)}</span><ArrowRight className="h-3 w-3 text-muted-foreground" /><span className={cn("font-semibold", insightData.budget.newRemaining < 0 ? "text-destructive" : "text-foreground")}>{formatCurrency(insightData.budget.newRemaining)}</span></div></div></div>}
                                                </CardContent>
                                            </Card>
                                        )}
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
                            ) : (
                                <motion.div key="idle-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <div className="flex items-center gap-2 w-full p-1 border rounded-full bg-card h-14">
                                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" aria-label="Upload receipt image" />
                                        <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0 rounded-full bg-muted" onClick={() => fileInputRef.current?.click()} aria-label="Attach file"><Paperclip className="h-5 w-5" /></Button>
                                        <Textarea placeholder="Ketik atau rekam suara..." className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium placeholder:text-primary resize-none min-h-0 !p-0" minRows={1} maxRows={5} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processInput(inputValue); } }} disabled={pageState !== 'IDLE'} aria-label="Transaction description input" />
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
        </div>
    );
}