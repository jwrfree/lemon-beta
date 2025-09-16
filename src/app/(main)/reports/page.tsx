import { SummaryGenerator } from "@/components/reports/summary-generator";

export default function ReportsPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <SummaryGenerator />
    </div>
  );
}
