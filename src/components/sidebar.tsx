
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PieChart, Plus, HandCoins, LogOut, Settings, Wallet, Bell, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { BalanceVisibilityToggle } from './balance-visibility-toggle';

export const Sidebar = () => {
    const pathname = usePathname();
    const { handleSignOut } = useApp();
    const { setIsTxModalOpen } = useUI();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
        { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
        { id: 'anggaran', href: '/budgeting', icon: HandCoins, name: 'Anggaran' },
        { id: 'dompet', href: '/wallets', icon: Wallet, name: 'Dompet' },
        { id: 'pengingat', href: '/reminders', icon: Bell, name: 'Pengingat' },
        { id: 'profil', href: '/settings', icon: Settings, name: 'Pengaturan' },
    ];

    return (
        <div className={`hidden md:flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} h-full border-r bg-card/50 backdrop-blur-sm p-4 gap-4 sticky top-0 transition-all duration-300`}>
            <div className="flex items-center justify-between px-3 py-4">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">L</span>
                    </div>
                    {!isCollapsed && <h1 className="text-xl font-bold tracking-tight">Lemon</h1>}
                </div>
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-11 w-11 p-0 hover:bg-muted rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
            </div>

            <Button 
                onClick={() => setIsTxModalOpen(true)} 
                className={`${isCollapsed ? 'w-11 h-11 p-0 justify-center' : 'w-full gap-2'} shadow-lg hover:shadow-primary/20 transition-all active:scale-95`} 
                size={isCollapsed ? "lg" : "lg"}
            >
                <Plus className="h-5 w-5" />
                {!isCollapsed && "Catat Transaksi"}
            </Button>

            <nav className="flex-1 space-y-1 mt-4 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative min-h-11",
                                isCollapsed ? 'justify-center px-2' : 'px-3',
                                isActive 
                                    ? "bg-primary/10 text-primary" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {!isCollapsed && item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t pt-4 space-y-1">
                <BalanceVisibilityToggle 
                    variant="ghost" 
                    className={`${isCollapsed ? 'w-11 h-11 p-0 justify-center' : 'w-full justify-start gap-3'} text-muted-foreground`} 
                    showLabel={!isCollapsed}
                />
                <Button 
                    variant="ghost" 
                    className={`${isCollapsed ? 'w-11 h-11 p-0 justify-center' : 'w-full justify-start gap-3'} text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
                    onClick={handleSignOut}
                    size={isCollapsed ? "lg" : "default"}
                >
                    <LogOut className="h-6 w-6" />
                    {!isCollapsed && "Keluar"}
                </Button>
            </div>
        </div>
    );
};
