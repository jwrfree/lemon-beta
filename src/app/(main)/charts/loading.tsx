import { LoaderCircle } from 'lucide-react';

export default function ChartsLoading() {
    return (
        <div className="flex flex-col h-full bg-muted/30">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-center border-b bg-background/95 px-4 shadow-sm backdrop-blur">
                <h1 className="text-xl font-semibold tracking-tight">Statistik & Insight</h1>
            </header>
            <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    );
}
