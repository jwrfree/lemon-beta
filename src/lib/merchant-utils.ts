import { 
    Tv, Music, Coffee, ShoppingBag, Car, 
    CreditCard, Zap, Heart, Utensils,
    Gamepad2, Plane, GraduationCap, Globe
} from 'lucide-react';

export interface MerchantVisuals {
    icon: any;
    color: string;
    bgColor: string;
    brandColor?: string;
}

/**
 * BEST PRACTICE: Centralized Dictionary for Merchant Intelligence.
 * This keeps the AI logic separate from visual mapping.
 */
export const MERCHANT_MAP: Record<string, MerchantVisuals> = {
    // Entertainment
    'netflix': { icon: Tv, color: 'text-rose-600', bgColor: 'bg-rose-50', brandColor: '#E50914' },
    'spotify': { icon: Music, color: 'text-emerald-600', bgColor: 'bg-emerald-50', brandColor: '#1DB954' },
    'youtube': { icon: Tv, color: 'text-rose-700', bgColor: 'bg-rose-100', brandColor: '#FF0000' },
    'disney': { icon: Tv, color: 'text-blue-800', bgColor: 'bg-blue-50', brandColor: '#006E99' },
    'steam': { icon: Gamepad2, color: 'text-slate-700', bgColor: 'bg-slate-100', brandColor: '#171a21' },
    
    // Food & Drink
    'starbucks': { icon: Coffee, color: 'text-emerald-800', bgColor: 'bg-emerald-50', brandColor: '#00704A' },
    'gofood': { icon: Utensils, color: 'text-rose-500', bgColor: 'bg-rose-50', brandColor: '#EE2737' },
    'grabfood': { icon: Utensils, color: 'text-emerald-600', bgColor: 'bg-emerald-50', brandColor: '#00B14F' },
    'mcdonalds': { icon: Utensils, color: 'text-amber-500', bgColor: 'bg-amber-50', brandColor: '#FFC72C' },
    'kfc': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-rose-100', brandColor: '#E4002B' },
    
    // Shopping
    'tokopedia': { icon: ShoppingBag, color: 'text-emerald-500', bgColor: 'bg-emerald-50', brandColor: '#42B549' },
    'shopee': { icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-50', brandColor: '#EE4D2D' },
    'lazada': { icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50', brandColor: '#00008F' },
    'alfamart': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-rose-50', brandColor: '#E31E24' },
    'indomaret': { icon: ShoppingBag, color: 'text-blue-700', bgColor: 'bg-blue-50', brandColor: '#005DAA' },
    
    // Travel & Transport
    'gojek': { icon: Car, color: 'text-emerald-600', bgColor: 'bg-emerald-50', brandColor: '#00AA13' },
    'grab': { icon: Car, color: 'text-emerald-500', bgColor: 'bg-emerald-50', brandColor: '#00B14F' },
    'traveloka': { icon: Plane, color: 'text-blue-500', bgColor: 'bg-blue-50', brandColor: '#0194F3' },
    'tiket': { icon: Plane, color: 'text-blue-600', bgColor: 'bg-blue-100', brandColor: '#0055B8' },
    
    // Bills & Utilities
    'pln': { icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-50', brandColor: '#F7941D' },
    'pdam': { icon: Globe, color: 'text-blue-500', bgColor: 'bg-blue-50', brandColor: '#00ADEF' },
    'telkom': { icon: Zap, color: 'text-rose-600', bgColor: 'bg-rose-50', brandColor: '#ED1C24' },
};

/**
 * Extracts visual metadata for a merchant name.
 */
export function getMerchantVisuals(merchantName?: string | null): MerchantVisuals | null {
    if (!merchantName) return null;
    
    const normalized = merchantName.toLowerCase().trim();
    
    // 1. Direct Match
    if (MERCHANT_MAP[normalized]) return MERCHANT_MAP[normalized];
    
    // 2. Partial Match (e.g., "Langganan Netflix" -> "netflix")
    const key = Object.keys(MERCHANT_MAP).find(k => normalized.includes(k));
    if (key) return MERCHANT_MAP[key];
    
    return null;
}
