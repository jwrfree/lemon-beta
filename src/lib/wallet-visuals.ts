
'use client';
import { Wallet, Banknote, Landmark, Smartphone, CircleDollarSign } from 'lucide-react';

interface Gradient {
    from: string;
    to: string;
}

interface WalletVisuals {
  name: string;
  Icon: React.ElementType;
  gradient: Gradient;
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
    gradient: { from: '#64748b', to: '#334155' }, // slate-500 to slate-700
    textColor: 'text-white'
};

const brandGradients: Record<string, { gradient: Gradient; textColor: string }> = {
    // E-Wallets
    'gopay': { gradient: { from: '#3b82f6', to: '#1d4ed8' }, textColor: 'text-white' }, // blue-500 to blue-700
    'ovo': { gradient: { from: '#8b5cf6', to: '#5b21b6' }, textColor: 'text-white' }, // purple-500 to purple-800
    'dana': { gradient: { from: '#38bdf8', to: '#2563eb' }, textColor: 'text-white' }, // sky-400 to blue-600
    'linkaja': { gradient: { from: '#ef4444', to: '#b91c1c' }, textColor: 'text-white' }, // red-500 to red-700
    'shopeepay': { gradient: { from: '#f97316', to: '#ea580c' }, textColor: 'text-white' }, // orange-500 to orange-600
    // Banks
    'bca': { gradient: { from: '#1e40af', to: '#1e3a8a' }, textColor: 'text-white' }, // blue-800 to blue-900
    'mandiri': { gradient: { from: '#1e3a8a', to: '#facc15' }, textColor: 'text-white' }, // blue-900 to yellow-400
    'bni': { gradient: { from: '#f97316', to: '#14b8a6' }, textColor: 'text-white' }, // orange-500 to teal-500
    'bri': { gradient: { from: '#2563eb', to: '#f59e0b' }, textColor: 'text-white' }, // blue-600 to yellow-500
    'cimb niaga': { gradient: { from: '#dc2626', to: '#881337' }, textColor: 'text-white' }, // red-600 to rose-800
    // Cash
    'tunai': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' }, // green-500 to green-700
    'cash': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' }, // green-500 to green-700
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
    const categoryDefaultGradients: Record<string, Gradient> = {
      'e-wallet': { from: '#0ea5e9', to: '#0369a1' }, // sky-500 to sky-700
      'bank': { from: '#10b981', to: '#047857' }, // emerald-500 to emerald-700
      'cash': { from: '#f97316', to: '#c2410c' }, // orange-500 to orange-700
      'other': { from: '#64748b', to: '#334155' }, // slate-500 to slate-700
    };

    return {
        ...categoryInfo,
        gradient: categoryDefaultGradients[walletCategory] || defaultVisuals.gradient,
        textColor: 'text-white'
    };
};
