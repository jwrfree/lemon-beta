import {
  BellRing,
  HandCoins,
  Home,
  Landmark,
  NotebookPen,
  PieChart,
  PiggyBank,
  ReceiptText,
  Settings,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  href: string;
  icon: LucideIcon;
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
  { id: 'home', href: '/home', icon: Home, name: 'Beranda', shortName: 'Home', exact: true },
  { id: 'transactions', href: '/transactions', icon: ReceiptText, name: 'Transaksi', shortName: 'Transaksi' },
  { id: 'charts', href: '/charts', icon: PieChart, name: 'Analitik', shortName: 'Analitik' },
];

const planningItems: NavItem[] = [
  { id: 'budgeting', href: '/budgeting', icon: PiggyBank, name: 'Budget', shortName: 'Budget' },
  { id: 'plan', href: '/plan', icon: NotebookPen, name: 'Rencana', shortName: 'Rencana' },
  { id: 'goals', href: '/goals', icon: Target, name: 'Target', shortName: 'Target' },
];

const financeItems: NavItem[] = [
  { id: 'wallets', href: '/wallets', icon: Wallet, name: 'Dompet', shortName: 'Dompet' },
  { id: 'debts', href: '/debts', icon: HandCoins, name: 'Hutang', shortName: 'Hutang' },
  { id: 'assets-liabilities', href: '/assets-liabilities', icon: Landmark, name: 'Aset & Liabilitas', shortName: 'Aset' },
  { id: 'reminders', href: '/reminders', icon: BellRing, name: 'Pengingat', shortName: 'Pengingat' },
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
  { id: 'settings', href: '/settings', icon: Settings, name: 'Pengaturan', shortName: 'Settings' },
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
  '/settings',
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
