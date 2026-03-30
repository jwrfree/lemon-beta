import { useChat, Message } from 'ai/react';
import { useCallback } from 'react';
import { useUI } from '@/components/ui-provider';

export const useAIChat = () => {
    const { isAIChatOpen: isOpen, setIsAIChatOpen: setIsOpen } = useUI();

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
        reload,
        stop,
        setMessages,
    } = useChat({
        api: '/api/ai/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Halo! Saya Lemon Coach. Ada yang bisa saya bantu dengan keuanganmu hari ini?',
            },
        ],
    });

    const openChat = useCallback(() => setIsOpen(true), []);
    const closeChat = useCallback(() => setIsOpen(false), []);
    const toggleChat = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

    const clearChat = useCallback(() => {
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Halo! Saya Lemon Coach. Ada yang bisa saya bantu dengan keuanganmu hari ini?',
            },
        ]);
    }, [setMessages]);

    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
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
