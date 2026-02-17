'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, LoaderCircle, Mic, Check, Save, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SmartAddFooterProps {
    pageState: string;
    inputValue: string;
    setInputValue: (val: string) => void;
    isListening: boolean;
    toggleListening: () => void;
    processInput: (val: string) => void;
    handleConfirmSave: (addMore: boolean) => void;
    handleMultiConfirmSave: () => void;
    resetFlow: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    multiParsedDataLength: number;
    parsedData: any;
}

export const SmartAddFooter = ({
    pageState,
    inputValue,
    setInputValue,
    isListening,
    toggleListening,
    processInput,
    handleConfirmSave,
    handleMultiConfirmSave,
    resetFlow,
    fileInputRef,
    multiParsedDataLength,
    parsedData
}: SmartAddFooterProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (pageState === 'IDLE' && !isListening) {
            textareaRef.current?.focus();
        }
    }, [pageState, isListening]);

    return (
        <footer className="p-4 bg-background/80 backdrop-blur-md">
            <AnimatePresence mode="wait">
                {(pageState === 'CONFIRMING' || pageState === 'MULTI_CONFIRMING') && (
                    <motion.div
                        key="refinement-input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <div className="flex items-center gap-2 w-full p-1 rounded-full bg-card h-14">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Koreksi lewat chat..."
                                className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base font-medium placeholder:text-muted-foreground resize-none min-h-0 !p-0 ml-4"
                                minRows={1}
                                maxRows={3}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        processInput(inputValue);
                                        setInputValue('');
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                variant="default"
                                className="h-11 w-11 rounded-full shrink-0"
                                onClick={() => { processInput(inputValue); setInputValue(''); }}
                                disabled={!inputValue.trim()}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {pageState === 'CONFIRMING' && parsedData ? (
                    <motion.div
                        key="confirming-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col gap-3"
                    >
                        <Button
                            variant="outline"
                            className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary w-full"
                            onClick={() => handleConfirmSave(true)}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Simpan & Tambah Lagi
                        </Button>
                        <Button
                            className="w-full h-14 rounded-2xl text-lg font-medium shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                            size="lg"
                            onClick={() => handleConfirmSave(false)}
                        >
                            <Check className="mr-2 h-6 w-6" />
                            Iya, Simpan
                        </Button>
                    </motion.div>
                ) : pageState === 'MULTI_CONFIRMING' ? (
                    <motion.div
                        key="multi-confirming-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col gap-3"
                    >
                        <Button
                            variant="outline"
                            className="h-12 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary"
                            onClick={() => resetFlow()}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Batalkan Semua
                        </Button>
                        <Button
                            className="w-full h-14 rounded-2xl text-lg font-medium shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                            size="lg"
                            onClick={() => handleMultiConfirmSave()}
                        >
                            <Check className="mr-2 h-6 w-6" />
                            Simpan {multiParsedDataLength} Transaksi
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div key="idle-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="flex items-center gap-2 w-full p-1 rounded-full bg-card h-14">
                            <Button size="icon" variant="ghost" className="h-11 w-11 shrink-0 rounded-full bg-muted" onClick={() => fileInputRef.current?.click()} aria-label="Attach file"><Paperclip className="h-5 w-5" /></Button>
                            <Textarea
                                ref={textareaRef}
                                placeholder="Ketik atau rekam suara..."
                                className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium placeholder:text-primary resize-none min-h-0 !p-0"
                                minRows={1}
                                maxRows={5}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        processInput(inputValue);
                                        setInputValue('');
                                    }
                                }}
                                disabled={pageState === 'ANALYZING'}
                                aria-label="Transaction description input"
                            />
                            <div className="flex items-center">
                                <AnimatePresence>
                                    {pageState === 'ANALYZING' ? <LoaderCircle className="animate-spin h-5 w-5 text-muted-foreground mx-3" /> : (
                                        <motion.div key="actions" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center">
                                            {!inputValue && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className={cn("h-11 w-11 rounded-full transition-all", isListening ? "bg-primary text-white scale-110 shadow-lg" : "bg-muted")}
                                                    onClick={toggleListening}
                                                >
                                                    <Mic className="h-5 w-5" />
                                                </Button>
                                            )}
                                            {inputValue && (
                                                <Button
                                                    size="icon"
                                                    variant="default"
                                                    className="h-11 w-11 rounded-full"
                                                    onClick={() => { processInput(inputValue); setInputValue(''); }}
                                                >
                                                    <Send className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </footer>
    );
};

