'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DashboardGoalsEmpty = () => {
    const { setIsGoalModalOpen } = useUI();

    return (
        <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Target Keuangan</CardTitle>
                <CardDescription>Pantau progres impianmu</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3 animate-in zoom-in duration-300">
                    <Target className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium mb-1">Belum Ada Target</h3>
                <p className="text-xs text-muted-foreground max-w-[220px] mb-4">
                    Tentukan tujuan finansialmu seperti membeli rumah, liburan, atau dana darurat.
                </p>
                <Button onClick={() => setIsGoalModalOpen(true)} size="sm" variant="outline" className="gap-2 h-8 text-xs w-full max-w-[160px]">
                    <Plus className="h-3 w-3" />
                    Buat Target Baru
                </Button>
            </CardContent>
        </Card>
    );
};