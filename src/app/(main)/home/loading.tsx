
import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="overflow-y-auto pb-16 bg-muted">
      <header className="h-16 px-4 flex items-center justify-between sticky top-0 bg-background z-10 border-b">
        <h1 className="text-2xl font-bold text-primary">Lemon</h1>
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
      <main className="flex-1 p-4 space-y-6">
        <CardSkeleton />
        <WalletsSkeleton />
        <TransactionsSkeleton />
      </main>
    </div>
  );
}

const CardSkeleton = () => (
    <div className="p-6 bg-background rounded-lg">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className='space-y-1'>
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className='space-y-1'>
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </div>
    </div>
)

const WalletsSkeleton = () => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dompet Kamu</h2>
            <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
        </div>
    </div>
)

const TransactionsSkeleton = () => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
            <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
    </div>
)
