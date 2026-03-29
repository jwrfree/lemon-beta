'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicSuggestionsProps {
    onSuggestionClick: (text: string) => void;
    historySuggestions?: string[];
}

type TimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';

export const DynamicSuggestions = ({ onSuggestionClick, historySuggestions = [] }: DynamicSuggestionsProps) => {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('pagi');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 11) setTimeOfDay('pagi');
        else if (hour >= 11 && hour < 15) setTimeOfDay('siang');
        else if (hour >= 15 && hour < 19) setTimeOfDay('sore');
        else setTimeOfDay('malam');
    }, []);

    const contextualSuggestions: Record<TimeOfDay, string[]> = {
        pagi: ['Sarapan 15rb', 'Kopi 20rb', 'Ojek ke kantor 25rb', 'Commuter line 4rb'],
        siang: ['Makan siang 25rb', 'Es teh 5rb', 'Parkir 2rb', 'Jajan kantin 15rb'],
        sore: ['Gorengan 10rb', 'Belanja minimarket 50rb', 'Ojek pulang 20rb', 'Boba 35rb'],
        malam: ['Makan malam 25rb', 'Martabak 35rb', 'Bayar listrik 200rb', 'Langganan Netflix 54rb'],
    };

    const onboardingPrompts = [
        { text: '🎙️ Coba bilang "Beli bensin 20 ribu"', isSpecial: true },
        { text: '📸 Scan struk minimarket', isSpecial: true },
    ];

    const currentSuggestions = [
        ...(historySuggestions.length > 0 ? historySuggestions.slice(0, 2).map(s => ({ text: s, isSpecial: false })) : []),
        ...contextualSuggestions[timeOfDay].map(s => ({ text: s, isSpecial: false })),
    ].slice(0, 4);

    const allOptions = [...onboardingPrompts, ...currentSuggestions];

    return (
        <div className="w-full animate-in fade-in duration-300 px-1">
            <div className="flex items-center gap-1.5 mb-3">
                <Clock className="h-3 w-3 text-muted-foreground/50" />
                <p className="text-label text-muted-foreground/50">
                    Saran Interaktif
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {allOptions.map((item, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onSuggestionClick(item.isSpecial ? item.text.replace(/^[🎙️📸]\s*/, '') : item.text)}
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium border transition-all active:scale-95",
                            item.isSpecial 
                                ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:shadow-primary/10 font-semibold"
                                : "bg-card border-border/60 text-foreground/70 hover:bg-secondary/60 hover:text-foreground shadow-none"
                        )}
                    >
                        <span>{item.text}</span>
                        {!item.isSpecial && <ArrowRight className="h-3 w-3 opacity-40 ml-1" />}
                    </button>
                ))}
            </div>
        </div>
    );
};
