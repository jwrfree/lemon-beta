import * as React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

/**
 * ErrorMessage — inline field-level validation error.
 *
 * Usage:
 *   <ErrorMessage>{errors.name?.message}</ErrorMessage>
 *
 * Design System: §10 — Error State Guidelines (Validation Error)
 * Accessibility: renders with role="alert" and aria-live="polite" so
 * screen readers announce the message when it appears.
 */
const ErrorMessage = React.forwardRef<HTMLParagraphElement, ErrorMessageProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <p
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn('text-xs font-medium text-error ml-1 motion-inline-alert', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
ErrorMessage.displayName = 'ErrorMessage';

export { ErrorMessage, ErrorMessage as InlineError };
