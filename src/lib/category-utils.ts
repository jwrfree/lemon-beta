import React from 'react';
import {
    ForkKnife, ShoppingCart, Car, DeviceMobile,
    GameController, House, GraduationCap, Heartbeat,
    Briefcase, Gift, PiggyBank, Wrench, Receipt,
    ShieldCheck, Sparkle, Coins, ArrowsLeftRight, Handshake,
    Heart, Baby, ArrowsClockwise, CurrencyDollar, Wallet, TrendUp, Code,
    Lightning, Television
} from '@/lib/icons';

export const iconMap: Record<string, React.ElementType> = {
    Utensils: ForkKnife, ShoppingCart, Car, Phone: DeviceMobile, Gamepad2: GameController, Home: House, GraduationCap, HeartPulse: Heartbeat,
    Briefcase, Gift, PiggyBank, ReceiptText: Receipt, ShieldCheck, Sparkles: Sparkle, HandCoins: Coins,
    ArrowRightLeft: ArrowsLeftRight, Handshake, Wrench, Heart, Baby, RefreshCw: ArrowsClockwise, BadgeDollarSign: CurrencyDollar, Wallet, TrendingUp: TrendUp, Code,
    Zap: Lightning, Tv: Television
};

export const getCategoryIcon = (iconName: string | null | undefined) => {
    return iconMap[iconName || 'Wrench'] || Wrench;
};

/**
 * Mendapatkan detail visual kategori secara dinamis.
 * Jika kategori ada di database, gunakan data DB. 
 * Jika tidak (fallback), gunakan default.
 */
export const resolveCategoryVisuals = (categoryName: string, allCategories: { name: string; icon?: string | React.ElementType; color?: string; bgColor?: string; bg_color?: string }[]) => {
    const found = allCategories.find(c => c.name === categoryName);

    if (found) {
        return {
            name: found.name,
            icon: typeof found.icon === 'string' ? getCategoryIcon(found.icon) : (found.icon || Wrench),
            color: found.color || 'text-muted-foreground',
            bgColor: found.bgColor || found.bg_color || 'bg-muted'
        };
    }

    // Default Fallback
    return {
        name: categoryName,
        icon: Wrench,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted'
    };
};

