
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  actionButton?: {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
  };
  extraActions?: React.ReactNode;
}

export const PageHeader = ({
  title,
  showBackButton = true,
  actionButton,
  extraActions,
}: PageHeaderProps) => {
  const router = useRouter();

  return (
    <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4"
          onClick={() => router.back()}
          aria-label="Kembali"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      )}
      <h1 className="text-xl font-bold text-center w-full">{title}</h1>
      {extraActions && (
        <div className="absolute right-4 flex items-center gap-2">
          {extraActions}
          {actionButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={actionButton.onClick}
              aria-label={actionButton.label}
            >
              <actionButton.icon className="h-6 w-6" strokeWidth={1.75} />
            </Button>
          )}
        </div>
      )}
      {!extraActions && actionButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4"
          onClick={actionButton.onClick}
          aria-label={actionButton.label}
        >
          <actionButton.icon className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      )}
    </header>
  );
};
