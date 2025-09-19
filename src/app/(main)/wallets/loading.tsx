
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";

export default function WalletsLoading() {
  return (
    <div className="flex flex-col bg-muted h-full">
      <header className="h-16 flex items-center relative px-4 shrink-0 bg-muted z-20 border-b">
        <Button variant="ghost" size="icon" className="absolute left-4" disabled>
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </Button>
        <h1 className="text-xl font-bold text-center w-full">Dompet Kamu</h1>
        <Button variant="ghost" size="icon" className="absolute right-4" disabled>
          <Plus className="h-6 w-6" strokeWidth={1.75} />
        </Button>
      </header>
      <div className="flex flex-col flex-1 p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="space-y-2 pt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
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
    </div>
  );
}
