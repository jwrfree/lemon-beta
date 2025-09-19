
import { BudgetingSkeleton } from "@/components/budgeting-page";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function BudgetingLoading() {
    return (
         <div className="flex flex-col h-full bg-muted overflow-y-auto pb-16">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
                <h1 className="text-xl font-bold text-center w-full">Anggaran</h1>
                <Button variant="ghost" size="icon" className="absolute right-4" disabled>
                    <PlusCircle className="h-6 w-6" strokeWidth={1.75} />
                </Button>
            </header>
            <main className="flex-1">
                <BudgetingSkeleton />
            </main>
        </div>
    )
}
