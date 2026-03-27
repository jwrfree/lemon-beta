import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser Anda memblokir akses mikrofon. Pastikan Anda membuka web ini melalui koneksi aman (HTTPS) atau localhost asli.");
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                
                // Cleanup tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setAudioBlob(null);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setIsRecording(false);
            throw error;
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve(null);
                return;
            }

            // Temporarily replace onstop to attach the resolve
            const prevOnStop = mediaRecorderRef.current.onstop;
            mediaRecorderRef.current.onstop = (e) => {
                if (prevOnStop) prevOnStop.call(mediaRecorderRef.current!, e);
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setIsRecording(false);
                resolve(blob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    return {
        isRecording,
        startRecording,
        stopRecording,
        audioBlob
    };
};
