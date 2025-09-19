
'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Plus, Activity, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    const mainPages = navItems.filter(item => !item.primary).map(item => item.href);

    const isModalOpen = isTxModalOpen || isWalletModalOpen || isBudgetModalOpen || isDeleteModalOpen || isTransferModalOpen || isEditWalletModalOpen || isEditTxModalOpen;
    const isVisible = (mainPages.includes(pathname) || pathname === '/') && !isModalOpen;

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
                                         <Link href={item.href} passHref legacyBehavior>
                                             <Button
                                                asChild
                                                className={cn(
                                                    "rounded-full h-14 w-14 bg-blue-600 text-white shadow-lg -translate-y-4 hover:bg-blue-700",
                                                )}
                                                aria-label={item.name}
                                            >
                                                <a>
                                                    <item.icon className="h-8 w-8" />
                                                    <span className="sr-only">{item.name}</span>
                                                </a>
                                            </Button>
                                         </Link>
                                     </div>
                                 )
                             }
                            return (
                                <Link key={item.id} href={item.href} passHref legacyBehavior>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className={cn(
                                            "flex flex-col items-center justify-center h-full w-full text-gray-500 rounded-none",
                                            isActive && "text-blue-600",
                                            "hover:bg-gray-50"
                                        )}
                                    >
                                        <a>
                                            <item.icon className="h-6 w-6" />
                                            <span className={cn("text-xs mt-1", isActive && "font-semibold")}>{item.name}</span>
                                        </a>
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

