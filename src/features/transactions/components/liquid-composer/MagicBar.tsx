'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microphone, MicrophoneSlash, CircleNotch, Camera, Waveform, X, PaperPlaneRight } from '@/lib/icons';
import { cn, triggerHaptic } from '@/lib/utils';
import TextareaAutosize from 'react-textarea-autosize';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useUI } from '@/components/ui-provider';

interface MagicBarProps {
    value: string;
    // eslint-disable-next-line no-unused-vars
    onChange: (value: string) => void;
    onReturn?: () => void;
    isProcessing?: boolean;
    placeholder?: string;
    onClear?: () => void;
    // eslint-disable-next-line no-unused-vars
    onImageUpload?: (dataUrl: string) => void;
    focusRequestKey?: number;
    imageUploadRequestKey?: number;
}

export const MagicBar = ({
    value,
    onChange,
    onReturn,
    isProcessing = false,
    placeholder = "Ada transaksi apa hari ini? Lemon siap catat...",
    onClear,
    onImageUpload,
    focusRequestKey = 0,
    imageUploadRequestKey = 0,
}: MagicBarProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isRecording, startRecording, stopRecording } = useAudioRecorder();
    const { showToast } = useUI();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!focusRequestKey) return;
        textareaRef.current?.focus();
    }, [focusRequestKey]);

    useEffect(() => {
        if (!imageUploadRequestKey) return;
        document.getElementById('magic-image-upload')?.click();
    }, [imageUploadRequestKey]);

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
                showToast("Perekaman gagal dihentikan. Coba lagi.", "error");
            }
        } else {
            try {
                await startRecording();
                triggerHaptic('medium');
            } catch (err) {
                console.error("Failed to start recording:", err);
                showToast(
                    err instanceof Error ? err.message : "Gagal mengakses mikrofon. Pastikan izin diberikan.",
                    "error"
                );
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
                const nextValue = value.trim() ? `${value.trim()} ${data.text}` : data.text;
                onChange(nextValue);
            } else {
                throw new Error(data.error || 'Failed to transcribe');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            showToast("Audio belum berhasil diproses. Coba rekam ulang atau ketik manual.", "error");
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
        <div className="group relative w-full">
            {/* Ambient Glow Effect - The Liquid */}
            <div className={cn(
                "absolute inset-0 rounded-3xl bg-primary/20 blur-2xl transition-all duration-1000",
                (isProcessing || isTranscribing) ? "opacity-100 animate-pulse bg-primary/30" :
                    isRecording ? "opacity-100 animate-pulse scale-110 bg-violet-500/40" :
                        isFocused ? "opacity-50" : "opacity-0"
            )} />

            <div className={cn(
                "relative overflow-hidden rounded-3xl bg-secondary/50 px-3 py-2.5 shadow-inner transition-all duration-300 dark:bg-secondary/25 sm:px-4 sm:py-3",
                (isProcessing || isTranscribing) ? "bg-primary/[0.08] shadow-inner" :
                    isRecording ? "bg-violet-500/10 shadow-inner" :
                        isFocused ? "bg-card shadow-inner" : ""
            )}>
                <div className="flex items-end gap-2">
                    <div className="flex min-w-0 flex-1 items-end gap-2">
                        <div className="shrink-0">
                            {(isProcessing || isTranscribing) ? (
                                <CircleNotch size={20} weight="regular" className="animate-spin text-primary" />
                            ) : isRecording ? (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <Waveform size={20} weight="regular" className="text-violet-500" />
                                </motion.div>
                            ) : null}
                        </div>

                        <TextareaAutosize
                            ref={textareaRef}
                            maxRows={4}
                            value={value}
                            name="smart-add-input"
                            autoComplete="off"
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Small delay to allow button clicks
                            disabled={isRecording || isTranscribing}
                            placeholder={isTranscribing ? "Mentranskripsi..." : isRecording ? "Mendengarkan..." : placeholder}
                            className="min-w-0 w-full flex-1 resize-none border-none bg-transparent py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-70 md:text-base"
                        />
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
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
                                    aria-label="Unggah foto struk"
                                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                    <Camera size={20} weight="regular" />
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
                                    aria-label="Kosongkan input"
                                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                    <X size={18} weight="regular" />
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
                                    aria-label="Kirim input Smart Add"
                                    className={cn(
                                        "rounded-full p-3 shadow-elevation-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                        value.trim()
                                            ? "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105"
                                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                    )}
                                >
                                    {isProcessing ? (
                                        <CircleNotch size={18} weight="regular" className="animate-spin" />
                                    ) : (
                                        <PaperPlaneRight size={18} weight="regular" />
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
                                    aria-label={isRecording ? "Hentikan rekaman" : "Mulai rekam suara"}
                                    className={cn(
                                        "rounded-full p-3 shadow-elevation-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                        isRecording
                                            ? "bg-violet-500 text-white animate-pulse"
                                            : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105"
                                    )}
                                >
                                    {isRecording ? <MicrophoneSlash size={20} weight="regular" /> : <Microphone size={20} weight="regular" />}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
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

