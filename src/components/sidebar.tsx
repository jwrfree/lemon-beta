'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, LogOut, Eye, EyeOff, Download, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useAuth } from '@/providers/auth-provider';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_CONFIG } from '@/lib/sidebar-config';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const Sidebar = () => {
    const pathname = usePathname();
    const { handleSignOut } = useAuth();
    const { isSidebarCollapsed, setIsSidebarCollapsed, deferredPrompt, setDeferredPrompt, openTransactionSheet, setIsAIChatOpen } = useUI();
    const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();
    const router = useRouter();

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col fixed left-4 top-4 bottom-4 z-50 transition-[width,padding] duration-300 ease-in-out',
                'bg-background/85 backdrop-blur-xl border border-border/20 shadow-none rounded-2xl overflow-hidden',
                isSidebarCollapsed ? cn(SIDEBAR_CONFIG.collapsedWidth, 'py-10 px-2') : cn(SIDEBAR_CONFIG.expandedWidth, 'p-4 py-10')
            )}
        >
            {/* 1. Logo Section - Fixed Centering */}
            <div className={cn('flex items-center mb-12 transition-all duration-300 w-full', isSidebarCollapsed ? 'justify-center' : 'px-3')}>
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <div className="text-primary-foreground font-semibold text-xl leading-none tracking-tighter">L</div>
                </div>
                {!isSidebarCollapsed && (
                    <div className="flex flex-col ml-4 overflow-hidden whitespace-nowrap">
                        <p className="text-lg font-semibold tracking-tighter truncate text-foreground leading-none">{SIDEBAR_CONFIG.appName}</p>
                        <p className="text-label text-muted-foreground truncate opacity-50 mt-1.5">{SIDEBAR_CONFIG.appVersion}</p>
                    </div>
                )}
            </div>

            {/* 2. Primary Action - Aligned width */}
            <div className="mb-12 w-full">
                {!isSidebarCollapsed && (
                    <p className="label-xs px-5 mb-4">
                        Aksi Cepat
                    </p>
                )}
                <div className={isSidebarCollapsed ? "flex justify-center" : "px-1"}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => openTransactionSheet()}
                                className={cn(
                                    'active:scale-95 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0 rounded-full' : 'w-full gap-3 px-5 h-12 rounded-xl'
                                )}
                            >
                                <Sparkles className="h-5 w-5 shrink-0" />
                                {!isSidebarCollapsed && (
                                    <span className="font-semibold text-sm truncate">Smart Add</span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="text-label bg-primary text-primary-foreground border-none">
                                Smart Add
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </div>

            <div className="mb-12 w-full">
                {!isSidebarCollapsed && (
                    <p className="label-xs px-5 mb-4">
                        AI Coach
                    </p>
                )}
                <div className={isSidebarCollapsed ? "flex justify-center" : "px-1"}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setIsAIChatOpen(true)}
                                variant="outline"
                                className={cn(
                                    'active:scale-95 transition-all duration-300 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0 rounded-full' : 'w-full gap-3 px-5 h-12 rounded-xl'
                                )}
                            >
                                <Bot className="h-5 w-5 shrink-0" />
                                {!isSidebarCollapsed && (
                                    <span className="font-semibold text-sm truncate">Tanya Lemon</span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="text-label bg-primary/10 text-primary border-primary/20 shadow-none">
                                Tanya Lemon AI
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </div>

            {/* 3. Navigation - Aligned Icons */}
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar w-full" aria-label="Navigasi utama">
                {!isSidebarCollapsed && (
                    <p className="label-xs px-5 mb-4">
                        Menu Utama
                    </p>
                )}
                <div className="space-y-1">
                    {SIDEBAR_NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
                        return (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        prefetch={false}
                                        className={cn(
                                            'group flex items-center h-11 rounded-xl text-sm font-medium transition-all duration-300 relative',
                                            isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto rounded-full' : 'px-4 w-full gap-4 md:rounded-xl',
                                            isActive
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active-bg"
                                                className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-xl"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={cn("h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                                        {!isSidebarCollapsed && (
                                            <span className="truncate flex-1 whitespace-nowrap relative z-10 font-semibold tracking-tight">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                {isSidebarCollapsed && (
                                    <TooltipContent side="right" sideOffset={20} className="text-label bg-card/95 backdrop-blur-xl text-foreground border-border/40 shadow-none">
                                        {item.name}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </nav>

            {/* 4. Footer - Clean & Centered */}
            <div className="mt-auto pt-8 space-y-2 w-full">
                <div className="flex flex-col gap-1">
                    {deferredPrompt && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={handleInstallClick}
                                    className={cn(
                                        'text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 text-label',
                                        isSidebarCollapsed ? 'w-12 h-12 p-0 mx-auto flex items-center justify-center rounded-full' : 'w-full justify-start gap-4 px-4 h-11 rounded-xl'
                                    )}
                                >
                                    <Download className="h-5 w-5 shrink-0" />
                                    {!isSidebarCollapsed && <span>Install App</span>}
                                </Button>
                            </TooltipTrigger>
                            {isSidebarCollapsed && (
                                <TooltipContent side="right" sideOffset={20} className="text-label bg-card/95 backdrop-blur-xl text-primary border-primary/20 shadow-none">
                                    Install App
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                onClick={toggleBalanceVisibility}
                                className={cn(
                                    'text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl transition-all duration-300 text-label',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0 mx-auto flex items-center justify-center' : 'w-full justify-start gap-4 px-4 h-11 rounded-xl'
                                )}
                            >
                                {isBalanceVisible ? <Eye className="h-5 w-5 shrink-0" /> : <EyeOff className="h-5 w-5 shrink-0" />}
                                {!isSidebarCollapsed && <span>{isBalanceVisible ? 'Sembunyikan' : 'Tampilkan'}</span>}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="text-label bg-card/95 backdrop-blur-xl text-foreground border-border/40 shadow-none">
                                {isBalanceVisible ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
                            </TooltipContent>
                        )}
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className={cn(
                                    'text-muted-foreground hover:bg-muted/50 rounded-xl transition-all duration-300 text-label',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0 mx-auto flex items-center justify-center' : 'w-full justify-start gap-4 px-4 h-11 rounded-xl'
                                )}
                            >
                                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
                                {!isSidebarCollapsed && <span>Ciutkan</span>}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="text-label bg-card/95 backdrop-blur-xl text-foreground border-border/40 shadow-none">
                                Perluas Sidebar
                            </TooltipContent>
                        )}
                    </Tooltip>

                    <div className="pt-4 flex justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={handleSignOut}
                                    className={cn(
                                        'text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 text-label',
                                        isSidebarCollapsed ? 'w-12 h-12 p-0 flex items-center justify-center rounded-full' : 'w-full justify-start gap-4 px-4 h-11 rounded-xl'
                                    )}
                                >
                                    <LogOut className="h-5 w-5 shrink-0" />
                                    {!isSidebarCollapsed && <span>Keluar</span>}
                                </Button>
                            </TooltipTrigger>
                            {isSidebarCollapsed && (
                                <TooltipContent side="right" sideOffset={20} className="text-label bg-destructive/90 backdrop-blur-xl text-destructive-foreground border-none shadow-none">
                                    Keluar Akun
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </div>
            </div>
        </aside>
    );
};
