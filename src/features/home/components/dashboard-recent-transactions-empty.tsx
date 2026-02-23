'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Plus, Sparkles } from 'lucide-react';
import { useUI } from '@/components/ui-provider';
import { cn } from '@/lib/utils';

export const DashboardRecentTransactionsEmpty = () => {
    const { setIsTxModalOpen } = useUI();

    return (
        <Card className="h-full border-border rounded-lg bg-card shadow-card overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-foreground">
                <Receipt className="h-32 w-32 -rotate-12" />
            </div>
            
            <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium tracking-tight">Transaksi Terakhir</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium text-muted-foreground/70">Pantau setiap aliran keuanganmu</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-12 text-center min-h-[350px] relative z-10">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-50" />
                    <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/10 shadow-inner">
                        <Receipt className="h-10 w-10 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-background rounded-full border border-border shadow-sm">
                        <Plus className="h-4 w-4 text-primary" />
                    </div>
                </div>

                <h3 className="text-lg font-medium tracking-tight mb-2">Mulai Perjalanan Finansialmu</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mb-8 leading-relaxed">
                    Setiap rupiah berarti. Catat transaksi pertamamu untuk mulai mendapatkan insight cerdas dari Lemon.
                </p>

                <Button 
                    onClick={() => setIsTxModalOpen(true)} 
                    size="lg" 
                    className="gap-2 rounded-lg px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Catat Sekarang
                </Button>
                
                <div className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary/40">
                    <Sparkles className="h-3 w-3" />
                    <span>Didukung AI Lemon</span>
                </div>
            </CardContent>
        </Card>
    );
};
