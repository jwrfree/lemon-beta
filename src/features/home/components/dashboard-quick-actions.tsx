
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft, HandCoins, Target } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DashboardQuickActions = () => {
    const { 
        setIsTxModalOpen, 
        setIsTransferModalOpen, 
        setIsDebtModalOpen, 
        setIsGoalModalOpen,
        setTransactionToEdit,
        setDebtToEdit,
        setGoalToEdit
    } = useUI();

    return (
        <Card className="border-none shadow-sm bg-card rounded-lg">
            <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-2">
                    <Button 
                        variant="outline" 
                        className="flex flex-col h-auto py-2 px-1 gap-1 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                            setTransactionToEdit(null);
                            setIsTxModalOpen(true);
                        }}
                        title="Transaksi Baru"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Baru</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex flex-col h-auto py-2 px-1 gap-1 border-muted hover:bg-muted"
                        onClick={() => setIsTransferModalOpen(true)}
                        title="Transfer Antar Dompet"
                    >
                        <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">Transfer</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex flex-col h-auto py-2 px-1 gap-1 border-muted hover:bg-muted"
                        onClick={() => {
                            setDebtToEdit(null);
                            setIsDebtModalOpen(true);
                        }}
                        title="Catat Hutang/Piutang"
                    >
                        <HandCoins className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">Hutang</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex flex-col h-auto py-2 px-1 gap-1 border-muted hover:bg-muted"
                        onClick={() => {
                            setGoalToEdit(null);
                            setIsGoalModalOpen(true);
                        }}
                        title="Target Baru"
                    >
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">Target</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
