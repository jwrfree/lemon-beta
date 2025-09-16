
import { Wallet, Banknote, Landmark, Smartphone, CircleDollarSign } from 'lucide-react';

export const walletVisuals: Record<string, { name: string; Icon: React.ElementType; color: string }> = {
  'e-wallet': { name: 'E-Wallet', Icon: Smartphone, color: 'bg-sky-500' },
  'bank': { name: 'Bank', Icon: Landmark, color: 'bg-emerald-500' },
  'cash': { name: 'Tunai', Icon: Wallet, color: 'bg-orange-500' },
  'other': { name: 'Lainnya', Icon: CircleDollarSign, color: 'bg-slate-500' },
};

export const getWalletVisuals = (key: string) => walletVisuals[key] || walletVisuals.other;
