'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/providers/app-provider';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/user-avatar';
import { Loader2, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
    const { userData } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setPhotoURL(userData.photoURL || '');
        }
    }, [userData]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // TODO: Implementasi update profile sesungguhnya
            // await updateProfile({ displayName, photoURL });
            
            console.log('Updating profile:', { displayName, photoURL });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi delay
            
            // Jika menggunakan toast:
            // toast({ title: "Profil diperbarui", description: "Perubahan berhasil disimpan." });
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader 
                title="Profil Saya" 
                description="Kelola informasi pribadi dan akunmu"
            />
            
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>
                                Foto profil dan nama tampilan yang akan dilihat pengguna lain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                                <div className="relative group">
                                    <UserAvatar 
                                        name={displayName || userData.displayName} 
                                        src={photoURL || userData.photoURL} 
                                        className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-sm" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 flex-1 w-full">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Nama Tampilan</Label>
                                        <Input 
                                            id="displayName" 
                                            value={displayName} 
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Nama Lengkap"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="photoURL">URL Foto Profil</Label>
                                        <Input 
                                            id="photoURL" 
                                            value={photoURL} 
                                            onChange={(e) => setPhotoURL(e.target.value)}
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Masukkan URL gambar langsung (JPG/PNG).
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input value={userData.email || ''} disabled className="bg-muted" />
                                <p className="text-[10px] text-muted-foreground">
                                    Email tidak dapat diubah. Hubungi dukungan jika perlu bantuan.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/10 px-6 py-4 flex justify-end">
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}