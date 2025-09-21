
'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, X, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useUI } from './ui-provider';
import { Separator } from '@/components/ui/separator';

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

export const LoginPage = ({ onClose, setAuthModal }: { onClose: () => void; setAuthModal: (modal: string | null) => void; }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { showToast } = useUI();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
        mode: 'onTouched'
    });

    const { formState: { isSubmitting } } = form;

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            showToast("Login berhasil! Selamat datang kembali.", 'success');
            onClose();
        } catch (error: any) {
            showToast(error.code === 'auth/invalid-credential' ? 'Email atau password salah.' : 'Gagal masuk. Coba lagi ya.', 'error');
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setIsGoogleLoading(true);
            await signInWithPopup(auth, provider);
            showToast("Login dengan Google berhasil!", 'success');
            onClose();
        } catch (error: any) {
            showToast('Gagal masuk dengan Google. Coba lagi ya.', 'error');
        } finally {
            setIsGoogleLoading(false);
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
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-heading"
                className="w-full max-w-md bg-background rounded-t-2xl shadow-2xl flex flex-col h-fit"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                 <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
                    <h2 id="login-heading" className="text-xl font-bold">Selamat Datang Kembali!</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-muted hover:bg-muted/80">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
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
                                                    className="pl-10 pr-12 text-base h-12"
                                                    {...field}
                                                />
                                            </FormControl>
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
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
                                                    className="pl-10 pr-12 text-base h-12"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                aria-pressed={showPassword}
                                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>
                                        <FormDescription>Minimal 6 karakter kombinasi huruf dan angka.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" className="w-full text-base" disabled={isSubmitting}>
                                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <Separator className="bg-border" />
                            <span className="absolute inset-x-0 -top-2 mx-auto w-max bg-background px-3 text-xs uppercase text-muted-foreground">atau lanjutkan</span>
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
                            {isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        Belum punya akun?{' '}
                        <Button variant="link" onClick={() => setAuthModal('signup')} className="p-0 h-auto" type="button">Daftar di sini</Button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
