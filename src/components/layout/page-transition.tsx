'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
    const pathname = usePathname();

    return (
        <div
            key={pathname}
            className={cn('motion-page-enter', className)}
            data-route={pathname}
        >
            {children}
        </div>
    );
};
