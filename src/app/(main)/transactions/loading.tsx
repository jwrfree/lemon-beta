
import { TransactionsSkeleton } from "./page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ListFilter, Search } from "lucide-react";


export default function TransactionsLoading() {
    return (
        <div className="flex flex-col h-full bg-muted overflow-y-auto pb-16">
            <header className="h-16 flex items-center gap-2 relative px-4 shrink-0 border-b bg-background sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="shrink-0" disabled>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cari transaksi..."
                        className="pl-10"
                        disabled
                    />
                </div>
                 <Button variant="ghost" size="icon" className="shrink-0 relative" disabled>
                    <ListFilter className="h-5 w-5" />
                </Button>
            </header>
            
            <div className="p-4 flex flex-col gap-3 bg-background border-b sticky top-16 z-10">
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="income">Pemasukan</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <main className="space-y-2">
                <TransactionsSkeleton />
            </main>
        </div>
    );
}
