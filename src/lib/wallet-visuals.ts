
'use client';
import { Wallet, Landmark, Smartphone, CircleDollarSign, TrendingUp, Home, Building } from 'lucide-react';

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

const itemCategories: Record<string, Omit<WalletVisuals, 'gradient' | 'textColor'>> = {
  // Wallets
  'e-wallet': { name: 'E-Wallet', Icon: Smartphone },
  'bank': { name: 'Bank', Icon: Landmark },
  'cash': { name: 'Tunai', Icon: Wallet },
  // Assets
  'investment': { name: 'Investasi', Icon: TrendingUp },
  'property': { name: 'Properti', Icon: Home },
  // Liabilities & Paylater
  'loan': { name: 'Pinjaman', Icon: Building },
  'credit-card': { name: 'Kartu Kredit', Icon: Smartphone },
  'paylater': { name: 'Paylater', Icon: Smartphone },
  // Default / Other
  'other': { name: 'Lainnya', Icon: CircleDollarSign },
};

const defaultVisuals: WalletVisuals = {
    name: 'Lainnya',
    Icon: CircleDollarSign,
    gradient: { from: '#4338ca', to: '#312e81' }, // indigo-700 to indigo-900
    textColor: 'text-white'
};

const brandGradients: Record<string, { gradient: Gradient; textColor: string }> = {
    // E-Wallets
    'gopay': { gradient: { from: '#06b6d4', to: '#0284c7' }, textColor: 'text-white' },
    'ovo': { gradient: { from: '#8b5cf6', to: '#5b21b6' }, textColor: 'text-white' },
    'dana': { gradient: { from: '#38bdf8', to: '#2563eb' }, textColor: 'text-white' },
    'linkaja': { gradient: { from: '#ef4444', to: '#b91c1c' }, textColor: 'text-white' },
    'shopeepay': { gradient: { from: '#f97316', to: '#ea580c' }, textColor: 'text-white' },
    'paypal': { gradient: { from: '#0ea5e9', to: '#0284c7' }, textColor: 'text-white' },
    
    // Banks
    'bca': { gradient: { from: '#1e40af', to: '#1e3a8a' }, textColor: 'text-white' },
    'mandiri': { gradient: { from: '#1e3a8a', to: '#facc15' }, textColor: 'text-white' },
    'bni': { gradient: { from: '#f97316', to: '#14b8a6' }, textColor: 'text-white' },
    'bri': { gradient: { from: '#1d4ed8', to: '#3b82f6' }, textColor: 'text-white' },
    'cimb niaga': { gradient: { from: '#dc2626', to: '#881337' }, textColor: 'text-white' },
    'bsi': { gradient: { from: '#047857', to: '#fbbf24' }, textColor: 'text-white' }, // Green & Gold
    'bank syariah indonesia': { gradient: { from: '#047857', to: '#fbbf24' }, textColor: 'text-white' },
    
    // Digital Banks
    'bank neo': { gradient: { from: '#f97316', to: '#f59e0b' }, textColor: 'text-white' },
    'seabank': { gradient: { from: '#f97316', to: '#ea580c' }, textColor: 'text-white' },
    'superbank': { gradient: { from: '#a3e635', to: '#4d7c0f' }, textColor: 'text-white' },
    'blu': { gradient: { from: '#38bdf8', to: '#3b82f6' }, textColor: 'text-white' },
    'blu by bca': { gradient: { from: '#38bdf8', to: '#3b82f6' }, textColor: 'text-white' },
    'jenius': { gradient: { from: '#38bdf8', to: '#0284c7' }, textColor: 'text-white' },
    'jago': { gradient: { from: '#f97316', to: '#f59e0b' }, textColor: 'text-white' },
    'bank jago': { gradient: { from: '#f97316', to: '#f59e0b' }, textColor: 'text-white' },

    // Paylater
    'spaylater': { gradient: { from: '#f97316', to: '#fb923c' }, textColor: 'text-white' },
    'gopaylater': { gradient: { from: '#06b6d4', to: '#22d3ee' }, textColor: 'text-white' },
    'kredivo': { gradient: { from: '#facc15', to: '#eab308' }, textColor: 'text-white' },
    'akulaku': { gradient: { from: '#ef4444', to: '#f87171' }, textColor: 'text-white' },

    // Investment
    'bibit': { gradient: { from: '#16a34a', to: '#22c55e' }, textColor: 'text-white' },
    'ajaib': { gradient: { from: '#4f46e5', to: '#8b5cf6' }, textColor: 'text-white' },
    'pluang': { gradient: { from: '#fbbf24', to: '#d97706' }, textColor: 'text-white' },

    // Cash
    'tunai': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' },
    'cash': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' },
};


export const getWalletVisuals = (itemName: string, itemCategoryKey?: string): WalletVisuals => {
    const normalizedName = itemName.toLowerCase();
    const brand = brandGradients[normalizedName];

    const categoryInfo = (itemCategoryKey && itemCategories[itemCategoryKey]) ? itemCategories[itemCategoryKey] : itemCategories.other;

    if (brand) {
        return {
            ...categoryInfo,
            ...brand
        };
    }
    
    const categoryDefaultGradients: Record<string, Gradient> = {
      // Wallets
      'e-wallet': { from: '#0ea5e9', to: '#0369a1' }, // sky-500 to sky-700
      'bank': { from: '#10b981', to: '#047857' }, // emerald-500 to emerald-700
      'cash': { from: '#f97316', to: '#c2410c' }, // orange-500 to orange-700
      // Assets
      'investment': { from: '#10b981', to: '#047857' }, // emerald
      'property': { from: '#2563eb', to: '#1e3a8a' }, // blue
      // Liabilities
      'loan': { from: '#ef4444', to: '#991b1b' }, // red
      'credit-card': { from: '#f97316', to: '#9a3412' }, // orange
      // Default
      'other': { from: '#4338ca', to: '#312e81' }, // indigo-700 to indigo-900
    };

    return {
        ...categoryInfo,
        gradient: (itemCategoryKey && categoryDefaultGradients[itemCategoryKey]) || defaultVisuals.gradient,
        textColor: 'text-white'
    };
};
