'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActions } from '@/providers/action-provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useUI } from '@/components/ui-provider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { walletSchema, WalletFormValues } from '../schemas/wallet-schema';
import { cn } from '@/lib/utils';
import type { Wallet as WalletType } from '@/types/models';
import { z } from 'zod';

// ...

export const EditWalletModal = ({ wallet, onClose }: { wallet: WalletType, onClose: () => void }) => {
  const { reconcileWallet, updateWallet, deleteWallet } = useActions();
  const { showToast } = useUI();
  const [correctionValue, setCorrectionValue] = useState('');

  const form = useForm<z.input<typeof walletSchema>>({
    resolver: zodResolver(walletSchema) as any,
    defaultValues: {
      name: wallet.name,
      balance: wallet.balance.toString(), // Balance can't be edited but schema needs it
      icon: wallet.icon || 'other',
      isDefault: wallet.isDefault || false,
    }
  });

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = form;
  const [isDeleting, setIsDeleting] = useState(false);

  const onSubmit = async (data: z.input<typeof walletSchema>) => {
    const values = data as unknown as WalletFormValues;
    try {
      await updateWallet(wallet.id, { name: values.name, isDefault: values.isDefault });
    } catch (error) {
      showToast("Gagal memperbarui dompet.", 'error');
      console.error(error);
    }
  };

  const handleReconcile = async () => {
    if (!correctionValue) return;
    const targetBalance = parseInt(correctionValue.replace(/[^0-9]/g, ''));
    if (isNaN(targetBalance)) return;

    try {
      await reconcileWallet(wallet.id, wallet.balance, targetBalance);
      onClose();
    } catch (error) {
      showToast('Gagal mengoreksi saldo. Coba lagi.', 'error');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWallet(wallet.id);
    } catch (error) {
      showToast("Gagal menghapus dompet.", 'error');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentName = watch('name');
  const currentIsDefault = watch('isDefault');
  const hasChanges = currentName !== wallet.name || currentIsDefault !== !!wallet.isDefault;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl">
          <h2 className="text-xl font-medium">Edit Dompet</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full"><X className="h-5 w-5" /></Button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-name" className={cn(errors.name && "text-destructive")}>Nama Dompet</Label>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="wallet-name"
                    disabled={wallet.name === 'Tunai'}
                    className={cn(errors.name && "border-destructive")}
                  />
                )}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is-default">Jadikan Dompet Utama</Label>
                <p className="text-xs text-muted-foreground">
                  Dompet ini akan otomatis terpilih saat kamu membuat transaksi.
                </p>
              </div>
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <Switch
                    id="is-default"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground">Kategori dompet dan saldo awal tidak dapat diubah.</p>

            <Button type="submit" className="w-full" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </form>

          {/* BALANCE CORRECTION SECTION */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-primary">Koreksi Saldo</Label>
              <p className="text-xs text-muted-foreground leading-normal">
                Gunakan ini jika saldo di aplikasi berbeda dengan saldo asli. Lemon akan membuat transaksi penyesuaian otomatis.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Saldo yang benar..."
                  value={correctionValue}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    setCorrectionValue(rawValue ? new Intl.NumberFormat('id-ID').format(parseInt(rawValue)) : '');
                  }}
                  className="bg-muted/50 border-none h-11"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={!correctionValue || isSubmitting}
                onClick={handleReconcile}
                className="h-11 px-6 font-medium"
              >
                Koreksi
              </Button>
            </div>
          </div>

          {/* DANGER AREA */}
          <div className="pt-2">
            {wallet.name !== 'Tunai' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="ghost" className="w-full text-destructive hover:bg-destructive/10" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Hapus Dompet
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] rounded-card md:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yakin mau menghapus dompet?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Dompet hanya bisa dihapus jika <strong>tidak memiliki riwayat transaksi</strong> dan tidak terpaku pada pembayaran hutang.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row gap-2 pt-2">
                    <AlertDialogCancel className="flex-1 mt-0 rounded-md">Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 bg-destructive hover:bg-destructive/90 rounded-md"
                    >
                      {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

