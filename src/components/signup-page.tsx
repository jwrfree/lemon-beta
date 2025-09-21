
'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useApp } from './app-provider';

const formSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
});


export const SignUpPage = ({ onClose, setAuthModal }: { onClose: () => void; setAuthModal: (modal: string | null) => void; }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { showToast } = useApp();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
        mode: 'onTouched'
    });

    const { formState: { isSubmitting } } = form;

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
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit"
                onClick={(e) => e.stopPropagation()}
                {...handlers}
            >
                 <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
                    <h2 className="text-xl font-bold">Buat Akun Baru</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                </div>
                <div className="p-4 overflow-y-auto">
                     <p className="text-muted-foreground text-sm mb-4">Mulai kelola keuanganmu bersama Lemon.</p>
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
                                                <Input type="email" id="signup-email" placeholder="email@example.com" {...field} />
                                            </FormControl>
                                            {field.value && (
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => form.setValue('email', '')}>
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Hapus email</span>
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
                                                <Input type={showPassword ? "text" : "password"} id="signup-password" placeholder="********" {...field} />
                                            </FormControl>
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                                <span className="sr-only">{showPassword ? 'Sembunyikan' : 'Tampilkan'} password</span>
                                            </button>
                                        </div>
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
                                                <Input type={showPassword ? "text" : "password"} id="signup-confirm-password" placeholder="********" {...field} />
                                            </FormControl>
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                                <span className="sr-only">{showPassword ? 'Sembunyikan' : 'Tampilkan'} password</span>
                                            </button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Membuat Akun...' : 'Daftar'}
                            </Button>
                        </form>
                    </Form>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        Sudah punya akun?{' '}
                        <Button variant="link" type="button" onClick={() => setAuthModal('login')} className="p-0 h-auto">Masuk di sini</Button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
