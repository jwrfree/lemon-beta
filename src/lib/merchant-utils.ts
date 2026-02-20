import {
    Tv, Music, Coffee, ShoppingBag, Car,
    CreditCard, Utensils,
    Gamepad2, Plane, Smartphone, Zap, Droplets, Wifi
} from 'lucide-react';

export interface MerchantVisuals {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    brandColor?: string;
    domain?: string;
    logo?: string; // Local first logo path
}

export const MERCHANT_MAP: Record<string, MerchantVisuals> = {
    // --- ENTERTAINMENT ---
    'netflix': { icon: Tv, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'netflix.com' },
    'spotify': { icon: Music, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'spotify.com' },
    'youtube': { icon: Tv, color: 'text-rose-700', bgColor: 'bg-rose-100', domain: 'youtube.com' },
    'disney': { icon: Tv, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'disneyplus.com' },
    'hbo': { icon: Tv, color: 'text-indigo-600', bgColor: 'bg-indigo-50', domain: 'hbo.com' },
    'steam': { icon: Gamepad2, color: 'text-slate-700', bgColor: 'bg-slate-100', domain: 'steampowered.com' },
    'playstation': { icon: Gamepad2, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'playstation.com' },

    // --- FOOD & BEVERAGE ---
    'starbucks': { icon: Coffee, color: 'text-emerald-800', bgColor: 'bg-emerald-50', domain: 'starbucks.com' },
    'kopi kenangan': { icon: Coffee, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'kopikenangan.com' },
    'janji jiwa': { icon: Coffee, color: 'text-orange-800', bgColor: 'bg-orange-50', domain: 'jiwagroup.com' },
    'mcdonalds': { icon: Utensils, color: 'text-amber-500', bgColor: 'bg-amber-50', domain: 'mcdonalds.com' },
    'kfc': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-rose-100', domain: 'kfc.com' },

    // --- SHOPPING ---
    'tokopedia': { icon: ShoppingBag, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'tokopedia.com' },
    'shopee': { icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'shopee.co.id' },
    'lazada': { icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'lazada.co.id' },
    'alfamart': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'alfamart.co.id' },
    'indomaret': { icon: ShoppingBag, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'indomaret.co.id' },
    'uniqlo': { icon: ShoppingBag, color: 'text-rose-700', bgColor: 'bg-rose-100', domain: 'uniqlo.com' },

    // --- TRANSPORT ---
    'gojek': { icon: Car, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'gojek.com' },
    'grab': { icon: Car, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'grab.com' },
    'traveloka': { icon: Plane, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'traveloka.com' },
    'bluebird': { icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'bluebirdgroup.com' },

    // --- FINANCE ---
    'bca': { icon: CreditCard, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'bca.co.id' },
    'mandiri': { icon: CreditCard, color: 'text-blue-900', bgColor: 'bg-yellow-50', domain: 'bankmandiri.co.id' },
    'bni': { icon: CreditCard, color: 'text-orange-700', bgColor: 'bg-orange-50', domain: 'bni.co.id' },
    'bri': { icon: CreditCard, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'bri.co.id' },
    'cimb': { icon: CreditCard, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'cimbniaga.co.id' },
    'bsi': { icon: CreditCard, color: 'text-teal-700', bgColor: 'bg-teal-50', domain: 'bankbsi.co.id' },
    'dana': { icon: Smartphone, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'dana.id' },
    'ovo': { icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-50', domain: 'tokopedia.com' },
    'ovo cash': { icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-50', domain: 'tokopedia.com' },
    'gopay': { icon: Smartphone, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'gopay.co.id' },
    'linkaja': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'linkaja.id' },
    'shopeepay': { icon: Smartphone, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'shopee.co.id' },
    'jenius': { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'jenius.com' },
    'jago': { icon: CreditCard, color: 'text-amber-500', bgColor: 'bg-amber-50', domain: 'jago.com' },
    'blu': { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'blubybcadigital.id' },
    'superbank': { icon: CreditCard, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'superbank.id' },
    'seabank': { icon: CreditCard, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'seabank.co.id' },
    'neobank': { icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'bankneocommerce.co.id' },
    'neo bank': { icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'bankneocommerce.co.id' },
    'tiktok': { icon: Smartphone, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'tiktok.com' },
    'tiktok paylater': { icon: CreditCard, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'tiktok.com' },

    // --- TELECOM & UTILITIES ---
    'telkomsel': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'telkomsel.com' },
    'tsel': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'telkomsel.com' },
    'halo': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'telkomsel.com' },
    'indosat': { icon: Smartphone, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'indosatooredoo.com' },
    'im3': { icon: Smartphone, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'indosatooredoo.com' },
    'xl': { icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'xl.co.id' },
    'axis': { icon: Smartphone, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'axis.co.id' },
    'smartfren': { icon: Smartphone, color: 'text-rose-500', bgColor: 'bg-rose-50', domain: 'smartfren.com' },
    'indihome': { icon: Wifi, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'indihome.co.id' },
    'biznet': { icon: Wifi, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'biznetnetworks.com' },
    'first media': { icon: Wifi, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'firstmedia.com' },
    'pln': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'pln.co.id' },
    'listrik': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'pln.co.id' },
    'token': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'pln.co.id' },
    'pdam': { icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'pdam.co.id' },
};

/**
 * Gets real-world logo URL.
 * Uses Logo.dev via our API proxy as primary, Clearbit as secondary.
 */
export function getMerchantLogoUrl(domain?: string): string | null {
    if (!domain) return null;

    // Use our Logo API route as primary - it will redirect to the actual logo
    return `/api/logo/${domain}`;
}

/**
 * Fallback logo service if primary fails.
 * Uses Clearbit as secondary fallback.
 */
export function getBackupLogoUrl(domain?: string): string | null {
    if (!domain) return null;

    // Use Clearbit as secondary fallback
    return `https://logo.clearbit.com/${domain}?size=128`;
}

export function getMerchantVisuals(merchantName?: string | null): MerchantVisuals | null {
    if (!merchantName) return null;

    const normalized = merchantName.toLowerCase().trim();

    // 1. Direct Match
    if (MERCHANT_MAP[normalized]) return MERCHANT_MAP[normalized];

    // 2. Powerful Partial Match: Check if any key in MERCHANT_MAP is contained within the string
    // This handles "Beli Starbucks", "Bayar Netflix", etc.
    const keys = Object.keys(MERCHANT_MAP);
    for (const key of keys) {
        if (normalized.includes(key)) {
            return MERCHANT_MAP[key];
        }
    }

    return null;
}
