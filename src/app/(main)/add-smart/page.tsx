'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { RotateCcw, Mic } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { compressImageFile, getDataUrlSizeInBytes } from '@/lib/utils';
import { TransactionComposer } from '@/features/transactions/components/transaction-composer';
import { useUI } from '@/components/ui-provider';
import { useSmartAddFlow } from '@/features/transactions/hooks/use-smart-add-flow';
import { PageHeader } from '@/components/page-header';
import { DynamicSuggestions } from './dynamic-suggestions';
import { SuccessAnimation } from '@/components/success-animation';

// New Modular Components & Hooks
import { useVoiceRecognition } from '@/features/transactions/hooks/use-voice-recognition';
import { SmartAddFooter } from './smart-add-footer';
import { SmartAddMessages } from './smart-add-messages';
import { SmartAddResults } from './smart-add-results';

const textLoadingMessages = ["Menganalisis teks...", "Mengidentifikasi detail...", "Memilih kategori...", "Hampir selesai..."];
const imageLoadingMessages = ["Membaca struk...", "Mengekstrak total & merchant...", "Menebak kategori belanja...", "Menyiapkan hasil..."];
const MAX_COMPRESSED_IMAGE_BYTES = 1024 * 1024;

export default function SmartAddPage() {
    const router = useRouter();
    const { showToast } = useUI();
    const { getCategoryVisuals } = useCategories();
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
    const [isVoiceInputMode, setIsVoiceInputMode] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Haptic feedback utility
    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, []);

    // Scroll bottom
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, pageState]);

    // Voice Recognition Hook
    const { isListening, toggleListening, isSupported } = useVoiceRecognition(
        (text) => setInputValue(text),
        (finalText) => {
            if (isVoiceInputMode && finalText.trim()) {
                setIsVoiceInputMode(false);
                processInput(finalText);
                setInputValue('');
            } else {
                setIsVoiceInputMode(false);
            }
        }
    );

    const handleToggleVoice = useCallback(() => {
        if (!isSupported) {
            showToast("Browser tidak mendukung input suara.", 'error');
            return;
        }
        vibrate(50);
        setIsVoiceInputMode(!isListening);
        toggleListening();
    }, [isListening, isSupported, showToast, vibrate, toggleListening]);

    const handleConfirmSave = useCallback(async (addMore: boolean) => {
        vibrate(50);
        const success = await saveTransaction();
        if (success) {
            if (addMore) {
                setPageState('IDLE');
                setInputValue('');
            } else {
                setShowSuccess(true);
                vibrate([80, 50, 80]);
                setTimeout(() => {
                    setShowSuccess(false);
                    router.back();
                }, 1200);
            }
        }
    }, [saveTransaction, router, vibrate, setPageState]);

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
                if (pageState === 'CONFIRMING') handleConfirmSave(false);
                else if (pageState === 'MULTI_CONFIRMING') handleMultiConfirmSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageState, handleConfirmSave, handleMultiConfirmSave]);

    useEffect(() => {
        if (pageState === 'ANALYZING') {
            vibrate(30);
            const loadingMsgs = messages.some(m => m.type === 'user-image') ? imageLoadingMessages : textLoadingMessages;
            let i = 0;
            setLoadingMessage(loadingMsgs[i]);
            const interval = setInterval(() => {
                i = (i + 1) % loadingMsgs.length;
                setLoadingMessage(loadingMsgs[i]);
            }, 1500);
            return () => clearInterval(interval);
        }
        if (pageState === 'CONFIRMING' || pageState === 'MULTI_CONFIRMING') vibrate([20, 30, 20]);
    }, [pageState, messages, vibrate]);

    if (pageState === 'EDITING' && parsedData) {
        return <TransactionComposer isModal={false} initialData={parsedData} onClose={(data: any) => { if (data) setParsedData((prev: any) => prev ? ({ ...prev, ...data }) : null); setPageState('CONFIRMING'); }} />;
    }

    return (
        <div className="flex flex-col h-screen bg-background safe-bottom overflow-hidden">
            <PageHeader
                title="Smart Add"
                showBackButton={true}
                extraActions={
                    <Button variant="ghost" size="icon" onClick={() => resetFlow()} className="rounded-full hover:bg-muted" aria-label="Reset">
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                }
            />

            <main className="flex-1 flex flex-col justify-end overflow-hidden pb-4 md:pb-10 relative">
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isListening && (
                            <motion.div key="voice-overlay" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-x-0 bottom-24 flex justify-center z-50 pointer-events-none">
                                <div className="bg-primary/95 backdrop-blur-md text-primary-foreground px-6 py-4 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Mic className="h-6 w-6 relative z-10" />
                                            <motion.div className="absolute inset-0 bg-white rounded-full" animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Mendengarkan...</span>
                                            <p className="text-lg font-medium max-w-[200px] truncate">{inputValue || "Bicara sekarang..."}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <motion.div key={i} className="w-1 bg-white rounded-full" animate={{ height: [8, 20, 8] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />
                                        ))}
                                    </div>
                                    <Button variant="secondary" size="sm" className="mt-1 rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-wider pointer-events-auto" onClick={() => handleToggleVoice()}>Selesai</Button>
                                </div>
                            </motion.div>
                        )}

                        {!messages.length && !inputValue && !isListening && (
                            <DynamicSuggestions key="suggestions" onSuggestionClick={(text) => { setInputValue(text); processInput(text); }} />
                        )}

                        <SmartAddMessages key="messages" messages={messages} loadingMessage={loadingMessage} />

                        <SmartAddResults
                            key="results"
                            pageState={pageState}
                            parsedData={parsedData}
                            multiParsedData={multiParsedData}
                            inputValue={inputValue}
                            getCategoryVisuals={getCategoryVisuals}
                            isCategoryPopoverOpen={isCategoryPopoverOpen}
                            setIsCategoryPopoverOpen={setIsCategoryPopoverOpen}
                            setParsedData={setParsedData}
                            insightData={insightData}
                            removeMultiTransaction={removeMultiTransaction}
                        />
                    </AnimatePresence>
                </div>
            </main>

            <SmartAddFooter
                pageState={pageState}
                inputValue={inputValue}
                setInputValue={setInputValue}
                isListening={isListening}
                toggleListening={handleToggleVoice}
                processInput={processInput}
                handleConfirmSave={handleConfirmSave}
                handleMultiConfirmSave={handleMultiConfirmSave}
                resetFlow={resetFlow}
                fileInputRef={fileInputRef}
                multiParsedDataLength={multiParsedData.length}
                parsedData={parsedData}
            />

            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" aria-label="Upload receipt image" />
            {showSuccess && <SuccessAnimation />}
        </div>
    );
}