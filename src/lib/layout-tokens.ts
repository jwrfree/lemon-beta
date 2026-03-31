/**
 * Semantic layout tokens for shared page shells.
 *
 * These tokens standardize scroll ownership, width tiers, sticky page chrome,
 * and body spacing across mobile and desktop internal pages.
 */

export type PageWidth = 'compact' | 'standard' | 'wide' | 'full';

export const pageWidth = {
  compact: 'max-w-5xl',
  standard: 'max-w-7xl',
  wide: 'max-w-[1600px]',
  full: 'max-w-none',
} as const;

export const pageShell = {
  root: 'flex min-h-0 flex-1 flex-col bg-background',
  bodyBase: 'mx-auto w-full min-h-0 px-4 py-4 pb-6 md:px-6 md:py-6 md:pb-10',
  headerChrome:
    'sticky top-0 z-30 shrink-0 border-b border-border/15 bg-background/88 backdrop-blur-md',
  stickyFooter:
    'sticky bottom-0 inset-x-0 z-30 border-t border-border/15 bg-background/92 px-4 py-3 backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-4',
} as const;

export const spacing = {
  /** Canonical standard-width page body */
  container: `${pageShell.bodyBase} ${pageWidth.standard} space-y-6`,
  containerCompact: `${pageShell.bodyBase} ${pageWidth.compact} space-y-6`,
  containerWide: `${pageShell.bodyBase} ${pageWidth.wide} space-y-6`,

  /** Vertical rhythm between sections */
  section: 'space-y-6',

  /** Premium card inner content padding */
  cardPremium: 'p-7',

  /** Flat card inner content padding */
  cardFlat: 'p-4',

  /** Card grid gap */
  gridGap: 'gap-4',

  /** Form / stack field gap */
  stack: 'space-y-4',
} as const;

/** Alias exported as `layout` for ergonomic JSX usage: `className={layout.container}` */
export const layout = spacing;
