'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';

interface BalanceVisibilityToggleProps {
  className?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const BalanceVisibilityToggle: React.FC<BalanceVisibilityToggleProps> = ({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false
}) => {
  const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleBalanceVisibility}
      className={cn('gap-2', className)}
      aria-label={isBalanceVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
    >
      {isBalanceVisible ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="text-sm">
          {isBalanceVisible ? 'Sembunyikan' : 'Tampilkan'}
        </span>
      )}
    </Button>
  );
};