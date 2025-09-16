
import { Wallet, Banknote, Landmark } from 'lucide-react';

export const walletVisuals: Record<string, { name: string; Icon: React.ElementType; color: string }> = {
  wallet: { name: 'Dompet', Icon: Wallet, color: 'bg-indigo-500' },
  bank: { name: 'Bank', Icon: Banknote, color: 'bg-teal-500' },
  landmark: { name: 'Lainnya', Icon: Landmark, color: 'bg-orange-500' },
};
export const getWalletVisuals = (key: string) => walletVisuals[key] || walletVisuals.wallet;
