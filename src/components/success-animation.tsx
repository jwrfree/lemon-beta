'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { motionTokens } from '@/lib/motion-tokens';

const PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export const SuccessAnimation = () => {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const query = window.matchMedia(PREFERS_REDUCED_MOTION);
        const update = () => setReduceMotion(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    if (reduceMotion) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="h-24 w-24 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-card">
                    <Check className="h-12 w-12" strokeWidth={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm motion-overlay" data-state="open">
            <div className="relative flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.18 }}
                    transition={{ duration: motionTokens.durationNormal, ease: motionTokens.easingStandard }}
                    className="absolute h-32 w-32 bg-success rounded-full"
                />

                <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: motionTokens.durationFast, ease: motionTokens.easingStandard }}
                    className="h-24 w-24 bg-success rounded-full flex items-center justify-center shadow-xl shadow-success/20"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: motionTokens.durationFast, ease: motionTokens.easingStandard }}
                    >
                        <Check className="h-12 w-12 text-success-foreground stroke-[3px]" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};
