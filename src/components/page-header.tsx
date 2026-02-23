
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  showBackButton = true,
  backIcon: BackIcon = ChevronLeft,
  onBackClick,
  actionButton,
  extraActions,
  className,
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
    <header className={cn("h-16 flex items-center shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-30 border-b border-border/10", className)}>
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between relative">
        {/* Mobile Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute left-2 rounded-full hover:bg-muted"
            onClick={handleBack}
            aria-label="Kembali"
          >
            <BackIcon className="h-5 w-5 text-foreground" strokeWidth={2.5} />
          </Button>
        )}

        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:block">
              {description}
            </p>
          )}
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1 md:gap-2 absolute right-4 md:relative">
          {extraActions}
          {actionButton && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
              onClick={actionButton.onClick}
              aria-label={actionButton.label}
            >
              <actionButton.icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
