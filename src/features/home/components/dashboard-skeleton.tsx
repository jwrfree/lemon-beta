import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-52 hidden lg:block rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Finance Overview Skeleton (4 Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Content Area (Col 8) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {/* Cashflow Chart */}
                            <Skeleton className="md:col-span-3 h-[350px] rounded-xl" />
                            {/* Expense Pie */}
                            <Skeleton className="md:col-span-2 h-[350px] rounded-xl" />
                        </div>
                        {/* Recent Transactions */}
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>

                    {/* Sidebar Area (Col 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};