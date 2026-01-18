'use client';

import React, { useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AuthModalView } from '@/types/auth';

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
    password: z.string().min(8, { message: "Password minimal 8 karakter." }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
});

const strengthMeta = [
    { label: 'Perlu diperkuat', color: 'bg-destructive' },
    { label: 'Cukup aman', color: 'bg-amber-500' },
    { label: 'Sangat kuat', color: 'bg-emerald-500' },
];

const evaluatePasswordStrength = (value: string) => {
    if (!value) {
        return null;
    }

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;

    const index = Math.max(Math.min(score, strengthMeta.length), 1) - 1;
    const width = `${Math.max(score, 1) / strengthMeta.length * 100}%`;

    return {
        ...strengthMeta[index],
        score,
        width,
    };
};

export const SignUpPage = ({
    onClose,
    setAuthModal,
    isPage = false,
}: {
    onClose: () => void;
    setAuthModal: React.Dispatch<React.SetStateAction<AuthModalView>>;
    isPage?: boolean;
}) => {
    const shouldReduceMotion = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const passwordValue = form.watch('password');
    const passwordStrength = useMemo(() => evaluatePasswordStrength(passwordValue), [passwordValue]);

    const handleSignUp = async (values: z.infer<typeof formSchema>) => {
        try {
            setAuthError(null);
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });

            if (error) throw error;

            showToast("Akun berhasil dibuat! Silakan masuk.", 'success');
            setAuthModal('login');
        } catch (error: any) {
            let message = 'Gagal membuat akun. Coba lagi ya.';
            if (error.message.includes('User already registered')) {
                message = 'Email ini sudah terdaftar.';
            }
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
            // Note: Redirects automatically
        } catch (error: any) {
            let message = 'Gagal mendaftar dengan Google. Coba lagi ya.';
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
        "aria-modal": "true",
        "aria-labelledby": "signup-heading",
        className: "w-full max-w-md bg-background rounded-t-2xl shadow-2xl flex flex-col h-fit",
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
        ...handlers
    };

    return (
        <Wrapper {...pageProps}>
            <MotionWrapper {...contentProps}>
                <div className={cn("p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10", isPage ? "rounded-t-2xl" : "")}>
                    <h2 id="signup-heading" className="text-xl font-bold">Buat Akun Baru</h2>
                    {!isPage && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted hover:bg-muted/80">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Tutup</span>
                        </Button>
                    )}
                </div>

                <div className="p-5 pb-6 overflow-y-auto">
                    <p className="text-sm text-muted-foreground mb-4">Mulai kelola keuanganmu bersama Lemon. Buat akun gratis dan dapatkan insight personal.</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input type="email" id="signup-email" autoComplete="email" placeholder="email@contoh.com" className="pl-10 pr-12" size="lg" {...field} />
                                            </FormControl>
                                            {field.value && (
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" onClick={() => form.setValue('email', '')} aria-label="Hapus email">
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
                                                <Input type={showPassword ? "text" : "password"} id="signup-password" autoComplete="new-password" placeholder="********" className="pl-10 pr-12" size="lg" {...field} />
                                            </FormControl>
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-pressed={showPassword} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>
                                        <FormDescription>Gunakan minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka.</FormDescription>
                                        {passwordStrength && (
                                            <div className="mt-2 space-y-1" aria-live="polite">
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <motion.div
                                                        className={cn('h-full rounded-full', passwordStrength.color)}
                                                        initial={shouldReduceMotion ? { width: passwordStrength.width } : { width: 0 }}
                                                        animate={{ width: passwordStrength.width }}
                                                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">{passwordStrength.label}</p>
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Konfirmasi Password</FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input type={showConfirmPassword ? "text" : "password"} id="signup-confirm-password" autoComplete="new-password" placeholder="********" className="pl-10 pr-12" size="lg" {...field} />
                                            </FormControl>
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-pressed={showConfirmPassword} aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}>
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" className="w-full text-base" disabled={isSubmitting}>
                                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Membuat Akun...' : 'Daftar'}
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
                            <span className="absolute inset-x-0 -top-2 mx-auto w-max bg-background px-3 text-xs uppercase text-muted-foreground">atau</span>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full text-base"
                            onClick={handleGoogleSignIn}
                            type="button"
                            disabled={isSubmitting || isGoogleLoading}
                        >
                             {isGoogleLoading ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <GoogleIcon className="mr-2 h-5 w-5" />
                            )}
                            {isGoogleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        Sudah punya akun?{' '}
                        <Button
                            variant="link"
                            type="button"
                            onClick={() => {
                                setAuthError(null);
                                setAuthModal('login');
                            }}
                            className="p-0 h-auto"
                        >
                            Masuk di sini
                        </Button>
                    </p>
                </div>
            </MotionWrapper>
        </Wrapper>
    );
};
