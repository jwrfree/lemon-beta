
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
    logo?: string;
}

const itemCategories: Record<string, Omit<WalletVisuals, 'gradient' | 'textColor' | 'logo'>> = {
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

const brandGradients: Record<string, { gradient: Gradient; textColor: string; logo?: string }> = {
    // E-Wallets
    'gopay': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/gopay.co.id' },
    'ovo': { gradient: { from: '#4C3494', to: '#322261' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/ovo.id' },
    'dana': { gradient: { from: '#118EE9', to: '#0B5E9A' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/dana.id' },
    'linkaja': { gradient: { from: '#ED1C24', to: '#991217' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/linkaja.id' },
    'shopeepay': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/shopee.co.id' },
    'paypal': { gradient: { from: '#003087', to: '#001C64' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/paypal.com' },

    // Banks (with & without "Bank" prefix)
    'bca': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bca.co.id' },
    'bank bca': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bca.co.id' },
    'mandiri': { gradient: { from: '#003D79', to: '#00284F' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bankmandiri.co.id' },
    'bank mandiri': { gradient: { from: '#003D79', to: '#00284F' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bankmandiri.co.id' },
    'bni': { gradient: { from: '#F15A23', to: '#A33B15' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bni.co.id' },
    'bank bni': { gradient: { from: '#F15A23', to: '#A33B15' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bni.co.id' },
    'bri': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bri.co.id' },
    'bank bri': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bri.co.id' },
    'cimb niaga': { gradient: { from: '#7B1216', to: '#4A0B0D' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/cimbniaga.co.id' },
    'bsi': { gradient: { from: '#00A499', to: '#007068' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bankbsi.co.id' },
    'bank syariah indonesia': { gradient: { from: '#00A499', to: '#007068' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bankbsi.co.id' },

    // Digital Banks & Aliases
    'neobank': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: 'https://logo.clearbit.com/bankneo.co.id' },
    'bank neo': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: 'https://logo.clearbit.com/bankneo.co.id' },
    'seabank': { gradient: { from: '#FF5400', to: '#A83700' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/seabank.co.id' },
    'superbank': { gradient: { from: '#CCFF00', to: '#8AB300' }, textColor: 'text-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Superbank_Logo.svg/1200px-Superbank_Logo.svg.png' }, // Fallback to wikimedia for new bank
    'blu': { gradient: { from: '#00D1FF', to: '#008CBA' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/blubybcadigital.id' },
    'blu by bca': { gradient: { from: '#00D1FF', to: '#008CBA' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/blubybcadigital.id' },
    'jenius': { gradient: { from: '#00B5E0', to: '#007FA0' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/jenius.com' },
    'jago': { gradient: { from: '#F6A000', to: '#AD7100' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/jago.com' },
    'bank jago': { gradient: { from: '#F6A000', to: '#AD7100' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/jago.com' },

    // Paylater
    'spaylater': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/shopee.co.id' },
    'gopaylater': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/gopay.co.id' },
    'gopay later': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/gopay.co.id' },
    'kredivo': { gradient: { from: '#F78121', to: '#A85614' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/kredivo.com' },
    'akulaku': { gradient: { from: '#E33333', to: '#962222' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/akulaku.com' },

    // Investment
    'bibit': { gradient: { from: '#23B15D', to: '#17733C' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/bibit.id' },
    'ajaib': { gradient: { from: '#007AFF', to: '#0051AB' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/ajaib.co.id' },
    'pluang': { gradient: { from: '#1A1A1A', to: '#000000' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/pluang.com' },
    'saldo pluang': { gradient: { from: '#1A1A1A', to: '#000000' }, textColor: 'text-white', logo: 'https://logo.clearbit.com/pluang.com' },

    // Cash & Physical
    'dompet': { gradient: { from: '#334155', to: '#0f172a' }, textColor: 'text-white' }, // Dark slate for physical wallet
    'tunai': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' },
    'cash': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' },
};


export const getWalletVisuals = (itemName: string, itemCategoryKey?: string): WalletVisuals => {
    const normalizedName = itemName.toLowerCase();

    // 1. Try Exact Match
    let brand = brandGradients[normalizedName];

    // 2. Try Fuzzy Match (Smart Search)
    if (!brand) {
        // Exclude generic words to prevent "Dana Darurat" matching "dana" brand or "Tunai Dompet" matching "tunai"
        const excludedFuzzyKeys = ['cash', 'tunai', 'dompet', 'dana', 'bank', 'other'];

        const matchedKey = Object.keys(brandGradients).find(key => {
            if (excludedFuzzyKeys.includes(key)) return false;
            return normalizedName.includes(key);
        });

        if (matchedKey) {
            brand = brandGradients[matchedKey];
        }
    }

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
