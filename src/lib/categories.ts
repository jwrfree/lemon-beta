
import { Utensils, ShoppingCart, Car, Phone, Gamepad2, Home, GraduationCap, HeartPulse, Wrench, Briefcase, Gift, PiggyBank, Handshake, LucideIcon } from 'lucide-react';

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
}

export const categories: Categories = {
  expense: [
    { id: 'cat-e-1', name: 'Makanan & Minuman', icon: Utensils, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
    { id: 'cat-e-2', name: 'Belanja', icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
    { id: 'cat-e-3', name: 'Transportasi', icon: Car, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/50' },
    { id: 'cat-e-4', name: 'Tagihan & Utilitas', icon: Phone, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/50' },
    { id: 'cat-e-5', name: 'Hiburan', icon: Gamepad2, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/50' },
    { id: 'cat-e-6', name: 'Rumah', icon: Home, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/50' },
    { id: 'cat-e-7', name: 'Pendidikan', icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/50' },
    { id: 'cat-e-8', name: 'Kesehatan', icon: HeartPulse, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/50' },
    { id: 'cat-e-9', name: 'Lain-lain', icon: Wrench, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/50' },
  ],
  income: [
    { id: 'cat-i-1', name: 'Gaji', icon: Briefcase, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/50' },
    { id: 'cat-i-2', name: 'Bonus', icon: Gift, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
    { id: 'cat-i-3', name: 'Investasi', icon: PiggyBank, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
    { id: 'cat-i-4', name: 'Lain-lain', icon: Handshake, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/50' },
  ],
};

const defaultCategory = { name: 'Lain-lain', icon: Wrench, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/50' };

export const categoryDetails = (name: string): Category => {
  const allCategories = [...categories.expense, ...categories.income];
  const category = allCategories.find(c => c.name === name);
  return category || defaultCategory;
};
