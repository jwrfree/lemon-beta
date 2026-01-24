import { Home, PieChart, HandCoins, Wallet, Landmark, Bell, Settings } from 'lucide-react';

export const SIDEBAR_NAV_ITEMS = [
    { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
    { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
    { id: 'anggaran', href: '/budgeting', icon: HandCoins, name: 'Anggaran' },
    { id: 'dompet', href: '/wallets', icon: Wallet, name: 'Dompet' },
    { id: 'assets-liabilities', href: '/assets-liabilities', icon: Landmark, name: 'Aset & Liabilitas' },
    { id: 'pengingat', href: '/reminders', icon: Bell, name: 'Pengingat' },
    { id: 'profil', href: '/settings', icon: Settings, name: 'Pengaturan' },
] as const;

export const SIDEBAR_CONFIG = {
    collapsedWidth: 'w-16',
    expandedWidth: 'w-64',
    appName: 'Lemon',
    appVersion: 'Beta',
} as const;
