'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';

interface SecureBalanceDisplayProps {
  value: number;
  className?: string;
  hiddenClassName?: string;
  showAnimation?: boolean;
  duration?: number;
}

export const SecureBalanceDisplay: React.FC<SecureBalanceDisplayProps> = ({
  value,
  className,
  hiddenClassName,
  showAnimation = true,
  duration = 0.8
}) => {
  const { isBalanceVisible } = useBalanceVisibility();

  // Generate hidden balance representation (asterisks)
  const generateHiddenBalance = (amount: number) => {
    // Estimate length based on the formatted currency string
    const formatted = formatCurrency(amount);
    // Count digits in the amount (excluding "Rp" and separators)
    const digitCount = Math.ceil(Math.log10(Math.abs(amount) + 1));
    // Create asterisks that roughly match the length of the real balance
    const asteriskCount = Math.min(Math.max(6, digitCount + 2), 12); // Between 6-12 characters
    return 'Rp ' + '•'.repeat(asteriskCount);
  };

  if (isBalanceVisible) {
    if (showAnimation) {
      return <motion.p className={cn(className)}>{formatCurrency(value)}</motion.p>;
    }
    return <span className={cn(className)}>{formatCurrency(value)}</span>;
  }

  // Hidden balance display
  const hiddenText = generateHiddenBalance(value);
  
  if (showAnimation) {
    return (
      <motion.p 
        className={cn('blur-sm transition-all duration-300', hiddenClassName)}
        animate={{ opacity: 0.7 }}
        whileInView={{ opacity: 1 }}
      >
        {hiddenText}
      </motion.p>
    );
  }

  return (
    <span className={cn('blur-sm transition-all duration-300', hiddenClassName)}>
      {hiddenText}
    </span>
  );
};