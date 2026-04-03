'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CaretLeft,
  CaretRight,
  CaretUpDown,
  DownloadSimple,
  GearSix,
  Robot,
  SignOut,
  Sparkle,
} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUI } from '@/components/ui-provider';
import { useAuth } from '@/providers/auth-provider';
import { SIDEBAR_CONFIG, SIDEBAR_NAV_SECTIONS, isNavItemActive } from '@/lib/sidebar-config';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserAvatar } from '@/components/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarActionProps {
  children: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const SidebarAction = ({ children, label, collapsed }: SidebarActionProps) => {
  if (!collapsed) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={18} className="bg-card/95 text-label text-foreground shadow-elevation-3 backdrop-blur-xl">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();
  const { userData, handleSignOut } = useAuth();
  const {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    deferredPrompt,
    setDeferredPrompt,
    openTransactionSheet,
    setIsAIChatOpen,
  } = useUI();

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const accountMenuItems = (
    <>
      <DropdownMenuItem asChild>
        <Link href="/settings" prefetch={false} className="font-medium">
          <GearSix size={16} weight="regular" />
          <span>Pengaturan</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSignOut}
        className="font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
      >
        <SignOut size={16} weight="regular" />
        <span>Keluar</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <aside
      className={cn(
        'fixed bottom-4 left-4 top-4 z-50 hidden flex-col overflow-hidden rounded-card-premium bg-card/96 shadow-elevation-4 backdrop-blur-xl transition-[width,padding] duration-300 ease-in-out dark:bg-background/95 md:flex',
        isSidebarCollapsed
          ? cn(SIDEBAR_CONFIG.collapsedWidth, 'px-3 py-4')
          : cn(SIDEBAR_CONFIG.expandedWidth, 'px-4 py-4')
      )}
    >
      <div className="flex items-center justify-between gap-3 pb-5">
        <Link
          href="/home"
          prefetch={false}
          className={cn(
            'flex min-w-0 items-center gap-3 rounded-2xl',
            isSidebarCollapsed ? 'w-full justify-center' : 'flex-1 bg-white/58 px-3 py-2 shadow-inner'
          )}
          aria-label={SIDEBAR_CONFIG.appName}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevation-2">
            <span className="text-lg font-semibold leading-none">L</span>
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-foreground">
                {SIDEBAR_CONFIG.appName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {SIDEBAR_CONFIG.appVersion}
              </p>
            </div>
          )}
        </Link>

        <SidebarAction collapsed={isSidebarCollapsed} label={isSidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="h-10 w-10 rounded-2xl text-muted-foreground hover:bg-white/70 hover:text-foreground"
            aria-label={isSidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            {isSidebarCollapsed ? <CaretRight size={18} weight="regular" /> : <CaretLeft size={18} weight="regular" />}
          </Button>
        </SidebarAction>
      </div>

      <div className="space-y-2 rounded-3xl bg-black/[0.02] p-2.5 pb-2.5 dark:bg-white/[0.03]">
        {!isSidebarCollapsed && (
          <p className="px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
            Quick Actions
          </p>
        )}

        <SidebarAction collapsed={isSidebarCollapsed} label="Smart Add">
          <Button
            type="button"
            onClick={() => openTransactionSheet()}
            className={cn(
              'w-full bg-primary text-primary-foreground hover:bg-primary/90',
              isSidebarCollapsed ? 'h-12 w-12 rounded-2xl p-0' : 'h-12 justify-start rounded-2xl px-4'
            )}
            aria-label="Smart Add"
          >
            <Sparkle size={20} weight="regular" className="shrink-0" />
            {!isSidebarCollapsed && <span className="text-sm font-semibold">Smart Add</span>}
          </Button>
        </SidebarAction>

        <SidebarAction collapsed={isSidebarCollapsed} label="Tanya Lemon AI">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsAIChatOpen(true)}
            className={cn(
              'w-full bg-white text-slate-900 shadow-elevation-2 hover:bg-white/92 hover:text-slate-950 dark:bg-white dark:text-slate-900 dark:hover:bg-white/92',
              isSidebarCollapsed ? 'h-12 w-12 rounded-2xl p-0' : 'h-11 justify-start rounded-2xl px-4'
            )}
            aria-label="Tanya Lemon AI"
          >
            <Robot size={20} weight="regular" className="shrink-0" />
            {!isSidebarCollapsed && <span className="text-sm font-semibold">Tanya Lemon AI</span>}
          </Button>
        </SidebarAction>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide pr-1 pt-5">
        <nav className="space-y-5" aria-label="Navigasi utama">
          {SIDEBAR_NAV_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-2">
              {!isSidebarCollapsed && (
                <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                  {section.label}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isNavItemActive(pathname, item);
                  const NavIcon = item.icon;

                  return (
                    <SidebarAction key={item.id} collapsed={isSidebarCollapsed} label={item.name}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className={cn(
                          'group relative flex items-center text-sm transition-all duration-200',
                          isSidebarCollapsed
                            ? 'mx-auto h-12 w-12 justify-center rounded-2xl'
                            : 'h-11 gap-3 rounded-2xl px-3.5',
                          isActive
                            ? 'text-slate-900'
                            : 'text-muted-foreground hover:bg-white/72 hover:text-foreground'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-2xl bg-white shadow-elevation-2"
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                          />
                        )}
                        <div
                          className={cn(
                            'relative z-10 flex items-center justify-center rounded-xl transition-colors',
                            isSidebarCollapsed ? 'h-10 w-10' : 'h-9 w-9',
                            isActive
                              ? 'bg-primary/12 text-primary'
                              : 'text-muted-foreground group-hover:bg-muted group-hover:text-foreground dark:group-hover:bg-background'
                          )}
                        >
                          <NavIcon
                            size={18}
                            weight={isActive ? 'fill' : 'regular'}
                            className="shrink-0"
                          />
                        </div>
                        {!isSidebarCollapsed && (
                          <>
                            <span className="relative z-10 min-w-0 flex-1 truncate font-medium">
                              {item.name}
                            </span>
                            {isActive && <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary" />}
                          </>
                        )}
                      </Link>
                    </SidebarAction>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-5">
        {deferredPrompt && (
          <div
            className={cn(
              'rounded-3xl bg-white/96 p-2.5 shadow-elevation-3 dark:bg-card/92',
              isSidebarCollapsed ? '' : 'mx-1'
            )}
          >
            {!isSidebarCollapsed && (
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                Utilities
              </p>
            )}

            <SidebarAction collapsed={isSidebarCollapsed} label="Install App">
              <Button
                type="button"
                variant="ghost"
                onClick={handleInstallClick}
                className={cn(
                  'w-full text-primary hover:bg-primary/10 hover:text-primary',
                  isSidebarCollapsed ? 'mx-auto h-11 w-11 rounded-2xl p-0' : 'h-10 justify-start rounded-2xl px-3'
                )}
                aria-label="Install App"
              >
                <DownloadSimple size={18} weight="regular" className="shrink-0" />
                {!isSidebarCollapsed && <span className="text-sm font-medium">Install App</span>}
              </Button>
            </SidebarAction>
          </div>
        )}

        <div
          className={cn(
            'space-y-2 rounded-3xl bg-white/96 p-2.5 shadow-elevation-3 dark:bg-card/92',
            deferredPrompt ? 'mt-3' : '',
            isSidebarCollapsed ? '' : 'mx-1'
          )}
        >
          {userData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-2xl bg-card text-left transition-colors hover:bg-muted dark:bg-background/40 dark:hover:bg-background/60',
                    isSidebarCollapsed ? 'flex justify-center p-2' : 'p-3'
                  )}
                  aria-label="Menu akun pengguna"
                >
                  <div
                    className={cn(
                      'flex items-center',
                      isSidebarCollapsed ? 'justify-center' : 'gap-3'
                    )}
                  >
                    <UserAvatar
                      name={userData.displayName}
                      src={userData.photoURL}
                      className="h-10 w-10 border-0"
                    />
                    {!isSidebarCollapsed && (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {userData.displayName || 'Pengguna Lemon'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {userData.email}
                        </p>
                      </div>
                    )}
                    {!isSidebarCollapsed && (
                      <CaretUpDown size={16} weight="regular" className="shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isSidebarCollapsed ? 'center' : 'end'}
                side="top"
                sideOffset={12}
                className="w-56 rounded-2xl border-0 bg-popover/98 p-2 shadow-elevation-4"
              >
                {accountMenuItems}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </aside>
  );
};

