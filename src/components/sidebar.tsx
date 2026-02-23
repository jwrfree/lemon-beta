'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, LogOut, Eye, EyeOff, Download } from 'lucide-react';
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
    const { isSidebarCollapsed, setIsSidebarCollapsed, deferredPrompt, setDeferredPrompt } = useUI();
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
                'bg-background/85 backdrop-blur-xl border border-border/20 shadow-card rounded-xl overflow-hidden',
                isSidebarCollapsed ? cn(SIDEBAR_CONFIG.collapsedWidth, 'py-10 px-2') : cn(SIDEBAR_CONFIG.expandedWidth, 'p-4 py-10')
            )}
        >
            {/* 1. Logo Section - Fixed Centering */}
            <div className={cn('flex items-center mb-12 transition-all duration-300 w-full', isSidebarCollapsed ? 'justify-center' : 'px-3')}>
                <div className="h-10 w-10 rounded-full bg-primary shadow-lg shadow-primary/20 flex items-center justify-center shrink-0">
                    <div className="text-primary-foreground font-semibold text-xl leading-none tracking-tighter">L</div>
                </div>
                {!isSidebarCollapsed && (
                    <div className="flex flex-col ml-4 overflow-hidden whitespace-nowrap">
                        <p className="text-lg font-semibold tracking-tighter truncate text-foreground leading-none">{SIDEBAR_CONFIG.appName}</p>
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.2em] truncate opacity-50 mt-1.5">{SIDEBAR_CONFIG.appVersion}</p>
                    </div>
                )}
            </div>

            {/* 2. Primary Action - Aligned width */}
            <div className="mb-12 w-full">
                {!isSidebarCollapsed && (
                    <p className="text-[9px] font-semibold text-muted-foreground/40 px-5 mb-4 uppercase tracking-[0.3em]">
                        Aksi Cepat
                    </p>
                )}
                <div className={isSidebarCollapsed ? "flex justify-center" : "px-1"}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => router.push('/add-smart')}
                                className={cn(
                                    'shadow-lg shadow-primary/20 active:scale-95 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0' : 'w-full gap-3 px-5 h-12'
                                )}
                            >
                                <Sparkles className="h-5 w-5 shrink-0" />
                                {!isSidebarCollapsed && (
                                    <span className="font-semibold text-sm truncate">Smart Add</span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="font-semibold text-[10px] uppercase tracking-widest bg-primary text-primary-foreground border-none">
                                Smart Add
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </div>

            {/* 3. Navigation - Aligned Icons */}
            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar w-full" aria-label="Navigasi utama">
                {!isSidebarCollapsed && (
                    <p className="text-[9px] font-semibold text-muted-foreground/40 px-5 mb-4 uppercase tracking-[0.3em]">
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
                                            'group flex items-center h-11 rounded-full text-sm font-medium transition-all duration-300 relative',
                                            isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-4 w-full gap-4',
                                            isActive
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active-bg"
                                                className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-full"
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
                                    <TooltipContent side="right" sideOffset={20} className="font-semibold text-[10px] uppercase tracking-widest bg-card text-foreground border-border shadow-xl">
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
                                        'text-primary hover:bg-primary/10 rounded-full transition-all duration-300 font-semibold text-[10px] uppercase tracking-widest',
                                        isSidebarCollapsed ? 'w-12 h-12 p-0 mx-auto flex items-center justify-center' : 'w-full justify-start gap-4 px-4 h-11'
                                    )}
                                >
                                    <Download className="h-5 w-5 shrink-0" />
                                    {!isSidebarCollapsed && <span>Install App</span>}
                                </Button>
                            </TooltipTrigger>
                            {isSidebarCollapsed && (
                                <TooltipContent side="right" sideOffset={20} className="font-semibold text-[10px] uppercase tracking-widest bg-card text-primary border-primary/20 shadow-xl">
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
                                    'text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-full transition-all duration-300 font-semibold text-[10px] uppercase tracking-widest',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0 mx-auto flex items-center justify-center' : 'w-full justify-start gap-4 px-4 h-11'
                                )}
                            >
                                {isBalanceVisible ? <Eye className="h-5 w-5 shrink-0" /> : <EyeOff className="h-5 w-5 shrink-0" />}
                                {!isSidebarCollapsed && <span>{isBalanceVisible ? 'Sembunyikan' : 'Tampilkan'}</span>}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="font-semibold text-[10px] uppercase tracking-widest bg-card text-foreground border-border shadow-xl">
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
                                    'text-muted-foreground hover:bg-muted/50 rounded-full transition-all duration-300 font-semibold text-[10px] uppercase tracking-widest',
                                    isSidebarCollapsed ? 'w-12 h-12 p-0 mx-auto flex items-center justify-center' : 'w-full justify-start gap-4 px-4 h-11'
                                )}
                            >
                                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
                                {!isSidebarCollapsed && <span>Ciutkan</span>}
                            </Button>
                        </TooltipTrigger>
                        {isSidebarCollapsed && (
                            <TooltipContent side="right" sideOffset={20} className="font-semibold text-[10px] uppercase tracking-widest bg-card text-foreground border-border shadow-xl">
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
                                        'text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-300 font-semibold text-[10px] uppercase tracking-widest',
                                        isSidebarCollapsed ? 'w-12 h-12 p-0 flex items-center justify-center' : 'w-full justify-start gap-4 px-4 h-11'
                                    )}
                                >
                                    <LogOut className="h-5 w-5 shrink-0" />
                                    {!isSidebarCollapsed && <span>Keluar</span>}
                                </Button>
                            </TooltipTrigger>
                            {isSidebarCollapsed && (
                                <TooltipContent side="right" sideOffset={20} className="font-semibold text-[10px] uppercase tracking-widest bg-destructive text-destructive-foreground border-none shadow-xl">
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
