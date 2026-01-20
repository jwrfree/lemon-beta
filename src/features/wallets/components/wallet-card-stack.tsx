'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useBalanceVisibility } from '@/providers/balance-visibility-provider';

interface WalletCardStackProps {
  wallets: any[];
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
    setActiveIndex(prevIndex => (prevIndex + newDirection + wallets.length) % wallets.length);
  };

  const onDragEnd = (e: any, { offset, velocity }: { offset: any, velocity: any }) => {
    const swipe = swipePower(offset.y, velocity.y);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full h-48 flex items-center justify-center">
        <AnimatePresence initial={false}>
          {wallets.map((wallet, i) => {
            const isActive = i === activeIndex;
            const isNext = i === (activeIndex + 1) % wallets.length;

            const { Icon, gradient, textColor } = getWalletVisuals(wallet.name, wallet.icon);

            return (
              <motion.div
                key={wallet.id}
                drag={isActive ? "y" : false}
                onDragEnd={onDragEnd}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onClick={() => !isActive && setActiveIndex(i)}
                className={cn(
                  "absolute w-[90%] max-w-sm h-48 rounded-2xl text-white shadow-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70",
                  isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                )}
                style={{
                  backgroundImage: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`
                }}
                initial={{
                   scale: i === activeIndex ? 1 : 0.85,
                   y: (i - activeIndex) * 30,
                   opacity: i === activeIndex ? 1 : (i === (activeIndex + 1) % wallets.length ? 1 : 0),
                }}
                animate={{
                  scale: isActive ? 1 : 0.85,
                  y: isActive ? 0 : (isNext ? 30 : -30),
                  zIndex: wallets.length - Math.abs(activeIndex - i),
                  opacity: isActive || isNext ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 25,
                }}
                role="button"
                aria-pressed={isActive}
                aria-label={isActive ? `${wallet.name}, dompet aktif` : `Pilih dompet ${wallet.name}`}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    paginate(1);
                  }
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    paginate(-1);
                  }
                }}
              >
                  {/* Ornaments */}
                  <div className="absolute -top-1/4 -left-1/4 w-48 h-48 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-1/4 -right-10 w-40 h-40 bg-white/5 rounded-full" />

                  <div className="relative p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between">
                           <div className="flex items-center gap-3">
                              <Icon className={cn("h-8 w-8", textColor, "opacity-80")} />
                              <p className="font-semibold text-lg drop-shadow-md">{wallet.name}</p>
                              {wallet.isDefault && (
                                <div className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                                    Utama
                                </div>
                              )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 h-8 w-8 rounded-full relative z-10"
                            onClick={(e) => { e.stopPropagation(); openEditWalletModal(wallet); }}
                            aria-label={`Kelola dompet ${wallet.name}`}
                          >
                              <MoreVertical className="h-5 w-5" />
                              <span className="sr-only">Kelola dompet {wallet.name}</span>
                          </Button>
                      </div>

                      <div className="flex-1 flex items-end">
                          <p className={cn("text-3xl font-bold drop-shadow-lg", textColor, !isBalanceVisible && 'blur-sm transition-all duration-300')}>
                              {isBalanceVisible ? formatCurrency(wallet.balance) : 'Rp ••••••'}
                          </p>
                      </div>
                  </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {wallets.map((wallet, i) => (
          <button
            key={wallet.id ?? i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={`Pilih dompet ${wallet.name}`}
            aria-pressed={i === activeIndex}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
