'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';

interface MagicBarProps {
    value: string;
    onChange: (val: string) => void;
    isProcessing?: boolean;
    placeholder?: string;
    onClear?: () => void;
}

export const MagicBar = ({ 
    value, 
    onChange, 
    isProcessing = false, 
    placeholder = "Katakan sesuatu... (misal: 'Ganti harganya jadi 50rb')",
    onClear 
}: MagicBarProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="relative group w-full max-w-md mx-auto px-4">
            {/* Ambient Glow Effect when active */}
            <div className={cn(
                "absolute inset-0 bg-primary/10 blur-2xl rounded-full transition-opacity duration-1000",
                isProcessing ? "opacity-100 animate-pulse" : "opacity-0 group-focus-within:opacity-50"
            )} />

            <div className={cn(
                "relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] shadow-xl transition-all duration-500 overflow-hidden px-5 py-3",
                isProcessing ? "border-primary/50 ring-4 ring-primary/10" : "group-focus-within:border-primary/30 group-focus-within:ring-4 group-focus-within:ring-primary/5"
            )}>
                <div className="mr-3 shrink-0">
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
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
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base font-medium placeholder:text-zinc-400 resize-none py-1"
                />

                <div className="ml-3 flex items-center gap-2 shrink-0">
                    <AnimatePresence mode="wait">
                        {value ? (
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
                                className="p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/20 active:scale-90 transition-transform"
                            >
                                <Mic className="h-5 w-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Status Micro-copy */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-[10px] font-bold text-primary uppercase tracking-widest mt-3"
                    >
                        DeepSeek sedang menganalisis...
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};
