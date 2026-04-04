'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, LoaderCircle, CheckCircle2 } from '@/lib/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { motion } from 'framer-motion';
import { useUI } from '@/components/ui-provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { spacing } from '@/lib/layout-tokens';

const formSchema = z.object({
    password: z.string().min(8, { message: "Password minimal 8 karakter." }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
});

export const ResetPasswordPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useUI();
    const [authError, setAuthError] = useState<string | null>(null);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: "", confirmPassword: "" },
        mode: 'onTouched'
    });

    const { formState: { isSubmitting } } = form;

    const handleResetPassword = async (values: z.infer<typeof formSchema>) => {
        try {
            setAuthError(null);
            
            const { error } = await supabase.auth.updateUser({
                password: values.password
            });

            if (error) throw error;

            setIsSuccess(true);
            showToast("Password berhasil diperbarui! Silakan masuk kembali.", 'success');
            
            // Redirect to landing page after a short delay
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal memperbarui password. Sesi mungkin sudah tidak berlaku.';
            setAuthError(message);
            showToast(message, 'error');
        }
    };

    if (isSuccess) {
        return (
            <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-display-sm">Password Diperbarui!</h2>
                    <p className="text-muted-foreground">Password kamu sudah berhasil diganti. Kamu akan dialihkan ke halaman utama sebentar lagi.</p>
                </div>
                <Button onClick={() => router.push('/')} className="w-full h-12 rounded-xl">
                    Kembali Sekarang
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h2 className="text-display-sm mb-2">Atur Ulang Password</h2>
                <p className="text-muted-foreground">Silakan masukkan password baru untuk akun kamu. Pastikan gunakan kombinasi yang kuat.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleResetPassword)} className={spacing.stack}>
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password Baru</FormLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="********" 
                                            className="pl-10 pr-12 h-12" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 text-muted-foreground"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <FormDescription>Minimal 8 karakter.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konfirmasi Password Baru</FormLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <FormControl>
                                        <Input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            placeholder="********" 
                                            className="pl-10 pr-12 h-12" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 text-muted-foreground"
                                        aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-body-lg" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Memperbarui...' : 'Simpan Password Baru'}
                    </Button>
                </form>
            </Form>

            {authError && (
                <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{authError}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

