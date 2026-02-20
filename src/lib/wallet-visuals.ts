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
    'gopay': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: '/api/logo/gopay.co.id' },
    'ovo': { gradient: { from: '#4C3494', to: '#322261' }, textColor: 'text-white', logo: '/api/logo/ovo.id' },
    'ovo cash': { gradient: { from: '#4C3494', to: '#322261' }, textColor: 'text-white', logo: '/api/logo/ovo.id' },
    'dana': { gradient: { from: '#118EE9', to: '#0B5E9A' }, textColor: 'text-white', logo: '/api/logo/dana.id' },
    'linkaja': { gradient: { from: '#ED1C24', to: '#991217' }, textColor: 'text-white', logo: '/api/logo/linkaja.id' },
    'shopeepay': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: '/api/logo/shopee.co.id' },
    'paypal': { gradient: { from: '#003087', to: '#001C64' }, textColor: 'text-white', logo: '/api/logo/paypal.com' },

    // Banks
    'bca': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: '/api/logo/bca.co.id' },
    'mandiri': { gradient: { from: '#003D79', to: '#00284F' }, textColor: 'text-white', logo: '/api/logo/bankmandiri.co.id' },
    'bni': { gradient: { from: '#F15A23', to: '#A33B15' }, textColor: 'text-white', logo: '/api/logo/bni.co.id' },
    'bri': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: '/api/logo/bri.co.id' },
    'cimb': { gradient: { from: '#7B1216', to: '#4A0B0D' }, textColor: 'text-white', logo: '/api/logo/cimbniaga.co.id' },
    'bsi': { gradient: { from: '#00A499', to: '#007068' }, textColor: 'text-white', logo: '/api/logo/bankbsi.co.id' },
    'digibank': { gradient: { from: '#E32D2D', to: '#961E1E' }, textColor: 'text-white', logo: '/api/logo/dbs.com' },
    'ocbc': { gradient: { from: '#ED1C24', to: '#991217' }, textColor: 'text-white', logo: '/api/logo/ocbc.id' },
    'uob': { gradient: { from: '#003366', to: '#002244' }, textColor: 'text-white', logo: '/api/logo/uob.co.id' },
    'maybank': { gradient: { from: '#FFD100', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/maybank.co.id' },
    'permata': { gradient: { from: '#00A651', to: '#007036' }, textColor: 'text-white', logo: '/api/logo/permatabank.com' },
    'panin': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: '/api/logo/panin.co.id' },
    'btpn': { gradient: { from: '#0070C0', to: '#004A80' }, textColor: 'text-white', logo: '/api/logo/btpn.com' },
    'danamon': { gradient: { from: '#F15A23', to: '#A33B15' }, textColor: 'text-white', logo: '/api/logo/danamon.co.id' },
    'hsbc': { gradient: { from: '#DB0011', to: '#99000B' }, textColor: 'text-white', logo: '/api/logo/hsbc.co.id' },
    'btn': { gradient: { from: '#00529C', to: '#003666' }, textColor: 'text-white', logo: '/api/logo/btn.co.id' },

    // Digital Banks
    'neobank': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/bankneocommerce.co.id' },
    'neo bank': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/bankneocommerce.co.id' },
    'bank neo': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/bankneocommerce.co.id' },
    'bnc': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/bankneocommerce.co.id' },
    'seabank': { gradient: { from: '#FF5400', to: '#A83700' }, textColor: 'text-white', logo: '/api/logo/seabank.co.id' },
    'sea bank': { gradient: { from: '#FF5400', to: '#A83700' }, textColor: 'text-white', logo: '/api/logo/seabank.co.id' },
    'superbank': { gradient: { from: '#CCFF00', to: '#8AB300' }, textColor: 'text-black', logo: '/api/logo/superbank.id' },
    'blu': { gradient: { from: '#00D1FF', to: '#008CBA' }, textColor: 'text-white', logo: '/api/logo/blubybcadigital.id' },
    'jenius': { gradient: { from: '#00B5E0', to: '#007FA0' }, textColor: 'text-white', logo: '/api/logo/jenius.com' },
    'jago': { gradient: { from: '#F6A000', to: '#AD7100' }, textColor: 'text-white', logo: '/api/logo/jago.com' },
    'tiktok': { gradient: { from: '#000000', to: '#25F4EE' }, textColor: 'text-white', logo: '/api/logo/tiktok.com' },
    'tiktok paylater': { gradient: { from: '#000000', to: '#25F4EE' }, textColor: 'text-white', logo: '/api/logo/tiktok.com' },
    'nanovest': { gradient: { from: '#1A1A1A', to: '#000000' }, textColor: 'text-white', logo: '/api/logo/nanovest.io' },

    // Paylater & Loans
    'spaylater': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: '/api/logo/shopee.co.id' },
    'sp pinjam': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: '/api/logo/shopee.co.id' },
    'shopee pinjam': { gradient: { from: '#EE4D2D', to: '#9E331D' }, textColor: 'text-white', logo: '/api/logo/shopee.co.id' },

    'gopaylater': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: '/api/logo/gopay.co.id' },
    'gopay pinjam': { gradient: { from: '#00AED6', to: '#0083A0' }, textColor: 'text-white', logo: '/api/logo/gopay.co.id' },

    'flexi cash': { gradient: { from: '#00B5E0', to: '#007FA0' }, textColor: 'text-white', logo: '/api/logo/jenius.com' },
    'jenius flexi': { gradient: { from: '#00B5E0', to: '#007FA0' }, textColor: 'text-white', logo: '/api/logo/jenius.com' },

    'neo pinjam': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/bankneocommerce.co.id' },
    'neo bank pinjam': { gradient: { from: '#FACD00', to: '#B89600' }, textColor: 'text-black', logo: '/api/logo/bankneocommerce.co.id' },

    'kredivo': { gradient: { from: '#F78121', to: '#A85614' }, textColor: 'text-white', logo: '/api/logo/kredivo.id' },
    'akulaku': { gradient: { from: '#E33333', to: '#962222' }, textColor: 'text-white', logo: '/api/logo/akulaku.com' },
    'atome': { gradient: { from: '#FFE000', to: '#B8A200' }, textColor: 'text-black', logo: '/api/logo/atome.id' },
    'traveloka paylater': { gradient: { from: '#00D1FF', to: '#008CBA' }, textColor: 'text-white', logo: '/api/logo/traveloka.com' },
    'indodana': { gradient: { from: '#24C0A6', to: '#15806D' }, textColor: 'text-white', logo: '/api/logo/indodana.id' },
    'home credit': { gradient: { from: '#E30613', to: '#99040D' }, textColor: 'text-white', logo: '/api/logo/homecredit.co.id' },
    'easycash': { gradient: { from: '#FF4D00', to: '#A83200' }, textColor: 'text-white', logo: '/api/logo/easy-cash.id' },
    'adakami': { gradient: { from: '#00A89D', to: '#007068' }, textColor: 'text-white', logo: '/api/logo/cs.adakami.id' },

    // Investment
    'bibit': { gradient: { from: '#23B15D', to: '#17733C' }, textColor: 'text-white', logo: '/api/logo/bibit.id' },
    'ajaib': { gradient: { from: '#007AFF', to: '#0051AB' }, textColor: 'text-white', logo: '/api/logo/ajaib.co.id' },
    'pluang': { gradient: { from: '#1A1A1A', to: '#000000' }, textColor: 'text-white', logo: '/api/logo/pluang.com' },
    'stockbit': { gradient: { from: '#1D1D1D', to: '#000000' }, textColor: 'text-white', logo: '/api/logo/stockbit.com' },
    'indodax': { gradient: { from: '#003366', to: '#002244' }, textColor: 'text-white', logo: '/api/logo/indodax.com' },
    'binance': { gradient: { from: '#F3BA2F', to: '#A88221' }, textColor: 'text-black', logo: '/api/logo/binance.com' },
    'pintu': { gradient: { from: '#000000', to: '#333333' }, textColor: 'text-white', logo: '/api/logo/pintu.co.id' },
    'bareksa': { gradient: { from: '#23B15D', to: '#17733C' }, textColor: 'text-white', logo: '/api/logo/bareksa.com' },

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
