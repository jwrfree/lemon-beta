'use client';

/**
 * FAB — Floating Action Button
 *
 * Design System standard for all mobile create/add actions.
 * Position: fixed bottom-24 right-6 (mobile), md:bottom-8 md:right-8 (desktop)
 * Hidden on desktop by default (lg:hidden). Remove lg:hidden when needed on desktop.
 * Color: bg-primary by default. Only use a semantic override when the action is
 * inherently destructive (e.g., a delete-only panel). Never use literal color
 * names (purple-600, blue-600) — override via className using semantic tokens only.
 *
 * Usage:
 *   <FAB onClick={openModal} label="Tambah transaksi" />
 *   <FAB onClick={openModal} label="Hapus data" className="bg-destructive shadow-destructive/40" />
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FABProps {
  /** Click handler that opens the relevant modal or sheet */
  onClick: () => void;
  /** Accessible label for screen readers and tooltip */
  label: string;
  /** Icon component — defaults to Plus */
  icon?: React.ElementType;
  /** Override classes. Use semantic tokens only (bg-destructive, not bg-red-600). */
  className?: string;
  /** Set to false to show on desktop too. Default: true (lg:hidden) */
  mobileOnly?: boolean;
}

export const FAB = ({
  onClick,
  label,
  icon: Icon = Plus,
  className,
  mobileOnly = true,
}: FABProps) => {
  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8',
        mobileOnly && 'lg:hidden',
      )}
    >
      <Button
        onClick={onClick}
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-2xl shadow-primary/40',
          'hover:scale-110 transition-transform active:scale-95',
          className,
        )}
        aria-label={label}
      >
        <Icon className="h-7 w-7" />
        <span className="sr-only">{label}</span>
      </Button>
    </div>
  );
};
