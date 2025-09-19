
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useApp } from "@/components/app-provider";
import { AssetLiabilityList } from '@/components/asset-liability-list';
import { AssetLiabilityForm } from '@/components/asset-liability-form';

export default function NetWorthPage() {
  const { isLoading, assets, liabilities } = useApp();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);

  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const isPositive = netWorth >= 0;

  const handleEdit = (item: any, type: 'asset' | 'liability') => {
    setItemToEdit({ ...item, type });
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setItemToEdit(null);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setItemToEdit(null);
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-muted">
        <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
            <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
            </Button>
            <h1 className="text-xl font-bold text-center w-full">Aset & Liabilitas</h1>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute right-4" onClick={handleAdd}>
                        <Plus className="h-6 w-6" strokeWidth={1.75} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="p-0 rounded-t-2xl max-h-[85vh] flex flex-col" onInteractOutside={handleSheetClose}>
                    <AssetLiabilityForm initialData={itemToEdit} onClose={handleSheetClose} />
                </SheetContent>
            </Sheet>
        </header>
        <main className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Kekayaan Bersih</p>
                    <p className={`text-4xl font-extrabold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCurrency(netWorth)}
                    </p>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Aset</CardTitle>
                            <span className="font-bold text-lg text-emerald-600">{formatCurrency(totalAssets)}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AssetLiabilityList type="asset" items={assets} onEdit={handleEdit} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                         <div className="flex justify-between items-center">
                            <CardTitle>Liabilitas</CardTitle>
                            <span className="font-bold text-lg text-rose-600">{formatCurrency(totalLiabilities)}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AssetLiabilityList type="liability" items={liabilities} onEdit={handleEdit} />
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  )
}
