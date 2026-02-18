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
                            <div className="py-2 px-4 bg-primary text-primary-foreground rounded-lg rounded-tr-sm text-sm font-medium shadow-sm max-w-[85%]">
                                {String(msg.content)}
                            </div>
                        </div>
                    )}
                    {msg.type === 'user-image' && (
                        <div className="flex justify-end">
                            <Card className="p-1 bg-muted max-w-[180px] border-border overflow-hidden rounded-lg">
                                <Image src={String(msg.content)} alt="Receipt" width={200} height={300} className="rounded-lg w-full h-auto object-cover" />
                            </Card>
                        </div>
                    )}
                    {msg.type === 'ai-thinking' && (
                        <div className="flex justify-start">
                            <div className="py-2 px-3 bg-muted/50 rounded-lg rounded-tl-sm flex items-center gap-3 border border-border/40">
                                <div className="relative flex items-center justify-center w-4 h-4">
                                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground animate-pulse">
                                    {loadingMessage || "Sedang memproses..."}
                                </span>
                            </div>
                        </div>
                    )}
                    {msg.type === 'ai-clarification' && (
                        <div className="flex justify-start">
                            <div className="py-3 px-4 bg-warning/10 text-warning rounded-lg rounded-tl-sm max-w-[85%] text-sm border border-warning/20 shadow-sm">
                                <p className="leading-snug font-medium">
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
