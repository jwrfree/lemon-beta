'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, MicOff, X, Loader2 } from 'lucide-react';
import { cn, triggerHaptic } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';

interface MagicBarProps {
    value: string;
    onChange: (val: string) => void;
    onReturn?: () => void;
    isProcessing?: boolean;
    placeholder?: string;
    onClear?: () => void;
}

export const MagicBar = ({ 
    value, 
    onChange, 
    onReturn,
    isProcessing = false, 
    placeholder = "Ketik atau bicara...",
    onClear 
}: MagicBarProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Initialize Web Speech API
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'id-ID';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                onChange(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, [onChange]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            triggerHaptic('light');
        } else {
            onChange(''); // Clear before listening
            recognitionRef.current.start();
            setIsListening(true);
            triggerHaptic('medium');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (onReturn) onReturn();
        }
    };

    return (
        <div className="relative group w-full max-w-md mx-auto px-4">
            {/* Ambient Glow Effect */}
            <div className={cn(
                "absolute inset-0 bg-primary/10 blur-2xl rounded-full transition-opacity duration-1000",
                (isProcessing || isListening) ? "opacity-100 animate-pulse" : "opacity-0 group-focus-within:opacity-50"
            )} />

            <div className={cn(
                "relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] shadow-xl transition-all duration-500 overflow-hidden px-5 py-3",
                (isProcessing || isListening) ? "border-primary/50 ring-4 ring-primary/10" : "group-focus-within:border-primary/30 group-focus-within:ring-4 group-focus-within:ring-primary/5"
            )}>
                <div className="mr-3 shrink-0">
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" strokeWidth={1.5} />
                    ) : (
                        <Sparkles className={cn(
                            "h-5 w-5 transition-colors",
                            value ? "text-primary fill-primary/20" : "text-zinc-400"
                        )} />
                    )}
                </div>

                <TextareaAutosize
                    ref={textareaRef}
                    maxRows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Mendengarkan..." : placeholder}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-medium placeholder:text-zinc-400 resize-none py-1"
                />

                <div className="ml-3 flex items-center gap-2 shrink-0">
                    <AnimatePresence mode="wait">
                        {value && !isListening ? (
                            <motion.button
                                key="clear"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={onClear}
                                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        ) : (
                            <motion.button
                                key="mic"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={toggleListening}
                                className={cn(
                                    "p-3 rounded-full shadow-lg transition-all active:scale-90",
                                    isListening 
                                        ? "bg-rose-500 text-white animate-pulse" 
                                        : "bg-primary text-white shadow-primary/20 hover:scale-110"
                                )}
                            >
                                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Status Feedback */}
            <AnimatePresence>
                {(isProcessing || isListening) && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-[10px] font-medium text-primary uppercase tracking-[0.3em] mt-3"
                    >
                        {isListening ? "Suara Anda Sedang Direkam..." : "Lemon Sedang Berpikir..."}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};
