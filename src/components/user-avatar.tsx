'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface UserAvatarProps {
    name?: string | null;
    src?: string | null;
    className?: string;
    fallbackClassName?: string;
}

const COLORS = [
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
];

export const UserAvatar = ({ name, src, className, fallbackClassName }: UserAvatarProps) => {
    const initials = useMemo(() => {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [name]);

    const colorClass = useMemo(() => {
        if (!name) return "bg-muted text-muted-foreground";
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % COLORS.length;
        return COLORS[index];
    }, [name]);

    return (
        <Avatar className={cn("h-10 w-10 border border-border/50", className)}>
            <AvatarImage src={src || ''} alt={name || 'User'} className="object-cover" />
            <AvatarFallback className={cn("font-semibold text-sm", colorClass, fallbackClassName)}>
                {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
        </Avatar>
    );
};