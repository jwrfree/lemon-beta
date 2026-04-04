'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ChatCircleDots, 
    Bug, 
    Lightbulb, 
    RocketLaunch, 
    CheckCircle,
    ArrowLeft
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { cn, triggerHaptic } from '@/lib/utils';
import { useUI } from '@/components/ui-provider';

type FeedbackType = 'bug' | 'feature' | 'general';

export default function FeedbackPage() {
    const router = useRouter();
    const { showToast } = useUI();
    const [type, setType] = useState<FeedbackType>('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        triggerHaptic('medium');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
        showToast('Terima kasih! Masukan Anda sangat berharga.', 'success');
    };

    if (isSuccess) {
        return (
            <AppPageShell>
                <AppPageHeaderChrome>
                    <div className="flex h-16 items-center px-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ArrowLeft weight="regular" />
                        </Button>
                    </div>
                </AppPageHeaderChrome>
                <AppPageBody className="flex flex-col items-center justify-center pt-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
                        <CheckCircle size={48} weight="fill" />
                    </div>
                    <h1 className="text-display-sm mb-2">Masukan Terkirim!</h1>
                    <p className="text-body-md text-muted-foreground max-w-xs mx-auto mb-8">
                        Terima kasih telah membantu Lemon menjadi lebih baik. Kami akan meninjau pesan Anda segera.
                    </p>
                    <Button onClick={() => router.push('/profile')} variant="primary" className="w-full max-w-[200px] rounded-full">
                        Kembali ke Profil
                    </Button>
                </AppPageBody>
            </AppPageShell>
        );
    }

    return (
        <AppPageShell>
            <AppPageHeaderChrome>
                <div className="flex h-16 items-center gap-3 px-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft weight="regular" />
                    </Button>
                    <h1 className="text-title-lg font-semibold">Kirim Masukan</h1>
                </div>
            </AppPageHeaderChrome>

            <AppPageBody className="space-y-6 pb-10">
                <div className="space-y-2">
                    <p className="text-body-md text-muted-foreground px-1">
                        Apa yang ingin Anda sampaikan hari ini? Kami sangat menghargai setiap masukan Anda.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => { triggerHaptic('light'); setType('bug'); }}
                        className={cn(
                            "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all active:scale-95",
                            type === 'bug' ? "border-primary bg-primary/5 text-primary" : "border-border/15 bg-card text-muted-foreground"
                        )}
                    >
                        <Bug size={24} weight={type === 'bug' ? 'fill' : 'regular'} />
                        <span className="text-label-sm">Bug</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { triggerHaptic('light'); setType('feature'); }}
                        className={cn(
                            "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all active:scale-95",
                            type === 'feature' ? "border-primary bg-primary/5 text-primary" : "border-border/15 bg-card text-muted-foreground"
                        )}
                    >
                        <Lightbulb size={24} weight={type === 'feature' ? 'fill' : 'regular'} />
                        <span className="text-label-sm">Saran</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { triggerHaptic('light'); setType('general'); }}
                        className={cn(
                            "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all active:scale-95",
                            type === 'general' ? "border-primary bg-primary/5 text-primary" : "border-border/15 bg-card text-muted-foreground"
                        )}
                    >
                        <ChatCircleDots size={24} weight={type === 'general' ? 'fill' : 'regular'} />
                        <span className="text-label-sm">Lainnya</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="message" className="text-label-md ml-1">Detail Pesan</Label>
                        <Textarea
                            id="message"
                            placeholder={
                                type === 'bug' ? "Jelaskan error yang Anda alami..." :
                                type === 'feature' ? "Apa fitur yang Anda impikan?" :
                                "Tuliskan masukan Anda di sini..."
                            }
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[160px] rounded-2xl border-border/15 bg-card text-body-md focus-visible:ring-primary/20"
                            required
                        />
                    </div>

                    <div className="rounded-2xl bg-muted/30 p-4 border border-border/10">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <RocketLaunch size={20} weight="duotone" className="text-primary" />
                            <p className="text-label-md leading-relaxed">
                                Masukan Anda akan langsung diteruskan ke tim pengembang kami untuk Lemon v3.0.
                            </p>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !message.trim()} 
                        className="w-full h-14 rounded-full text-body-lg shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? "Mengirim..." : "Kirim Sekarang"}
                    </Button>
                </form>
            </AppPageBody>
        </AppPageShell>
    );
}
