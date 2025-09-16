
'use client';
import { Wallet, Banknote, Landmark, Smartphone, CircleDollarSign } from 'lucide-react';

interface WalletVisuals {
  name: string;
  Icon: React.ElementType;
  gradient: string;
  textColor: string;
}

const walletCategories: Record<string, Omit<WalletVisuals, 'gradient' | 'textColor'>> = {
  'e-wallet': { name: 'E-Wallet', Icon: Smartphone },
  'bank': { name: 'Bank', Icon: Landmark },
  'cash': { name: 'Tunai', Icon: Wallet },
  'other': { name: 'Lainnya', Icon: CircleDollarSign },
};

const defaultVisuals: WalletVisuals = {
    name: 'Lainnya',
    Icon: CircleDollarSign,
    gradient: 'from-slate-500 to-slate-700',
    textColor: 'text-white'
};

const brandGradients: Record<string, { gradient: string; textColor: string }> = {
    // E-Wallets
    'gopay': { gradient: 'from-blue-500 to-blue-700', textColor: 'text-white' },
    'ovo': { gradient: 'from-purple-500 to-purple-800', textColor: 'text-white' },
    'dana': { gradient: 'from-sky-400 to-blue-600', textColor: 'text-white' },
    'linkaja': { gradient: 'from-red-500 to-red-700', textColor: 'text-white' },
    'shopeepay': { gradient: 'from-orange-500 to-orange-600', textColor: 'text-white' },
    // Banks
    'bca': { gradient: 'from-blue-700 to-blue-900', textColor: 'text-white' },
    'mandiri': { gradient: 'from-blue-800 to-yellow-400', textColor: 'text-white' },
    'bni': { gradient: 'from-orange-500 to-teal-500', textColor: 'text-white' },
    'bri': { gradient: 'from-blue-600 to-yellow-500', textColor: 'text-white' },
    'cimb niaga': { gradient: 'from-red-600 to-rose-800', textColor: 'text-white' },
    // Cash
    'tunai': { gradient: 'from-green-500 to-green-700', textColor: 'text-white' },
    'cash': { gradient: 'from-green-500 to-green-700', textColor: 'text-white' },
};


export const getWalletVisuals = (walletName: string, walletCategory: string): WalletVisuals => {
    const normalizedName = walletName.toLowerCase();
    const brand = brandGradients[normalizedName];

    const categoryInfo = walletCategories[walletCategory] || walletCategories.other;

    if (brand) {
        return {
            ...categoryInfo,
            ...brand
        };
    }
    
    // Fallback for categories without specific brand matches
    const categoryDefaultGradients: Record<string, string> = {
      'e-wallet': 'from-sky-500 to-sky-700',
      'bank': 'from-emerald-500 to-emerald-700',
      'cash': 'from-orange-500 to-orange-700',
      'other': 'from-slate-500 to-slate-700',
    };

    return {
        ...categoryInfo,
        gradient: categoryDefaultGradients[walletCategory] || defaultVisuals.gradient,
        textColor: 'text-white'
    };
};
