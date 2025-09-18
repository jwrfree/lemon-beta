
'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PiggyBank, PlusCircle, BarChart3, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/app-provider';

export const BottomNavigation = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { 
        setIsTxModalOpen,
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
        { id: 'budgeting', href: '/budgeting', icon: PiggyBank, name: 'Anggaran' },
        { id: 'add', href: '/add-smart', icon: Sparkles, name: 'Tambah', primary: true },
        { id: 'charts', href: '/charts', icon: BarChart3, name: 'Analisis' },
        { id: 'settings', href: '/settings', icon: Settings, name: 'Pengaturan' },
    ];
    
    const mainPages = navItems.map(item => item.href);

    const isModalOpen = isTxModalOpen || isWalletModalOpen || isBudgetModalOpen || isDeleteModalOpen || isTransferModalOpen || isEditWalletModalOpen || isEditTxModalOpen;
    const isVisible = mainPages.includes(pathname) && !isModalOpen;

    const handleNavClick = (item: any) => {
        if (item.id === 'add-old') { // Keep old logic if needed, but disable for now
            setIsTxModalOpen(true);
        } else {
            router.push(item.href);
        }
    };

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
                    <div className="w-full max-w-md mx-auto flex h-16 items-center justify-around bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-t-2xl md:rounded-b-lg md:rounded-t-none">
                        {navItems.map(item => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    "flex flex-col items-center justify-center h-full w-1/5 text-muted-foreground rounded-none",
                                    pathname === item.href && "text-primary",
                                    item.primary && "rounded-full h-12 w-12 bg-primary text-white shadow-lg -translate-y-4 hover:bg-primary/90"
                                )}
                            >
                                <item.icon className={cn("h-6 w-6", item.primary && "h-7 w-7")} />
                                {!item.primary && <span className="text-[10px] mt-1">{item.name}</span>}
                            </Button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
