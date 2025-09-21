
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wallet, Wrench, Target, Landmark, LogOut, ChevronRight, UserCircle, Bell, Shield, Moon, Sun } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const router = useRouter();
    const { user, handleSignOut, isLoading } = useApp();
    const { theme, setTheme } = useTheme();

    const managementItems = [
        { id: 'wallets', name: 'Kelola Dompet', icon: Wallet, page: '/wallets' },
        { id: 'categories', name: 'Kelola Kategori', icon: Wrench, page: '/categories' },
        { id: 'goals', name: 'Target Keuangan', icon: Target, page: '/goals' },
        { id: 'assets_liabilities', name: 'Aset & Liabilitas', icon: Landmark, page: '/assets-liabilities' },
    ];
    
    if (isLoading) {
        return null;
    }

    return (
        <div className="flex flex-col bg-muted overflow-y-auto">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <h1 className="text-xl font-bold text-center w-full">Pengaturan</h1>
            </header>
            <main className="flex-1 pb-20">
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
                    <div className="rounded-lg bg-background overflow-hidden">
                        <div className="w-full flex items-center gap-4 p-3 text-left">
                            <Moon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                            <span className="font-medium flex-1">Tema Aplikasi</span>
                            <div className="relative flex items-center gap-1 p-1 rounded-full bg-muted">
                                {theme === 'light' && (
                                    <motion.div layoutId="theme-bg" className="absolute inset-0 h-full w-1/2 bg-background rounded-full shadow-sm" />
                                )}
                                 {theme === 'dark' && (
                                    <motion.div layoutId="theme-bg" className="absolute inset-0 h-full w-1/2 left-1/2 bg-background rounded-full shadow-sm" />
                                )}
                                <Button
                                    size="icon"
                                    variant='ghost'
                                    onClick={() => setTheme('light')}
                                    className={cn("rounded-full z-10 h-7 w-7", theme === 'light' ? 'text-primary' : 'text-muted-foreground')}
                                    aria-label="Set theme to light"
                                >
                                    <Sun className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant='ghost'
                                    onClick={() => setTheme('dark')}
                                    className={cn("rounded-full z-10 h-7 w-7", theme === 'dark' ? 'text-primary' : 'text-muted-foreground')}
                                    aria-label="Set theme to dark"
                                >
                                    <Moon className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <Separator className="mx-3 w-auto"/>
                        <button onClick={() => router.push('/notifications')} className="w-full flex items-center gap-4 p-3 hover:bg-accent text-left">
                            <Bell className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                            <span className="font-medium flex-1">Notifikasi</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                        <Separator className="mx-3 w-auto"/>
                        <button className="w-full flex items-center gap-4 p-3 hover:bg-accent text-left" disabled>
                            <Shield className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                            <span className="font-medium flex-1">Keamanan</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Management Card */}
                    <div className="rounded-lg bg-background overflow-hidden">
                        {managementItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <button onClick={() => router.push(item.page)} className="w-full flex items-center gap-4 p-3 hover:bg-accent text-left">
                                    <item.icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                                    <span className="font-medium flex-1">{item.name}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </button>
                                 {index < managementItems.length - 1 && <Separator className="mx-3 w-auto"/>}
                            </React.Fragment>
                        ))}
                    </div>
                    
                     {/* Logout Button */}
                     <div className="rounded-lg bg-background overflow-hidden">
                        <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-3 hover:bg-destructive/10 text-left text-destructive">
                            <LogOut className="h-6 w-6" strokeWidth={1.5}/>
                            <span className="font-medium flex-1">Keluar</span>
                        </button>
                    </div>
                    
                     <p className="text-xs text-muted-foreground text-center !mt-6">Lemon App v1.2.0</p>
                </div>
            </main>
        </div>
    );
};
