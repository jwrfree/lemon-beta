import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const DashboardSkeleton = () => {
    return (
        <div className="w-full h-full flex flex-col bg-zinc-50/50 dark:bg-black/50">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-48 hidden lg:block rounded-card bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-10 w-10 rounded-card bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-10 w-10 rounded-card bg-zinc-200 dark:bg-zinc-800" />
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Finance Overview Skeleton (4 Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-5 border-zinc-200/60 dark:border-zinc-800/60 rounded-card-glass shadow-sm bg-white dark:bg-zinc-900">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-7 w-32" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-card" />
                            </div>
                            <Skeleton className="h-3 w-24" />
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Content Area (Col 8) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                            {/* Cashflow Chart */}
                            <Card className="md:col-span-3 p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-card-premium bg-white dark:bg-zinc-900">
                                <div className="flex justify-between items-center mb-6">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-[280px] w-full rounded-card" />
                            </Card>
                            {/* Expense Pie */}
                            <Card className="md:col-span-2 p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-card-premium bg-white dark:bg-zinc-900">
                                <Skeleton className="h-6 w-32 mb-8 mx-auto" />
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    <Skeleton className="h-48 w-48 rounded-full" />
                                    <div className="w-full space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        {/* Recent Transactions */}
                        <Card className="p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-card-premium bg-white dark:bg-zinc-900">
                             <div className="flex justify-between items-center mb-6">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded-card" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Area (Col 4) */}
                    <div className="lg:col-span-4 space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-card-glass bg-white dark:bg-zinc-900 space-y-4">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-20 w-full rounded-card" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};