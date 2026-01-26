'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { BalanceVisibilityToggle } from './balance-visibility-toggle';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_CONFIG } from '@/lib/sidebar-config';

export const Sidebar = () => {
    const pathname = usePathname();
    const { handleSignOut } = useApp();
    const { setIsTxModalOpen, isSidebarCollapsed, setIsSidebarCollapsed } = useUI();
    const router = useRouter();

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col h-full fixed top-0 left-0 z-50 border-r transition-all duration-300 ease-in-out',
                'bg-card',
                isSidebarCollapsed ? cn(SIDEBAR_CONFIG.collapsedWidth, 'px-2 py-4 gap-3') : cn(SIDEBAR_CONFIG.expandedWidth, 'p-4 gap-4')
            )}
        >
            <div className={cn('flex items-center', isSidebarCollapsed ? 'justify-center px-1' : 'px-3 py-4')}>
                <div className="h-9 w-9 rounded-xl bg-primary shadow-sm flex items-center justify-center shrink-0">
                    <div className="text-primary-foreground font-bold text-lg leading-none">L</div>
                </div>
                {!isSidebarCollapsed && (
                    <div className="ml-3 leading-tight overflow-hidden">
                        <p className="text-base font-semibold tracking-tight truncate">{SIDEBAR_CONFIG.appName}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate">{SIDEBAR_CONFIG.appVersion}</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <p className={cn('text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1 mb-2', isSidebarCollapsed && 'sr-only')}>
                    Aksi Cepat
                </p>
                <Button
                    onClick={() => router.push('/add-smart')}
                    className={cn(
                        'shadow-sm active:scale-95 transition-all bg-primary text-primary-foreground hover:bg-primary/90',
                        isSidebarCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'w-full gap-2 rounded-xl'
                    )}
                    size={isSidebarCollapsed ? "icon" : "lg"}
                >
                    <Sparkles className="h-5 w-5" />
                    {!isSidebarCollapsed && <span className="truncate">Smart Add</span>}
                </Button>
            </div>

            <nav className="flex-1 space-y-1 mt-4 overflow-y-auto no-scrollbar" aria-label="Navigasi utama">
                <p className={cn('text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1 mb-2', isSidebarCollapsed && 'sr-only')}>
                    Menu Utama
                </p>
                {SIDEBAR_NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            prefetch={false}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'group flex items-center gap-3 px-3 py-1.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden',
                                isSidebarCollapsed ? 'justify-center px-0' : 'px-3',
                                isActive
                                    ? 'text-primary bg-primary/10 dark:bg-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                        >
                            <motion.span
                                layoutId="sidebar-active"
                                className={cn(
                                    'absolute left-0 h-6 w-1 rounded-r-full bg-primary',
                                    !isActive && 'opacity-0'
                                )}
                                initial={false}
                                animate={{ opacity: isActive && !isSidebarCollapsed ? 1 : 0 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                            />
                            <span
                                className={cn(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                        : 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                            </span>
                            {!isSidebarCollapsed && (
                                <span className="truncate flex-1">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t pt-4 space-y-3">
                <div
                    className={cn(
                        'flex flex-col items-center rounded-2xl bg-muted border border-border',
                        isSidebarCollapsed ? 'p-1.5' : 'p-2'
                    )}
                >
                    <BalanceVisibilityToggle
                        variant="ghost"
                        className={cn(
                            'text-muted-foreground hover:bg-primary/10 hover:text-foreground rounded-xl transition-colors',
                            isSidebarCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'w-full justify-start gap-3 px-3'
                        )}
                        showLabel={!isSidebarCollapsed}
                    />
                    <Button
                        variant="ghost"
                        size={isSidebarCollapsed ? 'icon' : 'default'}
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={cn(
                            'rounded-xl hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-colors',
                            isSidebarCollapsed ? 'w-11 h-11 p-0 rounded-full' : 'w-full justify-start gap-3 px-3'
                        )}
                        aria-label={isSidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5" />
                                <span className="text-sm font-medium">Ciutkan Sidebar</span>
                            </>
                        )}
                    </Button>
                </div>
                <div className="w-full">
                     <Button
                        variant="ghost"
                        className={cn(
                            'text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl w-full transition-all',
                            isSidebarCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'justify-start gap-3 px-3'
                        )}
                        onClick={handleSignOut}
                        size={isSidebarCollapsed ? "icon" : "default"}
                    >
                        <LogOut className={cn("shrink-0", isSidebarCollapsed ? "h-6 w-6" : "h-5 w-5")} />
                        {!isSidebarCollapsed && <span className="text-sm font-medium">Keluar</span>}
                    </Button> 
                </div>
            </div>
        </aside>
    );
};