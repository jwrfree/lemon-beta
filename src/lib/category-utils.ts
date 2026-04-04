import React from 'react';
import {
    ForkKnife, ShoppingCart, Car, DeviceMobile,
    GameController, House, GraduationCap, Heartbeat,
    Briefcase, Gift, PiggyBank, Wrench, Receipt,
    ShieldCheck, Sparkle, Coins, ArrowsLeftRight, Handshake,
    Heart, Baby, ArrowsClockwise, CurrencyDollar, Wallet, TrendUp, Code,
    Lightning, Television
} from '@/lib/icons';

const withFillWeight = (Icon: React.ComponentType<any>): React.ComponentType<any> => {
    const WrappedIcon: React.FC<any> = (props) =>
        React.createElement(Icon, {
            ...props,
            weight: 'fill',
        });
    WrappedIcon.displayName = Icon.displayName ?? Icon.name ?? 'CategoryIcon';
    return WrappedIcon;
};

export const iconMap: Record<string, React.ComponentType<any>> = {
    Utensils: withFillWeight(ForkKnife),
    ShoppingCart: withFillWeight(ShoppingCart),
    Car: withFillWeight(Car),
    Phone: withFillWeight(DeviceMobile),
    Gamepad2: withFillWeight(GameController),
    Home: withFillWeight(House),
    GraduationCap: withFillWeight(GraduationCap),
    HeartPulse: withFillWeight(Heartbeat),
    Briefcase: withFillWeight(Briefcase),
    Gift: withFillWeight(Gift),
    PiggyBank: withFillWeight(PiggyBank),
    ReceiptText: withFillWeight(Receipt),
    ShieldCheck: withFillWeight(ShieldCheck),
    Sparkles: withFillWeight(Sparkle),
    HandCoins: withFillWeight(Coins),
    ArrowRightLeft: withFillWeight(ArrowsLeftRight),
    Handshake: withFillWeight(Handshake),
    Wrench: withFillWeight(Wrench),
    Heart: withFillWeight(Heart),
    Baby: withFillWeight(Baby),
    RefreshCw: withFillWeight(ArrowsClockwise),
    BadgeDollarSign: withFillWeight(CurrencyDollar),
    Wallet: withFillWeight(Wallet),
    TrendingUp: withFillWeight(TrendUp),
    Code: withFillWeight(Code),
    Zap: withFillWeight(Lightning),
    Tv: withFillWeight(Television),
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

