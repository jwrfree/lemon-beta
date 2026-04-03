'use client';

import type { ReactNode } from 'react';

import {
    ArrowClockwise,
    Camera,
    CaretRight,
    PencilSimple,
    Rows,
    Sparkle,
} from '@/lib/icons';

import { cn } from '@/lib/utils';
import type {
    QuickStartAction,
    QuickStartSuggestion,
    QuickStartSuggestionGroups,
} from '@/features/transactions/utils/quick-start-suggestions';
import { formatCompactAmount } from '@/features/transactions/utils/quick-start-suggestions';

interface DynamicSuggestionsProps {
    // eslint-disable-next-line no-unused-vars
    onSuggestionClick: (...args: [QuickStartSuggestion]) => void;
    suggestions: QuickStartSuggestionGroups;
}

interface SuggestionSectionProps {
    title: string;
    children: ReactNode;
}

interface SuggestionCardProps {
    suggestion: QuickStartSuggestion;
    // eslint-disable-next-line no-unused-vars
    onClick: (...args: [QuickStartSuggestion]) => void;
}

const SuggestionSection = ({ title, children }: SuggestionSectionProps) => (
    <section className="space-y-2.5">
        <div className="px-1">
            <span className="text-label font-bold uppercase tracking-widest text-muted-foreground/50">
                {title}
            </span>
        </div>
        {children}
    </section>
);

const RepeatSuggestionCard = ({
    suggestion,
    onClick,
}: SuggestionCardProps) => (
    <button
        type="button"
        onClick={() => onClick(suggestion)}
        className="group flex w-full items-center gap-3 rounded-[22px] bg-card p-3 text-left shadow-elevation-2 transition-all active:scale-[0.98] hover:-translate-y-0.5"
    >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ArrowClockwise size={18} weight="regular" />
        </span>
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">{suggestion.label}</p>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-label font-semibold text-primary">
                    {suggestion.reason}
                </span>
            </div>
            <p className="truncate pt-0.5 text-xs font-medium text-muted-foreground/75">{suggestion.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-primary">
            <span className="text-label font-semibold">{suggestion.amount ? formatCompactAmount(suggestion.amount) : ''}</span>
            <CaretRight size={14} weight="regular" className="opacity-50 transition-transform group-hover:translate-x-0.5" />
        </div>
    </button>
);

const HabitSuggestionChip = ({
    suggestion,
    onClick,
}: SuggestionCardProps) => (
    <button
        type="button"
        onClick={() => onClick(suggestion)}
        className="flex min-w-[148px] flex-1 flex-col items-start gap-1 rounded-[20px] bg-card px-3 py-3 text-left shadow-elevation-2 transition-all active:scale-[0.98] hover:-translate-y-0.5"
    >
        <div className="flex w-full items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">{suggestion.label}</span>
            <Rows size={14} weight="regular" className="shrink-0 text-muted-foreground/45" />
        </div>
        <p className="text-label font-medium text-muted-foreground/75">{suggestion.description}</p>
    </button>
);

const ActionSuggestionCard = ({
    suggestion,
    onClick,
}: SuggestionCardProps) => {
    const iconByAction: Record<QuickStartAction, typeof Camera> = {
        'scan-receipt': Camera,
        'manual-assist': PencilSimple,
    };
    const Icon = iconByAction[suggestion.action || 'manual-assist'];

    return (
        <button
            type="button"
            onClick={() => onClick(suggestion)}
            className={cn(
                "flex min-h-[84px] flex-1 items-start gap-3 rounded-[22px] px-3 py-3 text-left transition-all active:scale-[0.98] hover:-translate-y-0.5",
                suggestion.action === 'scan-receipt'
                    ? "bg-primary/10 text-primary shadow-elevation-2"
                    : "bg-card text-foreground shadow-elevation-2"
            )}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background/80">
                <Icon size={18} weight="regular" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-sm font-semibold tracking-tight">{suggestion.label}</span>
                <span className="mt-1 block text-label font-medium opacity-75">{suggestion.description}</span>
            </span>
        </button>
    );
};

export const DynamicSuggestions = ({ onSuggestionClick, suggestions }: DynamicSuggestionsProps) => {
    const { repeats, habits, actions } = suggestions;

    return (
        <div className="w-full animate-in fade-in duration-300 px-1">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-label font-bold uppercase tracking-widest text-muted-foreground/50">
                            Mulai Cepat
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground/75">
                        Pilih contoh di bawah atau mulai dari histori terakhirmu.
                    </p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary shadow-elevation-2">
                    <Sparkle size={16} weight="regular" />
                </div>
            </div>

            <div className="space-y-4">
                {repeats.length > 0 && (
                    <SuggestionSection title="Ulang Terakhir">
                        <div className="space-y-2">
                            {repeats.map((suggestion) => (
                                <RepeatSuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    onClick={onSuggestionClick}
                                />
                            ))}
                        </div>
                    </SuggestionSection>
                )}

                {habits.length > 0 && (
                    <SuggestionSection title="Kebiasaanmu">
                        <div className="flex flex-wrap gap-2">
                            {habits.map((suggestion) => (
                                <HabitSuggestionChip
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    onClick={onSuggestionClick}
                                />
                            ))}
                        </div>
                    </SuggestionSection>
                )}

                {actions.length > 0 && (
                    <SuggestionSection title="Aksi Cepat">
                        <div className="flex flex-wrap gap-2">
                            {actions.map((suggestion) => (
                                <ActionSuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    onClick={onSuggestionClick}
                                />
                            ))}
                        </div>
                    </SuggestionSection>
                )}
            </div>
        </div>
    );
};

