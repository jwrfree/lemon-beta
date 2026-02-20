'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Sparkles, NotebookPen, User } from 'lucide-react';
import { cn, triggerHaptic } from '@/lib/utils';
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
        isSmartAddOpen,
    } = useUI();

    const navItems = [
        { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
        { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
        { id: 'add', href: '/add-smart', icon: Sparkles, name: 'Smart', primary: true },
        { id: 'rencana', href: '/plan', icon: NotebookPen, name: 'Rencana' },
        { id: 'profil', href: '/settings', icon: User, name: 'Profil' },
    ];

    // Check if any modal is open to hide the bottom nav
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
        isDebtPaymentModalOpen ||
        isSmartAddOpen;

    const isVisible = !isModalOpen;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-4 right-4 z-40 md:bottom-8"
                >
                    <div
                        className="w-full max-w-md mx-auto grid grid-cols-5 items-center bg-popover/80 backdrop-blur-2xl shadow-2xl border border-border/50 rounded-full h-16 px-1.5 py-1"
                    >
                        {navItems.map(item => {
                            const isActive = pathname.startsWith(item.href);

                            if (item.primary) {
                                return (
                                    <div key={item.id} className="flex justify-center items-center relative">
                                        <div className="absolute -top-8 rounded-full shadow-lg">
                                            <Link
                                                href={item.href}
                                                prefetch={false}
                                                onClick={() => triggerHaptic('medium')}
                                                className={cn(
                                                    'flex items-center justify-center rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transition-all duration-200 hover:scale-110 active:scale-95 relative overflow-hidden fab-enhanced'
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
                                    prefetch={false}
                                    onClick={() => triggerHaptic('light')}
                                    className={cn(
                                                        'flex flex-col items-center justify-center h-10 w-10 rounded-full transition-all active:scale-95 group relative',
                                                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                                    )}
                                    aria-label={item.name}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 m-auto w-9 h-7 rounded-full bg-primary/10 dark:bg-primary/20 -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={cn("h-5 w-5 transition-transform z-10", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="sr-only">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
