'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PieChart, Plus, HandCoins, Settings, Wallet, Bell, ChevronLeft, ChevronRight, Landmark, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { BalanceVisibilityToggle } from './balance-visibility-toggle';

export const Sidebar = () => {
    const pathname = usePathname();
    const { handleSignOut } = useApp();
    const { setIsTxModalOpen, isSidebarCollapsed, setIsSidebarCollapsed } = useUI();

    const navItems = [
        { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
        { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
        { id: 'anggaran', href: '/budgeting', icon: HandCoins, name: 'Anggaran' },
        { id: 'dompet', href: '/wallets', icon: Wallet, name: 'Dompet' },
        { id: 'assets-liabilities', href: '/assets-liabilities', icon: Landmark, name: 'Aset & Liabilitas' },
        { id: 'pengingat', href: '/reminders', icon: Bell, name: 'Pengingat' },
        { id: 'profil', href: '/settings', icon: Settings, name: 'Pengaturan' },
    ];

    return (
        <div
            className={cn(
                'hidden md:flex flex-col h-full fixed top-0 left-0 z-50 border-r transition-all duration-300',
                'bg-card',
                isSidebarCollapsed ? 'w-16 px-2 py-4 gap-3' : 'w-64 p-4 gap-4'
            )}
        >
            <div className={cn('flex items-center', isSidebarCollapsed ? 'justify-center px-1' : 'px-3 py-4')}>
                <div className="h-9 w-9 rounded-xl bg-primary shadow-sm flex items-center justify-center">
                    <div className="text-primary-foreground font-bold text-lg">L</div>
                </div>
                {!isSidebarCollapsed && (
                    <div className="ml-3 leading-tight">
                        <p className="text-base font-semibold tracking-tight">Lemon</p>
                        <p className="text-xs text-muted-foreground font-medium">Beta</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <p className={cn('text-[10px] font-medium text-muted-foreground px-1 mb-2', isSidebarCollapsed && 'sr-only')}>
                    Aksi Cepat
                </p>
                <Button
                    onClick={() => setIsTxModalOpen(true)}
                    className={cn(
                        'shadow-sm active:scale-95 transition-all bg-primary text-primary-foreground',
                        isSidebarCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'w-full gap-2 rounded-xl'
                    )}
                    size="lg"
                >
                    <Plus className="h-5 w-5" />
                    {!isSidebarCollapsed && "Catat Transaksi"}
                </Button>
            </div>

            <nav className="flex-1 space-y-1 mt-4 overflow-y-auto no-scrollbar" aria-label="Navigasi utama">
                <p className={cn('text-[10px] font-medium text-muted-foreground px-1 mb-2', isSidebarCollapsed && 'sr-only')}>
                    Menu Utama
                </p>
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all relative overflow-hidden',
                                isSidebarCollapsed ? 'justify-center px-0' : 'px-3',
                                isActive
                                    ? 'text-primary bg-primary/10 dark:bg-primary/20 dark:text-primary'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'
                            )}
                        >
                            <motion.span
                                layoutId="sidebar-active"
                                className={cn(
                                    'absolute left-2 h-6 w-1 rounded-full bg-primary',
                                    !isActive && 'opacity-0'
                                )}
                                initial={false}
                                animate={{ opacity: isActive && !isSidebarCollapsed ? 1 : 0 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                            />
                            <span
                                className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                        : 'bg-muted/70 text-muted-foreground group-hover:text-foreground'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                            </span>
                            {!isSidebarCollapsed && (
                                <span className="truncate">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t pt-4 space-y-3">
                <div
                    className={cn(
                        'flex flex-col items-center rounded-xl bg-accent/60',
                        isSidebarCollapsed ? 'gap-2 p-2' : 'gap-2 p-3'
                    )}
                >
                    <BalanceVisibilityToggle
                        variant="ghost"
                        className={cn(
                            'text-muted-foreground hover:bg-primary/10 hover:text-foreground rounded-xl',
                            isSidebarCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'w-full justify-start gap-3'
                        )}
                        showLabel={!isSidebarCollapsed}
                    />
                    <Button
                        variant="ghost"
                        size={isSidebarCollapsed ? 'icon' : 'default'}
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={cn(
                            'rounded-lg hover:bg-primary/10 focus:ring-2 focus:ring-ring focus:ring-offset-2',
                            isSidebarCollapsed ? 'w-11 h-11 p-0 rounded-full' : 'w-full justify-start gap-2 px-3'
                        )}
                        aria-label={isSidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
                        title={isSidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5" />
                                <span className="text-sm font-medium">Ciutkan</span>
                            </>
                        )}
                    </Button>
                </div>
                <div className="w-full">
                     <Button
                        variant="ghost"
                        className={cn(
                            'text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl w-full',
                            isSidebarCollapsed ? 'w-11 h-11 p-0 justify-center rounded-full' : 'justify-start gap-3'
                        )}
                        onClick={handleSignOut}
                        size={isSidebarCollapsed ? "lg" : "default"}
                    >
                        <LogOut className="h-6 w-6" />
                        {!isSidebarCollapsed && "Keluar"}
                    </Button> 
                </div>
            </div>
        </div>
    );
};