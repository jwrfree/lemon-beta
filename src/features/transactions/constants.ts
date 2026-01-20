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
    { name: 'Yellow', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Blue', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Purple', color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Cyan', color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Orange', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Pink', color: 'text-pink-600', bg: 'bg-pink-100' },
    { name: 'Green', color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Indigo', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Red', color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Teal', color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: 'Stone', color: 'text-stone-600', bg: 'bg-stone-100' },
] as const;