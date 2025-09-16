
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
    gradient: 'bg-gradient-to-r from-slate-500 to-slate-700',
    textColor: 'text-white'
};

const brandGradients: Record<string, { gradient: string; textColor: string }> = {
    // E-Wallets
    'gopay': { gradient: 'bg-gradient-to-r from-blue-500 to-blue-700', textColor: 'text-white' },
    'ovo': { gradient: 'bg-gradient-to-r from-purple-500 to-purple-800', textColor: 'text-white' },
    'dana': { gradient: 'bg-gradient-to-r from-sky-400 to-blue-600', textColor: 'text-white' },
    'linkaja': { gradient: 'bg-gradient-to-r from-red-500 to-red-700', textColor: 'text-white' },
    'shopeepay': { gradient: 'bg-gradient-to-r from-orange-500 to-orange-600', textColor: 'text-white' },
    // Banks
    'bca': { gradient: 'bg-gradient-to-r from-blue-700 to-blue-900', textColor: 'text-white' },
    'mandiri': { gradient: 'bg-gradient-to-r from-blue-800 to-yellow-400', textColor: 'text-white' },
    'bni': { gradient: 'bg-gradient-to-r from-orange-500 to-teal-500', textColor: 'text-white' },
    'bri': { gradient: 'bg-gradient-to-r from-blue-600 to-yellow-500', textColor: 'text-white' },
    'cimb niaga': { gradient: 'bg-gradient-to-r from-red-600 to-rose-800', textColor: 'text-white' },
    // Cash
    'tunai': { gradient: 'bg-gradient-to-r from-green-500 to-green-700', textColor: 'text-white' },
    'cash': { gradient: 'bg-gradient-to-r from-green-500 to-green-700', textColor: 'text-white' },
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
      'e-wallet': 'bg-gradient-to-r from-sky-500 to-sky-700',
      'bank': 'bg-gradient-to-r from-emerald-500 to-emerald-700',
      'cash': 'bg-gradient-to-r from-orange-500 to-orange-700',
      'other': 'bg-gradient-to-r from-slate-500 to-slate-700',
    };

    return {
        ...categoryInfo,
        gradient: categoryDefaultGradients[walletCategory] || defaultVisuals.gradient,
        textColor: 'text-white'
    };
};
