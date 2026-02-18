import { 
    Tv, Music, Coffee, ShoppingBag, Car, 
    CreditCard, Zap, Heart, Utensils,
    Gamepad2, Plane, GraduationCap, Globe,
    Smartphone, Film, ShoppingCart, Train,
    Shield, Briefcase, Plus, Minus
} from 'lucide-react';

export interface MerchantVisuals {
    icon: any;
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
    'ovo': { icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-50', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/512px-Logo_ovo_purple.svg.png' },
    'ovo cash': { icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-50', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/512px-Logo_ovo_purple.svg.png' },
    'gopay': { icon: Smartphone, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'gopay.co.id' },
    'linkaja': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'linkaja.id' },
    'shopeepay': { icon: Smartphone, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'shopee.co.id' },
    'jenius': { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'jenius.com' },
    'jago': { icon: CreditCard, color: 'text-amber-500', bgColor: 'bg-amber-50', domain: 'jago.com' },
    'blu': { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'blubybcadigital.id' },
    'seabank': { icon: CreditCard, color: 'text-orange-600', bgColor: 'bg-orange-50', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SeaBank_logo.svg/512px-SeaBank_logo.svg.png' },
    'sea bank': { icon: CreditCard, color: 'text-orange-600', bgColor: 'bg-orange-50', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SeaBank_logo.svg/512px-SeaBank_logo.svg.png' },
    'neobank': { icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/1/10/Bank_Neo_Commerce_logo.svg/512px-Bank_Neo_Commerce_logo.svg.png' },
    'neo bank': { icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/1/10/Bank_Neo_Commerce_logo.svg/512px-Bank_Neo_Commerce_logo.svg.png' },
    'tiktok': { icon: Smartphone, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'tiktok.com' },
    'tiktok paylater': { icon: CreditCard, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'tiktok.com' },
};

/**
 * Gets real-world logo URL.
 * Uses Clearbit as primary (High Res) and Google as fallback (Reliable).
 */
export function getMerchantLogoUrl(domain?: string, size: number = 64): string | null {
    if (!domain) return null;
    return `https://logo.clearbit.com/${domain}?size=${size}`;
}

/**
 * Fallback logo service if Clearbit fails.
 */
export function getBackupLogoUrl(domain?: string): string | null {
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
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
