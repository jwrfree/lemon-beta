
'use client';

import { type UIMessage } from 'ai';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    User,
    Bot,
    ChevronRight,
    Trash2,
    Loader2,
    Square,
    X,
    Mic,
    StopCircle,
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, triggerHaptic } from '@/lib/utils';
import { useAIChat } from '../hooks/use-ai-chat';
import { ErrorAlert } from '@/components/ui/error-alert';
import ReactMarkdown from 'react-markdown';
import { useInsights } from '@/features/insights/hooks/use-insights';
import { buildFollowUpSuggestions } from '../lib/follow-up-suggestions';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useUI } from '@/components/ui-provider';
import {
    type AppAction,
    type ChatResponse,
    type RichComponent,
    extractChatDisplayText,
    extractLegacyRichComponents,
    extractLegacySuggestions,
    hasLegacyControlTags,
    hasPartialChatResponseBlock,
    parseChatResponseText,
    parseRichMessageParts,
} from '@/ai/chat-contract';
import { APP_TARGETS, AppTargetKey, executeAppAction as executeCoreAppAction } from '@/lib/app-actions';
import { BudgetStatusCard } from './rich-results/BudgetStatusCard';
import { WealthSummaryCard } from './rich-results/WealthSummaryCard';
import { RecentTransactionsList } from './rich-results/RecentTransactionsList';
import { ScenarioSimulationCard } from './rich-results/ScenarioSimulationCard';
import { SubscriptionAnalysisCard } from './rich-results/SubscriptionAnalysisCard';
import { FinancialHealthCard } from './rich-results/FinancialHealthCard';
import { TrendChart } from './rich-results/TrendChart';
import { GoalProgressCard } from './rich-results/GoalProgressCard';
import { AnomalyAlertCard } from './rich-results/AnomalyAlertCard';
import { InsightSummaryCard } from './rich-results/InsightSummaryCard';

interface AIChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLACEHOLDERS = [
    "Coba tanya: 'Berapa sisa uangku?'",
    "Coba tanya: 'Bulan ini paling boros buat apa?'",
    "Coba tanya: 'Budget makan masih aman?'",
    'Ketik pertanyaanmu di sini...',
];

const ShinyText = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2">
        <motion.span
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="font-semibold bg-[linear-gradient(110deg,rgba(156,163,175,0.5),45%,#fff,55%,rgba(156,163,175,0.5))] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(110deg,#4b5563,45%,#fff,55%,#4b5563)]"
        >
            {text}
        </motion.span>
        <span className="flex gap-1">
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }} className="h-1 w-1 rounded-full bg-foreground/30" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2, times: [0, 0.5, 1] }} className="h-1 w-1 rounded-full bg-foreground/30" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4, times: [0, 0.5, 1] }} className="h-1 w-1 rounded-full bg-foreground/30" />
        </span>
    </div>
);

const getRawMessageText = (message: UIMessage) =>
    message.parts
        .filter((part): part is Extract<UIMessage['parts'][number], { type: 'text' }> => part.type === 'text')
        .map((part) => part.text)
        .join('');

const dedupeAppActions = (actions: AppAction[]) => {
    const seen = new Set<string>();
    return actions.filter((action) => {
        const key = JSON.stringify(action);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const dedupeSuggestions = (suggestions: string[]) => {
    const seen = new Set<string>();
    return suggestions.filter((suggestion) => {
        const normalized = suggestion.trim().toLowerCase();
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });
};

const warnedLegacyMessages = new Set<string>();

const warnLegacyResponsePath = (rawText: string) => {
    if (!hasLegacyControlTags(rawText) || warnedLegacyMessages.has(rawText)) {
        return;
    }

    warnedLegacyMessages.add(rawText);
    console.warn('[AIChatDrawer] Legacy rich tag parsing path is deprecated. Migrate assistant replies to <response> JSON blocks.');
};

const deriveFallbackAppActions = (components: RichComponent[]): AppAction[] => {
    const actions: AppAction[] = [];

    if (components.some((component) => component.type === 'BudgetStatus')) {
        actions.push({ type: 'navigate', target: '/budgeting', params: { label: 'Go to Budgets ->' } });
    }

    if (components.some((component) => component.type === 'RecentTransactions')) {
        actions.push({ type: 'navigate', target: '/transactions', params: { label: 'Go to Transactions ->' } });
        actions.push({ type: 'open_form', target: 'transaction', params: { label: 'Add transaction ->', mode: 'smart' } });
    }

    if (components.some((component) => component.type === 'WealthSummary')) {
        actions.push({ type: 'navigate', target: '/wallets', params: { label: 'Go to Wallets ->' } });
    }

    return actions;
};

export const resolveChatResponse = (rawText: string, isStreaming = false) => {
    const parsedResponse = parseChatResponseText(rawText);
    if (parsedResponse) {
        return { response: parsedResponse, isPending: false };
    }

    if (isStreaming && hasPartialChatResponseBlock(rawText)) {
        return { response: null, isPending: true };
    }

    warnLegacyResponsePath(rawText);

    return {
        response: {
            text: extractChatDisplayText(rawText),
            components: extractLegacyRichComponents(rawText),
            suggestions: extractLegacySuggestions(rawText),
        } satisfies ChatResponse,
        isPending: false,
    };
};

export const extractAppActionsFromMessage = (message: UIMessage, response?: ChatResponse | null): AppAction[] => {
    const toolActions = message.parts.flatMap((part) => {
        if (part.type === 'tool-app_action' && part.state === 'output-available') {
            return [part.output as AppAction];
        }

        return [];
    });

    return dedupeAppActions([
        ...(response?.actions ?? []),
        ...toolActions,
        ...deriveFallbackAppActions(response?.components ?? []),
    ]);
};

export const getAppActionLabel = (action: AppAction) => {
    if (typeof action.params?.label === 'string' && action.params.label.trim()) {
        return action.params.label;
    }

    if (action.type === 'navigate') {
        const targetLabel = action.target.replace(/^\//, '').replace(/-/g, ' ') || 'page';
        return `Open ${targetLabel} ->`;
    }

    if (action.type === 'open_form') {
        return `Open ${action.target} form ->`;
    }

    return `Highlight ${action.target} ->`;
};
type AppActionBridge = {
    router: ReturnType<typeof useRouter>;
    openTransactionSheet: (transaction?: null | undefined, mode?: 'smart' | 'manual') => void;
    setIsBudgetModalOpen: (isOpen: boolean) => void;
    setIsWalletModalOpen: (isOpen: boolean) => void;
    setIsGoalModalOpen: (isOpen: boolean) => void;
    setIsReminderModalOpen: (isOpen: boolean) => void;
    setIsDebtModalOpen: (isOpen: boolean) => void;
    setIsTransferModalOpen: (isOpen: boolean) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
};

export const executeAppAction = (action: AppAction, bridge: AppActionBridge) => {
    const targetKey = action.target as AppTargetKey;
    if (APP_TARGETS[targetKey]) {
        executeCoreAppAction(targetKey, action.params, bridge as any, bridge.router);
        return;
    }

    console.warn(`[AIChatDrawer] Target not found in APP_TARGETS: "${action.target}". Falling back to legacy dispatch.`);

    switch (action.type) {
        case 'navigate': {
            let path = action.target;
            if (!path.startsWith('/')) path = '/' + path;
            bridge.router.push(path);
            return;
        }
        case 'open_form':
            switch (action.target) {
                case 'transaction':
                    bridge.openTransactionSheet(null, action.params?.mode === 'manual' ? 'manual' : 'smart');
                    return;
                case 'budget':
                    bridge.setIsBudgetModalOpen(true);
                    return;
                case 'wallet':
                    bridge.setIsWalletModalOpen(true);
                    return;
                case 'goal':
                    bridge.setIsGoalModalOpen(true);
                    return;
                case 'reminder':
                    bridge.setIsReminderModalOpen(true);
                    return;
                case 'debt':
                case 'ADD_LIABILITY':
                    bridge.setIsDebtModalOpen(true);
                    return;
                case 'transfer':
                    bridge.setIsTransferModalOpen(true);
                    return;
                default:
                    bridge.showToast(`Form untuk "${action.target}" belum didukung.`, 'info');
                    return;
            }
        case 'highlight': {
            const selectorTarget = action.target.replace(/^#/, '');
            const targetElement = document.querySelector(
                `[data-highlight-target="${selectorTarget}"], [data-app-target="${selectorTarget}"], #${selectorTarget}`
            ) as HTMLElement | null;

            if (!targetElement) {
                bridge.showToast(`Bagian "${action.target}" belum ditemukan di halaman ini.`, 'info');
                return;
            }

            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetElement.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-background');
            window.setTimeout(() => {
                targetElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-background');
            }, 2400);
            return;
        }
        default:
            return;
    }
};

const renderRichComponent = (
    component: RichComponent,
    idx: number,
    bridge?: AppActionBridge,
) => {
    switch (component.type) {
        case 'BudgetStatus':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><BudgetStatusCard /></div>;
        case 'WealthSummary':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><WealthSummaryCard /></div>;
        case 'RecentTransactions':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><RecentTransactionsList /></div>;
        case 'ScenarioSimulation':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><ScenarioSimulationCard data={component.data as never} /></div>;
        case 'SubscriptionAnalysis':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><SubscriptionAnalysisCard data={component.data as never} /></div>;
        case 'FinancialHealth':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><FinancialHealthCard data={component.data as never} /></div>;
        case 'TrendChart':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><TrendChart data={component.data as never} /></div>;
        case 'GoalProgress':
            return <div key={idx} className="my-3 first:mt-0 last:mb-0"><GoalProgressCard data={component.data as never} /></div>;
        case 'AnomalyAlert':
            return (
                <div key={idx} className="my-3 first:mt-0 last:mb-0">
                    <AnomalyAlertCard
                        data={component.data as never}
                        onAction={bridge ? (action) => executeAppAction(action, bridge) : undefined}
                    />
                </div>
            );
        case 'InsightSummary':
            return (
                <div key={idx} className="my-3 first:mt-0 last:mb-0">
                    <InsightSummaryCard
                        data={component.data as never}
                        onAction={bridge ? (action) => executeAppAction(action, bridge) : undefined}
                    />
                </div>
            );
        default:
            return null;
    }
};

export const RichMessageContent = ({
    text,
    bridge,
}: {
    text: string;
    bridge?: AppActionBridge;
}) => {
    const { response, isPending } = resolveChatResponse(text);

    if (isPending) {
        return <ShinyText text="Lemon Coach sedang berpikir..." />;
    }

    if (!response) {
        return null;
    }

    return (
        <>
            {response.text && (
                <ReactMarkdown
                    components={{
                        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    }}
                >
                    {response.text}
                </ReactMarkdown>
            )}
            {response.components?.map((component, idx) => renderRichComponent(component, idx, bridge))}
        </>
    );
};

export { parseRichMessageParts };

export const AIChatDrawer = ({ isOpen, onClose }: AIChatDrawerProps) => {
    const router = useRouter();
    const { briefing } = useInsights();
    const {
        showToast,
        openTransactionSheet,
        setIsBudgetModalOpen,
        setIsWalletModalOpen,
        setIsGoalModalOpen,
        setIsReminderModalOpen,
        setIsDebtModalOpen,
        setIsTransferModalOpen,
    } = useUI();
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        submitQuickAction,
        setInput,
        isLoading,
        error,
        errorMessage,
        reload,
        stop,
        clearChat,
    } = useAIChat();

    const { isRecording, startRecording, stopRecording } = useAudioRecorder();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    const quickActions = [
        ...(briefing?.suggestion ? [{ label: 'Saran AI', value: briefing.suggestion }] : []),
        { label: 'Berapa saldo saya?', value: 'Berapa total saldo saya di semua dompet saat ini?' },
        { label: 'Budget aman?', value: 'Apakah ada budget saya yang hampir habis bulan ini?' },
        { label: 'Saran hemat', value: 'Berikan saran penghematan cerdas berdasarkan pola pengeluaran saya.' },
    ];

    const bottomAnchorRef = useRef<HTMLDivElement>(null);
    const handleVoiceRecord = async () => {
        if (!isRecording) {
            try {
                triggerHaptic('light');
                await startRecording();
            } catch (err: any) {
                showToast(err.message || 'Gagal mengakses mikrofon.', 'error');
            }
            return;
        }

        try {
            triggerHaptic('medium');
            setIsTranscribing(true);
            const blob = await stopRecording();
            if (!blob) return;

            const formData = new FormData();
            formData.append('audio', blob, 'voice.webm');

            const res = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.text) {
                triggerHaptic('success');
                setInput(data.text);
            } else if (data.error) {
                showToast('Gagal mengubah suara ke teks.', 'error');
            }
        } catch (err) {
            console.error('Transcription failed:', err);
            showToast('Gagal memproses suara. Periksa koneksi Anda.', 'error');
        } finally {
            setIsTranscribing(false);
        }
    };

    useEffect(() => {
        bottomAnchorRef.current?.scrollIntoView({
            block: 'end',
            behavior: isLoading ? 'auto' : 'smooth',
        });
    }, [messages, isLoading]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const hasInteracted = messages.length > 1;
    const lastMessage = messages[messages.length - 1];
    const latestAssistantMessageId = !isLoading && !error && lastMessage?.role === 'assistant' ? lastMessage.id : null;
    const followUpSuggestions = useMemo(() => buildFollowUpSuggestions(messages), [messages]);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                hideCloseButton
                className="flex h-full w-full flex-col gap-0 border-l border-border/50 bg-background p-0 text-foreground shadow-2xl sm:max-w-[440px]"
            >
                <SheetHeader className="px-6 py-3.5 bg-background border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-label font-semibold uppercase tracking-widest text-muted-foreground/50">
                                Lemon Coach
                            </h2>
                            <SheetTitle className="sr-only">Lemon Coach</SheetTitle>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {isLoading && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={stop}
                                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                                    title="Hentikan Respons"
                                >
                                    <Square className="h-3.5 w-3.5 fill-current" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearChat}
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                                title="Hapus Chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-9 w-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                title="Tutup"
                            >
                                <X className="h-4.5 w-4.5" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex min-h-0 flex-1 flex-col">
                    <ScrollArea className="min-h-0 flex-1 px-4">
                        <div className="max-w-full space-y-6 overflow-x-hidden">
                            {error && (
                                <ErrorAlert
                                    variant="server"
                                    message="Lemon Coach gagal merespons."
                                    description={errorMessage}
                                    onRetry={() => void reload()}
                                    retryLabel="Coba Lagi"
                                />
                            )}
                            <AnimatePresence initial={false}>
                                {messages.map((message: UIMessage) => {
                                    const rawMessageText = getRawMessageText(message);
                                    const isStreamingAssistantMessage = isLoading && lastMessage?.id === message.id && message.role === 'assistant';
                                    const { response, isPending } = resolveChatResponse(rawMessageText, isStreamingAssistantMessage);
                                    const displayText = response?.text ?? extractChatDisplayText(rawMessageText);
                                    const appActions = message.role === 'assistant'
                                        ? extractAppActionsFromMessage(message, response)
                                        : [];
                                    const messageSuggestions = message.role === 'assistant' && response?.suggestions?.length
                                        ? dedupeSuggestions(response.suggestions)
                                            .slice(0, 2)
                                            .map((suggestion) => ({ label: suggestion, value: suggestion }))
                                        : followUpSuggestions;

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn('flex w-full mb-4', message.role === 'user' ? 'justify-end' : 'justify-start')}
                                        >
                                            <div className={cn('flex gap-3 max-w-[85%]', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                                                <div className={cn('h-8 w-8 rounded-full shrink-0 flex items-center justify-center', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-primary')}>
                                                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                                                    <div className={cn('p-3 rounded-2xl text-sm leading-relaxed', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card text-foreground rounded-tl-none prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-foreground prose-a:text-primary dark:prose-invert')}>
                                                        {message.role === 'user' ? (
                                                            displayText
                                                        ) : isPending ? (
                                                            <ShinyText text="Lemon Coach sedang berpikir..." />
                                                        ) : rawMessageText ? (
                                                            <RichMessageContent
                                                                text={rawMessageText}
                                                                bridge={{ router, openTransactionSheet, setIsBudgetModalOpen, setIsWalletModalOpen, setIsGoalModalOpen, setIsReminderModalOpen, setIsDebtModalOpen, setIsTransferModalOpen, showToast }}
                                                            />
                                                        ) : (
                                                            isLoading && <ShinyText text="Lemon Coach sedang berpikir..." />
                                                        )}
                                                    </div>
                                                    {message.role === 'assistant' && appActions.length > 0 && (
                                                        <div className="flex max-w-[320px] flex-wrap gap-2 pt-2">
                                                            {appActions.map((action) => (
                                                                <button
                                                                    key={`${action.type}:${action.target}:${JSON.stringify(action.params ?? {})}`}
                                                                    type="button"
                                                                    onClick={() => executeAppAction(action, { router, openTransactionSheet, setIsBudgetModalOpen, setIsWalletModalOpen, setIsGoalModalOpen, setIsReminderModalOpen, setIsDebtModalOpen, setIsTransferModalOpen, showToast })}
                                                                    className="rounded-full border border-border/60 bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary transition-colors hover:border-primary/35 hover:bg-primary/5"
                                                                >
                                                                    {getAppActionLabel(action)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {message.role === 'assistant' && latestAssistantMessageId === message.id && messageSuggestions.length > 0 && (
                                                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.2 }} className="flex w-full max-w-[320px] flex-col gap-2 pt-1.5">
                                                            {messageSuggestions.map((suggestion) => (
                                                                <motion.button
                                                                    key={suggestion.value}
                                                                    type="button"
                                                                    onClick={() => void submitQuickAction(suggestion.value)}
                                                                    whileTap={{ scale: 0.99 }}
                                                                    className="w-full rounded-2xl border border-border/45 bg-card/72 px-3 py-2.5 text-left text-xs font-medium leading-relaxed text-muted-foreground shadow-[0_8px_16px_-16px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-all hover:border-border/70 hover:bg-card hover:text-foreground"
                                                                >
                                                                    {suggestion.value}
                                                                </motion.button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-card text-primary">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-card rounded-tl-none text-foreground flex items-center gap-2 text-sm">
                                            <ShinyText text="Lemon Coach sedang berpikir..." />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!hasInteracted && !isLoading && (
                                <div className="space-y-3 px-2">
                                    <p className="ml-1 text-label uppercase tracking-widest text-muted-foreground/80">
                                        Saran Pertanyaan
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        {quickActions.map((action) => (
                                            <button
                                                key={action.label}
                                                onClick={() => void submitQuickAction(action.value)}
                                                disabled={isLoading}
                                                className="group flex items-center justify-between rounded-xl bg-card p-3 text-xs font-medium text-foreground transition-all hover:translate-x-1 hover:bg-muted"
                                            >
                                                <span className="opacity-90 group-hover:opacity-100">{action.label}</span>
                                                <ChevronRight className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomAnchorRef} className="h-px w-full" aria-hidden="true" />
                        </div>
                    </ScrollArea>

                    <div className="shrink-0 px-4 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <div className="relative flex-1">
                                <AnimatePresence mode="wait">
                                    {!input && !isLoading && (
                                        <motion.div
                                            key={placeholderIndex}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm leading-none text-muted-foreground/60"
                                        >
                                            {PLACEHOLDERS[placeholderIndex]}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <Input
                                    value={input}
                                    onChange={handleInputChange}
                                    disabled={isLoading || isRecording || isTranscribing}
                                    className="h-12 w-full rounded-[24px] bg-card pr-20 text-foreground focus-visible:ring-primary/20"
                                />
                                <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={handleVoiceRecord}
                                        disabled={isLoading || isTranscribing}
                                        className={cn('h-9 w-9 rounded-2xl transition-all duration-300', isRecording ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-secondary text-muted-foreground hover:bg-muted')}
                                    >
                                        {isTranscribing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isRecording ? (
                                            <StopCircle className="h-4 w-4" />
                                        ) : (
                                            <Mic className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || isRecording || isTranscribing || !input.trim()}
                                        className="h-9 w-9 rounded-2xl shadow-lg shadow-primary/20"
                                    >
                                        {isLoading ? (
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

