'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children, 
  className 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtTop = () => {
      if (!containerRef.current) return true;
      return containerRef.current.scrollTop <= 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isAtTop()) return;
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && isAtTop()) {
        e.preventDefault();
        const pullAmount = Math.min(distance * 0.5, MAX_PULL);
        setPullDistance(pullAmount);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current || isRefreshing) return;

      isPulling.current = false;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, pullDistance, isRefreshing]);

  const refreshProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className={className}>
      <AnimatePresence>
        {pullDistance > 20 && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-50 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-full p-3 shadow-lg"
              style={{ 
                transform: `translateY(${Math.max(pullDistance - 40, 0)}px) scale(${0.8 + refreshProgress * 0.4})`,
                rotate: isRefreshing ? 360 : refreshProgress * 180
              }}
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ 
                rotate: { duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }
              }}
            >
              <RefreshCw className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        style={{ 
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : '',
          transition: isPulling.current ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
