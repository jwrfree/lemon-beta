
'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './app-provider';
import { CheckCircle2, XCircle, Info, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastIcons: { [key: string]: LucideIcon } = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const toastColors: { [key: string]: string } = {
  success: 'bg-gray-800',
  error: 'bg-gray-800',
  info: 'bg-gray-800',
};

export const CustomToast = () => {
  const { toastState, hideToast } = useApp();
  const { show, message, type } = toastState;

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, hideToast]);

  const ToastIcon = toastIcons[type];

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed bottom-20 inset-x-0 z-50 flex justify-center">
            <motion.div
              layout
              initial={{ y: 100, scaleX: 0.3, opacity: 0 }}
              animate={{ y: 0, scaleX: 1, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 150 } }}
              exit={{ y: 100, scaleX: 0.3, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
            >
              <div
                className={cn(
                  'flex items-center gap-3 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap',
                  toastColors[type]
                )}
              >
                <ToastIcon className="h-5 w-5" />
                <span>{message}</span>
              </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
