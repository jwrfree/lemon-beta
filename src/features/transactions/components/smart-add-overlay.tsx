'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { Mic, Send, Image as ImageIcon, Sparkles, AudioLines, ChevronDown, CheckCircle2, RotateCcw, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceRecognition } from '@/features/transactions/hooks/use-voice-recognition';
import { useSmartAddFlow } from '@/features/transactions/hooks/use-smart-add-flow';
import { useCategories } from '@/features/transactions/hooks/use-categories'; // For visuals
import TextareaAutosize from 'react-textarea-autosize';

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
    const [isSaving, setIsSaving] = useState(false);
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

    // Loading Message Typing Effect
    useEffect(() => {
        if (pageState !== 'ANALYZING') return;

        const msgs = [
            "Menganalisis teks...",
            "Mendeteksi merchant...",
            "Mencari kategori...",
            "Menghitung total...",
            "Finalisasi..."
        ];
        
        let msgIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeoutId: NodeJS.Timeout;

        const type = () => {
            const currentMsg = msgs[msgIndex];

            if (!isDeleting && charIndex <= currentMsg.length) {
                // Typing
                setLoadingMsg(currentMsg.substring(0, charIndex));
                charIndex++;
                // Randomize typing speed for realism (30-80ms)
                timeoutId = setTimeout(type, 30 + Math.random() * 50);
            } else if (isDeleting && charIndex > 0) {
                // Deleting (faster)
                setLoadingMsg(currentMsg.substring(0, charIndex));
                charIndex--;
                timeoutId = setTimeout(type, 20);
            } else if (!isDeleting && charIndex > currentMsg.length) {
                // Finished typing, wait before deleting
                isDeleting = true;
                timeoutId = setTimeout(type, 1000); // Wait 1s
            } else if (isDeleting && charIndex === 0) {
                // Finished deleting, next message
                isDeleting = false;
                msgIndex = (msgIndex + 1) % msgs.length;
                timeoutId = setTimeout(type, 200);
            }
        };

        type();

        return () => clearTimeout(timeoutId);
    }, [pageState]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        if (navigator.vibrate) navigator.vibrate(50);
        await processInput(inputValue);
        setInputValue(''); // Clear input after processing
    };

    const handleConfirm = async () => {
        if (navigator.vibrate) navigator.vibrate(50);
        setIsSaving(true);
        const success = await saveTransaction();
        setIsSaving(false);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
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
                                "pointer-events-auto relative w-full max-w-md bg-background rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 will-change-transform border border-white/10 pb-safe",
                                isResultMode ? "h-[85dvh]" : "max-h-[85dvh]"
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
                                <div className="shrink-0 pt-4 pb-safe relative group">
                                    
                                    {/* Ambient Glow Orb Behind Input */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none opacity-50" />

                                    {/* Input Mode: IDLE or ANALYZING */}
                                    {!isResultMode ? (
                                        <div className="flex flex-col gap-4 relative">
                                            {/* Ambient Glow Effect */}
                                            <div className={cn(
                                                "absolute inset-0 bg-primary/10 blur-2xl rounded-full transition-opacity duration-1000",
                                                (inputValue || isListening) ? "opacity-100" : "opacity-0"
                                            )} />

                                            <div className="relative bg-card rounded-[28px] p-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:shadow-[0_12px_50px_-12px_rgba(0,0,0,0.15)] focus-within:shadow-[0_12px_50px_-12px_rgba(var(--primary-rgb),0.25)]">
                                                <div className="flex items-end gap-3 px-1">
                                                    <TextareaAutosize
                                                        ref={textareaRef}
                                                        maxRows={4}
                                                        value={inputValue}
                                                        onChange={(e) => setInputValue(e.target.value)}
                                                        onKeyDown={handleKeyDown}
                                                        placeholder={isListening ? "Mendengarkan..." : "Misal: Makan siang 25rb..."}
                                                        className="flex-1 bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed py-3 pl-3 pr-2"
                                                    />
                                                    
                                                    {/* Mic/Send Button Inline */}
                                                    <motion.button
                                                        layout
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (inputValue.trim()) handleSubmit();
                                                            else toggleListening();
                                                        }}
                                                        className={cn(
                                                            "h-12 w-12 rounded-full flex items-center justify-center shadow-sm transition-all shrink-0",
                                                            inputValue.trim()
                                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                                : isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                        )}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {inputValue.trim() ? (
                                                            <ArrowUp className="h-6 w-6" />
                                                        ) : isListening ? (
                                                            <AudioLines className="h-5 w-5" />
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
                                                className="flex-1 h-12 rounded-full border-border text-muted-foreground hover:text-foreground"
                                                onClick={() => resetFlow()}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                className="flex-[2] h-12 rounded-full font-medium text-base shadow-lg shadow-primary/20"
                                                onClick={handleConfirm}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    "Simpan"
                                                )}
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

