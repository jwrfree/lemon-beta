'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, Sparkles, Tag, MapPin, CornerDownRight, 
    Loader2, RotateCcw, Camera, CheckCircle2, ChevronLeft, ChevronRight
} from 'lucide-react';

import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { useUI } from '@/components/ui-provider';
import { triggerHaptic, cn, compressImageFile, getDataUrlSizeInBytes } from '@/lib/utils';
import { SuccessAnimation } from '@/components/success-animation';

// Liquid & Core Logic
import { HeroAmount } from '@/features/transactions/components/liquid-composer/HeroAmount';
import { MagicBar } from '@/features/transactions/components/liquid-composer/MagicBar';
import { useSmartAddFlow } from '@/features/transactions/hooks/use-smart-add-flow';
import { useTransactionForm } from '@/features/transactions/hooks/use-transaction-form';
import { DynamicSuggestions } from './dynamic-suggestions';

const MAX_COMPRESSED_IMAGE_BYTES = 1024 * 1024;

// --- Sub-component for Typing Effect ---
const TypewriterText = ({ text }: { text: string }) => {
    const letters = Array.from(text);
    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.02, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 5,
        },
    };

    return (
        <motion.span
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.span>
    );
};

export default function SmartAddPage() {
    const router = useRouter();
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const { showToast } = useUI();
    const [magicValue, setMagicValue] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Otak Multi-Transaction & OCR
    const {
        pageState,
        parsedData,
        multiParsedData,
        processInput,
        saveTransaction,
        saveMultiTransactions,
        resetFlow
    } = useSmartAddFlow();

    // AI Context
    const aiContext = useMemo(() => ({
        wallets: wallets.map(w => ({ id: w.id, name: w.name })),
        categories: [...expenseCategories, ...incomeCategories].map(c => c.name)
    }), [wallets, expenseCategories, incomeCategories]);

    // Hook untuk handle submission akhir
    const { isSubmitting } = useTransactionForm({ context: aiContext });

    const handleMagicSubmit = async () => {
        if (!magicValue) return;
        triggerHaptic('medium');
        await processInput(magicValue);
        setMagicValue('');
    };

    const handleConfirmSave = async () => {
        triggerHaptic('success');
        
        // 1. Jalankan proses simpan di background (Optimistic)
        const savePromise = multiParsedData.length > 0 ? saveMultiTransactions() : saveTransaction();
        
        // 2. Langsung tampilkan sukses & pindah halaman (Instant Feedback)
        setShowSuccess(true);
        
        // Timer lebih singkat untuk transisi yang terasa "snappy"
        setTimeout(() => {
            setShowSuccess(false);
            router.push('/home');
        }, 800); 

        // 3. Tangani hasil di background jika perlu
        savePromise.then((success) => {
            if (!success) showToast('Gagal sinkronisasi data.', 'error');
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('Pilih foto struk ya.', 'error'); return; }
        
        triggerHaptic('medium');
        try {
            const compressedDataUrl = await compressImageFile(file, { maxDimension: 1280, quality: 0.8 });
            if (getDataUrlSizeInBytes(compressedDataUrl) > MAX_COMPRESSED_IMAGE_BYTES) {
                showToast('Gambar terlalu besar (>1 MB).', 'error');
                return;
            }
            processInput({ type: 'image', dataUrl: compressedDataUrl });
        } catch { 
            showToast('Gagal memproses gambar.', 'error'); 
        } finally { 
            e.target.value = ''; 
        }
    };

    const activeTx = multiParsedData.length > 0 ? multiParsedData[focusedIndex] : parsedData;
    const isAnalyzing = pageState === 'ANALYZING';
    const hasData = !!activeTx || isAnalyzing;

    return (
        <div className="flex flex-col h-dvh bg-background relative overflow-hidden text-foreground">
            
            {/* 1. Compact Header */}
            <div className="p-4 md:p-6 flex justify-between items-center z-30 shrink-0">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="h-10 w-10 rounded-full bg-popover/80 backdrop-blur-md shadow-sm border border-border/50"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-2">
                    {pageState !== 'IDLE' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { triggerHaptic('light'); resetFlow(); setFocusedIndex(0); }}
                            className="h-10 w-10 rounded-full bg-popover/80 backdrop-blur-md shadow-sm border border-border/50"
                        >
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-popover/80 backdrop-blur-md shadow-sm border border-border/50">
                        <Sparkles className={cn("h-3.5 w-3.5 text-primary", isAnalyzing && "animate-pulse")} />
                        <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Smart Add</span>
                    </div>
                </div>
            </div>

            {/* 2. Liquid Stage (Flexible Spacing) */}
            <div className={cn(
                "flex-1 flex flex-col items-center relative z-10 transition-all duration-500",
                hasData ? "justify-start pt-2 md:pt-8" : "justify-center -mt-12"
            )}>
                <AnimatePresence mode="wait">
                    {pageState === 'IDLE' && !magicValue && (
                        <motion.div 
                            key="idle-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full overflow-y-auto no-scrollbar max-h-full pb-32"
                        >
                            <DynamicSuggestions onSuggestionClick={(text) => {
                                setMagicValue(text);
                                processInput(text);
                                setMagicValue('');
                            }} />
                        </motion.div>
                    )}

                    {hasData && (
                        <motion.div 
                            key="result-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center w-full px-6"
                        >
                            <HeroAmount 
                                amount={activeTx?.amount || 0} 
                                type={activeTx?.type || 'expense'} 
                                compact={true}
                            />

                            {/* Metadata Orbits */}
                            <div className="min-h-[120px] w-full flex flex-col items-center justify-center gap-4 mt-2">
                                <AnimatePresence mode="popLayout">
                                    {isAnalyzing ? (
                                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <Loader2 className="h-10 w-10 text-primary animate-spin" strokeWidth={1.5} />
                                                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                                            </div>
                                            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">Menganalisis...</p>
                                        </motion.div>
                                    ) : activeTx && (
                                        <motion.div key="tx-data" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 w-full">
                                            
                                            {/* Category & Sub */}
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                                                    <Tag className="h-3 w-3 fill-primary-foreground/20" />
                                                    <span className="text-[10px] font-medium uppercase tracking-[0.1em]">{activeTx.category}</span>
                                                </div>
                                                {activeTx.subCategory && (
                                                    <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                                        <CornerDownRight className="h-3 w-3 opacity-50" />
                                                        <span className="text-[10px] font-medium">{activeTx.subCategory}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Location & Description with Ghost Typing */}
                                            <div className="flex flex-col items-center gap-3 w-full">
                                                {activeTx.location && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground bg-card px-3 py-1 rounded-full border border-border shadow-sm">
                                                        <MapPin className="h-3 w-3 text-destructive" />
                                                        <span className="text-[9px] font-medium uppercase tracking-wider">{activeTx.location}</span>
                                                    </div>
                                                )}
                                                <div className="text-sm font-medium text-muted-foreground italic text-center max-w-[280px] min-h-[1.5em]">
                                                    <TypewriterText text={`"${activeTx.description}"`} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Bottom Control Center (Fixed & Compact) */}
            <div className="w-full max-w-md mx-auto px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10 relative z-20 space-y-4 shrink-0">
                
                {/* Magic Bar Zone */}
                <div className="relative">
                    <MagicBar 
                        value={magicValue}
                        onChange={setMagicValue}
                        onReturn={handleMagicSubmit}
                        isProcessing={isAnalyzing}
                        placeholder={pageState === 'IDLE' ? "Ketik atau bicara..." : "Koreksi transaksi..."}
                        onClear={() => setMagicValue('')}
                    />
                    
                    {pageState === 'IDLE' && (
                        <div className="absolute -top-10 right-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800 h-8 px-3 gap-2 text-[9px] font-medium uppercase tracking-widest hover:text-primary transition-all"
                            >
                                <Camera className="h-3.5 w-3.5" />
                                Scan Struk
                            </Button>
                        </div>
                    )}
                </div>

                {/* Multi-Nav Center */}
                {multiParsedData.length > 1 && !isAnalyzing && (
                    <div className="flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={focusedIndex === 0}
                            onClick={() => { triggerHaptic('light'); setFocusedIndex(f => f - 1); }}
                            className="h-9 w-9 rounded-xl"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Transaksi</span>
                            <span className="text-xs font-medium tabular-nums">{focusedIndex + 1} <span className="opacity-30">/</span> {multiParsedData.length}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={focusedIndex === multiParsedData.length - 1}
                            onClick={() => { triggerHaptic('light'); setFocusedIndex(f => f + 1); }}
                            className="h-9 w-9 rounded-xl text-primary"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Final Confirmation */}
                <AnimatePresence>
                    {activeTx && !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col gap-3"
                        >
                            <Button 
                                onClick={handleConfirmSave} 
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl text-base font-medium shadow-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        <span>Simpan {multiParsedData.length > 1 ? `${multiParsedData.length} Transaksi` : 'Transaksi'}</span>
                                    </>
                                )}
                            </Button>
                            
                            <button 
                                onClick={() => { triggerHaptic('medium'); resetFlow(); setFocusedIndex(0); }}
                                className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-rose-500 transition-colors py-1"
                            >
                                Batalkan & Mulai Ulang
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden Input & Decorations */}
            <label htmlFor="file-input" className="hidden">Upload Receipt Image</label>
            <input id="file-input" type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            {showSuccess && <SuccessAnimation />}
        </div>
    );
}
