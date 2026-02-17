'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, Sparkles, Tag, MapPin, CornerDownRight, 
    Loader2, Save, RotateCcw, Camera, Mic, X, Trash2,
    CheckCircle2
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
import { DynamicSuggestions } from './dynamic-suggestions';

const MAX_COMPRESSED_IMAGE_BYTES = 1024 * 1024;

export default function SmartAddPage() {
    const router = useRouter();
    const { wallets } = useWallets();
    const { expenseCategories, incomeCategories } = useCategories();
    const { showToast } = useUI();
    const [magicValue, setMagicValue] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0); // For multi-transaction navigation

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        pageState,
        setPageState,
        parsedData,
        multiParsedData,
        removeMultiTransaction,
        processInput,
        saveTransaction,
        saveMultiTransactions,
        resetFlow
    } = useSmartAddFlow();

    // 1. AI Context
    const aiContext = useMemo(() => ({
        wallets: wallets.map(w => ({ id: w.id, name: w.name })),
        categories: [...expenseCategories, ...incomeCategories].map(c => c.name)
    }), [wallets, expenseCategories, incomeCategories]);

    // 2. Handle Submissions
    const handleMagicSubmit = async () => {
        if (!magicValue) return;
        triggerHaptic('medium');
        await processInput(magicValue);
        setMagicValue('');
    };

    const handleConfirmSave = async () => {
        triggerHaptic('success');
        const success = multiParsedData.length > 0 ? await saveMultiTransactions() : await saveTransaction();
        if (success) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.push('/home');
            }, 1500);
        }
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
        } catch (error) { 
            showToast('Gagal memproses gambar.', 'error'); 
        } finally { 
            e.target.value = ''; 
        }
    };

    // 3. Derived Visual Data
    const activeTx = multiParsedData.length > 0 ? multiParsedData[focusedIndex] : parsedData;
    const isAnalyzing = pageState === 'ANALYZING';

    return (
        <div className="flex flex-col h-dvh bg-zinc-50 dark:bg-black relative overflow-hidden">
            
            {/* 1. Header Premium */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="h-12 w-12 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex gap-2">
                    {pageState !== 'IDLE' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { triggerHaptic('light'); resetFlow(); }}
                            className="h-12 w-12 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                        >
                            <RotateCcw className="h-5 w-5 text-zinc-500" />
                        </Button>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800">
                        <Sparkles className={cn("h-4 w-4 text-primary", isAnalyzing && "animate-pulse")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Lemon Intelligence</span>
                    </div>
                </div>
            </div>

            {/* 2. Liquid Power Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
                
                <AnimatePresence mode="wait">
                    {/* State: Idle / Suggestions */}
                    {pageState === 'IDLE' && !magicValue && (
                        <motion.div 
                            key="idle-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <DynamicSuggestions onSuggestionClick={(text) => {
                                setMagicValue(text);
                                processInput(text);
                                setMagicValue('');
                            }} />
                        </motion.div>
                    )}

                    {/* State: Analyzing / Results */}
                    {(activeTx || isAnalyzing) && (
                        <motion.div 
                            key="result-view"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center w-full"
                        >
                            {/* Hero Amount (Dynamic from Focused Transaction) */}
                            <HeroAmount 
                                amount={activeTx?.amount || 0} 
                                type={activeTx?.type || 'expense'} 
                            />

                            {/* Multi-Transaction Indicator */}
                            {multiParsedData.length > 1 && (
                                <div className="flex gap-1.5 mb-6">
                                    {multiParsedData.map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            animate={{ 
                                                width: i === focusedIndex ? 24 : 6,
                                                backgroundColor: i === focusedIndex ? 'var(--primary)' : 'rgba(161, 161, 170, 0.3)'
                                            }}
                                            className="h-1.5 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Metadata Orbits */}
                            <div className="min-h-[100px] flex flex-col items-center justify-center gap-3 w-full px-8">
                                <AnimatePresence mode="popLayout">
                                    {isAnalyzing ? (
                                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin" strokeWidth={1.5} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Menganalisis...</p>
                                        </motion.div>
                                    ) : activeTx && (
                                        <motion.div key="tx-data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full shadow-xl shadow-primary/20">
                                                <Tag className="h-4 w-4 fill-white/20" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{activeTx.category}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {activeTx.subCategory && (
                                                    <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-4 py-1.5 rounded-2xl border border-primary/10">
                                                        <CornerDownRight className="h-3.5 w-3.5 opacity-50" />
                                                        <span className="text-[11px] font-bold">{activeTx.subCategory}</span>
                                                    </div>
                                                )}
                                                {activeTx.location && (
                                                    <div className="flex items-center gap-1.5 text-zinc-500 bg-white dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{activeTx.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <p className="text-sm font-medium text-zinc-400 italic">"{activeTx.description}"</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Interaction Zone */}
            <div className="w-full max-w-md mx-auto px-6 pb-safe mb-8 relative z-20 space-y-6">
                
                {/* Magic Bar with OCR and Voice */}
                <div className="relative">
                    <MagicBar 
                        value={magicValue}
                        onChange={setMagicValue}
                        onReturn={handleMagicSubmit}
                        isProcessing={isAnalyzing}
                        placeholder="Ketik, suara, atau upload struk..."
                        onClear={() => setMagicValue('')}
                    />
                    
                    {/* OCR Quick Trigger */}
                    <div className="absolute -top-12 right-4 flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200/50 dark:border-zinc-800 h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                        >
                            <Camera className="h-4 w-4" />
                            Scan Struk
                        </Button>
                    </div>
                </div>

                {/* Navigation for Multi-Transaction */}
                {multiParsedData.length > 1 && (
                    <div className="flex justify-between items-center px-2">
                        <Button 
                            variant="ghost" 
                            disabled={focusedIndex === 0}
                            onClick={() => { triggerHaptic('light'); setFocusedIndex(f => f - 1); }}
                            className="text-zinc-400"
                        >
                            Sebelumnya
                        </Button>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                            {focusedIndex + 1} dari {multiParsedData.length}
                        </span>
                        <Button 
                            variant="ghost" 
                            disabled={focusedIndex === multiParsedData.length - 1}
                            onClick={() => { triggerHaptic('light'); setFocusedIndex(f => f + 1); }}
                            className="text-primary font-bold"
                        >
                            Berikutnya
                        </Button>
                    </div>
                )}

                {/* Global Confirm Actions */}
                <AnimatePresence>
                    {(parsedData || multiParsedData.length > 0) && !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex flex-col gap-3"
                        >
                            <Button 
                                onClick={handleConfirmSave} 
                                disabled={isSubmitting}
                                className="w-full h-16 rounded-[2rem] text-lg font-black tracking-tight shadow-2xl shadow-primary/30 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        <span>Simpan {multiParsedData.length > 0 ? `${multiParsedData.length} Transaksi` : 'Transaksi'}</span>
                                    </>
                                )}
                            </Button>
                            
                            <Button 
                                variant="ghost" 
                                onClick={() => { triggerHaptic('medium'); resetFlow(); }}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-rose-500 transition-colors"
                            >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Batalkan Semua
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*" 
            />

            {/* Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            {showSuccess && <SuccessAnimation />}
        </div>
    );
}
