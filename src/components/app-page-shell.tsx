'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { pageShell, pageWidth, type PageWidth } from '@/lib/layout-tokens';

interface AppPageShellProps {
  children: ReactNode;
  className?: string;
}

interface AppPageBodyProps {
  children: ReactNode;
  className?: string;
  width?: PageWidth;
  as?: ElementType;
}

interface AppPageHeaderChromeProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  width?: PageWidth;
}

interface AppPageStickyFooterProps {
  children: ReactNode;
  className?: string;
  width?: PageWidth;
}

export const AppPageShell = ({ children, className }: AppPageShellProps) => {
  return <div className={cn(pageShell.root, className)}>{children}</div>;
};

export const AppPageHeaderChrome = ({
  children,
  className,
  innerClassName,
  width = 'standard',
}: AppPageHeaderChromeProps) => {
  return (
    <div
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      className={cn(pageShell.headerChrome, className)}
    >
      <div className={cn('mx-auto w-full', pageWidth[width], innerClassName)}>{children}</div>
    </div>
  );
};

export const AppPageBody = ({
  children,
  className,
  width = 'standard',
  as: Component = 'main',
}: AppPageBodyProps) => {
  return (
    <Component className={cn(pageShell.bodyBase, pageWidth[width], 'app-page-body-padding', className)}>
      {children}
    </Component>
  );
};

export const AppPageStickyFooter = ({
  children,
  className,
  width = 'standard',
}: AppPageStickyFooterProps) => {
  return (
    <div className={cn(pageShell.stickyFooter, className)}>
      <div className={cn('mx-auto w-full', pageWidth[width])}>{children}</div>
    </div>
  );
};

