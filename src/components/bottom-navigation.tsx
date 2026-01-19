
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Plus, HandCoins, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/components/ui-provider';
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
        isGoalModalOpen,
        isReminderModalOpen,
        isDebtModalOpen,
        isDebtPaymentModalOpen,
    } = useUI();

    const navItems = [
        { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
        { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
        { id: 'add', href: '/add-smart', icon: Plus, name: 'Tambah', primary: true },
        { id: 'anggaran', href: '/budgeting', icon: HandCoins, name: 'Anggaran' },
        { id: 'profil', href: '/settings', icon: User, name: 'Profil' },
    ];
    
    const isModalOpen =
        isTxModalOpen ||
        isWalletModalOpen ||
        isBudgetModalOpen ||
        isDeleteModalOpen ||
        isTransferModalOpen ||
        isEditWalletModalOpen ||
        isGoalModalOpen ||
        isReminderModalOpen ||
        isDebtModalOpen ||
        isDebtPaymentModalOpen;
    
    const isVisible = !isModalOpen;

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
                    <div
                        className="w-full max-w-md mx-auto grid grid-cols-5 items-center bg-card/90 backdrop-blur-xl shadow-[0_-2px_15px_rgba(0,0,0,0.08)] border-t border-border/50 md:rounded-b-lg md:rounded-t-none bottom-nav-container"
                        style={{
                            paddingBottom: 'env(safe-area-inset-bottom)',
                            minHeight: 'calc(4rem + env(safe-area-inset-bottom))',
                        }}
                    >
                        {navItems.map(item => {
                            const isActive = pathname.startsWith(item.href);

                            if (item.primary) {
                                return (
                                    <div key={item.id} className="flex justify-center items-center relative">
                                        <div className="absolute -top-7 bg-background rounded-full p-1.5 shadow-lg ring-2 ring-background/50 fab-position">
                                           <Link
                                               href={item.href}
                                               className={cn(
                                                   'flex items-center justify-center rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transition-all duration-200 hover:scale-110 active:scale-95 relative overflow-hidden fab-enhanced'
                                               )}
                                               aria-label={item.name}
                                           >
                                               <item.icon className="h-7 w-7 relative z-10" />
                                               <span className="sr-only">{item.name}</span>
                                               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                           </Link>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'flex flex-col items-center justify-center h-full w-full rounded-none transition-all active:scale-95 group relative',
                                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute top-1 w-8 h-1 bg-primary rounded-full opacity-80"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={cn("h-6 w-6 mb-1 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'font-bold' : '')}>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
