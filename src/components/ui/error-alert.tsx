'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ErrorAlertVariant = 'validation' | 'network' | 'server' | 'empty';

interface ErrorAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Error category:
   * - `validation` — user input issue
   * - `network`    — connection / timeout failure
   * - `server`     — unexpected server / system error
   * - `empty`      — empty / fallback state (data unavailable)
   */
  variant?: ErrorAlertVariant;
  /** Primary error message shown to the user. */
  message: string;
  /** Optional descriptive detail shown below the message. */
  description?: string;
  /** Label for the retry button. Pass `undefined` to hide. */
  retryLabel?: string;
  /** Callback invoked when the retry button is pressed. */
  onRetry?: () => void;
}

const variantConfig: Record<
  ErrorAlertVariant,
  { Icon: React.ElementType; defaultMessage: string }
> = {
  validation: {
    Icon: AlertCircle,
    defaultMessage: 'Periksa kembali isian kamu.',
  },
  network: {
    Icon: WifiOff,
    defaultMessage: 'Koneksi bermasalah. Coba lagi.',
  },
  server: {
    Icon: ServerCrash,
    defaultMessage: 'Terjadi kesalahan pada sistem.',
  },
  empty: {
    Icon: AlertCircle,
    defaultMessage: 'Data belum tersedia.',
  },
};

/**
 * ErrorAlert — block-level inline error notification.
 *
 * Use this for:
 * - Network failure after a failed fetch/mutation
 * - Server error returned from an API call
 * - Form-level validation summary
 * - Empty/fallback states that signal a failure
 *
 * Design System: §10 — Error State Guidelines
 * Accessibility: renders as role="alert" with aria-live="assertive".
 */
const ErrorAlert = React.forwardRef<HTMLDivElement, ErrorAlertProps>(
  (
    {
      variant = 'server',
      message,
      description,
      retryLabel = 'Coba Lagi',
      onRetry,
      className,
      ...props
    },
    ref
  ) => {
    const { Icon } = variantConfig[variant];

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(
          'flex items-start gap-3 rounded-card border border-error-border bg-error-surface p-4 text-sm',
          className
        )}
        {...props}
      >
        <Icon
          className="mt-0.5 h-4 w-4 shrink-0 text-error"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-medium text-error leading-snug">{message}</p>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-7 px-2 text-xs text-error hover:bg-error-muted hover:text-error border-none"
            >
              <RefreshCw className="mr-1.5 h-3 w-3" aria-hidden="true" />
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }
);
ErrorAlert.displayName = 'ErrorAlert';

export { ErrorAlert, ErrorAlert as ErrorBanner, type ErrorAlertVariant };
