import { Home, PieChart, NotebookPen, Wallet, Landmark, Settings } from 'lucide-react';

export const SIDEBAR_NAV_ITEMS = [
    { id: 'home', href: '/home', icon: Home, name: 'Beranda' },
    { id: 'statistik', href: '/charts', icon: PieChart, name: 'Statistik' },
    { id: 'rencana', href: '/plan', icon: NotebookPen, name: 'Rencana' },
    { id: 'dompet', href: '/wallets', icon: Wallet, name: 'Dompet' },
    { id: 'assets-liabilities', href: '/assets-liabilities', icon: Landmark, name: 'Aset & Liabilitas' },
    { id: 'profil', href: '/settings', icon: Settings, name: 'Pengaturan' },
] as const;

export const SIDEBAR_CONFIG = {
    collapsedWidth: 'w-16',
    expandedWidth: 'w-64',
    appName: 'Lemon',
    appVersion: 'v2.2.0',
} as const;
