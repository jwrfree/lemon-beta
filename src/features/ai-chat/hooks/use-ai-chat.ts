import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useUI } from '@/components/ui-provider';
import { useAuth as useUser } from '@/providers/auth-provider';

const FALLBACK_CHAT_ERROR = 'Lemon Coach sedang tidak tersedia. Coba lagi sebentar.';

const formatChatErrorMessage = (error: unknown) => {
    if (!(error instanceof Error) || !error.message) {
        return FALLBACK_CHAT_ERROR;
    }

    try {
        const parsed = JSON.parse(error.message) as { error?: string; message?: string };
        if (typeof parsed.error === 'string' && parsed.error.trim()) {
            return parsed.error;
        }
        if (typeof parsed.message === 'string' && parsed.message.trim()) {
            return parsed.message;
        }
    } catch {
        // Keep the original message when it is plain text.
    }

    return error.message;
};

export const useAIChat = () => {
    const {
        isAIChatOpen: isOpen,
        setIsAIChatOpen: setIsOpen,
        showToast,
    } = useUI();
    const { user } = useUser();

    const welcomeMessage = useMemo(() => {
        const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Teman';
        return {
            id: 'welcome',
            role: 'assistant' as const,
            parts: [
                {
                    type: 'text' as const,
                    text: `Halo ${firstName}! Saya Lemon Coach. Ada yang bisa saya bantu dengan keuanganmu hari ini?`,
                },
            ],
        } satisfies UIMessage;
    }, [user]);

    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isHydratingSession, setIsHydratingSession] = useState(true);
    const wasOpenRef = useRef(isOpen);
    const lastProfileSyncKeyRef = useRef<string | null>(null);

    const getStorageKey = useCallback((userId: string) => `lemon-coach-session-id:${userId}`, []);

    const createSessionId = useCallback(() => crypto.randomUUID(), []);

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: '/api/chat',
                body: sessionId ? { sessionId } : {},
            }),
        [sessionId]
    );

    const {
        messages,
        setMessages,
        sendMessage,
        stop,
        status,
        error,
        regenerate: reload,
        clearError,
    } = useChat<UIMessage>({
        id: 'lemon-coach',
        messages: [welcomeMessage],
        transport,
        onError: (chatError: Error) => {
            showToast(formatChatErrorMessage(chatError), 'error');
        },
    });

    const isLoading = status === 'streaming' || status === 'submitted';
    const errorMessage = error ? formatChatErrorMessage(error) : undefined;
    const substantiveAssistantMessages = useMemo(
        () => messages.filter((message) => message.role === 'assistant' && message.id !== 'welcome'),
        [messages]
    );

    const syncCoachingProfile = useCallback((reason: 'close' | 'clear') => {
        if (!user || !sessionId || substantiveAssistantMessages.length < 3) {
            return;
        }

        const lastAssistantMessageId = substantiveAssistantMessages[substantiveAssistantMessages.length - 1]?.id ?? 'none';
        const syncKey = `${sessionId}:${substantiveAssistantMessages.length}:${lastAssistantMessageId}:${reason}`;
        if (lastProfileSyncKeyRef.current === syncKey) {
            return;
        }

        lastProfileSyncKeyRef.current = syncKey;

        void fetch('/api/chat/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId,
                messages,
            }),
        }).catch((profileError) => {
            console.error('Failed to sync coaching profile:', profileError);
        });
    }, [messages, sessionId, substantiveAssistantMessages, user]);

    useEffect(() => {
        let isCancelled = false;

        const hydrateSession = async () => {
            if (!user) {
                setSessionId(null);
                setMessages([welcomeMessage]);
                setIsHydratingSession(false);
                return;
            }

            setIsHydratingSession(true);

            const storageKey = getStorageKey(user.id);
            const storedSessionId = window.localStorage.getItem(storageKey) || createSessionId();
            window.localStorage.setItem(storageKey, storedSessionId);
            setSessionId(storedSessionId);

            try {
                const response = await fetch(`/api/chat/session?sessionId=${storedSessionId}`);
                if (!response.ok) {
                    throw new Error('Gagal memuat sesi Lemon Coach.');
                }

                const payload = await response.json() as { messages?: UIMessage[] };
                if (isCancelled) return;

                if (Array.isArray(payload.messages) && payload.messages.length > 0) {
                    setMessages(payload.messages);
                } else {
                    setMessages([welcomeMessage]);
                }
            } catch (sessionError) {
                console.error('Failed to hydrate chat session:', sessionError);
                if (!isCancelled) {
                    setMessages([welcomeMessage]);
                }
            } finally {
                if (!isCancelled) {
                    setIsHydratingSession(false);
                }
            }
        };

        void hydrateSession();

        return () => {
            isCancelled = true;
        };
    }, [createSessionId, getStorageKey, setMessages, user, welcomeMessage]);

    useEffect(() => {
        if (wasOpenRef.current && !isOpen) {
            syncCoachingProfile('close');
        }

        wasOpenRef.current = isOpen;
    }, [isOpen, syncCoachingProfile]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading || isHydratingSession) return;

        const content = input;
        setInput('');
        
        try {
            clearError();
            await sendMessage({ text: content });
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    }, [clearError, input, isHydratingSession, isLoading, sendMessage]);

    const openChat = useCallback(() => setIsOpen(true), [setIsOpen]);
    const closeChat = useCallback(() => setIsOpen(false), [setIsOpen]);
    const toggleChat = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

    const clearChat = useCallback(() => {
        const resetChat = async () => {
            syncCoachingProfile('clear');
            stop();
            clearError();
            setInput('');

            if (user && sessionId) {
                try {
                    await fetch(`/api/chat/session?sessionId=${sessionId}`, {
                        method: 'DELETE',
                    });
                } catch (sessionError) {
                    console.error('Failed to clear chat session:', sessionError);
                }

                const nextSessionId = createSessionId();
                window.localStorage.setItem(getStorageKey(user.id), nextSessionId);
                setSessionId(nextSessionId);
            }

            setMessages([welcomeMessage]);
        };

        void resetChat();
    }, [clearError, createSessionId, getStorageKey, sessionId, setMessages, stop, syncCoachingProfile, user, welcomeMessage]);

    const submitQuickAction = useCallback(async (value: string) => {
        if (isLoading || isHydratingSession) return;
        try {
            clearError();
            await sendMessage({ text: value });
        } catch (err) {
            console.error('Failed to send quick action:', err);
        }
    }, [clearError, isHydratingSession, isLoading, sendMessage]);

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        submitQuickAction,
        isLoading,
        error,
        errorMessage,
        reload,
        stop,
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        clearChat,
        setIsOpen,
        setInput,
        isHydratingSession,
    };
};
