'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function InstallPrompt() {
  const { deferredPrompt, setDeferredPrompt } = useUI();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      // Delay showing the prompt slightly so it doesn't clash with initial load
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        setShow(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-96"
        >
          <div className="bg-popover/90 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Install Lemon App</span>
                <span className="text-xs text-muted-foreground">Akses lebih cepat & offline</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleInstallClick} 
                size="sm" 
                className="h-8 text-xs font-medium px-3"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Tutup</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
