'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RetrySectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message displayed above the retry button. */
  message?: string;
  /** Label for the retry button. Defaults to "Coba Lagi". */
  retryLabel?: string;
  /** Callback invoked when the retry button is pressed. */
  onRetry: () => void;
  /** Whether a retry is in progress. Disables the button when true. */
  isRetrying?: boolean;
}

/**
 * RetrySection — a self-contained retry prompt.
 *
 * Use this when a section of the page failed to load and the user
 * can trigger a refetch without navigating away.
 *
 * Design System: §10 — Error State Guidelines
 * Accessibility: container renders with role="status" and aria-live="polite".
 */
const RetrySection = React.forwardRef<HTMLDivElement, RetrySectionProps>(
  (
    {
      message = 'Gagal memuat data.',
      retryLabel = 'Coba Lagi',
      onRetry,
      isRetrying = false,
      className,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-error-border bg-error-surface p-6 text-center text-sm',
        className
      )}
      {...props}
    >
      <p className="text-error font-medium">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
        className="border-error-border text-error hover:bg-error-muted hover:text-error"
      >
        <RefreshCw
          className={cn('mr-1.5 h-3.5 w-3.5', isRetrying && 'animate-spin')}
          aria-hidden="true"
        />
        {retryLabel}
      </Button>
    </div>
  )
);
RetrySection.displayName = 'RetrySection';

export { RetrySection };
