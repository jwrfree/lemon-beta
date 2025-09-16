
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const paginate = (newDirection: number) => {
    setActiveIndex(prevIndex => (prevIndex + newDirection + wallets.length) % wallets.length);
  };

  const handlers = useSwipeable({
    onSwipedUp: (eventData) => {
        paginate(1);
    },
    onSwipedDown: (eventData) => {
       paginate(-1);
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <div {...handlers} className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence initial={false}>
        {wallets.map((wallet, i) => {
          const isActive = i === activeIndex;
          const isPrevious = i === (activeIndex - 1 + wallets.length) % wallets.length;
          const isNext = i === (activeIndex + 1) % wallets.length;

          let state = 'middle';
          if (isActive) state = 'top';
          else if (isPrevious) state = 'bottom';
          else if (isNext) state = 'middle';
          
          const { Icon, gradient, textColor } = getWalletVisuals(wallet.name, wallet.icon);

          return (
            <motion.div
              key={wallet.id}
              className={cn(
                "absolute w-[90%] max-w-sm h-48 rounded-2xl text-white shadow-lg cursor-grab active:cursor-grabbing",
                gradient
              )}
              style={{
                zIndex: wallets.length - Math.abs(activeIndex - i)
              }}
              initial={{
                 scale: i === activeIndex ? 1 : 0.9,
                 y: (i - activeIndex) * 20,
                 opacity: i === activeIndex ? 1 : (i === (activeIndex + 1) % wallets.length ? 1 : 0),
              }}
              animate={{
                scale: isActive ? 1 : 0.9,
                y: isActive ? 0 : (isNext ? 20 : -20),
                opacity: isActive || isNext ? 1 : 0,
                zIndex: isActive ? wallets.length : (isNext ? wallets.length -1 : wallets.length - 2)
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
                <div className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3">
                            <Icon className={cn("h-8 w-8", textColor, "opacity-80")} />
                            <p className="font-semibold text-lg" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>{wallet.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                            <Edit2 className="h-4 w-4" />
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
  );
};
