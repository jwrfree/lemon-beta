'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from '@/lib/icons';
import { cn, triggerHaptic } from '@/lib/utils';
import { useUI } from '@/components/ui-provider';
import { MOBILE_NAV_ITEMS, isNavItemActive } from '@/lib/sidebar-config';

const navRevealTransition = {
    duration: 0.18,
    ease: [0.22, 0.61, 0.36, 1] as const,
};

const slotBaseClassName =
    'group flex h-full w-full min-w-0 flex-col items-center px-1 pb-2 pt-3 text-xs motion-pressable active:scale-95';

const navIconRowClassName = 'flex h-7 w-full flex-none items-center justify-center';
const navLabelClassName = 'inline-flex h-4 w-full flex-none items-start justify-center truncate text-xs font-medium leading-none tracking-tight transition-colors';

interface NavSlotProps {
    label: string;
    children: React.ReactNode;
    isActive?: boolean;
    href?: string;
    onClick?: () => void;
}

const NavSlot = ({ label, children, isActive = false, href, onClick }: NavSlotProps) => {
    const className = cn(
        slotBaseClassName,
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    );

    const content = (
        <>
            <span className={navIconRowClassName}>{children}</span>
            <span
                className={cn(
                    navLabelClassName,
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
            >
                {label}
            </span>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                prefetch={false}
                onClick={onClick}
                className={className}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={label}
        >
            {content}
        </button>
    );
};

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
                <motion.nav
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={navRevealTransition}
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white shadow-elevation-2 dark:bg-background dark:shadow-elevation-2"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                    aria-label="Navigasi utama"
                >
                    <div className="mx-auto grid h-16 w-full max-w-lg grid-cols-5 items-stretch px-1">
                        {MOBILE_NAV_ITEMS.slice(0, 2).map((item) => {
                            const isActive = isNavItemActive(pathname, item);

                            return (
                                <NavSlot
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => triggerHaptic('light')}
                                    label={item.shortName ?? item.name}
                                    isActive={isActive}
                                >
                                    <item.icon
                                        size={20}
                                        weight={isActive ? 'fill' : 'regular'}
                                        className="shrink-0"
                                    />
                                </NavSlot>
                            );
                        })}

                        <NavSlot
                            onClick={() => {
                                triggerHaptic('medium');
                                openTransactionSheet();
                            }}
                            label="Tambah"
                        >
                            <Plus size={20} weight="regular" className="shrink-0" />
                        </NavSlot>

                        {MOBILE_NAV_ITEMS.slice(2).map((item) => {
                            const isActive = isNavItemActive(pathname, item);

                            return (
                                <NavSlot
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => triggerHaptic('light')}
                                    label={item.shortName ?? item.name}
                                    isActive={isActive}
                                >
                                    <item.icon
                                        size={20}
                                        weight={isActive ? 'fill' : 'regular'}
                                        className="shrink-0"
                                    />
                                </NavSlot>
                            );
                        })}
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

