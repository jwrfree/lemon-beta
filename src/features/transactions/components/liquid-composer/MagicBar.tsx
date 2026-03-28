'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, MicOff, Loader2, Camera, Waves, X, Send } from 'lucide-react';
import { cn, triggerHaptic } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';

interface MagicBarProps {
    value: string;
    onChange: (val: string) => void;
    onReturn?: () => void;
    isProcessing?: boolean;
    placeholder?: string;
    onClear?: () => void;
    onImageUpload?: (dataUrl: string) => void;
}

export const MagicBar = ({ 
    value, 
    onChange, 
    onReturn,
    isProcessing = false, 
    placeholder = "Ada transaksi apa hari ini? Lemon siap catat...",
    onClear,
    onImageUpload
}: MagicBarProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isRecording, startRecording, stopRecording } = useAudioRecorder();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const toggleListening = async () => {
        if (isRecording) {
            triggerHaptic('light');
            try {
                const blob = await stopRecording();
                if (blob) {
                    await handleTranscription(blob);
                }
            } catch (err) {
                console.error("Failed to stop recording:", err);
            }
        } else {
            onChange(''); // Clear before listening
            try {
                await startRecording();
                triggerHaptic('medium');
            } catch (err) {
                console.error("Failed to start recording:", err);
                alert(err instanceof Error ? err.message : "Gagal mengakses mikrofon. Pastikan izin diberikan.");
            }
        }
    };

    const handleTranscription = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.text) {
                onChange(data.text);
                // Optionally auto-submit if confident
                // if (onReturn) onReturn();
            } else {
                throw new Error(data.error || 'Failed to transcribe');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            // Optionally show error toast here
        } finally {
            setIsTranscribing(false);
        }
    };



    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (isProcessing) return;
            if (value.trim() && onReturn) {
                onReturn();
            }
        }
    };

    return (
        <div className="relative group w-full max-w-md mx-auto px-4">
            {/* Ambient Glow Effect - The Liquid */}
            <div className={cn(
                "absolute inset-0 bg-primary/20 blur-2xl rounded-full transition-all duration-1000",
                (isProcessing || isTranscribing) ? "opacity-100 animate-pulse bg-primary/30" : 
                isRecording ? "opacity-100 animate-pulse scale-110 bg-violet-500/40" : 
                isFocused ? "opacity-50" : "opacity-0"
            )} />

            <div className={cn(
                "relative flex items-center bg-card border border-border rounded-card shadow-card transition-all duration-500 overflow-hidden px-5 py-3",
                (isProcessing || isTranscribing) ? "border-primary/50 ring-4 ring-primary/10" : 
                isRecording ? "border-violet-500/50 ring-4 ring-violet-500/20 bg-violet-500/5" :
                isFocused ? "border-primary/30 ring-4 ring-primary/5" : ""
            )}>
                <div className="mr-3 shrink-0">
                    {(isProcessing || isTranscribing) ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" strokeWidth={1.5} />
                    ) : isRecording ? (
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Waves className="h-5 w-5 text-violet-500" />
                        </motion.div>
                    ) : null}
                </div>

                <TextareaAutosize
                    ref={textareaRef}
                    maxRows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Small delay to allow button clicks
                    disabled={isRecording || isTranscribing}
                    placeholder={isTranscribing ? "Mentranskripsi..." : isRecording ? "Mendengarkan..." : placeholder}
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:outline-none text-sm md:text-base font-medium placeholder:text-muted-foreground/40 resize-none py-1 text-foreground disabled:opacity-70"
                />

                <div className="ml-2 flex items-center gap-1.5 shrink-0">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="magic-image-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onImageUpload) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    if (event.target?.result) {
                                        onImageUpload(event.target.result as string);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    
                    <AnimatePresence mode="popLayout" initial={false}>
                        {/* Camera Icon: Hide if value exists or focusing/active */}
                        {!value && !isFocused && !isRecording && !isTranscribing && (
                            <motion.button
                                key="camera"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={() => document.getElementById('magic-image-upload')?.click()}
                                className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                            >
                                <Camera className="h-5 w-5" />
                            </motion.button>
                        )}

                        {/* Clear (X) Icon: Show when typing OR focused with value */}
                        {value && (
                            <motion.button
                                key="clear"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={onClear}
                                className="p-2 rounded-full hover:bg-secondary text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        )}

                        {/* Toggle between Mic and Send: Show Send if typing OR focused */}
                        {(value || isFocused) && !isRecording && !isTranscribing ? (
                            <motion.button
                                key="send"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={() => {
                                    triggerHaptic('medium');
                                    onReturn?.();
                                }}
                                disabled={isProcessing || !value.trim()}
                                className={cn(
                                    "p-3 rounded-full transition-all active:scale-95 shadow-lg",
                                    value.trim() 
                                        ? "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105" 
                                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                )}
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </motion.button>
                        ) : (
                            <motion.button
                                key="mic"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={toggleListening}
                                disabled={isProcessing || isTranscribing}
                                className={cn(
                                    "p-3 rounded-full shadow-lg transition-all active:scale-95",
                                    isRecording 
                                        ? "bg-violet-500 text-white animate-pulse" 
                                        : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105"
                                )}
                            >
                                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Status Feedback */}
            <AnimatePresence>
                {(isProcessing || isRecording || isTranscribing) && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-label text-primary mt-3"
                    >
                        {isRecording ? "Sedang merekam suara..." : isTranscribing ? "Menerjemahkan audio..." : "Sedang menganalisis transaksi..."}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};
