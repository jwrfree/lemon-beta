'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const SuccessAnimation = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
                {/* Expanding Circle Background */}
                <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0.5, 1, 0] }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute h-32 w-32 bg-green-500 rounded-full opacity-20"
                />
                
                {/* Main Circle */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.1 
                    }}
                    className="h-24 w-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
                >
                    {/* Checkmark Drawing Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.2 }}
                    >
                        <Check className="h-12 w-12 text-white stroke-[3px]" />
                    </motion.div>
                </motion.div>

                {/* Particle Explosion */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-2 w-2 bg-green-500 rounded-full"
                        initial={{ opacity: 1, x: 0, y: 0 }}
                        animate={{ 
                            opacity: 0,
                            x: Math.cos(i * 45 * (Math.PI / 180)) * 60,
                            y: Math.sin(i * 45 * (Math.PI / 180)) * 60
                        }}
                        transition={{ 
                            duration: 0.6, 
                            ease: "easeOut",
                            delay: 0.2
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
