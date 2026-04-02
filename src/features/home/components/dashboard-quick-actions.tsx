
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowsLeftRight, HandCoins, Plus, Sparkle, Target } from '@phosphor-icons/react';
import { useUI } from '@/components/ui-provider';

export const DashboardQuickActions = () => {
    const { 
        setIsTransferModalOpen, 
        setIsDebtModalOpen, 
        setIsGoalModalOpen,
        setDebtToEdit,
        setGoalToEdit,
        openTransactionSheet
    } = useUI();

    return (
        <Card className="rounded-card bg-card/98 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
            <CardContent className="p-3">
                <div className="grid grid-cols-5 gap-2">
                    <Button 
                        variant="outline" 
                        className="flex h-auto flex-col gap-1 bg-primary/10 px-1 py-2 text-primary shadow-[0_10px_20px_-18px_rgba(13,148,136,0.2)] hover:bg-primary/20 hover:text-primary"
                        onClick={() => openTransactionSheet()}
                        title="Smart Add (AI)"
                    >
                        <Sparkle size={20} weight="regular" />
                        <span className="text-xs font-medium">Smart</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex h-auto flex-col gap-1 bg-primary/6 px-1 py-2 shadow-[0_10px_20px_-18px_rgba(13,148,136,0.14)] hover:bg-primary/10 hover:text-primary"
                        onClick={() => openTransactionSheet()}
                        title="Transaksi Baru"
                    >
                        <Plus size={20} weight="regular" />
                        <span className="text-xs font-medium">Baru</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex h-auto flex-col gap-1 bg-muted/45 px-1 py-2 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.12)] hover:bg-muted"
                        onClick={() => setIsTransferModalOpen(true)}
                        title="Transfer Antar Dompet"
                    >
                        <ArrowsLeftRight size={20} weight="regular" className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Transfer</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex h-auto flex-col gap-1 bg-muted/45 px-1 py-2 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.12)] hover:bg-muted"
                        onClick={() => {
                            setDebtToEdit(null);
                            setIsDebtModalOpen(true);
                        }}
                        title="Catat Hutang/Piutang"
                    >
                        <HandCoins size={20} weight="regular" className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Hutang</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex h-auto flex-col gap-1 bg-muted/45 px-1 py-2 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.12)] hover:bg-muted"
                        onClick={() => {
                            setGoalToEdit(null);
                            setIsGoalModalOpen(true);
                        }}
                        title="Target Baru"
                    >
                        <Target size={20} weight="regular" className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Target</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

