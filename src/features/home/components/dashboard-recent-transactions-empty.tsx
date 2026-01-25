'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DashboardRecentTransactionsEmpty = () => {
    const { setIsTxModalOpen } = useUI();

    return (
        <Card className="h-full shadow-sm border-border/60">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Transaksi Terakhir</CardTitle>
                </div>
                <CardDescription>Riwayat aktivitas keuanganmu</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center min-h-[300px]">
                <div className="p-4 bg-primary/10 rounded-full mb-4 animate-in zoom-in duration-300">
                    <Receipt className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium mb-1">Belum Ada Transaksi</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mb-6">
                    Data transaksi terbarumu akan muncul di sini setelah kamu mulai mencatat.
                </p>
                <Button onClick={() => setIsTxModalOpen(true)} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Catat Transaksi
                </Button>
            </CardContent>
        </Card>
    );
};