
'use client';

import type { ComponentType, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { AppPageHeaderChrome } from '@/components/app-page-shell';
import type { PageWidth } from '@/lib/layout-tokens';
import { cn } from '@/lib/utils';

type HeaderIcon = ComponentType<{ className?: string }>;

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backIcon?: HeaderIcon;
  onBackClick?: () => void;
  actionButton?: {
    icon: HeaderIcon;
    label: string;
    onClick: () => void;
  };
  extraActions?: ReactNode;
  className?: string;
  width?: PageWidth;
}

export const PageHeader = ({
  title,
  description,
  showBackButton = true,
  backIcon: BackIcon = CaretLeft,
  onBackClick,
  actionButton,
  extraActions,
  className,
  width = 'standard',
}: PageHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <AppPageHeaderChrome width={width} className={className}>
      <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-4 md:min-h-16 md:px-6">
        <div className={cn("flex items-center justify-start", showBackButton ? "w-10 md:w-0" : "w-0")}>
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              onClick={handleBack}
              aria-label="Kembali"
            >
              <BackIcon className="h-4 w-4 text-current" />
            </Button>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="min-w-0 space-y-0.5">
            <h1 className="truncate text-left text-base font-semibold tracking-tight text-foreground md:text-lg">
              {title}
            </h1>
            {description && (
              <p className="hidden truncate text-sm text-muted-foreground md:block">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1.5 md:gap-2">
          {extraActions}
          {actionButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary active:scale-95"
              onClick={actionButton.onClick}
              aria-label={actionButton.label}
            >
              <actionButton.icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppPageHeaderChrome>
  );
};

