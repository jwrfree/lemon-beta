'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlass,
    ArrowRight,
    Receipt,
    Target,
    HandCoins,
    PiggyBank,
    Wallet,
    House,
    Bell,
    Sparkle,
    CaretRight,
    Command as CommandIcon,
    ArrowArcLeft
} from '@/lib/icons';
import { useUI } from '@/components/ui-provider';
import { cn, triggerHaptic } from '@/lib/utils';
import { searchService, SearchResult } from '@/lib/services/search-service';
import { useAuth } from '@/providers/auth-provider';
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';

export const CommandPalette = () => {
    const router = useRouter();
    const { user } = useAuth();
    const {
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        openUniversalAdd,
        setIsGoalModalOpen,
        setIsDebtModalOpen,
        setGoalToEdit,
        setDebtToEdit
    } = useUI();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initial search or search on query change
    useEffect(() => {
        if (!isCommandPaletteOpen) {
            setQuery('');
            return;
        }

        const fetchResults = async () => {
            if (!user?.id) return;

            setIsLoading(true);
            try {
                const data = await searchService.search(user.id, query);
                setResults(data);
            } catch (err) {
                console.error('Command Palette Search Error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, query ? 150 : 0);
        return () => clearTimeout(timer);
    }, [query, isCommandPaletteOpen, user?.id]);

    const handleSelect = useCallback((item: SearchResult) => {
        triggerHaptic('light');
        setIsCommandPaletteOpen(false);

        if (item.type === 'action') {
            const action = item.metadata?.action;
            // Small delay to let everything close smoothly
            setTimeout(() => {
                if (action === 'openUniversalAdd') openUniversalAdd();
                if (action === 'openGoalModal') {
                    setGoalToEdit(null);
                    setIsGoalModalOpen(true);
                }
                if (action === 'openDebtModal') {
                    setDebtToEdit(null);
                    setIsDebtModalOpen(true);
                }
            }, 200);
            return;
        }

        if (item.href) {
            router.push(item.href);
        }
    }, [
        router,
        setIsCommandPaletteOpen,
        openUniversalAdd,
        setIsGoalModalOpen,
        setIsDebtModalOpen,
        setGoalToEdit,
        setDebtToEdit
    ]);

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'nav': return House;
            case 'transaction': return Receipt;
            case 'goal': return Target;
            case 'debt': return HandCoins;
            case 'wallet': return Wallet;
            case 'action': return Sparkle;
            default: return ArrowRight;
        }
    };

    const getGroupLabel = (type: string) => {
        switch (type) {
            case 'nav': return 'Navigasi';
            case 'action': return 'Aksi Cepat';
            case 'transaction': return 'Transaksi Terbaru';
            case 'goal': return 'Target';
            case 'debt': return 'Hutang';
            case 'wallet': return 'Dompet';
            default: return 'Lainnya';
        }
    };

    // Group results by type
    const groupedResults = results.reduce((acc, curr) => {
        if (!acc[curr.type]) acc[curr.type] = [];
        acc[curr.type].push(curr);
        return acc;
    }, {} as Record<string, SearchResult[]>);

 <Dialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
 <DialogPortal>
 <DialogOverlay className="bg-black/60 backdrop-blur-md" />
 <DialogContent className="fixed left-[50%] top-[5%] sm:top-[50%] translate-x-[-50%] sm:translate-y-[-50%] w-[94vw] sm:max-w-2xl border-none bg-transparent p-0 shadow-none transition-all duration-300">
 <DialogTitle className="sr-only">Navigasi dan Pencarian Universal</DialogTitle>
 <DialogDescription className="sr-only">
 Cari transaksi, target, dompet, atau jalankan aksi cepat di seluruh aplikasi.
 </DialogDescription>
 <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-card/70 shadow-elevation-4 backdrop-blur-xl">
                        <Command className="flex h-full w-full flex-col overflow-hidden">
                            <div className="flex items-center border-b border-white/10 px-4">
                                <MagnifyingGlass className="mr-3 h-5 w-5 text-muted-foreground" />
                                <Command.Input
                                    value={query}
                                    onValueChange={setQuery}
                                    placeholder="Cari transaksi, target, atau aksi..."
                                    className="flex h-14 w-full bg-transparent text-title-lg outline-none placeholder:text-muted-foreground/50"
                                />
                                {isLoading && (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                )}
                                {!query && (
                                    <div className="hidden items-center gap-1 sm:flex">
                                        <kbd className="flex h-6 items-center rounded border border-white/20 bg-white/5 px-1.5 font-sans text-label-md text-muted-foreground">
                                            <CommandIcon size={12} className="mr-1" /> K
                                        </kbd>
                                    </div>
                                )}
                            </div>

                            <Command.List className="max-h-[60vh] overflow-y-auto px-2 py-4 scrollbar-none sm:max-h-[400px]">
                                <Command.Empty className="flex flex-col items-center justify-center py-10 text-center">
                                    <MagnifyingGlass size={32} className="mb-4 text-muted-foreground/20" />
                                    <p className="text-muted-foreground">Tidak ada hasil ditemukan.</p>
                                </Command.Empty>

                                {Object.entries(groupedResults).map(([type, items]) => (
                                    <Command.Group
                                        key={type}
                                        heading={getGroupLabel(type)}
                                        className="mb-4 px-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:[&_[cmdk-group-heading]]:[&_[cmdk-group-heading]]:[&_[cmdk-group-heading]]:text-foreground/40"
                                    >
                                        <div className="mt-2 space-y-1">
                                            {items.map((item) => (
                                                <Command.Item
                                                    key={item.id}
                                                    value={item.id + item.title + item.subtitle}
                                                    onSelect={() => handleSelect(item)}
                                                    className="group flex cursor-pointer items-center gap-4 rounded-2xl px-3 py-3 transition-all hover:bg-white/10 data-[selected=true]:bg-white/15"
                                                >
                                                    <div className={cn(
                                                        "flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/5 text-muted-foreground transition-colors group-hover:text-primary group-data-[selected=true]:bg-primary/20 group-data-[selected=true]:text-primary"
                                                    )}>
                                                        {React.createElement(getIcon(item.type), { size: 20 })}
                                                    </div>

                                                    <div className="flex min-w-0 flex-1 flex-col">
                                                        <span className="truncate text-body-md ">{item.title}</span>
                                                        {item.subtitle && (
                                                            <span className="truncate text-label-md text-foreground/60">{item.subtitle}</span>
                                                        )}
                                                    </div>

                                                    {item.amount !== undefined && (
                                                        <div className="flex flex-none flex-col items-end gap-1">
                                                            <span className={cn(
                                                                "text-body-md ",
                                                                item.type === 'transaction' && item.metadata?.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                                                            )}>
                                                                {item.type === 'transaction' && item.metadata?.type === 'expense' ? '-' : ''}
                                                                Rp {item.amount.toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <CaretRight size={16} className="flex-none text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100" />
                                                </Command.Item>
                                            ))}
                                        </div>
                                    </Command.Group>
                                ))}
                            </Command.List>

                            <div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-4 py-3 text-label-md text-foreground/70">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border border-white/10 bg-white/10 px-1 font-sans">↑↓</kbd> Navigasi
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border border-white/10 bg-white/10 px-1 font-sans">Enter</kbd> Pilih
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <kbd className="rounded border border-white/10 bg-white/10 px-1 font-sans">Esc</kbd> Tutup
                                </span>
                            </div>
                        </Command>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
