'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandCoins, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DebtsEmptyState = () => {
    const { setIsDebtModalOpen, setDebtToEdit } = useUI();

    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-card rounded-[32px] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                <HandCoins className="h-40 w-40" />
            </div>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center relative z-10">
                <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                    <HandCoins className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold tracking-tighter mb-2">Belum Ada Catatan</h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 max-w-[240px] mb-8 uppercase tracking-widest leading-relaxed">
                    Kelola hutang dan piutangmu dengan rapi dalam satu asisten cerdas.
                </p>
                <Button 
                    onClick={() => {
                        setDebtToEdit(null);
                        setIsDebtModalOpen(true);
                    }} 
                    className="gap-2 rounded-full h-12 px-8 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    Catat Sekarang
                </Button>
            </CardContent>
        </Card>
    );
};