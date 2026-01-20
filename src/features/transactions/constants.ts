import { 
    Utensils, ShoppingCart, Car, Phone, 
    Gamepad2, Home, GraduationCap, HeartPulse,
    Briefcase, Gift, PiggyBank, Wrench, ReceiptText, 
    ShieldCheck, Sparkles, HandCoins, ArrowRightLeft, Handshake
} from 'lucide-react';

export const CATEGORY_ICONS = [
    { name: 'Utensils', icon: Utensils },
    { name: 'ShoppingCart', icon: ShoppingCart },
    { name: 'Car', icon: Car },
    { name: 'Phone', icon: Phone },
    { name: 'Gamepad2', icon: Gamepad2 },
    { name: 'Home', icon: Home },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'HeartPulse', icon: HeartPulse },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Gift', icon: Gift },
    { name: 'PiggyBank', icon: PiggyBank },
    { name: 'ReceiptText', icon: ReceiptText },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'HandCoins', icon: HandCoins },
    { name: 'ArrowRightLeft', icon: ArrowRightLeft },
    { name: 'Handshake', icon: Handshake },
    { name: 'Wrench', icon: Wrench },
] as const;

export const CATEGORY_COLORS = [
    { name: 'Yellow', color: 'text-yellow-600 dark:text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/50' },
    { name: 'Blue', color: 'text-blue-600 dark:text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    { name: 'Purple', color: 'text-purple-600 dark:text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/50' },
    { name: 'Cyan', color: 'text-cyan-600 dark:text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/50' },
    { name: 'Orange', color: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/50' },
    { name: 'Pink', color: 'text-pink-600 dark:text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/50' },
    { name: 'Green', color: 'text-green-600 dark:text-green-500', bg: 'bg-green-100 dark:bg-green-900/50' },
    { name: 'Emerald', color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/50' },
    { name: 'Teal', color: 'text-teal-600 dark:text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/50' },
    { name: 'Indigo', color: 'text-indigo-600 dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    { name: 'Red', color: 'text-red-600 dark:text-red-500', bg: 'bg-red-100 dark:bg-red-900/50' },
    { name: 'Rose', color: 'text-rose-600 dark:text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/50' },
    { name: 'Stone', color: 'text-stone-600 dark:text-stone-500', bg: 'bg-stone-100 dark:bg-stone-900/50' },
] as const;