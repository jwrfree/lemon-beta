
'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export const AnimatedCounter = ({ value, className, duration = 0.8 }: AnimatedCounterProps) => {
  const { isBalanceVisible } = useBalanceVisibility();
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  // Generate hidden balance representation (asterisks)
  const generateHiddenBalance = (amount: number) => {
    const digitCount = Math.ceil(Math.log10(Math.abs(amount) + 1));
    const asteriskCount = Math.min(Math.max(6, digitCount + 2), 12);
    return 'Rp ' + '•'.repeat(asteriskCount);
  };

  const display = useTransform(rounded, (latest) => {
    if (isBalanceVisible) {
      return formatCurrency(latest);
    }
    return generateHiddenBalance(latest);
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, count, duration]);

  return (
    <motion.p 
      className={cn(className, !isBalanceVisible && 'blur-sm transition-all duration-300')}
    >
      {display}
    </motion.p>
  );
};
