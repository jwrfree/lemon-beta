
import { BudgetDetailSkeleton } from "./page";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetDetailLoading() {
  return (
    <div className="flex flex-col h-full bg-muted">
      <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background">
        <Button variant="ghost" size="icon" className="absolute left-4" disabled>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <Skeleton className="h-6 w-40 mx-auto" />
      </header>
      <main className="flex-1 overflow-y-auto">
        <BudgetDetailSkeleton />
      </main>
    </div>
  );
}
