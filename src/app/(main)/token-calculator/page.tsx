
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, LoaderCircle, Sparkles } from 'lucide-react';
import { countTransactionTokens } from '@/ai/flows/count-tokens-flow';
import { useUI } from '@/components/ui-provider';
import { AnimatePresence, motion } from 'framer-motion';

export default function TokenCalculatorPage() {
    const router = useRouter();
    const { showToast } = useUI();
    const [inputText, setInputText] = useState('Beli 2 kopi di Starbucks pake GoPay 50rb');
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<{ input: number; output: number } | null>(null);

    const handleCalculate = async () => {
        if (!inputText.trim()) {
            showToast('Harap masukkan teks untuk dihitung.', 'error');
            return;
        }
        setIsCalculating(true);
        setResult(null);
        try {
            const tokenCounts = await countTransactionTokens(inputText);
            setResult(tokenCounts);
        } catch (error) {
            console.error('Token calculation failed:', error);
            showToast('Gagal menghitung token. Coba lagi.', 'error');
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4"
                    onClick={() => router.back()}
                    aria-label="Kembali"
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Kalkulator Token AI</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Hitung Token untuk "Catat Cepat"</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Masukkan teks transaksi untuk melihat perkiraan jumlah token input dan output yang akan digunakan oleh model AI.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="input-text">Teks Transaksi</Label>
                            <Textarea
                                id="input-text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Contoh: Beli bensin 150rb di Shell"
                                rows={3}
                            />
                        </div>
                        <Button onClick={handleCalculate} disabled={isCalculating} className="w-full">
                            {isCalculating ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            {isCalculating ? 'Menghitung...' : 'Hitung Token'}
                        </Button>
                    </CardContent>
                </Card>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Hasil Perhitungan</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Token Input</p>
                                        <p className="text-3xl font-bold">{result.input}</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Token Output</p>
                                        <p className="text-3xl font-bold">{result.output}</p>
                                    </div>
                                    <div className="col-span-2 p-4 bg-primary/10 rounded-lg">
                                         <p className="text-sm text-primary/80">Total Token</p>
                                        <p className="text-3xl font-bold text-primary">{result.input + result.output}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
