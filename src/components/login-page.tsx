
'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/app/page';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.356-11.303-8H4.899v6.42C8.212,39.881,15.536,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.83,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export const LoginPage = () => {
    const { router } = useData();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login berhasil!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast.success("Login dengan Google berhasil!");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-sm text-center">
                <LogIn className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-3xl font-bold mt-4">Selamat Datang!</h1>
                <p className="text-muted-foreground mt-2">Masuk untuk melanjutkan ke aplikasi Lemon.</p>
            </div>
            <form onSubmit={handleLogin} className="w-full max-w-sm mt-8 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Memproses...' : 'Masuk'}
                </Button>
            </form>
            <div className="w-full max-w-sm mt-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Atau lanjutkan dengan
                        </span>
                    </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn}>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Google
                </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
                Belum punya akun?{' '}
                <Button variant="link" onClick={() => router.push('signup')} className="p-0 h-auto">
                    Daftar di sini
                </Button>
            </p>
        </div>
    );
};
