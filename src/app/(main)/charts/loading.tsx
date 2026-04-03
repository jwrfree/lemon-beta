import { PageHeader } from "@/components/page-header";

export default function ChartsLoading() {
    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Statistik & Insight" />
            <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
        </div>
    );
}

