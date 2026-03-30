'use client';

import React, { useEffect, useRef } from 'react';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Sparkles, 
    Send, 
    User, 
    Bot, 
    ChevronRight, 
    Trash2, 
    Loader2,
    Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAIChat } from '../hooks/use-ai-chat';
import { ErrorAlert } from '@/components/ui/error-alert';

interface AIChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_ACTIONS = [
    { label: 'Berapa saldo saya?', value: 'Berapa total saldo saya di semua dompet saat ini?' },
    { label: 'Budget aman?', value: 'Apakah ada budget saya yang hampir habis bulan ini?' },
    { label: 'Saran hemat', value: 'Berikan saran penghematan cerdas berdasarkan pola pengeluaran saya.' },
];

export const AIChatDrawer = ({ isOpen, onClose }: AIChatDrawerProps) => {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        submitQuickAction,
        isLoading,
        error,
        reload,
        stop,
        clearChat,
    } = useAIChat();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent 
                side="right" 
                className="w-full sm:max-w-[440px] p-0 flex flex-col h-full bg-background border-l border-border/50 text-foreground"
            >
                <SheetHeader className="p-6 pb-4 border-b border-border/30 bg-background">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">Lemon Coach</SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">Asisten Keuangan Pintar Anda</SheetDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {isLoading && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={stop}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    title="Hentikan Respons"
                                >
                                    <Square className="h-4 w-4 fill-current" />
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={clearChat}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                title="Hapus Chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
                        <div className="space-y-6 max-w-full overflow-x-hidden">
                            {error && (
                                <ErrorAlert
                                    variant="server"
                                    message="Lemon Coach gagal merespons."
                                    description={error.message}
                                    onRetry={() => void reload()}
                                    retryLabel="Coba Lagi"
                                />
                            )}
                            <AnimatePresence initial={false}>
                                {messages.map((m: any) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            "flex w-full mb-4",
                                            m.role === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex gap-3 max-w-[85%]",
                                            m.role === 'user' ? "flex-row-reverse" : "flex-row"
                                        )}>
                                            <div className={cn(
                                                "h-8 w-8 rounded-full shrink-0 flex items-center justify-center border",
                                                m.role === 'user' 
                                                    ? "bg-primary border-primary/20 text-primary-foreground" 
                                                    : "bg-card border-border/50 text-primary"
                                            )}>
                                                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-2xl text-sm leading-relaxed",
                                                m.role === 'user' 
                                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                    : "bg-card text-foreground border border-border/60 rounded-tl-none"
                                            )}>
                                                {m.content}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center border bg-card border-border/50 text-primary">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-card border border-border/60 rounded-tl-none text-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin opacity-60" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {messages.length <= 1 && !isLoading && (
                        <div className="px-6 py-4 space-y-3">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80 ml-1">Saran Pertanyaan</p>
                            <div className="flex flex-col gap-2">
                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => void submitQuickAction(action.value)}
                                        disabled={isLoading}
                                        className="flex items-center justify-between p-3 rounded-xl bg-card text-foreground border border-border/60 text-xs font-medium hover:bg-muted transition-all hover:translate-x-1 group"
                                    >
                                        <span className="opacity-90 group-hover:opacity-100">{action.label}</span>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 border-t border-border/30 bg-background">
                    <form 
                        onSubmit={handleSubmit}
                        className="relative flex items-center mt-6"
                    >
                        <Input
                            placeholder="Tanya Lemon Coach..."
                            value={input}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="pr-12 h-12 rounded-2xl border-border/50 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20"
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1.5 h-9 w-9 rounded-xl shadow-lg shadow-primary/20"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                    <p className="text-[10px] text-center mt-4 text-muted-foreground/70">
                        Lemon AI dapat membuat kesalahan. Periksa info penting.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
};
