'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/components/app-provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useUI } from '@/components/ui-provider';

export const EditWalletModal = ({ wallet, onClose }: { wallet: any, onClose: () => void }) => {
  const { updateWallet, deleteWallet } = useApp();
  const { showToast } = useUI();
  const [walletName, setWalletName] = useState(wallet.name);
  const [isDefault, setIsDefault] = useState(wallet.isDefault || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) {
      showToast("Nama dompet tidak boleh kosong.", 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateWallet(wallet.id, { name: walletName, isDefault });
    } catch (error) {
      showToast("Gagal memperbarui dompet.", 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
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

  const hasChanges = walletName !== wallet.name || isDefault !== !!wallet.isDefault;

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
          <h2 className="text-xl font-bold">Edit Dompet</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full"><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Nama Dompet</Label>
            <Input
              id="wallet-name"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              required
              disabled={wallet.name === 'Tunai'}
            />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                  <Label htmlFor="is-default">Jadikan Dompet Utama</Label>
                  <p className="text-xs text-muted-foreground">
                      Dompet ini akan otomatis terpilih saat kamu membuat transaksi.
                  </p>
              </div>
              <Switch
                id="is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
          </div>
          
          <p className="text-xs text-muted-foreground">Kategori dompet dan saldo awal tidak dapat diubah.</p>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="icon" disabled={isDeleting}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Yakin mau menghapus dompet ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Dompet hanya bisa dihapus jika tidak memiliki riwayat transaksi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
