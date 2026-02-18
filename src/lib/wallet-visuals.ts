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
    'gopay': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=gopay.co.id&sz=128' },
    'ovo': { gradient: { from: '#4C3494', to: '#322261' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=ovo.id&sz=128' },
    'dana': { gradient: { from: '#118EE9', to: '#0B5E9A' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=dana.id&sz=128' },
    'linkaja': { gradient: { from: '#ED1C24', to: '#991217' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=linkaja.id&sz=128' },
    'shopeepay': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=shopee.co.id&sz=128' },
    'paypal': { gradient: { from: '#003087', to: '#001C64' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=paypal.com&sz=128' },

    // Banks
    'bca': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bca.co.id&sz=128' },
    'mandiri': { gradient: { from: '#003D79', to: '#00284F' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bankmandiri.co.id&sz=128' },
    'bni': { gradient: { from: '#F15A23', to: '#A33B15' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bni.co.id&sz=128' },
    'bri': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bri.co.id&sz=128' },
    'cimb': { gradient: { from: '#7B1216', to: '#4A0B0D' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=cimbniaga.co.id&sz=128' },
    'bsi': { gradient: { from: '#00A499', to: '#007068' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bankbsi.co.id&sz=128' },
    'digibank': { gradient: { from: '#E32D2D', to: '#961E1E' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=dbs.com&sz=128' },
    'ocbc': { gradient: { from: '#ED1C24', to: '#991217' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=ocbc.id&sz=128' },
    'uob': { gradient: { from: '#003366', to: '#002244' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=uob.co.id&sz=128' },
    'maybank': { gradient: { from: '#FFD100', to: '#B89600' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=maybank.co.id&sz=128' },
    'permata': { gradient: { from: '#00A651', to: '#007036' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=permatabank.com&sz=128' },
    'panin': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=panin.co.id&sz=128' },
    'btpn': { gradient: { from: '#0070C0', to: '#004A80' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=btpn.com&sz=128' },
    'danamon': { gradient: { from: '#F15A23', to: '#A33B15' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=danamon.co.id&sz=128' },
    'hsbc': { gradient: { from: '#DB0011', to: '#99000B' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=hsbc.co.id&sz=128' },
    'btn': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=btn.co.id&sz=128' },

    // Digital Banks
    'neobank': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=bankneo.co.id&sz=128' },
    'neo': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=bankneo.co.id&sz=128' },
    'bnc': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=bankneo.co.id&sz=128' },
    'bank neo': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=bankneo.co.id&sz=128' },
    'seabank': { gradient: { from: '#FF5400', to: '#A83700' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=seabank.co.id&sz=128' },
    'sea bank': { gradient: { from: '#FF5400', to: '#A83700' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=seabank.co.id&sz=128' },
    'superbank': { gradient: { from: '#CCFF00', to: '#8AB300' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=superbank.id&sz=128' },
    'blu': { gradient: { from: '#00D1FF', to: '#008CBA' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=blubybcadigital.id&sz=128' },
    'jenius': { gradient: { from: '#00B5E0', to: '#007FA0' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=jenius.com&sz=128' },
    'jago': { gradient: { from: '#F6A000', to: '#AD7100' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=jago.com&sz=128' },
    'nanovest': { gradient: { from: '#1A1A1A', to: '#000000' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=nanovest.io&sz=128' },

    // Paylater
    'spaylater': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=shopee.co.id&sz=128' },
    'gopaylater': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=gopay.co.id&sz=128' },
    'kredivo': { gradient: { from: '#F78121', to: '#A85614' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=kredivo.id&sz=128' },
    'akulaku': { gradient: { from: '#E33333', to: '#962222' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=akulaku.com&sz=128' },
    'atome': { gradient: { from: '#FFE000', to: '#B8A200' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=atome.id&sz=128' },
    'traveloka paylater': { gradient: { from: '#00D1FF', to: '#008CBA' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=traveloka.com&sz=128' },

    // Investment
    'bibit': { gradient: { from: '#23B15D', to: '#17733C' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bibit.id&sz=128' },
    'ajaib': { gradient: { from: '#007AFF', to: '#0051AB' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=ajaib.co.id&sz=128' },
    'pluang': { gradient: { from: '#1A1A1A', to: '#000000' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=pluang.com&sz=128' },
    'stockbit': { gradient: { from: '#1D1D1D', to: '#000000' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=stockbit.com&sz=128' },
    'indodax': { gradient: { from: '#003366', to: '#002244' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=indodax.com&sz=128' },
    'binance': { gradient: { from: '#F3BA2F', to: '#A88221' }, textColor: 'text-black', logo: 'https://www.google.com/s2/favicons?domain=binance.com&sz=128' },
    'pintu': { gradient: { from: '#000000', to: '#333333' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=pintu.co.id&sz=128' },
    'bareksa': { gradient: { from: '#23B15D', to: '#17733C' }, textColor: 'text-white', logo: 'https://www.google.com/s2/favicons?domain=bareksa.com&sz=128' },

    // Cash & Physical
    'dompet': { gradient: { from: '#334155', to: '#0f172a' }, textColor: 'text-white' },
    'tunai': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' },
    'cash': { gradient: { from: '#22c55e', to: '#15803d' }, textColor: 'text-white' },
};


export const getWalletVisuals = (itemName: string, itemCategoryKey?: string): WalletVisuals => {
    const normalizedName = itemName.toLowerCase().trim();

    // 1. Try Exact Match
    let brand = brandGradients[normalizedName];

    // 2. Try Fuzzy Match (Smart Search)
    if (!brand) {
        const genericWords = ['cash', 'tunai', 'dompet', 'bank', 'other'];
        const sortedKeys = Object.keys(brandGradients).sort((a, b) => b.length - a.length);

        const matchedKey = sortedKeys.find(key => {
            if (genericWords.includes(key)) return false;
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
        'e-wallet': { from: '#0ea5e9', to: '#0369a1' },
        'bank': { from: '#10b981', to: '#047857' },
        'cash': { from: '#f97316', to: '#c2410c' },
        'investment': { from: '#10b981', to: '#047857' },
        'property': { from: '#2563eb', to: '#1e3a8a' },
        'loan': { from: '#ef4444', to: '#991b1b' },
        'credit-card': { from: '#f97316', to: '#9a3412' },
        'other': { from: '#4338ca', to: '#312e81' },
    };

    return {
        ...categoryInfo,
        gradient: (itemCategoryKey && categoryDefaultGradients[itemCategoryKey]) || defaultVisuals.gradient,
        textColor: 'text-white'
    };
};
