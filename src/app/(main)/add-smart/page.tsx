
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Paperclip, Camera, Send, LoaderCircle, Pencil, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { categoryDetails } from '@/lib/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { extractTransaction } from '@/ai/flows/extract-transaction-flow';
import { scanReceipt } from '@/ai/flows/scan-receipt-flow';
import Image from 'next/image';
import { isSameMonth, parseISO } from 'date-fns';

type Message = {
    id: string;
    type: 'user' | 'user-image' | 'ai-thinking' | 'ai-confirmation';
    content: any;
};

export default function SmartAddPage() {
    const router = useRouter();
    const { addTransaction, wallets, expenseCategories, incomeCategories, budgets, transactions } = useApp();
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const availableCategories = [...expenseCategories.map(c => c.name), ...incomeCategories.map(c => c.name)];
    const availableWallets = wallets.map(w => w.name);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const handleSendText = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userInput = inputValue.trim();
        setInputValue('');
        setExtractedData(null);
        setIsLoading(true);

        const newMessages: Message[] = [
            { id: `user-${Date.now()}`, type: 'user', content: userInput },
            { id: `ai-thinking-${Date.now()}`, type: 'ai-thinking', content: 'Menganalisis...' }
        ];
        setMessages(newMessages);

        try {
            const result = await extractTransaction({
                text: userInput,
                availableCategories,
                availableWallets
            });
            
            const matchingWallet = wallets.find(w => w.name.toLowerCase() === result.wallet?.toLowerCase());

            const dataToConfirm = {
                type: result.amount > 0 ? (result.category === 'Gaji' || result.category === 'Bonus' || result.category === 'Investasi' ? 'income' : 'expense') : 'expense',
                amount: result.amount || 0,
                description: result.description || 'Transaksi baru',
                category: result.category || '',
                walletId: matchingWallet?.id || wallets.find(w=>w.isDefault)?.id || '',
                location: result.location || '',
                date: new Date().toISOString(),
            };
            
            setExtractedData(dataToConfirm);
            setMessages(prev => [
                ...prev.filter(m => m.type !== 'ai-thinking'),
                { id: `ai-confirm-${Date.now()}`, type: 'ai-confirmation', content: dataToConfirm }
            ]);

        } catch (error) {
            console.error("AI extraction failed:", error);
            toast.error("Oops! Gagal menganalisis transaksimu. Coba lagi ya.");
             setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const imageDataUrl = loadEvent.target?.result as string;
            handleSendImage(imageDataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleSendImage = async (imageDataUrl: string) => {
        if (!imageDataUrl || isLoading) return;
        
        setInputValue('');
        setExtractedData(null);
        setIsLoading(true);

        const newMessages: Message[] = [
            { id: `user-image-${Date.now()}`, type: 'user-image', content: imageDataUrl },
            { id: `ai-thinking-${Date.now()}`, type: 'ai-thinking', content: 'Membaca struk...' }
        ];
        setMessages(newMessages);

        try {
             const result = await scanReceipt({
                photoDataUri: imageDataUrl,
                availableCategories,
            });
            
            const dataToConfirm = {
                type: 'expense',
                amount: result.amount || 0,
                description: result.description || 'Transaksi dari struk',
                category: result.category || '',
                walletId: wallets.find(w=>w.isDefault)?.id || '',
                location: result.merchant || '',
                date: result.transactionDate ? new Date(result.transactionDate).toISOString() : new Date().toISOString(),
            };
            
            setExtractedData(dataToConfirm);
            setMessages(prev => [
                ...prev.filter(m => m.type !== 'ai-thinking'),
                { id: `ai-confirm-${Date.now()}`, type: 'ai-confirmation', content: dataToConfirm }
            ]);

        } catch (error) {
            console.error("AI receipt scan failed:", error);
            toast.error("Oops! Gagal membaca struk. Coba foto lagi atau masukkan manual ya.");
            setMessages(prev => prev.filter(m => m.type !== 'ai-thinking'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveTransaction = async () => {
        if (!extractedData || !extractedData.walletId) {
            toast.error("Gagal menyimpan.", { description: "Harap pilih dompet terlebih dahulu." });
            return;
        }
        setIsLoading(true);
        try {
            await addTransaction(extractedData);
            toast.success("Transaksi berhasil disimpan!");
            router.back();
        } catch (error) {
            console.error("Failed to save transaction:", error);
            toast.error("Gagal menyimpan transaksi.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateExtractedData = (field: string, value: any) => {
        setExtractedData((prev: any) => ({ ...prev, [field]: value }));
    };

    const { icon: CategoryIcon } = extractedData ? categoryDetails(extractedData.category) : { icon: null };

    const budgetInsight = useMemo(() => {
        if (!extractedData?.category || !budgets.length) return null;

        const relevantBudget = budgets.find(b => b.categories.includes(extractedData.category));
        if (!relevantBudget) return null;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const spent = transactions
            .filter(t => 
                t.type === 'expense' && 
                relevantBudget.categories.includes(t.category) &&
                parseISO(t.date) >= startOfMonth
            )
            .reduce((acc, t) => acc + t.amount, 0);
        
        const remaining = relevantBudget.targetAmount - spent;

        return `Sisa budget '${relevantBudget.name}' kamu bulan ini ${formatCurrency(remaining)}`;

    }, [extractedData, budgets, transactions]);


    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Catat Transaksi Baru</h1>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                {msg.type === 'user' && (
                                    <div className="flex justify-end">
                                        <Card className="p-3 bg-primary text-primary-foreground max-w-xs sm:max-w-sm break-words">
                                            {msg.content}
                                        </Card>
                                    </div>
                                )}
                                {msg.type === 'user-image' && (
                                    <div className="flex justify-end">
                                        <Card className="p-2 bg-primary max-w-xs sm:max-w-sm break-words">
                                            <Image src={msg.content} alt="Receipt" width={200} height={200} className="rounded-md" />
                                        </Card>
                                    </div>
                                )}
                                {msg.type === 'ai-thinking' && (
                                    <div className="flex justify-start">
                                        <Card className="p-3 bg-card max-w-xs sm:max-w-sm flex items-center gap-2">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            {msg.content}
                                        </Card>
                                    </div>
                                )}
                                {msg.type === 'ai-confirmation' && extractedData && (
                                    <Card className="p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            {isEditing ? (
                                                 <Input
                                                    type="text"
                                                    value={extractedData.amount}
                                                    onChange={(e) => updateExtractedData('amount', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                                                    className="text-3xl font-bold h-auto p-0 border-none focus-visible:ring-0"
                                                    autoFocus
                                                    onBlur={() => setIsEditing(false)}
                                                />
                                            ) : (
                                                <h3 className="text-3xl font-bold">{formatCurrency(extractedData.amount)}</h3>
                                            )}
                                            <Button size="icon" variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                                                {isEditing ? <Check className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
                                            </Button>
                                        </div>

                                        {isEditing ? (
                                            <Input
                                                value={extractedData.description}
                                                onChange={(e) => updateExtractedData('description', e.target.value)}
                                                className="font-medium text-lg h-auto p-0 border-none focus-visible:ring-0"
                                            />
                                        ) : (
                                            <p className="font-medium text-lg">{extractedData.description}</p>
                                        )}
                                        <Separator />
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="w-24 text-sm text-muted-foreground">Kategori</span>
                                                <Select value={extractedData.category} onValueChange={(v) => updateExtractedData('category', v)}>
                                                    <SelectTrigger className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                                                            <SelectValue placeholder="Pilih kategori" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {expenseCategories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                        ))}
                                                        <Separator className="my-1"/>
                                                        {incomeCategories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="w-24 text-sm text-muted-foreground">Bayar pakai</span>
                                                 <Select value={extractedData.walletId} onValueChange={(v) => updateExtractedData('walletId', v)}>
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Pilih dompet" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {wallets.map(w => (
                                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                 {extractedData && (
                    <div className="p-4 border-t bg-background space-y-3">
                         {budgetInsight && (
                            <div className="text-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-sm">
                                💡 {budgetInsight}
                            </div>
                         )}
                        <Button size="lg" className="w-full" onClick={handleSaveTransaction} disabled={isLoading}>
                             {isLoading ? <LoaderCircle className="animate-spin" /> : <><Check className="mr-2 h-5 w-5" /> Simpan Transaksi</>}
                        </Button>
                    </div>
                )}
            </main>

            <div className="p-2 border-t bg-background">
                <div className="relative">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                    />
                    <Textarea
                        placeholder="Tulis, tempel, atau foto transaksimu di sini..."
                        className="pr-24 min-h-[48px] max-h-48"
                        rows={1}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendText();
                            }
                        }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}><Camera className="h-5 w-5" /></Button>
                        <Button size="icon" variant="default" onClick={handleSendText} disabled={!inputValue.trim() || isLoading}>
                            {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
