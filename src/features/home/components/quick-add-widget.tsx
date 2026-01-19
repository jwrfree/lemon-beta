import React from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PlusCircle } from 'lucide-react';

export const QuickAddWidget = () => {
    const { setIsTxModalOpen } = useUI();
    const router = useRouter();

    return (
        <Card className="border-none shadow-sm bg-gradient-to-br from-card to-secondary/10">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Catat Cepat
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Catat pengeluaranmu sekarang. Gunakan AI untuk kemudahan atau input manual.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => setIsTxModalOpen(true)}
                        className="w-full active:scale-95 transition-transform"
                        variant="default"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Manual
                    </Button>
                    <Button
                        onClick={() => router.push('/add-smart')}
                        variant="secondary"
                        className="w-full active:scale-95 transition-transform bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Pakai AI
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
