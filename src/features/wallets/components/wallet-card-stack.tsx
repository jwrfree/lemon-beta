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

            const { Icon, gradient, textColor, logo } = getWalletVisuals(wallet.name, wallet.icon || undefined);

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
                  "absolute w-[88%] max-w-sm h-52 rounded-card-premium text-white shadow-card overflow-hidden",
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
                      <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-card border border-white/20 shadow-inner flex items-center justify-center">
                        {logo ? (
                          <>
                            <img
                              src={logo}
                              alt={wallet.name}
                              className="h-6 w-6 object-contain rounded-full bg-white/90 p-0.5"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const icon = e.currentTarget.nextElementSibling;
                                if (icon) icon.classList.remove('hidden');
                              }}
                            />
                            <Icon className={cn("h-6 w-6 hidden", textColor)} />
                          </>
                        ) : (
                          <Icon className={cn("h-6 w-6", textColor)} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-xl tracking-tight drop-shadow-sm">{wallet.name}</p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                            {wallet.icon === 'e-wallet' ? 'E-Wallet' : wallet.icon === 'bank' ? 'Bank' : 'Tunai'}
                          </span>
                        </div>
                        {wallet.isDefault && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="h-3 w-3 text-white/60" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Dompet Utama</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-10 w-10 rounded-full relative z-10 backdrop-blur-sm border border-white/10"
                      onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); openEditWalletModal(wallet); }}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs font-semibold uppercase tracking-widest">Saldo Tersedia</span>
                    </div>
                    <p className={cn("text-4xl font-semibold tracking-tighter tabular-nums drop-shadow-md", !isBalanceVisible && 'blur-md transition-all duration-500')}>
                      {isBalanceVisible ? formatCurrency(wallet.balance) : 'Rp ••••••'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Premium Quick Navigator (Logo-based) */}
      <div className="w-full mt-10 px-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {wallets.map((wallet, i) => {
            const isActive = i === activeIndex;
            const { Icon, logo, textColor } = getWalletVisuals(wallet.name, wallet.icon || undefined);

            return (
              <button
                key={wallet.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveIndex(i);
                  // Optional: Smooth scroll the button into view
                  document.getElementById(`nav-wallet-${wallet.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                id={`nav-wallet-${wallet.id}`}
                className="flex flex-col items-center gap-2 shrink-0 snap-center transition-all duration-300"
                style={{ opacity: isActive ? 1 : 0.4, transform: isActive ? 'scale(1.1)' : 'scale(0.9)' }}
              >
                <div className={cn(
                  "h-12 w-12 rounded-card flex items-center justify-center shadow-card border-2 transition-all",
                  isActive ? "border-primary bg-card" : "border-transparent bg-muted"
                )}>
                  {logo ? (
                    <img
                      src={logo}
                      alt={wallet.name}
                      className="h-7 w-7 object-contain rounded-full"
                    />
                  ) : (
                    <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-widest max-w-[50px] truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {wallet.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

