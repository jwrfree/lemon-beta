
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
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
import { Wallet, Wrench, Target, Landmark, LogOut, ChevronRight, UserCircle, Bell, Shield, Moon, Sun, BellRing, HandCoins, Calculator } from 'lucide-react';
import { useApp } from '@/providers/app-provider';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useBiometric } from '@/hooks/use-biometric';
import { Switch } from '@/components/ui/switch';
import { useUI } from '@/components/ui-provider';
import { PageHeader } from '@/components/page-header';

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
                await registerBiometric(user.email, user.id);
                await updateUserBiometricStatus(true);
                localStorage.setItem('lemon_biometric_user', user.email);
                showToast("Login sidik jari diaktifkan.", 'success');
            } else {
                await unregisterBiometric(user.id);
                await updateUserBiometricStatus(false);
                localStorage.removeItem('lemon_biometric_user');
                showToast("Login sidik jari dinonaktifkan.", 'info');
            }
        } catch (error) {
            console.error("Biometric operation failed:", error);
            showToast("Operasi biometrik gagal. Coba lagi.", 'error');
            await updateUserBiometricStatus(!enabled);
        }
    };

    const managementItems = [
        { id: 'wallets', name: 'Kelola Dompet', icon: Wallet, page: '/wallets', desc: 'Atur dompet dan pantau saldo' },
        { id: 'categories', name: 'Kelola Kategori', icon: Wrench, page: '/categories', desc: 'Kostumisasi kategori transaksi' },
        { id: 'goals', name: 'Target Keuangan', icon: Target, page: '/goals', desc: 'Pantau progres tabungan kamu' },
        { id: 'reminders', name: 'Pengingat Tagihan', icon: BellRing, page: '/reminders', desc: 'Jangan lewatkan jatuh tempo' },
        { id: 'debts', name: 'Hutang & Piutang', icon: HandCoins, page: '/debts', desc: 'Catat pinjaman dengan rapi' },
        { id: 'assets-liabilities', name: 'Aset & Liabilitas', icon: Landmark, page: '/assets-liabilities', desc: 'Hitung kekayaan bersih kamu' },
    ];
    
    const renderThemeToggle = () => {
        if (!mounted) return <div className="h-10 w-20 bg-muted rounded-full animate-pulse" />;
        return (
            <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50">
                <Button
                    size="sm"
                    variant={theme === 'light' ? 'default' : 'ghost'}
                    onClick={() => setTheme('light')}
                    className={cn("rounded-full h-8 px-3 gap-2 text-xs", theme === 'light' && "shadow-sm")}
                >
                    <Sun className="h-3.5 w-3.5" /> Terang
                </Button>
                <Button
                    size="sm"
                    variant={theme === 'dark' ? 'default' : 'ghost'}
                    onClick={() => setTheme('dark')}
                    className={cn("rounded-full h-8 px-3 gap-2 text-xs", theme === 'dark' && "shadow-sm")}
                >
                    <Moon className="h-3.5 w-3.5" /> Gelap
                </Button>
            </div>
        );
    };
    
    return (
        <div className="flex flex-col h-full bg-muted/30">
            <PageHeader title="Pengaturan" />
            
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                    
                    {/* TOP SECTION: PROFILE & THEME */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-inner rotate-3 hover:rotate-0 transition-transform duration-300">
                                        {userData?.photoURL ? (
                                            <Image src={userData.photoURL} alt="Avatar" width={96} height={96} className="object-cover" />
                                        ) : (
                                            <UserCircle className="w-14 h-14 text-primary" strokeWidth={1} />
                                        )}
                                    </div>
                                    <div className="text-center sm:text-left space-y-1">
                                        <h2 className="text-2xl font-bold tracking-tight">{userData?.displayName || 'Pengguna Lemon'}</h2>
                                        <p className="text-muted-foreground font-medium">{user?.email}</p>
                                        <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Versi Beta</Badge>
                                            <Badge variant="outline" className="text-[10px]">ID: {user?.id.slice(0, 8)}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm flex flex-col justify-center bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tampilan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium">Tema Mode</span>
                                    {renderThemeToggle()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN: SECURITY & TOOLS */}
                        <div className="space-y-6">
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Keamanan</h3>
                                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
                                    <CardContent className="p-0">
                                        {isBiometricSupported ? (
                                            <div className="flex items-center gap-4 p-4">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold">Biometrik</p>
                                                    <p className="text-[11px] text-muted-foreground">Login dengan sidik jari</p>
                                                </div>
                                                <Switch
                                                    checked={userData?.isBiometricEnabled || false}
                                                    onCheckedChange={handleBiometricToggle}
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center">
                                                <p className="text-xs text-muted-foreground italic">Biometrik tidak tersedia di perangkat ini</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Alat Bantu</h3>
                                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden group">
                                    <button 
                                        onClick={() => router.push('/token-calculator')} 
                                        className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors text-left"
                                    >
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                            <Calculator className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-foreground">Kalkulator AI</p>
                                            <p className="text-[11px] text-muted-foreground">Cek penggunaan token</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Card>
                            </section>

                            <section className="pt-4">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl py-6 border border-destructive/20 bg-destructive/5">
                                            <LogOut className="h-5 w-5" />
                                            <span className="font-bold">Keluar dari Akun</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Kamu akan keluar dari Lemon pada perangkat ini. Tenang, data kamu aman di cloud.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-white hover:bg-destructive/90">Iya, Keluar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: DATA MANAGEMENT GRID */}
                        <div className="md:col-span-2 space-y-3">
                            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground px-1">Manajemen Data</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {managementItems.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => router.push(item.page)}
                                        className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group"
                                    >
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <item.icon className="h-6 w-6" strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center py-8 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">Lemon Finance</p>
                        <p className="text-[10px] text-muted-foreground">Versi 2.1.0 (Public Beta) • Terlindungi oleh WebAuthn</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
