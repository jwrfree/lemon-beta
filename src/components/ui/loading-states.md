1. Page skeleton   — full-page skeleton on initial route load
                     Use: DashboardSkeleton pattern, extend for other pages
2. Card skeleton   — skeleton inside a card/widget while data loads
                     Use: <Skeleton> primitive with consistent height/width
3. Button loading  — spinner inside button while async action is pending
                     Use: existing button variant with loading prop
4. Empty/Error     — after load, if no data or fetch failed
                     Use: shared <EmptyState> or <ErrorAlert>

NEVER use: animate-pulse divs (use Skeleton primitive instead)
NEVER use: null returns without a skeleton (causes layout shift)
