import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface PlaceholderContentProps {
    label: string;
    icon: React.ElementType;
    text?: string;
}

export const PlaceholderContent = ({
    label,
    icon: Icon,
    text,
}: PlaceholderContentProps) => (
    <Card className="border-dashed border-border bg-muted">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-medium">{label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {text ||
                        `Data untuk analisis ${label.toLowerCase()} akan muncul di sini setelah Anda mencatat transaksi.`}
                </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Catat transaksi pertama kamu untuk membuka insight.</span>
            </div>
        </CardContent>
    </Card>
);
