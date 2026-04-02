import {
  Bank,
  Bell,
  ChartPieSlice,
  GearSix,
  HandCoins,
  House,
  Notebook,
  PiggyBank,
  Receipt,
  Target,
  User,
  Wallet,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  href: string;
  icon: PhosphorIcon;
  name: string;
  shortName?: string;
  exact?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const overviewItems: NavItem[] = [
  { id: 'home', href: '/home', icon: House, name: 'Beranda', shortName: 'Home', exact: true },
  { id: 'transactions', href: '/transactions', icon: Receipt, name: 'Transaksi', shortName: 'Transaksi' },
  { id: 'charts', href: '/charts', icon: ChartPieSlice, name: 'Analitik', shortName: 'Analitik' },
];

const planningItems: NavItem[] = [
  { id: 'budgeting', href: '/budgeting', icon: PiggyBank, name: 'Budget', shortName: 'Budget' },
  { id: 'plan', href: '/plan', icon: Notebook, name: 'Rencana', shortName: 'Rencana' },
  { id: 'goals', href: '/goals', icon: Target, name: 'Target', shortName: 'Target' },
];

const financeItems: NavItem[] = [
  { id: 'wallets', href: '/wallets', icon: Wallet, name: 'Dompet', shortName: 'Dompet' },
  { id: 'debts', href: '/debts', icon: HandCoins, name: 'Hutang', shortName: 'Hutang' },
  { id: 'assets-liabilities', href: '/assets-liabilities', icon: Bank, name: 'Aset & Liabilitas', shortName: 'Aset' },
  { id: 'reminders', href: '/reminders', icon: Bell, name: 'Pengingat', shortName: 'Pengingat' },
];

export const SIDEBAR_NAV_SECTIONS: NavSection[] = [
  { id: 'overview', label: 'Overview', items: overviewItems },
  { id: 'planning', label: 'Planning', items: planningItems },
  { id: 'finance', label: 'Finance', items: financeItems },
];

export const SIDEBAR_PRIMARY_NAV_ITEMS = SIDEBAR_NAV_SECTIONS.flatMap((section) => section.items);

export const MOBILE_NAV_ITEMS: NavItem[] = [
  overviewItems[0],
  overviewItems[1],
  planningItems[1],
  { id: 'profile', href: '/profile', icon: User, name: 'Profil & Akun', shortName: 'Profil' },
];

export const MOBILE_TOP_LEVEL_PATHS = new Set([
  '/home',
  '/transactions',
  '/charts',
  '/budgeting',
  '/plan',
  '/goals',
  '/wallets',
  '/debts',
  '/assets-liabilities',
  '/reminders',
  '/profile',
  '/notifications',
]);

export const SIDEBAR_CONFIG = {
  collapsedWidth: 'w-[88px]',
  expandedWidth: 'w-[288px]',
  appName: 'Lemon',
  appVersion: 'Finance OS',
} as const;

export const isNavItemActive = (pathname: string, item: NavItem) => {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};

export const isTopLevelMobileRoute = (pathname: string) => {
  if (!MOBILE_TOP_LEVEL_PATHS.has(pathname)) {
    return false;
  }

  return pathname.split('/').filter(Boolean).length === 1;
};
