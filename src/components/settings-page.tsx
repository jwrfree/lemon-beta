
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Wallet, Wrench, Target, Landmark, LogOut, ChevronRight, UserCircle, Bell, Shield, Moon, Sun } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


export const SettingsPage = () => {
    const router = useRouter();
    const { user, handleSignOut } = useApp();
    const { theme, setTheme } = useTheme();

    const managementItems = [
        { id: 'wallets', name: 'Kelola Dompet', icon: Wallet, page: '/wallets' },
        { id: 'categories', name: 'Kelola Kategori', icon: Wrench, page: '/categories' },
        { id: 'goals', name: 'Target Keuangan', icon: Target, page: '/goals' },
        { id: 'assets_liabilities', name: 'Aset & Liabilitas', icon: Landmark, page: '/assets-liabilities' },
    ];
    
    const preferenceItems = [
        { id: 'notifications', name: 'Notifikasi', icon: Bell, page: '/notifications' },
        { id: 'theme', name: 'Tema Aplikasi', icon: Moon, page: '#' },
        { id: 'security', name: 'Keamanan', icon: Shield, page: '#' },
    ];

    return (
        <div className="flex flex-col bg-muted overflow-y-auto">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-10">
                <h1 className="text-xl font-bold text-center w-full">Pengaturan</h1>
            </header>
            <main className="flex-1 p-4 space-y-6 pb-20">
                
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
                <Card className="p-2 bg-background">
                    <div className="w-full flex items-center gap-4 p-3 rounded-lg text-left">
                        <Moon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                        <span className="font-medium flex-1">Tema Aplikasi</span>
                        <div className="flex items-center gap-1 p-1 rounded-full bg-muted">
                            <Button
                                size="sm"
                                variant={theme === 'light' ? 'default' : 'ghost'}
                                onClick={() => setTheme('light')}
                                className={cn("rounded-full flex-1 px-3", theme === 'light' && 'bg-background shadow-sm')}
                            >
                                <Sun className="h-4 w-4 mr-1" /> Terang
                            </Button>
                            <Button
                                size="sm"
                                variant={theme === 'dark' ? 'default' : 'ghost'}
                                onClick={() => setTheme('dark')}
                                className={cn("rounded-full flex-1 px-3", theme === 'dark' && 'bg-background shadow-sm')}
                            >
                                <Moon className="h-4 w-4 mr-1" /> Gelap
                            </Button>
                        </div>
                    </div>
                    <Separator />
                    <button onClick={() => router.push('/notifications')} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left">
                        <Bell className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                        <span className="font-medium flex-1">Notifikasi</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <Separator />
                    <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left" disabled>
                        <Shield className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                        <span className="font-medium flex-1">Keamanan</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                </Card>

                {/* Management Card */}
                <Card className="p-2 bg-background">
                    {managementItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <button onClick={() => router.push(item.page)} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left">
                                <item.icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5}/>
                                <span className="font-medium flex-1">{item.name}</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </button>
                             {index < managementItems.length - 1 && <Separator />}
                        </React.Fragment>
                    ))}
                </Card>
                
                 {/* Logout Button */}
                 <Card className="p-2 bg-background">
                    <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-destructive/10 text-left text-destructive">
                        <LogOut className="h-6 w-6" strokeWidth={1.5}/>
                        <span className="font-medium flex-1">Keluar</span>
                    </button>
                </Card>
                
                 <p className="text-xs text-muted-foreground text-center">Lemon App v1.2.0</p>
            </main>
        </div>
    );
};
