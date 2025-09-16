"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { transactions, Transaction } from "@/lib/data";
import { Download, Upload } from "lucide-react";

export default function SettingsPage() {

  const handleExport = () => {
    const headers = Object.keys(transactions[0]);
    const csvRows = [
      headers.join(','),
      ...transactions.map(row => 
        headers.map(fieldName => 
          JSON.stringify((row as any)[fieldName], (key, value) => value === null ? '' : value)
        ).join(',')
      )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'lemon-transactions.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Import or export your transaction data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium text-lg">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your transaction data as a CSV file.
              </p>
            </div>
             <Button onClick={handleExport} className="w-fit">
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
          </div>
          <div className="mt-8">
            <h3 className="font-medium text-lg">Import Data</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to import transactions.
            </p>
            <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
                <Input type="file" disabled/>
                <Button type="submit" disabled>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Import functionality is coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
