
import { Utensils, ShoppingCart, Car, Phone, Gamepad2, Home, GraduationCap, HeartPulse, Wrench, Briefcase, Gift, PiggyBank, Handshake, LucideIcon, ArrowRightLeft } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface Categories {
  expense: Category[];
  income: Category[];
  internal: Category[];
}

export const categories: Categories = {
  expense: [
    { id: 'cat-e-1', name: 'Makanan & Minuman', icon: Utensils, color: 'text-[var(--cat-food-fg)]', bgColor: 'bg-[var(--cat-food-bg)]' },
    { id: 'cat-e-2', name: 'Belanja', icon: ShoppingCart, color: 'text-[var(--cat-shopping-fg)]', bgColor: 'bg-[var(--cat-shopping-bg)]' },
    { id: 'cat-e-3', name: 'Transportasi', icon: Car, color: 'text-[var(--cat-transport-fg)]', bgColor: 'bg-[var(--cat-transport-bg)]' },
    { id: 'cat-e-4', name: 'Tagihan & Utilitas', icon: Phone, color: 'text-[var(--cat-bills-fg)]', bgColor: 'bg-[var(--cat-bills-bg)]' },
    { id: 'cat-e-5', name: 'Hiburan', icon: Gamepad2, color: 'text-[var(--cat-entertainment-fg)]', bgColor: 'bg-[var(--cat-entertainment-bg)]' },
    { id: 'cat-e-6', name: 'Rumah', icon: Home, color: 'text-[var(--cat-home-fg)]', bgColor: 'bg-[var(--cat-home-bg)]' },
    { id: 'cat-e-7', name: 'Pendidikan', icon: GraduationCap, color: 'text-[var(--cat-education-fg)]', bgColor: 'bg-[var(--cat-education-bg)]' },
    { id: 'cat-e-8', name: 'Kesehatan', icon: HeartPulse, color: 'text-[var(--cat-health-fg)]', bgColor: 'bg-[var(--cat-health-bg)]' },
    { id: 'cat-e-9', name: 'Lain-lain', icon: Wrench, color: 'text-[var(--cat-other-fg)]', bgColor: 'bg-[var(--cat-other-bg)]' },
  ],
  income: [
    { id: 'cat-i-1', name: 'Gaji', icon: Briefcase, color: 'text-[var(--cat-salary-fg)]', bgColor: 'bg-[var(--cat-salary-bg)]' },
    { id: 'cat-i-2', name: 'Bonus', icon: Gift, color: 'text-[var(--cat-bonus-fg)]', bgColor: 'bg-[var(--cat-bonus-bg)]' },
    { id: 'cat-i-3', name: 'Investasi', icon: PiggyBank, color: 'text-[var(--cat-investment-fg)]', bgColor: 'bg-[var(--cat-investment-bg)]' },
    { id: 'cat-i-4', name: 'Lain-lain', icon: Handshake, color: 'text-[var(--cat-other-income-fg)]', bgColor: 'bg-[var(--cat-other-income-bg)]' },
  ],
  internal: [
    { id: 'cat-t-1', name: 'Transfer', icon: ArrowRightLeft, color: 'text-[var(--cat-transfer-fg)]', bgColor: 'bg-[var(--cat-transfer-bg)]' },
  ]
};

const defaultCategory = { name: 'Lain-lain', icon: Wrench, color: 'text-[var(--cat-other-fg)]', bgColor: 'bg-[var(--cat-other-bg)]' };

export const categoryDetails = (name: string): Category => {
  const allCategories = [...categories.expense, ...categories.income, ...categories.internal];
  const category = allCategories.find(c => c.name === name);
  return category || defaultCategory;
};
