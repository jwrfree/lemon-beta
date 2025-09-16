
'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/app/page';
import { User, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(6, { message: "Password minimal 6 karakter." }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
});


export const SignUpPage = () => {
    const { router } = useData();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: 'onTouched'
    });

    const { formState: { isSubmitting } } = form;

    const handleSignUp = async (values: z.infer<typeof formSchema>) => {
        try {
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            toast.success("Akun berhasil dibuat! Silakan masuk.");
            router.push('login');
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                toast.error("Email sudah terdaftar.");
            } else {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-sm text-center">
                <User className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold mt-4">Buat Akun</h1>
                <p className="text-muted-foreground mt-2">Mulai kelola keuangan Anda dengan Lemon.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignUp)} className="w-full max-w-sm mt-8 space-y-4">
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
                                            placeholder="email@example.com"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    {field.value && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => form.setValue('email', '')}
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
                                            placeholder="********"
                                            className="pl-10 pr-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
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
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="********"
                                            className="pl-10 pr-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Membuat Akun...' : 'Daftar'}
                    </Button>
                </form>
            </Form>
            <p className="text-sm text-muted-foreground mt-8">
                Sudah punya akun?{' '}
                <Button variant="link" onClick={() => router.push('login')} className="p-0 h-auto">
                    Masuk di sini
                </Button>
            </p>
        </div>
    );
};
