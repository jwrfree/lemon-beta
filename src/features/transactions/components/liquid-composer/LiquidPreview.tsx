'use client';

import React, { useState, useEffect } from 'react';
import { HeroAmount } from './HeroAmount';
import { MagicBar } from './MagicBar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, triggerHaptic } from '@/lib/utils';
import { Tag, ArrowBendDownRight, MapPin } from '@/lib/icons';

export const LiquidPreview = () => {
 const [amount, setAmount] = useState(25000);
 const [text, setText] = useState('');
 const [isProcessing, setIsProcessing] = useState(false);
 const [metadata, setMetadata] = useState<{
 category: string | null;
 subCategory: string | null;
 location: string | null;
 }>({
 category: null,
 subCategory: null,
 location: null
 });

 // Simulation logic: When user types "kopi starbuck di mall", simulate AI extraction
 useEffect(() => {
 const lowerText = text.toLowerCase();
 if (lowerText.includes('kopi')) {
 setIsProcessing(true);
 const timer = setTimeout(() => {
 setIsProcessing(false);
 setAmount(35000);
 setMetadata({
 category: 'Makanan & Minuman',
 subCategory: 'Kopi & Jajan',
 location: lowerText.includes('mall') ? 'Grand Indonesia': null
 });
 triggerHaptic('success');
 }, 1500);
 return () => clearTimeout(timer);
 } else {
 setMetadata({ category: null, subCategory: null, location: null });
 }
 }, [text]);

 return (
 <div className="w-full max-w-lg mx-auto bg-background rounded-card overflow-hidden border border-border/20 shadow-none border border-border/15 p-6 space-y-6">
 
 {/* 1. The Hero Header */}
 <HeroAmount 
 amount={amount} 
 type="expense"
 onAmountClick={() => triggerHaptic('light')}
 />

 {/* 2. The Smart Metadata Layer (Dynamic Chips) */}
 <div className="min-h-[100px] flex flex-col items-center justify-center gap-3">
 <AnimatePresence mode="popLayout">
 {metadata.category && (
 <motion.div 
 initial={{ opacity: 0, y: 10, scale: 0.9 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, scale: 0.9 }}
 className="flex flex-col items-center gap-2"
 >
 {/* Main Category Chip */}
 <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg">
 <Tag size={12} weight="regular"className="opacity-20"/>
 <span className="text-label text-white/90">{metadata.category}</span>
 </div>

 {/* Sub-Category Chip (Staggered) */}
 {metadata.subCategory && (
 <motion.div 
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.2 }}
 className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10"
 >
 <ArrowBendDownRight size={12} weight="regular"className="opacity-50"/>
 <span className="text-label ">{metadata.subCategory}</span>
 </motion.div>
 )}
 </motion.div>
 )}

 {metadata.location && (
 <motion.div 
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ type: 'spring', delay: 0.4 }}
 className="flex items-center gap-1 text-muted-foreground bg-card px-3 py-1 rounded-full border border-border/20"
 >
 <MapPin size={12} weight="regular"className="text-destructive"/>
 <span className="text-label ">{metadata.location}</span>
 </motion.div>
 )}

 {!metadata.category && !isProcessing && (
 <motion.div 
 key="idle"
 initial={{ opacity: 0 }}
 animate={{ opacity: 0.3 }}
 className="text-label text-muted-foreground animate-pulse"
 >
 Yuk, cerita ke Lemon kita habis jajan apa...
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* 3. Budget Impact Visualizer */}
 <div className="px-10 py-2">
 <div className="flex justify-between text-label text-muted-foreground/60 mb-2">
 <span>Sisa anggaran</span>
 <span className={cn(metadata.category ? "text-destructive": "")}>
 {metadata.category ? 'Hampir Habis': 'Aman'}
 </span>
 </div>
 <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
 <motion.div 
 animate={{ width: metadata.category ? '92%': '35%'}}
 className={cn(
 "h-full rounded-full transition-colors duration-700",
 metadata.category ? "bg-destructive": "bg-success"
 )}
 />
 </div>
 </div>

 {/* 4. The Magic Bar */}
 <MagicBar 
 value={text}
 onChange={setText}
 isProcessing={isProcessing}
 placeholder="Misal: Kopi 35rb di Grand Indonesia..."
 onClear={() => {
 setText('');
 setAmount(25000);
 triggerHaptic('medium');
 }}
 />
 </div>
 );
};



