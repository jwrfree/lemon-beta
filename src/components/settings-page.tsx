
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wallet, Wrench, Target, Landmark, LogOut } from 'lucide-react';
import { useApp } from '@/components/app-provider';

export const SettingsPage = () => {
    const router = useRouter();
    const { handleSignOut } = useApp();

    const settingsItems = [
        { id: 'wallets', name: 'Kelola Dompet', icon: Wallet, page: '/wallets' },
        { id: 'categories', name: 'Kelola Kategori', icon: Wrench, page: '/categories' },
        { id: 'goals', name: 'Target Keuangan', icon: Target, page: '/goals' },
        { id: 'assets_liabilities', name: 'Aset & Liabilitas', icon: Landmark, page: '/assets-liabilities' },
    ];

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b">
                 <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Pengaturan</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-2 pb-16">
                {settingsItems.map(item => (
                    <button key={item.id} onClick={() => router.push(item.page)} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left">
                        <item.icon className="h-6 w-6 text-muted-foreground" />
                        <span className="font-medium flex-1">{item.name}</span>
                        <ChevronLeft className="h-5 w-5 text-muted-foreground transform rotate-180" />
                    </button>
                ))}
                 <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent text-left text-destructive">
                    <LogOut className="h-6 w-6" />
                    <span className="font-medium flex-1">Keluar</span>
                </button>
            </main>
        </div>
    );
};
