
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useApp } from "@/components/app-provider";
import { Skeleton } from "@/components/ui/skeleton";

const AssetsLiabilitiesSkeleton = () => (
    <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-10 w-48 mx-auto" />
        </div>
        <Card className="shadow-none border-0">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
        <Card className="shadow-none border-0">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
    </div>
);


export default function NetWorthPage() {
  const { isLoading } = useApp();
  const assets = 48000000
  const liabilities = 7000000
  const netWorth = assets - liabilities
  const isPositive = netWorth >= 0;
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-muted">
        <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
            <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
            </Button>
            <h1 className="text-xl font-bold text-center w-full">Aset & Liabilitas</h1>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute right-4">
                        <Plus className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="p-6 space-y-4 rounded-t-2xl">
                    <h2 className="text-xl font-semibold text-center">Tambah Entri</h2>
                    {/* form input asset/liability */}
                    <p className="text-center text-muted-foreground">Formulir untuk menambah aset atau liabilitas baru akan muncul di sini.</p>
                </SheetContent>
            </Sheet>
        </header>
        <main className="flex-1 overflow-y-auto">
            {isLoading ? <AssetsLiabilitiesSkeleton /> : (
                <div className="p-4 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Kekayaan Bersih</p>
                        <p className={`text-4xl font-extrabold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(netWorth)}
                        </p>
                    </div>

                    {/* Assets */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Aset</CardTitle>
                                <span className="font-bold text-lg text-emerald-600">{formatCurrency(assets)}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Semua aset yang kamu miliki akan muncul di sini.</p>
                        </CardContent>
                    </Card>

                    {/* Liabilities */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <CardTitle>Liabilitas</CardTitle>
                                <span className="font-bold text-lg text-rose-600">{formatCurrency(liabilities)}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Daftar utang atau cicilanmu akan muncul di sini.</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    </div>
  )
}
