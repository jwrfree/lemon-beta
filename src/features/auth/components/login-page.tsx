'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, X, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion, useReducedMotion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useUI } from '@/components/ui-provider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AuthModalView } from '@/types/auth';
import { cn } from '@/lib/utils';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.356-11.303-8H4.899v6.42C8.212,39.881,15.536,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.83,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const formSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export const LoginPage = ({
    onClose,
    setAuthModal,
    isPage = false,
}: {
    onClose: () => void;
    setAuthModal: React.Dispatch<React.SetStateAction<AuthModalView>>;
    isPage?: boolean;
}) => {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { showToast } = useUI();
    const [authError, setAuthError] = useState<string | null>(null);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
        mode: 'onTouched'
    });

    const { formState: { isSubmitting } } = form;

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        try {
            setAuthError(null);
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                let message = 'Gagal masuk. Coba lagi ya.';
                if (error.message.includes('Invalid login credentials')) {
                    message = 'Email atau password salah.';
                } else {
                    message = error.message; // Use Supabase error message directly for debugging
                }
                throw new Error(message);
            }

            showToast("Login berhasil! Selamat datang kembali.", 'success');
            onClose();
            router.push('/home');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal masuk. Coba lagi ya.';
            setAuthError(message);
            showToast(message, 'error');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            setAuthError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            // Note: Redirects automatically, so toast might not be seen immediately
        } catch {
            let message = 'Gagal masuk dengan Google. Coba lagi ya.';
            setAuthError(message);
            showToast(message, 'error');
            setIsGoogleLoading(false);
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
        "aria-labelledby": "login-heading",
        className: "w-full max-w-md bg-background rounded-t-2xl shadow-2xl flex flex-col h-fit",
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
        ...handlers
    };


    return (
        <Wrapper {...pageProps}>
            <MotionWrapper {...contentProps}>
                <div className={cn("p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10", isPage ? "rounded-t-2xl" : "")}>
                    <h2 id="login-heading" className="text-xl font-medium">Selamat Datang Kembali!</h2>
                    {!isPage && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted hover:bg-muted/80">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Tutup</span>
                        </Button>
                    )}
                </div>


                <div className="p-5 pb-6 overflow-y-auto">
                    <p className="text-sm text-muted-foreground mb-4">Masuk menggunakan email yang sudah terdaftar untuk membuka dashboard Lemon.</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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
                                                    id="email"
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
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    autoComplete="current-password"
                                                    placeholder="********"
                                                    className="pl-10 pr-12"
                                                    size="lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </Button>
                                        </div>
                                        <FormDescription>Minimal 6 karakter kombinasi huruf dan angka.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end text-sm">
                                <Button
                                    variant="link"
                                    type="button"
                                    className="p-0 h-auto text-sm"
                                    onClick={() => {
                                        setAuthError(null);
                                        setAuthModal('forgot-password');
                                    }}
                                >
                                    Lupa password?
                                </Button>
                            </div>
                            <Button type="submit" size="lg" className="w-full text-base h-12" disabled={isSubmitting}>
                                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>
                    </Form>

                    {authError && (
                        <Alert variant="destructive" className="mt-4" aria-live="assertive">
                            <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <Separator className="bg-border" />
                            <span className="absolute inset-x-0 -top-2 mx-auto w-max bg-background px-3 text-xs uppercase text-muted-foreground">atau lanjutkan</span>
                        </div>
                        
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full text-base h-12"
                            onClick={handleGoogleSignIn}
                            type="button"
                            disabled={isSubmitting || isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <GoogleIcon className="mr-2 h-5 w-5" />
                            )}
                            {isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        Belum punya akun?{' '}
                        <Button
                            variant="link"
                            onClick={() => {
                                setAuthError(null);
                                setAuthModal('signup');
                            }}
                            className="p-0 h-auto"
                            type="button"
                        >
                            Daftar di sini
                        </Button>
                    </p>
                </div>
            </MotionWrapper>
        </Wrapper>
    );
};

