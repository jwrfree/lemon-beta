'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationPermissionCard = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!('Notification' in window)) {
            setIsSupported(false);
            return;
        }
        setPermission(Notification.permission);
    }, []);

    const requestPermission = async () => {
        if (!isSupported) return;
        
        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result === 'granted') {
            new Notification('Notifikasi Aktif', {
                body: 'Terima kasih! Kamu akan menerima pengingat dari Lemon.',
                icon: '/icons/icon-192x192.png'
            });
        }
    };

    if (!isSupported) return null;

    return (
        <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Izin Notifikasi</CardTitle>
                        <CardDescription>Terima pengingat tagihan dan hutang.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium">Status Browser</p>
                        <p className={cn("text-xs", 
                            permission === 'granted' ? "text-emerald-600" : 
                            permission === 'denied' ? "text-destructive" : "text-muted-foreground"
                        )}>
                            {permission === 'granted' && 'Diizinkan'}
                            {permission === 'denied' && 'Ditolak (Cek pengaturan browser)'}
                            {permission === 'default' && 'Belum diminta'}
                        </p>
                    </div>
                    
                    {permission === 'granted' ? (
                        <Button variant="outline" size="sm" disabled className="gap-2 text-emerald-600 border-emerald-200 bg-emerald-50 opacity-100">
                            <Check className="h-3.5 w-3.5" />
                            Aktif
                        </Button>
                    ) : (
                        <Button 
                            onClick={requestPermission} 
                            size="sm"
                            variant={permission === 'denied' ? "secondary" : "default"}
                            disabled={permission === 'denied'}
                        >
                            {permission === 'denied' ? 'Ditolak' : 'Izinkan'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};