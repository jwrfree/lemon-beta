
'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigation, Button } from '@/app/page';

export const AddTransactionForm = () => {
    const { back } = useNavigation();
    return (
        <div className="flex flex-col h-full">
            <header className="h-16 flex items-center relative px-4 shrink-0">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => useData().router.push('home')}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Tambah Transaksi</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 pb-24 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-muted-foreground text-center p-8">Formulir akan muncul di sini.</p>
                </div>
            </div>
            <div className="bg-background/80 backdrop-blur-lg p-4 border-t shrink-0 fixed bottom-0 w-full max-w-md mx-auto">
                <Button size="lg" className="w-full">
                    Simpan Transaksi
                </Button>
            </div>
        </div>
    );
};

    