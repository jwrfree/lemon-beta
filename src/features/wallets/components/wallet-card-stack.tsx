'use client';

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { MoreVertical, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';
import type { Wallet } from '@/types/models';

interface WalletCardStackProps {
  wallets: Wallet[];
  activeIndex: number;
  setActiveIndex: (update: number | ((prevIndex: number) => number)) => void;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const WalletCardStack = ({ wallets, activeIndex, setActiveIndex }: WalletCardStackProps) => {
  const { openEditWalletModal } = useUI();
  const { isBalanceVisible } = useBalanceVisibility();

  const paginate = (newDirection: number) => {
    triggerHaptic('light');
    setActiveIndex(prevIndex => (prevIndex + newDirection + wallets.length) % wallets.length);
  };

  const onDragEnd = (_e: unknown, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.y, velocity.y);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div className="relative w-full py-10 flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full h-56 flex items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {wallets.map((wallet, i) => {
            const isActive = i === activeIndex;
            
            // Calculate relative position for 3D effect
            const diff = i - activeIndex;
            const absDiff = Math.abs(diff);
            
            // Only show active and nearby cards for performance
            if (absDiff > 2) return null;

            const { Icon, gradient, textColor } = getWalletVisuals(wallet.name, wallet.icon || undefined);

            return (
              <motion.div
                key={wallet.id}
                layout
                drag={isActive ? "y" : false}
                onDragEnd={onDragEnd}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.4}
                onClick={() => !isActive && (triggerHaptic('light'), setActiveIndex(i))}
                className={cn(
                  "absolute w-[88%] max-w-sm h-52 rounded-[2.5rem] text-white shadow-2xl overflow-hidden premium-shadow",
                  isActive ? "cursor-grab active:cursor-grabbing z-30" : "cursor-pointer grayscale-[0.2]"
                )}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                }}
                animate={{
                  scale: isActive ? 1 : 1 - absDiff * 0.08,
                  y: diff * 45,
                  rotateX: isActive ? 0 : diff * -5,
                  zIndex: 30 - absDiff,
                  opacity: 1 - absDiff * 0.3,
                  filter: isActive ? 'blur(0px)' : `blur(${absDiff * 1}px)`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {/* Premium Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08] pointer-events-none" />
                
                {/* Animated Ornaments */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" 
                />
                
                <div className="relative p-7 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                        <Icon className={cn("h-6 w-6", textColor)} />
                      </div>
                      <div>
                        <p className="font-medium text-xl tracking-tight drop-shadow-sm">{wallet.name}</p>
                        {wallet.isDefault && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="h-3 w-3 text-white/60" />
                                <span className="text-[9px] font-medium uppercase tracking-widest text-white/60">Dompet Utama</span>
                            </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-10 w-10 rounded-2xl relative z-10 backdrop-blur-sm border border-white/10"
                      onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); openEditWalletModal(wallet); }}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-[9px] font-medium uppercase tracking-[0.2em]">Saldo Tersedia</span>
                    </div>
                    <p className={cn("text-4xl font-medium tracking-tighter tabular-nums drop-shadow-md", !isBalanceVisible && 'blur-md transition-all duration-500')}>
                      {isBalanceVisible ? formatCurrency(wallet.balance) : 'Rp ••••••'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Premium Pagination Dots */}
      <div className="flex justify-center gap-3 mt-12 bg-zinc-100 dark:bg-zinc-900/50 p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
        {wallets.map((_, i) => (
          <button
            key={i}
            onClick={() => { triggerHaptic('light'); setActiveIndex(i); }}
            className="group relative h-2 w-2"
          >
            <motion.span
              animate={{ 
                width: i === activeIndex ? 24 : 8,
                backgroundColor: i === activeIndex ? 'var(--primary)' : 'rgba(161, 161, 170, 0.3)'
              }}
              className="absolute inset-0 rounded-full transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

