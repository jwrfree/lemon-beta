
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Plus, Activity, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';
import Link from 'next/link';

export const BottomNavigation = () => {
    const pathname = usePathname();
    const {
        isTxModalOpen,
        isWalletModalOpen,
        isBudgetModalOpen,
        isDeleteModalOpen,
        isTransferModalOpen,
        isEditWalletModalOpen,
        isEditTxModalOpen
    } = useApp();

    const navItems = [
        { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
        { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
        { id: 'add', href: '/add-smart', icon: Plus, name: 'Tambah', primary: true },
        { id: 'aktivitas', href: '/transactions', icon: Activity, name: 'Aktivitas' },
        { id: 'profil', href: '/settings', icon: User, name: 'Profil' },
    ];
    
    // The pages where the bottom nav should be visible
    const mainPages = navItems.map(item => item.href);

    const isModalOpen = isTxModalOpen || isWalletModalOpen || isBudgetModalOpen || isDeleteModalOpen || isTransferModalOpen || isEditWalletModalOpen || isEditTxModalOpen;
    const isVisible = (mainPages.includes(pathname) || pathname === '/' || pathname.startsWith('/budgeting') || pathname.startsWith('/wallets')) && !isModalOpen;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-40"
                >
                    <div className="w-full max-w-md mx-auto grid grid-cols-5 h-16 items-center bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t md:rounded-b-lg md:rounded-t-none">
                        {navItems.map(item => {
                             const isActive = pathname === item.href;
                             if (item.primary) {
                                 return (
                                     <div key={item.id} className="flex justify-center items-center">
                                         <Link 
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-center rounded-full h-14 w-14 bg-primary text-white shadow-lg -translate-y-4 hover:bg-primary/90 transition-colors",
                                            )}
                                            aria-label={item.name}
                                        >
                                            <item.icon className="h-8 w-8" />
                                            <span className="sr-only">{item.name}</span>
                                         </Link>
                                     </div>
                                 )
                             }
                            return (
                                <Link 
                                    key={item.id} 
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center h-full w-full rounded-none transition-colors text-muted-foreground hover:bg-accent",
                                        isActive && "text-primary",
                                    )}
                                >
                                    <item.icon className="h-6 w-6" />
                                    <span className={cn("text-xs mt-1", isActive && "font-semibold")}>{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
