'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Message } from '@/features/transactions/hooks/use-smart-add-flow';

interface SmartAddMessagesProps {
    messages: Message[];
    loadingMessage: string;
}

export const SmartAddMessages = ({ messages, loadingMessage }: SmartAddMessagesProps) => {
    return (
        <AnimatePresence>
            {messages.map((msg) => (
                <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    {msg.type === 'user' && (
                        <div className="flex justify-end">
                            <div className="p-3 bg-primary/10 text-foreground rounded-card text-sm leading-relaxed border border-primary/20">
                                {String(msg.content)}
                            </div>
                        </div>
                    )}
                    {msg.type === 'user-image' && (
                        <div className="flex justify-end">
                            <Card className="p-1 bg-primary/20 max-w-xs border-primary/30 overflow-hidden">
                                <Image src={String(msg.content)} alt="Receipt" width={200} height={300} className="rounded-md" />
                            </Card>
                        </div>
                    )}
                    {msg.type === 'ai-thinking' && (
                        <div className="flex justify-start">
                            <div className="p-3 bg-card rounded-card flex items-center gap-2.5 shadow-sm border">
                                <div className="relative flex items-center justify-center">
                                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                    <motion.div
                                        className="absolute inset-0 bg-primary/20 rounded-full"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={loadingMessage}
                                        initial={{ opacity: 0, x: 5, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, x: -5, filter: "blur(4px)" }}
                                        transition={{ duration: 0.3 }}
                                        className="text-sm font-medium text-muted-foreground"
                                    >
                                        {loadingMessage}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                    {msg.type === 'ai-clarification' && (
                        <div className="flex justify-start">
                            <div className="p-3 bg-card rounded-card max-w-[85%] shadow-sm border">
                                <p className="text-sm leading-relaxed text-foreground italic">
                                    &quot;{String(msg.content)}&quot;
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </AnimatePresence>
    );
};
