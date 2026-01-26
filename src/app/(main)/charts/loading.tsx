import { LoaderCircle } from 'lucide-react';
import { PageHeader } from "@/components/page-header";

export default function ChartsLoading() {
    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Statistik & Insight" />
            <div className="flex flex-1 items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    );
}
