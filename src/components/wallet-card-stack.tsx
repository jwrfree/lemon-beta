
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from './app-provider';

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
  const { openEditWalletModal } = useApp();
  
  const paginate = (newDirection: number) => {
    setActiveIndex(prevIndex => (prevIndex + newDirection + wallets.length) % wallets.length);
  };

  const onDragEnd = (e: any, { offset, velocity }: { offset: any, velocity: any }) => {
    const swipe = swipePower(offset.x, velocity.x);

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
            const isPrevious = i === (activeIndex - 1 + wallets.length) % wallets.length;
            const isNext = i === (activeIndex + 1) % wallets.length;

            const { Icon, gradient, textColor } = getWalletVisuals(wallet.name, wallet.icon);

            return (
              <motion.div
                key={wallet.id}
                drag={isActive ? "x" : false}
                onDragEnd={onDragEnd}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                className={cn(
                  "absolute w-[90%] max-w-sm h-48 rounded-2xl text-white shadow-lg",
                  isActive ? "cursor-grab active:cursor-grabbing" : ""
                )}
                style={{
                  backgroundImage: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`
                }}
                initial={{
                   scale: i === activeIndex ? 1 : 0.85,
                   y: (i - activeIndex) * 30, // Increased vertical spacing
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
              >
                  <div className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between">
                           <div className="flex items-center gap-3">
                              <Icon className={cn("h-8 w-8", textColor, "opacity-80")} />
                              <p className="font-semibold text-lg" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>{wallet.name}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => openEditWalletModal(wallet)}>
                              <MoreVertical className="h-5 w-5" />
                          </Button>
                      </div>

                      <div className="flex-1 flex items-end">
                          <p className={cn("text-3xl font-bold", textColor)} style={{textShadow: '1px 1px 3px rgba(0,0,0,0.3)'}}>
                              {formatCurrency(wallet.balance)}
                          </p>
                      </div>
                  </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {wallets.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
            aria-label={`Go to wallet ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
