'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle, Wrench, RefreshCw } from 'lucide-react';
import { categories } from '@/lib/categories';
import { useAuth } from '@/providers/auth-provider';

export default function RepairPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<string>('');
    const [result, setResult] = useState<{ total: number, fixed: number } | null>(null);
    const [logs, setLogs] = useState<string[]>([]); // New: Logs for debugging
    const { user } = useAuth();
    const supabase = createClient();

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleFixData = async () => {
        if (!user) {
            addLog("Error: User not logged in");
            return;
        }

        setIsLoading(true);
        setLogs([]);
        setResult(null);
        addLog("Starting repair process...");

        try {
            // 1. Fetch ALL transactions to be safe (client-side filtering)
            // Sometimes .is('null') behaves weirdly with empty strings
            addLog("Fetching all transactions...");

            const { data: txs, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                addLog(`Database Error: ${JSON.stringify(error)}`);
                throw error;
            }

            if (!txs || txs.length === 0) {
                addLog("No transactions found in database.");
                setIsLoading(false);
                return;
            }

            // 2. Filter locally for empty sub-categories (null or "")
            const targets = txs.filter(t => !t.sub_category || t.sub_category === "");

            if (targets.length === 0) {
                addLog("All transactions already have sub-categories! Nothing to fix.");
                setIsLoading(false);
                return;
            }

            addLog(`Found ${targets.length} target transactions.`);
            setProgress(`Fixing ${targets.length} transactions...`);

            let fixedCount = 0;
            const allCats = [...categories.expense, ...categories.income];

            // 3. Process updates sequentially
            for (const tx of targets) {
                // Find category definition
                const parentCat = allCats.find(c => c.name === tx.category);

                if (parentCat && parentCat.sub_categories && parentCat.sub_categories.length > 0) {
                    let targetSub = parentCat.sub_categories[0]; // Default
                    const desc = (tx.description || "").toLowerCase();

                    // Smart Guessing Logic
                    if (parentCat.name === 'Makanan') {
                        if (desc.includes('kopi') || desc.includes('coffee') || desc.includes('starbucks') || desc.includes('janji jiwa')) targetSub = 'Kopi';
                        else if (desc.includes('martabak') || desc.includes('snack') || desc.includes('roti')) targetSub = 'Jajanan';
                        else if (desc.includes('belanja') || desc.includes('pasar') || desc.includes('sayur')) targetSub = 'Bahan Makanan';
                    } else if (parentCat.name === 'Transportasi') {
                        if (desc.includes('gojek') || desc.includes('grab') || desc.includes('maxim') || desc.includes('ojol')) targetSub = 'Gojek/Grab';
                        if (desc.includes('bensin') || desc.includes('pertamina') || desc.includes('shell') || desc.includes('isi bbm')) targetSub = 'Bensin';
                    } else if (parentCat.name === 'Belanja') {
                        if (desc.includes('tokopedia') || desc.includes('shopee')) targetSub = 'Online Shopping';
                    }

                    // Perform Update
                    const { error: updateError } = await supabase
                        .from('transactions')
                        .update({ sub_category: targetSub } as any)
                        .eq('id', tx.id);

                    if (updateError) {
                        addLog(`Failed to update TX ${tx.id}: ${updateError.message}`);
                    } else {
                        fixedCount++;
                        // addLog(`Fixed: ${tx.description} -> ${targetSub}`); // Too noisy
                    }
                } else {
                    addLog(`Skipped: TX ${tx.id} (${tx.category}) - No sub-categories defined`);
                }
            }

            setResult({ total: targets.length, fixed: fixedCount });
            addLog(`Success! Fixed ${fixedCount} transactions.`);

        } catch (err: any) {
            console.error(err);
            addLog(`CRITICAL ERROR: ${err.message || JSON.stringify(err)}`);
        } finally {
            setIsLoading(false);
            setProgress("");
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4 min-h-screen flex items-center justify-center">
            <Card className="border-border shadow-xl w-full">
                <CardHeader className="text-center pb-6 border-b border-border">
                    <div className="mx-auto w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 shadow-inner">
                        <Wrench className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-medium text-foreground">Database Repair Tool</CardTitle>
                    <CardDescription>
                        Memerbaiki data <strong>Sub-Kategori</strong> yang hilang pada transaksi lama.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-6 pt-6">
                    {result ? (
                        <div className="bg-success/10 p-6 rounded-lg border border-success/20 text-center animate-in zoom-in-95 duration-300">
                            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                            <h3 className="text-xl font-medium text-success mb-1">Perbaikan Selesai!</h3>
                            <p className="text-muted-foreground mb-6 font-medium">
                                Berhasil memperbaiki <span className="text-2xl font-medium text-success">{result.fixed}</span> item.
                            </p>
                            <Button size="lg" onClick={() => window.location.href = '/home'} className="w-full shadow-lg shadow-primary/20">
                                Kembali ke Dashboard
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-info/10 p-4 rounded-lg flex gap-3 items-start border border-info/20">
                                <AlertTriangle className="w-5 h-5 text-info shrink-0 mt-0.5" />
                                <div className="text-sm text-foreground/80">
                                    <p className="font-medium mb-1 text-info">Cara Kerja:</p>
                                    <p className="leading-relaxed opacity-90">Tool ini akan men-scan semua transaksi Anda. Jika ada yang sub-kategori-nya kosong, sistem akan otomatis mengisinya dengan default kategori atau menebak berdasarkan deskripsi.</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleFixData}
                                disabled={isLoading}
                                size="lg"
                                className="w-full h-14 text-lg font-medium shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Memproses Data...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-5 w-5" />
                                        <span>Jalankan Perbaikan</span>
                                    </div>
                                )}
                            </Button>
                        </>
                    )}

                    {/* Console Log Area */}
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-emerald-400 h-48 overflow-y-auto w-full shadow-inner border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 uppercase font-medium tracking-wider">System Log</span>
                            {logs.length > 0 && <span className="text-slate-500 cursor-pointer hover:text-white" onClick={() => setLogs([])}>Clear</span>}
                        </div>
                        {logs.length === 0 ? (
                            <span className="text-slate-700 italic">Ready to scan...</span>
                        ) : (
                            logs.map((log, i) => <div key={i} className="border-l-2 border-slate-800 pl-2 mb-1">{log}</div>)
                        )}
                        {isLoading && <span className="animate-pulse">_</span>}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

