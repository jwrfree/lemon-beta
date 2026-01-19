import { 
    Utensils, ShoppingCart, Car, Phone, 
    Gamepad2, Home, GraduationCap, HeartPulse,
    Briefcase, Gift, PiggyBank, Wrench, ReceiptText, 
    ShieldCheck, Sparkles, HandCoins, ArrowRightLeft, Handshake
} from 'lucide-react';

export const iconMap: Record<string, any> = {
    Utensils, ShoppingCart, Car, Phone, Gamepad2, Home, GraduationCap, HeartPulse, 
    Briefcase, Gift, PiggyBank, ReceiptText, ShieldCheck, Sparkles, HandCoins, 
    ArrowRightLeft, Handshake, Wrench
};

export const getCategoryIcon = (iconName: string | null | undefined) => {
    return iconMap[iconName || 'Wrench'] || Wrench;
};

/**
 * Mendapatkan detail visual kategori secara dinamis.
 * Jika kategori ada di database, gunakan data DB. 
 * Jika tidak (fallback), gunakan default.
 */
export const resolveCategoryVisuals = (categoryName: string, allCategories: any[]) => {
    const found = allCategories.find(c => c.name === categoryName);
    
    if (found) {
        return {
            name: found.name,
            icon: getCategoryIcon(found.icon),
            color: found.color || 'text-gray-600',
            bgColor: found.bg_color || 'bg-gray-100'
        };
    }

    // Default Fallback
    return {
        name: categoryName,
        icon: Wrench,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
    };
};
