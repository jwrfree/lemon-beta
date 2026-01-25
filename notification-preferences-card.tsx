'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Smartphone, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationPreferencesCard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        email_enabled: true,
        push_enabled: true
    });
    
    // Inisialisasi client Supabase
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('notification_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setPreferences({
                        email_enabled: data.email_enabled,
                        push_enabled: data.push_enabled
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, [supabase]);

    const handleToggle = async (key: 'email_enabled' | 'push_enabled', value: boolean) => {
        // Optimistic UI update
        setPreferences(prev => ({ ...prev, [key]: value }));
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notification_settings')
                .upsert({ 
                    user_id: user.id,
                    [key]: value,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating settings:', error);
            // Revert jika gagal (opsional)
            setPreferences(prev => ({ ...prev, [key]: !value }));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="shadow-sm border-border/60 h-[180px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Preferensi Notifikasi</CardTitle>
                <CardDescription>Pilih bagaimana kamu ingin menerima update.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notif" className="text-sm font-medium">Email</Label>
                            <p className="text-xs text-muted-foreground">Terima ringkasan mingguan dan tagihan.</p>
                        </div>
                    </div>
                    <Switch 
                        id="email-notif" 
                        checked={preferences.email_enabled}
                        onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
                    />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <Label htmlFor="push-notif" className="text-sm font-medium">Push Notification</Label>
                            <p className="text-xs text-muted-foreground">Pengingat harian langsung di perangkatmu.</p>
                        </div>
                    </div>
                    <Switch 
                        id="push-notif" 
                        checked={preferences.push_enabled}
                        onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
                    />
                </div>

                <div className="pt-2 flex justify-end">
                    <span className={cn("text-xs text-muted-foreground flex items-center gap-1 transition-opacity duration-300", isSaving ? "opacity-100" : "opacity-0")}>
                        <Save className="h-3 w-3" /> Menyimpan...
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};