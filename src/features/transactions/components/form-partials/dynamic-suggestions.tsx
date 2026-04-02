'use client';

import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface DynamicSuggestionsProps {
    // eslint-disable-next-line no-unused-vars
    onSuggestionClick: (text: string) => void;
    historySuggestions?: string[];
}

type TimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';

const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'pagi';
    if (hour >= 11 && hour < 15) return 'siang';
    if (hour >= 15 && hour < 19) return 'sore';
    return 'malam';
};

export const DynamicSuggestions = ({ onSuggestionClick, historySuggestions = [] }: DynamicSuggestionsProps) => {
    const timeOfDay = getTimeOfDay();

    const contextualSuggestions: Record<TimeOfDay, string[]> = {
        pagi: ['Sarapan 15rb', 'Kopi 20rb', 'Ojek ke kantor 25rb', 'Commuter line 4rb'],
        siang: ['Makan siang 25rb', 'Es teh 5rb', 'Parkir 2rb', 'Jajan kantin 15rb'],
        sore: ['Gorengan 10rb', 'Belanja minimarket 50rb', 'Ojek pulang 20rb', 'Boba 35rb'],
        malam: ['Makan malam 25rb', 'Martabak 35rb', 'Bayar listrik 200rb', 'Langganan Netflix 54rb'],
    };

    const onboardingPrompts = [
        { text: 'Coba bilang "Beli bensin 20 ribu"', isSpecial: true },
        { text: 'Scan struk minimarket', isSpecial: true },
    ];

    const currentSuggestions = [
        ...(historySuggestions.length > 0 ? historySuggestions.slice(0, 2).map((suggestion) => ({ text: suggestion, isSpecial: false })) : []),
        ...contextualSuggestions[timeOfDay].map((suggestion) => ({ text: suggestion, isSpecial: false })),
    ].slice(0, 4);

    const allOptions = [...onboardingPrompts, ...currentSuggestions];

    return (
        <div className="w-full animate-in fade-in duration-300 px-1">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="mb-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2 py-0.5 text-label font-bold uppercase tracking-widest text-muted-foreground/60 shadow-sm">
                            Mulai Cepat
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground/75">
                        Pilih contoh di bawah atau mulai dari histori terakhirmu.
                    </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary shadow-[0_12px_24px_-20px_rgba(13,148,136,0.35)]">
                    <Sparkle size={16} weight="regular" />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {allOptions.map((item) => (
                    <button
                        key={item.text}
                        type="button"
                        onClick={() => onSuggestionClick(item.text)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-all active:scale-95 hover:-translate-y-0.5",
                            item.isSpecial
                                ? "bg-primary/10 font-semibold text-primary shadow-[0_12px_30px_-24px_rgba(16,185,129,0.45)] hover:bg-primary/20"
                                : "bg-card/96 text-foreground/70 shadow-[0_10px_22px_-20px_rgba(15,23,42,0.18)] hover:bg-secondary/60 hover:text-foreground"
                        )}
                    >
                        <span>{item.text}</span>
                        {!item.isSpecial && <ArrowRight size={12} weight="regular" className="ml-1 opacity-40" />}
                    </button>
                ))}
            </div>
        </div>
    );
};
