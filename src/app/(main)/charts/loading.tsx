
import { ChartsSkeleton } from "@/components/charts-page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, Scale } from "lucide-react";


export default function ChartsLoading() {
  return (
    <div className="flex flex-col h-full bg-muted">
      <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
        <Button variant="ghost" size="icon" className="absolute left-4" disabled>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <h1 className="text-xl font-bold text-center w-full">Analisis Keuangan</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Tabs defaultValue="expense" className="w-full flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-3 mx-auto max-w-sm p-1 h-auto mt-4 sticky top-0 z-10">
                <TabsTrigger value="expense" className="flex gap-2 items-center">
                    <ArrowDownLeft className="h-4 w-4" />
                    Pengeluaran
                </TabsTrigger>
                <TabsTrigger value="income" className="flex gap-2 items-center">
                    <ArrowUpRight className="h-4 w-4" />
                    Pemasukan
                </TabsTrigger>
                <TabsTrigger value="net" className="flex gap-2 items-center">
                    <Scale className="h-4 w-4" />
                    Net Income
                </TabsTrigger>
            </TabsList>
            <div className="flex-1 p-4">
                <ChartsSkeleton />
            </div>
        </Tabs>
      </main>
    </div>
  );
}
