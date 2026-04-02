import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser tidak mendukung perekaman suara (harus HTTPS atau localhost).");
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.start(200); // Collect data every 200ms
            setIsRecording(true);
            setAudioBlob(null);
        } catch (error: any) {
            console.error('Error accessing microphone:', error);
            setIsRecording(false);
            
            let userFriendlyError = "Gagal mengakses mikrofon.";
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                userFriendlyError = "Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser Anda.";
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                userFriendlyError = "Tidak ada mikrofon yang ditemukan pada perangkat ini.";
            } else if (error.message) {
                userFriendlyError = error.message;
            }
            
            throw new Error(userFriendlyError);
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                cleanup();
                resolve(null);
                return;
            }

            let isResolved = false;
            const finalize = () => {
                if (isResolved) return;
                isResolved = true;
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                cleanup();
                resolve(blob);
            };

            // Fallback timeout in case onstop never fires (e.g. very short recordings in some browsers)
            const fallbackTimeout = setTimeout(finalize, 1000);

            mediaRecorderRef.current.onstop = () => {
                clearTimeout(fallbackTimeout);
                finalize();
            };

            try {
                mediaRecorderRef.current.stop();
            } catch (e) {
                console.error("Error stopping recorder", e);
                finalize();
            }
        });
    }, [cleanup]);

    const cancelRecording = useCallback(() => {
        cleanup();
        setAudioBlob(null);
    }, [cleanup]);

    // Ensure cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        cancelRecording,
        audioBlob
    };
};
