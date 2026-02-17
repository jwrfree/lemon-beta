'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { Mic, Send, Image as ImageIcon, Sparkles, AudioLines, ChevronDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceRecognition } from '@/features/transactions/hooks/use-voice-recognition';
import { useSmartAddFlow } from '@/features/transactions/hooks/use-smart-add-flow';
import { useCategories } from '@/features/transactions/hooks/use-categories'; // For visuals

// Import new sub-components
import { MessagesList } from './smart-add/messages-list';
import { ResultCard } from './smart-add/result-card';

interface SmartAddOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SmartAddOverlay = ({ isOpen, onClose }: SmartAddOverlayProps) => {
    // Core Hook Logic
    const {
        pageState,
        messages,
        parsedData,
        processInput,
        saveTransaction,
        resetFlow,
        setParsedData
    } = useSmartAddFlow();

    const { getCategoryVisuals, expenseCategories, incomeCategories } = useCategories();

    // Local UI State
    const [inputValue, setInputValue] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('Menganalisis...');
    const controls = useAnimation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Voice Hook
    const { isListening, toggleListening } = useVoiceRecognition(
        (text) => setInputValue(text),
        (finalText) => {
            if (isListening && finalText.trim()) {
                toggleListening();
            }
        }
    );

    // Reset flow when closed/opened
    useEffect(() => {
        if (!isOpen) {
            // Optional: reset flow on close, or keep state? Usually reset is cleaner.
            setTimeout(() => resetFlow(), 300);
        } else {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, resetFlow]);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [inputValue, isOpen]);

    // Loading Message Rotation
    useEffect(() => {
        if (pageState === 'ANALYZING') {
            const msgs = ["Membaca...", "Memilih kategori...", "Menghitung..."];
            let i = 0;
            const interval = setInterval(() => {
                setLoadingMsg(msgs[i]);
                i = (i + 1) % msgs.length;
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [pageState]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        if (navigator.vibrate) navigator.vibrate(50);
        await processInput(inputValue);
        setInputValue(''); // Clear input after processing
    };

    const handleConfirm = async () => {
        if (navigator.vibrate) navigator.vibrate(50);
        const success = await saveTransaction();
        if (success) {
            // Success Animation or Toast handled by hook
            // Close after brief delay
            setTimeout(() => onClose(), 800);
        }
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
        } else {
            controls.start({ y: 0 });
        }
    };

    // Determine UI height based on state
    const isResultMode = pageState === 'CONFIRMING' || pageState === 'MULTI_CONFIRMING';
    const hasMessages = messages.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Bottom Sheet Wrapper */}
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none">
                        <motion.div
                            key="sheet"
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0.05, bottom: 0.8 }}
                            onDragEnd={handleDragEnd}
                            animate={controls}
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "pointer-events-auto relative w-full max-w-md bg-background rounded-t-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 will-change-transform",
                                isResultMode ? "h-[85vh]" : "max-h-[85vh]"
                            )}
                        >
                            {/* Drag Handle */}
                            <div className="w-full flex justify-center pt-3 pb-2 shrink-0 bg-background z-10 cursor-grab active:cursor-grabbing" onClick={onClose}>
                                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                            </div>

                            {/* Content Container - Scrollable */}
                            <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">

                                {/* Header */}
                                <div className="flex items-center justify-between py-4 shrink-0">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="text-sm font-medium uppercase tracking-wide">Smart Add</span>
                                    </div>
                                    {pageState !== 'IDLE' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => resetFlow()}
                                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Reset
                                        </Button>
                                    )}
                                </div>

                                {/* Chat / Result Area (Scrollable) */}
                                <div className="flex-1 overflow-y-auto space-y-4 py-2 min-h-[100px]">
                                    {/* Show messages if any */}
                                    <MessagesList messages={messages} loadingMessage={loadingMsg} />

                                    {/* Show Result Card if Confirming */}
                                    {isResultMode && parsedData && (
                                        <ResultCard
                                            parsedData={parsedData}
                                            setParsedData={setParsedData}
                                            getCategoryVisuals={getCategoryVisuals}
                                            incomeCategories={incomeCategories}
                                            expenseCategories={expenseCategories}
                                        />
                                    )}
                                </div>

                                {/* Bottom Action Area (Fixed) */}
                                <div className="shrink-0 pt-4 pb-safe">
                                    {/* Input Mode: IDLE or ANALYZING */}
                                    {!isResultMode ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="relative bg-muted/30 rounded-2xl p-3 border border-border/50 focus-within:border-primary/50 transition-colors">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder={isListening ? "Mendengarkan..." : "Misal: Makan siang 25rb... (atau upload struk)"}
                                                    className="w-full bg-transparent text-xl font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed min-h-[60px]"
                                                    rows={2}
                                                />
                                                {/* Mic Button Inline */}
                                                <div className="absolute right-2 bottom-2">
                                                    <motion.button
                                                        layout
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (inputValue.trim()) handleSubmit();
                                                            else toggleListening();
                                                        }}
                                                        className={cn(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm transition-all",
                                                            inputValue.trim()
                                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                                : isListening ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                                                        )}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {inputValue.trim() ? (
                                                            <Send className="h-4 w-4" />
                                                        ) : isListening ? (
                                                            <AudioLines className="h-5 w-5 animate-pulse" />
                                                        ) : (
                                                            <Mic className="h-5 w-5" />
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Helper text or secondary actions */}
                                            {pageState === 'IDLE' && !inputValue && (
                                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide opacity-60">
                                                    {["Gaji 10jt", "Makan 20rb", "Grab 50rb"].map(s => (
                                                        <button key={s} onClick={() => setInputValue(s)} className="text-[10px] px-3 py-1.5 rounded-full bg-muted whitespace-nowrap hover:bg-primary/10 transition-colors">
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Confirmation Mode Buttons */
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-12 rounded-2xl border-muted-foreground/20 text-muted-foreground hover:text-foreground"
                                                onClick={() => resetFlow()}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                className="flex-[2] h-12 rounded-2xl font-medium text-base shadow-lg shadow-primary/20"
                                                onClick={handleConfirm}
                                            >
                                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                                Simpan
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

