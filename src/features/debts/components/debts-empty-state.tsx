'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandCoins, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DebtsEmptyState = () => {
    const { setIsDebtModalOpen, setDebtToEdit } = useUI();

    return (
        <Card className="shadow-sm border-border/60 border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 animate-in zoom-in duration-300">
                    <HandCoins className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium mb-1">Belum Ada Catatan Hutang</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
                    Kelola hutang dan piutangmu dengan rapi. Catat siapa yang berhutang padamu dan sebaliknya.
                </p>
                <Button 
                    onClick={() => {
                        setDebtToEdit(null);
                        setIsDebtModalOpen(true);
                    }} 
                    size="sm" 
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Catat Baru
                </Button>
            </CardContent>
        </Card>
    );
};