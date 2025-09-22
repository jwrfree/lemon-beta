
'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';


interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export const AnimatedCounter = ({ value, className, duration = 0.8 }: AnimatedCounterProps) => {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const display = useTransform(rounded, (latest) => formatCurrency(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, count, duration]);

  return <motion.p className={cn(className)}>{display}</motion.p>;
};
