'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { Message } from '@/features/transactions/hooks/use-smart-add-flow';

interface MessagesListProps {
    messages: Message[];
    loadingMessage: string;
}

export const MessagesList = ({ messages, loadingMessage }: MessagesListProps) => {
    return (
        <AnimatePresence>
            {messages.map((msg) => (
                <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-3"
                >
                    {msg.type === 'user' && (
                        <div className="flex justify-end">
                            <div className="py-2 px-4 bg-primary text-primary-foreground rounded-lg rounded-tr-sm text-sm font-medium max-w-[85%]">
                                {String(msg.content)}
                            </div>
                        </div>
                    )}
                    {msg.type === 'user-image' && (
                        <div className="flex justify-end">
                            <Card className="p-1 bg-muted max-w-[180px] border-border overflow-hidden rounded-card">
                                <Image src={String(msg.content)} alt="Receipt" width={200} height={300} className="rounded-lg w-full h-auto object-cover" />
                            </Card>
                        </div>
                    )}
                    {msg.type === 'ai-thinking' && (
                        <div className="flex justify-start">
                            <div className="py-2.5 px-4 bg-card rounded-card rounded-tl-none flex items-center gap-3 shadow-card">
                                <div className="relative flex items-center justify-center w-4 h-4">
                                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground flex items-center">
                                    {loadingMessage || "Sedang memproses..."}
                                    <span className="ml-0.5 w-1 h-3 bg-primary/50 animate-pulse block" />
                                </span>
                            </div>
                        </div>
                    )}
                    {msg.type === 'ai-clarification' && (
                        <div className="flex justify-start">
                            <div className="py-3 px-5 bg-card text-orange-700 dark:text-orange-400 rounded-card rounded-tl-none max-w-[85%] text-sm relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning/50" />
                                <p className="leading-snug font-medium pl-2">
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
