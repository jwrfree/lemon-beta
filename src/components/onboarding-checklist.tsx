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
          "relative overflow-hidden mb-6 rounded-2xl border border-white/40",
          "bg-white/80 backdrop-blur-xl shadow-xl shadow-emerald-900/5",
          isMinimized ? "p-3 px-4" : "p-5"
        )}
      >
        {/* Progress Background Glow */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-emerald-100"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="87.96"
                    initial={{ strokeDashoffset: 87.96 }}
                    animate={{ strokeDashoffset: 87.96 - (87.96 * progress) / 100 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="text-emerald-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-emerald-700">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                  Memulai dengan Lemon
                  {isAllCompleted && <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />}
                </h3>
                <p className="text-[11px] text-slate-500">
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
                className="h-7 w-7 rounded-full hover:bg-slate-100/50"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="space-y-2 mt-4">
              {ONBOARDING_TASKS.map((task) => {
                const isDone = status.steps[task.id];
                return (
                  <motion.button
                    key={task.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStepToggle(task.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border",
                      isDone 
                        ? "bg-emerald-50/50 border-emerald-100" 
                        : "bg-white/50 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      task.bgColor,
                      task.color
                    )}>
                      <task.icon className="w-4.5 h-4.5" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={cn(
                        "text-xs font-semibold",
                        isDone ? "text-emerald-700" : "text-slate-700"
                      )}>
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {task.description}
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50/50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-200" />
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
                    className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 border-none h-10"
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
