import { useChat } from 'ai/react';
import { useCallback } from 'react';
import { useUI } from '@/components/ui-provider';

const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'assistant' as const,
    content: 'Halo! Saya Lemon Coach. Ada yang bisa saya bantu dengan keuanganmu hari ini?',
};

export const useAIChat = () => {
    const {
        isAIChatOpen: isOpen,
        setIsAIChatOpen: setIsOpen,
        showToast,
    } = useUI();

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        append,
        isLoading,
        error,
        reload,
        stop,
        setMessages,
        setInput,
    } = useChat({
        id: 'lemon-coach',
        api: '/api/ai/chat',
        initialMessages: [WELCOME_MESSAGE],
        onError: (chatError) => {
            showToast(chatError.message || 'Tanya Lemon sedang bermasalah. Coba lagi.', 'error');
        },
    });

    const openChat = useCallback(() => setIsOpen(true), [setIsOpen]);
    const closeChat = useCallback(() => setIsOpen(false), [setIsOpen]);
    const toggleChat = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

    const clearChat = useCallback(() => {
        stop();
        setInput('');
        setMessages([WELCOME_MESSAGE]);
    }, [setInput, setMessages, stop]);

    const submitQuickAction = useCallback(async (value: string) => {
        setInput('');
        await append({
            role: 'user',
            content: value,
        });
    }, [append, setInput]);

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        submitQuickAction,
        isLoading,
        error,
        reload,
        stop,
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        clearChat,
    };
};
