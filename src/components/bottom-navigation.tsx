'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn, triggerHaptic } from '@/lib/utils';
import { useUI } from '@/components/ui-provider';
import Link from 'next/link';
import { MOBILE_NAV_ITEMS, isNavItemActive } from '@/lib/sidebar-config';

export const BottomNavigation = () => {
    const pathname = usePathname();
    const {
        isAnyModalOpen,
        openTransactionSheet,
    } = useUI();

    const isVisible = !isAnyModalOpen;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-3 left-3 right-3 z-40 rounded-[28px] bg-white/88 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.32)] backdrop-blur-[24px] pb-safe dark:bg-background/88"
                >
                    <div className="mx-auto grid h-16 w-full max-w-lg grid-cols-5 items-center px-2">
                        {MOBILE_NAV_ITEMS.slice(0, 2).map((item) => {
                            const isActive = isNavItemActive(pathname, item);

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    prefetch={false}
                                    onClick={() => triggerHaptic('light')}
                                    className={cn(
                                        'group relative flex h-full flex-col items-center justify-center transition-all active:scale-95',
                                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    aria-label={item.name}
                                >
                                    <div className="relative flex flex-col items-center gap-1">
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute -inset-x-3 -inset-y-1 -z-10 rounded-xl bg-primary/10 dark:bg-primary/20"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={cn("z-10 h-5 w-5 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={cn("text-xs font-semibold leading-none transition-opacity", isActive ? "opacity-100" : "opacity-90")}>
                                            {item.shortName ?? item.name}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}

                        <div className="flex justify-center items-center relative h-full">
                            <div className="absolute -top-6 h-14 w-14 rounded-full bg-[#f7f3ea] p-1 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.32)] dark:bg-background">
                                <button
                                    type="button"
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        openTransactionSheet();
                                    }}
                                    className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-110 hover:bg-primary/90 active:scale-95"
                                    aria-label="Smart Add"
                                >
                                    <Sparkles className="relative z-10 h-6 w-6" />
                                    <span className="sr-only">Smart Add</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                </button>
                            </div>
                        </div>

                        {MOBILE_NAV_ITEMS.slice(2).map((item) => {
                            const isActive = isNavItemActive(pathname, item);

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    prefetch={false}
                                    onClick={() => triggerHaptic('light')}
                                    className={cn(
                                        'group relative flex h-full flex-col items-center justify-center transition-all active:scale-95',
                                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    aria-label={item.name}
                                >
                                    <div className="relative flex flex-col items-center gap-1">
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute -inset-x-3 -inset-y-1 -z-10 rounded-xl bg-primary/10 dark:bg-primary/20"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className={cn("z-10 h-5 w-5 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={cn("text-xs font-semibold leading-none transition-opacity", isActive ? "opacity-100" : "opacity-90")}>
                                            {item.shortName ?? item.name}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
