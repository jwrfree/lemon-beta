
import { Utensils, ShoppingCart, Car, Phone, Gamepad2, Home, GraduationCap, HeartPulse, Wrench, Briefcase, Gift, PiggyBank, Handshake } from 'lucide-react';

export const categories = {
  expense: [
    { id: 'cat-e-1', name: 'Makanan & Minuman', icon: Utensils },
    { id: 'cat-e-2', name: 'Belanja', icon: ShoppingCart },
    { id: 'cat-e-3', name: 'Transportasi', icon: Car },
    { id: 'cat-e-4', name: 'Tagihan & Utilitas', icon: Phone },
    { id: 'cat-e-5', name: 'Hiburan', icon: Gamepad2 },
    { id: 'cat-e-6', name: 'Rumah', icon: Home },
    { id: 'cat-e-7', name: 'Pendidikan', icon: GraduationCap },
    { id: 'cat-e-8', name: 'Kesehatan', icon: HeartPulse },
    { id: 'cat-e-9', name: 'Lain-lain', icon: Wrench },
  ],
  income: [
    { id: 'cat-i-1', name: 'Gaji', icon: Briefcase },
    { id: 'cat-i-2', name: 'Bonus', icon: Gift },
    { id: 'cat-i-3', name: 'Investasi', icon: PiggyBank },
    { id: 'cat-i-4', name: 'Lain-lain', icon: Handshake },
  ],
};

export const categoryDetails = (name: string) => {
  const allCategories = [...categories.expense, ...categories.income];
  const category = allCategories.find(c => c.name === name);
  return category || { name: 'Lain-lain', icon: Wrench };
};
