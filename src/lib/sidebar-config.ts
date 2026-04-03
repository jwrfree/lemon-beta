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
  Compass,
  Layout,
  type Icon as PhosphorIcon,
} from '@/lib/icons';

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
  { id: 'transactions', href: '/transactions', icon: Receipt, name: 'Aktivitas', shortName: 'Aktivitas' },
];

const planningItems: NavItem[] = [
  { id: 'plan', href: '/plan', icon: Layout, name: 'Perencanaan', shortName: 'Rencana' },
  { id: 'budgeting', href: '/plan?tab=budget', icon: PiggyBank, name: 'Budgeting', shortName: 'Budget' },
  { id: 'goals', href: '/plan?tab=goals', icon: Target, name: 'Target', shortName: 'Target' },
  { id: 'reminders', href: '/plan?tab=bills', icon: Bell, name: 'Pengingat', shortName: 'Tagihan' },
];

const strategyItems: NavItem[] = [
  { id: 'wealth', href: '/wealth', icon: Compass, name: 'Strategi & Kekayaan', shortName: 'Wawasan' },
  { id: 'assets-liabilities', href: '/wealth?tab=assets', icon: Bank, name: 'Aset & Liabilitas', shortName: 'Aset' },
  { id: 'debts', href: '/wealth?tab=debts', icon: HandCoins, name: 'Hutang', shortName: 'Hutang' },
  { id: 'charts', href: '/wealth?tab=charts', icon: ChartPieSlice, name: 'Analitik', shortName: 'Analitik' },
];

export const SIDEBAR_NAV_SECTIONS: NavSection[] = [
  { id: 'overview', label: 'Ringkasan', items: overviewItems },
  { id: 'planning', label: 'Perencanaan', items: planningItems },
  { id: 'strategy', label: 'Strategi', items: strategyItems },
];

export const SIDEBAR_PRIMARY_NAV_ITEMS = SIDEBAR_NAV_SECTIONS.flatMap((section) => section.items);

export const MOBILE_NAV_ITEMS: NavItem[] = [
  overviewItems[0],
  overviewItems[1],
  planningItems[0],
  strategyItems[0],
];

export const MOBILE_TOP_LEVEL_PATHS = new Set([
  '/home',
  '/transactions',
  '/charts',
  '/budgeting',
  '/plan',
  '/wealth',
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

