'use client';

import React, { useMemo, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useUI } from './ui-provider';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }),
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
    if (value.length >= 6) score += 1;
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

export const SignUpPage = ({ onClose, setAuthModal }: { onClose: () => void; setAuthModal: (modal: string | null) => void; }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { showToast } = useUI();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
        mode: 'onTouched'
    });

    const { formState: { isSubmitting } } = form;

    const passwordValue = form.watch('password');
    const passwordStrength = useMemo(() => evaluatePasswordStrength(passwordValue), [passwordValue]);

    const handleSignUp = async (values: z.infer<typeof formSchema>) => {
        try {
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            showToast("Akun berhasil dibuat! Silakan masuk.", 'success');
            setAuthModal('login');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                showToast("Email ini sudah terdaftar.", 'error');
            } else {
                showToast("Gagal membuat akun. Coba lagi ya.", 'error');
            }
        }
    };

    const handlers = useSwipeable({
        onSwipedDown: onClose,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="signup-heading"
                className="w-full max-w-md bg-background/95 border border-primary/10 rounded-t-3xl shadow-2xl flex flex-col h-fit backdrop-blur-lg"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                <div className="relative overflow-hidden rounded-t-3xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10" />
                    <div className="relative flex items-center justify-between px-5 py-4">
                        <h2 id="signup-heading" className="text-xl font-bold">Buat Akun Baru</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-background/60 hover:bg-background">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Tutup</span>
                        </Button>
                    </div>
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
                                                <Input type="email" id="signup-email" autoComplete="email" placeholder="email@example.com" className="pl-10 pr-12" {...field} />
                                            </FormControl>
                                            {field.value && (
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => form.setValue('email', '')} aria-label="Hapus email">
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
                                                <Input type={showPassword ? "text" : "password"} id="signup-password" autoComplete="new-password" placeholder="********" className="pl-10 pr-12" {...field} />
                                            </FormControl>
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-pressed={showPassword} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>
                                        <FormDescription>Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk keamanan maksimal.</FormDescription>
                                        {passwordStrength && (
                                            <div className="mt-2 space-y-1" aria-live="polite">
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div className={cn('h-full rounded-full transition-all duration-300', passwordStrength.color)} style={{ width: passwordStrength.width }} />
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
                                                <Input type={showConfirmPassword ? "text" : "password"} id="signup-confirm-password" autoComplete="new-password" placeholder="********" className="pl-10 pr-12" {...field} />
                                            </FormControl>
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-pressed={showConfirmPassword} aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}>
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>
                                        <FormDescription>Pastikan sama persis dengan password di atas.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
                                {isSubmitting ? 'Membuat Akun...' : 'Daftar'}
                            </Button>
                        </form>
                    </Form>
                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        Sudah punya akun?{' '}
                        <Button variant="link" type="button" onClick={() => setAuthModal('login')} className="p-0 h-auto">Masuk di sini</Button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
