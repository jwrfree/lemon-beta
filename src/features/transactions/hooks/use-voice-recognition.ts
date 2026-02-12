'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start(): void;
    stop(): void;
    abort(): void;
}

const SpeechRecognition = (typeof window !== 'undefined' &&
    ((window as unknown as { SpeechRecognition?: new () => ISpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => ISpeechRecognition }).webkitSpeechRecognition)) as {
            new(): ISpeechRecognition;
        } | undefined;

export const useVoiceRecognition = (onTranscriptUpdate: (text: string) => void, onTranscriptEnd?: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const finalTranscriptRef = useRef('');
    const currentTranscriptRef = useRef('');

    useEffect(() => {
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                finalTranscriptRef.current += finalTranscript + ' ';
            }

            const fullTranscript = finalTranscriptRef.current + interimTranscript;
            currentTranscriptRef.current = fullTranscript;
            onTranscriptUpdate(fullTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (onTranscriptEnd) {
                onTranscriptEnd(currentTranscriptRef.current);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [onTranscriptUpdate, onTranscriptEnd]);

    const toggleListening = useCallback(() => {
        if (!SpeechRecognition) return false;

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            finalTranscriptRef.current = '';
            currentTranscriptRef.current = '';
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.error("Failed to start recognition:", err);
                setIsListening(true);
            }
        }
        return true;
    }, [isListening]);

    return {
        isListening,
        toggleListening,
        isSupported: !!SpeechRecognition
    };
}; 
