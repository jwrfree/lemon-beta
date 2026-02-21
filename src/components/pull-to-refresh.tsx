'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, animate } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Motion values for high-performance animation (no react re-renders on drag)
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, 80], [0, 180]);
  const opacity = useTransform(y, [0, 40, 80], [0, 0.5, 1]);
  const scale = useTransform(y, [0, 80], [0.5, 1]);

  // Refs for logic
  const startY = useRef(0);
  const startX = useRef(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 130;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtTop = () => {
      if (typeof window !== 'undefined' && window.scrollY > 5) return false;
      if (container.scrollTop > 0) return false;
      return true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isAtTop() || isRefreshing) return;

      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;

      const dy = currentY - startY.current;
      const dx = currentX - startX.current;

      // Ignore scroll up or horizontal swipes
      if (dy < 0) {
        isPulling.current = false;
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        isPulling.current = false;
        return;
      }

      // Pulling logic
      if (dy > 0 && isAtTop()) {
        if (e.cancelable) e.preventDefault();

        // Logarithmic damping for "rubber band" feel
        const pull = Math.min(Math.pow(dy, 0.85), MAX_PULL);
        y.set(pull);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current || isRefreshing) return;
      isPulling.current = false;

      const currentY = y.get();

      if (currentY >= PULL_THRESHOLD) {
        // Trigger Refresh
        setIsRefreshing(true);
        if (navigator.vibrate) navigator.vibrate(20);

        // Snap to threshold
        animate(y, PULL_THRESHOLD, { type: "spring", stiffness: 300, damping: 20 });

        try {
          await onRefresh();
        } finally {
          // Success/Finish animation
          setIsRefreshing(false);
          animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      } else {
        // Cancel/Reset
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    };

    // Add passive: false to allow e.preventDefault()
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, y]); // Removed manual deps as motion value is stable

  return (
    <div
      ref={containerRef}
      className={cn("relative touch-pan-y overscroll-y-contain", className)}
      style={{ overscrollBehaviorY: 'contain' }} // Inline fallback
    >
      {/* Loading Indicator */}
      <motion.div
        style={{ y, opacity, scale, rotate: isRefreshing ? 0 : rotate }}
        className="absolute top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      >
        <div className="relative -top-10 bg-popover text-primary shadow-card rounded-full p-2.5 flex items-center justify-center border border-border">
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          >
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5" />
            ) : (
              <ArrowDown className="h-5 w-5" />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};
