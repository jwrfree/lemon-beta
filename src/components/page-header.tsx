
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backIcon?: LucideIcon;
  onBackClick?: () => void;
  actionButton?: {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
  };
  extraActions?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  showBackButton = true,
  backIcon: BackIcon = ChevronLeft,
  onBackClick,
  actionButton,
  extraActions,
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
    <header className="h-16 flex items-center shrink-0 border-b bg-background sticky top-0 z-20">
      <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between relative">
        {/* Mobile Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute left-0"
            onClick={handleBack}
            aria-label="Kembali"
          >
            <BackIcon className="h-6 w-6" strokeWidth={1.75} />
          </Button>
        )}

        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground hidden md:block">
              {description}
            </p>
          )}
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1 md:gap-2 absolute right-0 md:relative">
          {extraActions}
          {actionButton && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={actionButton.onClick}
              aria-label={actionButton.label}
            >
              <actionButton.icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
