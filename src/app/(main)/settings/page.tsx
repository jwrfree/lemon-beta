
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Wallet, Wrench, Target, Landmark, LogOut, ChevronRight, UserCircle, Bell, Shield, Moon, Sun, BellRing, HandCoins } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useBiometric } from '@/hooks/use-biometric';
import { Switch } from '@/components/ui/switch';
import { useUI } from '@/components/ui-provider';

export default function SettingsPage() {
    const router = useRouter();
    const { user, userData, handleSignOut, updateUserBiometricStatus } = useApp();
    const { theme, setTheme } = useTheme();
    const { showToast } = useUI();
    const { isBiometricSupported, registerBiometric, unregisterBiometric } = useBiometric();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleBiometricToggle = async (enabled: boolean) => {
        if (!user?.email) return;

        try {
            if (enabled) {
                await registerBiometric(user.email, user.uid);
                await updateUserBiometricStatus(true);
                localStorage.setItem('lemon_biometric_user', user.email);
                showToast("Login sidik jari diaktifkan.", 'success');
            } else {
                await unregisterBiometric(user.uid);
                await updateUserBiometricStatus(false);
                localStorage.removeItem('lemon_biometric_user');
                showToast("Login sidik jari dinonaktifkan.", 'info');
            }
        } catch (error) {
            console.error("Biometric operation failed:", error);
            showToast("Operasi biometrik gagal. Coba lagi.", 'error');
            // Revert UI state on failure
            await updateUserBiometricStatus(!enabled);
        }
    };


    const managementItems = [
        { id: 'wallets', name: 'Kelola Dompet', icon: Wallet, page: '/wallets' },
        { id: 'categories', name: 'Kelola Kategori', icon: Wrench, page: '/categories' },
        { id: 'goals', name: 'Target Keuangan', icon: Target, page: '/goals' },
        { id: 'reminders', name: 'Pengingat', icon: BellRing, page: '/reminders' },
        { id: 'debts', name: 'Hutang & Piutang', icon: HandCoins, page: '/debts' },
        { id: 'assets_liabilities', name: 'Aset & Liabilitas', icon: Landmark, page: '/assets-liabilities' },
    ];
    
    const renderThemeToggle = () => {
        if (!mounted) {
            return (
                <div className="relative flex items-center gap-1 p-1 rounded-full bg-muted h-[42px] w-[84px]">
                    {/* Placeholder to prevent layout shift */}
                </div>
            );
        }
        return (
            <div className="relative flex items-center gap-1 p-1 rounded-full bg-muted">
                {theme === 'light' && (
                    <motion.div layoutId="theme-bg" className="absolute inset-0 h-full w-1/2 bg-background rounded-full shadow-sm" />
                )}
                {theme === 'dark' && (
                    <motion.div layoutId="theme-bg" className="absolute inset-0 h-full w-1/2 left-1/2 bg-background rounded-full shadow-sm" />
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setTheme('light')}
                    className={cn("rounded-full z-10 h-8 w-8", theme === 'light' ? 'text-primary' : 'text-muted-foreground')}
                    aria-label="Ganti ke tema terang"
                >
                    <Sun className="h-5 w-5" />
                    <span className="sr-only">Tema Terang</span>
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setTheme('dark')}
                    className={cn("rounded-full z-10 h-8 w-8", theme === 'dark' ? 'text-primary' : 'text-muted-foreground')}
                    aria-label="Ganti ke tema gelap"
                >
                    <Moon className="h-5 w-5" />
                    <span className="sr-only">Tema Gelap</span>
                </Button>
            </div>
        );
    };
    
    return (
        <>
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <h1 className="text-xl font-bold text-center w-full">Pengaturan</h1>
            </header>
            <main className="flex-1">
                <div className="p-4 space-y-4">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User Avatar" className="w-full h-full rounded-full" />
                            ) : (
                                <UserCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{user?.displayName || 'Pengguna Lemon'}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="rounded-lg bg-card overflow-hidden">
                        <div className="w-full flex items-center gap-4 px-4 py-3 text-left">
                            <Moon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                            <span className="font-medium flex-1">Tema Aplikasi</span>
                            {renderThemeToggle()}
                        </div>
                        <Separator className="mx-4 w-auto"/>
                        <button onClick={() => router.push('/notifications')} className="w-full flex items-center gap-4 px-4 py-3 h-[58px] hover:bg-accent text-left">
                            <Bell className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                            <span className="font-medium flex-1">Notifikasi</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Buka Notifikasi</span>
                        </button>
                    </div>

                    {/* Security Card */}
                    {isBiometricSupported && (
                        <div className="rounded-lg bg-card overflow-hidden">
                            <div className="w-full flex items-center gap-4 px-4 py-3 text-left">
                                <Shield className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                                <span className="font-medium flex-1">Keamanan</span>
                            </div>
                            <Separator className="mx-4 w-auto"/>
                            <div className="flex items-center gap-4 px-4 py-2 h-[68px]">
                                <div className="flex-1">
                                    <label htmlFor="biometric-switch" className="font-medium">Masuk dengan Sidik Jari</label>
                                    <p className="text-xs text-muted-foreground">Gunakan biometrik untuk masuk lebih cepat.</p>
                                </div>
                                <Switch
                                    id="biometric-switch"
                                    checked={userData?.isBiometricEnabled || false}
                                    onCheckedChange={handleBiometricToggle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Management Card */}
                    <div className="rounded-lg bg-card overflow-hidden">
                        {managementItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <button onClick={() => router.push(item.page)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-accent text-left">
                                    <item.icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                                    <span className="font-medium flex-1">{item.name}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    <span className="sr-only">Buka {item.name}</span>
                                </button>
                                 {index < managementItems.length - 1 && <Separator className="mx-4 w-auto"/>}
                            </React.Fragment>
                        ))}
                    </div>
                    
                     {/* Logout Button */}
                     <div className="rounded-lg bg-card overflow-hidden">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-destructive/10 text-left text-destructive">
                                    <LogOut className="h-6 w-6" strokeWidth={1.5}/>
                                    <span className="font-medium flex-1">Keluar</span>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Kamu akan keluar dari Lemon App pada perangkat ini.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleSignOut}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Keluar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    
                     <p className="text-xs text-muted-foreground text-center !mt-6">Lemon App v1.3.0</p>
                </div>
            </main>
        </>
    );
};
