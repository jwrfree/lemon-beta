
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/auth-provider';
import { UserAvatar } from '@/components/user-avatar';
import { Camera, CircleNotch, FloppyDisk, X } from '@/lib/icons';
import { triggerHaptic } from '@/lib/utils';
import { uploadAvatar } from '@/lib/supabase/storage';
import { motion, AnimatePresence } from 'framer-motion';

const profileSchema = z.object({
    displayName: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama terlalu panjang"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileSheet = ({ isOpen, onClose }: EditProfileSheetProps) => {
    const { userData, updateProfile, user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: userData?.displayName || '',
        }
    });

    // Reset form when sheet opens
    useEffect(() => {
        if (isOpen && userData) {
            form.reset({ displayName: userData.displayName || '' });
            setPreviewUrl(userData.photoURL || null);
            setSelectedFile(null);
        }
    }, [isOpen, userData, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            triggerHaptic('light');
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const onSubmit = async (values: ProfileFormValues) => {
        if (!user) return;

        setIsSubmitting(true);
        triggerHaptic('medium');

        try {
            let finalPhotoURL = userData?.photoURL;

            // 1. Upload if file selected
            if (selectedFile) {
                finalPhotoURL = await uploadAvatar(user.id, selectedFile);
            }

            // 2. Update profile
            await updateProfile({
                displayName: values.displayName,
                photoURL: finalPhotoURL
            });

            onClose();
        } catch (error) {
            console.error("Update profile failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="bottom"
                className="rounded-t-[32px] bg-background p-0 sm:max-w-lg mx-auto border-none shadow-2xl overflow-hidden"
            >
                {/* Handle Bar for Native Feel */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1.5 w-12 rounded-full bg-muted" />
                </div>

                <SheetHeader className="px-6 pt-4 pb-0 text-left">
                    <SheetTitle className="text-2xl font-semibold tracking-tighter">Edit Profil</SheetTitle>
                    <SheetDescription className="text-label font-semibold uppercase tracking-widest text-muted-foreground/40">Sesuaikan identitas digital kamu</SheetDescription>
                </SheetHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-8 space-y-8">
                    {/* AVATAR EDITOR */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UserAvatar
                                    name={form.watch('displayName')}
                                    src={previewUrl}
                                    className="h-28 w-28 border-4 border-background shadow-xl"
                                />
                                <div className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center border-4 border-background shadow-lg">
                                    <Camera size={18} weight="bold" />
                                </div>
                            </motion.div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground/30">Ketuk untuk ubah foto</p>
                    </div>

                    {/* FORM FIELDS */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="displayName" className="text-label font-semibold uppercase tracking-widest text-muted-foreground/60 ml-1">Nama Tampilan</Label>
                            <Input
                                id="displayName"
                                {...form.register('displayName')}
                                placeholder="Masukkan nama kamu"
                                className="h-14 rounded-2xl bg-muted/40 border-none px-5 text-base font-semibold tracking-tight focus:ring-accent"
                            />
                            {form.formState.errors.displayName && (
                                <p className="text-label font-semibold text-destructive ml-1 uppercase tracking-wider">{form.formState.errors.displayName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 opacity-50 select-none">
                            <Label className="text-label font-semibold uppercase tracking-widest text-muted-foreground/60 ml-1">E-mail (Teridentifikasi)</Label>
                            <div className="h-14 rounded-2xl bg-muted/20 border border-dashed border-border/40 px-5 flex items-center text-sm font-semibold text-muted-foreground">
                                {user?.email}
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-4 pb-8 sm:pb-4 flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-14 w-full rounded-2xl bg-foreground text-background font-semibold text-base tracking-tight hover:bg-foreground/90 transition-all active:scale-95 shadow-xl"
                        >
                            {isSubmitting ? <CircleNotch size={24} weight="bold" className="animate-spin" /> : 'Simpan Perubahan'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-12 w-full rounded-xl text-muted-foreground font-semibold text-xs uppercase tracking-widest"
                        >
                            Batalkan
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};

