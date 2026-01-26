"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "@/types/models";

interface ExportButtonProps {
    transactions: Transaction[];
}

export const ExportButton = ({ transactions }: ExportButtonProps) => {
    const handleExport = () => {
        if (!transactions || transactions.length === 0) return;

        // 1. Definisi Header CSV
        const headers = ["Tanggal", "Deskripsi", "Kategori", "Jumlah", "Tags"];
        
        // 2. Konversi Data ke Baris CSV
        const csvContent = [
            headers.join(","),
            ...transactions.map(t => {
                const date = t.date ? format(new Date(t.date), "yyyy-MM-dd") : "";
                // Escape tanda kutip ganda untuk format CSV yang valid
                const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : "";
                const cat = t.category || "";
                const amount = t.amount || 0;
                const tags = t.tags && t.tags.length > 0 ? `"${t.tags.join(", ")}"` : "";
                
                return [date, desc, cat, amount, tags].join(",");
            })
        ].join("\n");

        // 3. Buat Blob dan Trigger Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `lemon-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={handleExport} disabled={!transactions || transactions.length === 0}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Ekspor CSV</span>
        </Button>
    );
};

export default ExportButton;
