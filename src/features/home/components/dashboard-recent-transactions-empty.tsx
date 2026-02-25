'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DashboardRecentTransactionsEmpty = () => {
    const { setIsTxModalOpen } = useUI();

    return (
        <Card className="h-full border-border rounded-card bg-card shadow-card overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                <Receipt className="h-32 w-32" />
            </div>
            
            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xl font-medium tracking-tight">Transaksi Terakhir</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/70">Pantau setiap aliran keuanganmu</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-12 text-center min-h-[350px] relative z-10">
                <div className="p-6 bg-primary/10 rounded-lg mb-8">
                    <Receipt className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-medium tracking-tight mb-2">Catat Transaksi Pertama</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mb-8 leading-relaxed">
                    Mulai kelola keuangan dengan mencatat pengeluaran dan pemasukan hari ini.
                </p>

                <Button 
                    onClick={() => setIsTxModalOpen(true)} 
                    size="lg" 
                    className="gap-2 rounded-lg px-8 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Catat Sekarang
                </Button>
            </CardContent>
        </Card>
    );
};
