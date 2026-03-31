'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Wallet, 
  PlusCircle, 
  Target, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const ONBOARDING_TASKS = [
  {
    id: 'wallet' as const,
    title: 'Buat Dompet Pertama',
    description: 'Simpan uangmu di tempat yang tepat.',
    icon: Wallet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'transaction' as const,
    title: 'Catat Transaksi Hari Ini',
    description: 'Mulai lacak kemana uangmu pergi.',
    icon: PlusCircle,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 'goal' as const,
    title: 'Pasang Target Tabungan',
    description: 'Wujudkan impianmu lebih cepat.',
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
];

export const OnboardingChecklist = () => {
  const { userData, updateOnboardingStatus } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Safely access onboarding status
  const status = useMemo(() => {
    return userData?.onboardingStatus || {
      steps: { wallet: false, transaction: false, goal: false },
      isDismissed: false
    };
  }, [userData?.onboardingStatus]);

  const completedCount = useMemo(() => {
    return Object.values(status.steps).filter(Boolean).length;
  }, [status.steps]);

  const progress = (completedCount / ONBOARDING_TASKS.length) * 100;
  const isAllCompleted = completedCount === ONBOARDING_TASKS.length;

  // Trigger confetti only once when all are completed
  useEffect(() => {
    if (isAllCompleted && !showCelebration && !status.isDismissed) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
      });
      setShowCelebration(true);
    }
  }, [isAllCompleted, showCelebration, status.isDismissed]);

  const handleStepToggle = useCallback(async (stepId: 'wallet' | 'transaction' | 'goal') => {
    const isCurrentlyDone = status.steps[stepId];
    await updateOnboardingStatus({ 
      steps: { 
        ...status.steps,
        [stepId]: !isCurrentlyDone 
      } 
    });
  }, [status.steps, updateOnboardingStatus]);

  // Don't render if dismissed
  if (status.isDismissed) return null;
  // If all completed and minimized, hide it to save space
  if (isAllCompleted && isMinimized) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "mb-4 rounded-2xl border border-border/40 bg-card/90 shadow-none",
          isMinimized ? "p-3 px-4" : "p-4"
        )}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-[10px] font-bold">{Math.round(progress)}%</span>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Memulai dengan Lemon
                  {isAllCompleted && <Sparkles className="h-4 w-4 text-amber-500" />}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {isAllCompleted 
                    ? 'Hebat! Kamu sudah siap mengelola keuangan.' 
                    : `${ONBOARDING_TASKS.length - completedCount} langkah lagi untuk selesai.`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-muted"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>

          {!isMinimized && (
            <div className="mt-3 space-y-2">
              {ONBOARDING_TASKS.map((task) => {
                const isDone = status.steps[task.id];
                return (
                  <motion.button
                    key={task.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStepToggle(task.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-2.5 transition-all",
                      isDone 
                        ? "border-emerald-200/70 bg-emerald-500/5" 
                        : "border-border/50 bg-background hover:border-border"
                    )}
                  >
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      task.bgColor,
                      task.color
                    )}>
                      <task.icon className="w-4.5 h-4.5" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "text-xs font-semibold",
                        isDone ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"
                      )}>
                        {task.title}
                      </div>
                      <div className="text-[10px] leading-tight text-muted-foreground">
                        {task.description}
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>
                  </motion.button>
                );
              })}

              {isAllCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Button 
                    className="mt-2 h-10 w-full border-none bg-emerald-500 text-white shadow-none hover:bg-emerald-600"
                    onClick={() => updateOnboardingStatus({ isDismissed: true })}
                  >
                    Selesaikan Onboarding
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
