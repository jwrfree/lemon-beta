'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, X, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion, useReducedMotion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useUI } from '@/components/ui-provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AuthModalView } from '@/types/auth';
import { cn } from '@/lib/utils';


const formSchema = z.object({
    email: z.string().email({ message: 'Format email tidak valid.' }),
});

export const ForgotPasswordPage = ({
    onClose,
    setAuthModal,
    isPage = false,
}: {
    onClose: () => void;
    setAuthModal: React.Dispatch<React.SetStateAction<AuthModalView>>;
    isPage?: boolean;
}) => {
    const shouldReduceMotion = useReducedMotion();
    const { showToast } = useUI();
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '' },
        mode: 'onTouched',
    });

    const {
        formState: { isSubmitting },
    } = form;

    const handleReset = async (values: z.infer<typeof formSchema>) => {
        try {
            setAuthError(null);
            const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
                redirectTo: `${window.location.origin}/settings`,
            });
            
            if (error) throw error;

            setIsSuccess(true);
            showToast('Kami telah mengirim email untuk mengatur ulang password.', 'success');
        } catch (error: any) {
            let message = 'Gagal mengirim tautan reset password. Coba lagi ya.';
            if (error.message?.includes('User not found')) {
                message = 'Email belum terdaftar di Lemon.';
            } else if (error.status === 429) {
                message = 'Terlalu banyak permintaan. Coba beberapa menit lagi.';
            }
            setAuthError(message);
            showToast(message, 'error');
        }
    };

    const handlers = useSwipeable({
        onSwipedDown: onClose,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    
    const Wrapper = isPage ? 'div' : motion.div;
    const MotionWrapper = motion.div;
    
    const pageProps = isPage ? {} : {
        initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0 },
        animate: { opacity: 1 },
        exit: shouldReduceMotion ? { opacity: 1 } : { opacity: 0 },
        transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' },
        className: "fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm",
        onClick: onClose,
    };
    
    const contentProps = isPage ? { className: "w-full max-w-md" } : {
        initial: shouldReduceMotion ? { y: 0 } : { y: '100%' },
        animate: { y: 0 },
        exit: shouldReduceMotion ? { y: 0 } : { y: '100%' },
        transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' },
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": "forgot-password-heading",
        className: "w-full max-w-md bg-background rounded-t-2xl shadow-2xl flex flex-col h-fit",
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
        ...handlers
    };

    return (
        <Wrapper {...pageProps}>
            <MotionWrapper {...contentProps}>
                <div className={cn("p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10", isPage ? "rounded-t-2xl" : "")}>
                    <h2 id="forgot-password-heading" className="text-xl font-semibold">
                        Lupa Password
                    </h2>
                    {!isPage && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted hover:bg-muted/80">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Tutup</span>
                        </Button>
                    )}
                </div>

                <div className="p-5 pb-6 overflow-y-auto">
                    <p className="text-sm text-muted-foreground mb-4">
                        Masukkan email yang kamu gunakan di Lemon. Kami akan mengirim tautan untuk mengatur ulang password.
                    </p>

                    {isSuccess && (
                        <div
                            className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                            role="status"
                        >
                            Instruksi reset password sudah dikirim. Cek folder inbox atau spam bila belum terlihat.
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleReset)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    id="forgot-password-email"
                                                    autoComplete="email"
                                                    placeholder="email@contoh.com"
                                                    className="pl-10 pr-12"
                                                    size="lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
                                                    onClick={() => form.setValue('email', '')}
                                                    aria-label="Hapus email"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" className="w-full text-base h-12" disabled={isSubmitting}>
                                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Mengirim tautan...' : 'Kirim tautan reset'}
                            </Button>
                        </form>
                    </Form>

                    {authError && (
                        <Alert variant="destructive" className="mt-4" aria-live="assertive">
                            <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}

                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        Ingat password?{' '}
                        <Button
                            variant="link"
                            type="button"
                            onClick={() => {
                                setAuthError(null);
                                setIsSuccess(false);
                                setAuthModal('login');
                            }}
                            className="p-0 h-auto"
                        >
                            Kembali ke login
                        </Button>
                    </p>
                </div>
            </MotionWrapper>
        </Wrapper>
    );
};
