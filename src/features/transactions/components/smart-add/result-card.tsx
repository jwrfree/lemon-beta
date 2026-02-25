'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Pencil, ChevronRight, Heart, ShoppingBag, CalendarClock, Tag, CreditCard } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategoryGrid } from '@/features/transactions/components/category-grid';
import { Category } from '@/lib/categories';
import { getMerchantVisuals, getMerchantLogoUrl, getBackupLogoUrl, getGoogleFaviconUrl, markLogoAsFailed, isLogoFailed } from '@/lib/merchant-utils';
import { getVisualDNA, extractBaseColor } from '@/lib/visual-dna';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultCardProps {
    parsedData: any;
    setParsedData: (data: any) => void;
    getCategoryVisuals: (cat: string) => any;
    incomeCategories: Category[];
    expenseCategories: Category[];
}

export const ResultCard = ({ parsedData, setParsedData, getCategoryVisuals, incomeCategories, expenseCategories }: ResultCardProps) => {
    const { wallets } = useWallets();
    const [editDesc, setEditDesc] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [isCatOpen, setIsCatOpen] = useState(false);
    const [isSubCatOpen, setIsSubCatOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        if (parsedData) {
            setEditDesc(parsedData.description || '');
            setEditAmount(String(parsedData.amount || ''));
            try {
                setTimeStr(format(parseISO(parsedData.date), 'HH:mm'));
            } catch {
                // Fallback to current time when date string is invalid or missing
                setTimeStr(format(new Date(), 'HH:mm'));
            }
        }
    }, [parsedData]);

    const allCategories = [...incomeCategories, ...expenseCategories];
    const selectedCategoryObj = allCategories.find(c => c.name === parsedData?.category);
    const selectedWallet = wallets.find(w => w.id === parsedData?.walletId);
    let parsedDate: Date;
    try {
        parsedDate = parsedData?.date ? parseISO(parsedData.date) : new Date();
    } catch {
        // Fallback to current date when stored date string is unparseable
        parsedDate = new Date();
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0] ?? '0', 10);
        const minutes = parseInt(parts[1] ?? '0', 10);
        const newDate = new Date(date);
        newDate.setHours(isNaN(hours) ? 0 : hours);
        newDate.setMinutes(isNaN(minutes) ? 0 : minutes);
        setParsedData({ ...parsedData, date: newDate.toISOString() });
    };

    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTimeStr(newTime);
        const parts = newTime.split(':');
        const hours = parseInt(parts[0] ?? '0', 10);
        const minutes = parseInt(parts[1] ?? '0', 10);
        const newDate = new Date(parsedDate);
        newDate.setHours(isNaN(hours) ? 0 : hours);
        newDate.setMinutes(isNaN(minutes) ? 0 : minutes);
        setParsedData({ ...parsedData, date: newDate.toISOString() });
    };

    if (!parsedData) return null;

    const visuals = getCategoryVisuals(parsedData.category);
    const merchantVisuals = getMerchantVisuals(parsedData.merchant || parsedData.description);
    const dna = getVisualDNA(extractBaseColor(visuals.color));

    // Multi-tier Fallback State: logodev -> clearbit -> favicon -> icon
    const [logoSource, setLogoSource] = useState<'primary' | 'secondary' | 'tertiary' | 'icon'>(() => {
        if (!merchantVisuals?.domain) return 'icon';
        if (isLogoFailed(merchantVisuals.domain)) return 'icon';
        return 'primary';
    });

    useEffect(() => {
        if (merchantVisuals?.domain && !isLogoFailed(merchantVisuals.domain)) {
            setLogoSource('primary');
        } else {
            setLogoSource('icon');
        }
    }, [parsedData.merchant, parsedData.description]);

    const handleLogoError = () => {
        if (logoSource === 'primary') setLogoSource('secondary');
        else if (logoSource === 'secondary') setLogoSource('tertiary');
        else {
            setLogoSource('icon');
            if (merchantVisuals?.domain) markLogoAsFailed(merchantVisuals.domain);
        }
    };

    const primaryLogo = merchantVisuals?.domain ? getMerchantLogoUrl(merchantVisuals.domain) : null;
    const backupLogo = merchantVisuals?.domain ? getBackupLogoUrl(merchantVisuals.domain) : null;
    const googleLogo = merchantVisuals?.domain ? getGoogleFaviconUrl(merchantVisuals.domain) : null;

    const DisplayIcon = merchantVisuals?.icon || visuals.icon;
    const displayColor = merchantVisuals?.color || visuals.color;
    const displayBg = merchantVisuals?.bgColor || visuals.bgColor;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full"
        >
            {/* Apple-style Card Container with Aurora Mesh */}
            <div
                className="bg-white/95 dark:bg-black/60 backdrop-blur-xl rounded-card-premium p-7 shadow-card relative overflow-hidden group border border-white/20 dark:border-white/5"
                style={{ boxShadow: `0 30px 60px -12px ${dna.ambient.replace('0.2', '0.4')}` }}
            >
                {/* Dynamic DNA Ornament */}
                <div
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[60px] opacity-20"
                    style={{ background: dna.primary }}
                ></div>

                {/* 1. HERO AMOUNT (Apple Wallet Style) */}
                <div className="flex flex-col items-center justify-center mb-10 pt-4 relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">Verified Transaction</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground hover:scale-[1.02] active:scale-95 transition-transform cursor-text tabular-nums">
                                {formatCurrency(parsedData.amount)}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-4 rounded-card-glass shadow-xl border-none bg-popover/90 backdrop-blur-xl" side="bottom" sideOffset={10}>
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Edit Amount</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={editAmount}
                                        onChange={e => setEditAmount(e.target.value)}
                                        autoFocus
                                        className="h-11 rounded-md bg-secondary/50 border-none shadow-inner text-lg font-semibold tabular-nums"
                                    />
                                    <Button size="icon" className="h-11 w-11 rounded-md shadow-lg" onClick={() => setParsedData({ ...parsedData, amount: Number(editAmount) })}>
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* 2. iOS SEGMENTED CONTROL (Need vs Want) */}
                <div className="bg-muted/50 p-1 rounded-full grid grid-cols-2 relative mb-8 border border-border/10">
                    {/* Active Indicator Background */}
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-card rounded-full z-0 border border-border/5"
                        initial={false}
                        animate={{
                            x: parsedData.isNeed !== false ? 4 : 'calc(100% - 4px)',
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />

                    <button
                        onClick={() => setParsedData({ ...parsedData, isNeed: true })}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-widest rounded-full transition-colors duration-200",
                            parsedData.isNeed !== false ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground/70"
                        )}
                    >
                        <Heart className={cn("w-3.5 h-3.5 transition-all", parsedData.isNeed !== false ? "fill-rose-500 text-rose-500 scale-110" : "opacity-40")} />
                        Need
                    </button>
                    <button
                        onClick={() => setParsedData({ ...parsedData, isNeed: false })}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-widest rounded-full transition-colors duration-200",
                            parsedData.isNeed === false ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground/70"
                        )}
                    >
                        <ShoppingBag className={cn("w-3.5 h-3.5 transition-all", parsedData.isNeed === false ? "fill-primary text-primary scale-110" : "opacity-40")} />
                        Want
                    </button>
                </div>

                {/* 3. INSET GROUPED LIST (iOS Settings Style) */}
                <div className="bg-muted/30 rounded-card-glass overflow-hidden border border-border/20 shadow-inner">

                    {/* Row 1: Category */}
                    <Popover open={isCatOpen} onOpenChange={setIsCatOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn("w-10 h-10 rounded-card flex items-center justify-center text-white overflow-hidden border border-white/10")}
                                        style={{ background: dna.gradient }}
                                    >
                                        {primaryLogo && logoSource === 'primary' && (
                                            <img
                                                src={primaryLogo}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={handleLogoError}
                                            />
                                        )}
                                        {backupLogo && logoSource === 'secondary' && (
                                            <img
                                                src={backupLogo}
                                                alt=""
                                                className="w-full h-full object-contain p-1"
                                                onError={handleLogoError}
                                            />
                                        )}
                                        {googleLogo && logoSource === 'tertiary' && (
                                            <img
                                                src={googleLogo}
                                                alt=""
                                                className="w-6 h-6 object-contain"
                                                onError={handleLogoError}
                                            />
                                        )}
                                        {(logoSource === 'icon' || !merchantVisuals?.domain) && (
                                            <DisplayIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start space-y-0.5">
                                        <span className="text-sm font-semibold tracking-tight">{parsedData.merchant || parsedData.category}</span>
                                        <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">
                                            {parsedData.merchant ? parsedData.category : (parsedData.subCategory || 'General')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground/40">
                                    <span className="text-xs font-semibold uppercase tracking-widest">Adjust</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-card-premium shadow-xl border-none overflow-hidden" align="center">
                            <div className="p-5 bg-popover/95 backdrop-blur-xl max-h-[320px] overflow-y-auto">
                                <p className="text-xs font-bold text-muted-foreground/40 mb-4 px-1 uppercase tracking-widest">Select Identity</p>
                                <CategoryGrid
                                    categories={parsedData.type === 'income' ? incomeCategories : expenseCategories}
                                    selectedCategory={parsedData.category}
                                    onCategorySelect={(cat) => {
                                        setParsedData({ ...parsedData, category: cat.name, subCategory: '' });
                                        setIsCatOpen(false);
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-px bg-border/10 mx-5" />

                    {/* Row 2: Sub-Category */}
                    {selectedCategoryObj && (selectedCategoryObj.sub_categories?.length ?? 0) > 0 && (
                        <>
                            <Popover open={isSubCatOpen} onOpenChange={setIsSubCatOpen}>
                                <PopoverTrigger asChild>
                                    <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-card bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0 shadow-inner">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col items-start space-y-0.5">
                                                <span className="text-sm font-semibold tracking-tight">{parsedData.subCategory || 'Pilih Sub-kategori'}</span>
                                                <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">Sub-kategori</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground/40">
                                            <span className="text-xs font-semibold uppercase tracking-widest">Adjust</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-0 rounded-card-premium shadow-xl border-none overflow-hidden" align="center">
                                    <div className="p-4 bg-popover/95 backdrop-blur-xl">
                                        <p className="text-xs font-bold text-muted-foreground/40 mb-3 px-1 uppercase tracking-widest">Pilih Sub-kategori</p>
                                        <ScrollArea className="max-h-[240px]">
                                            <div className="space-y-1 pr-1">
                                                {selectedCategoryObj.sub_categories?.map((sub) => (
                                                    <button
                                                        key={sub}
                                                        type="button"
                                                        onClick={() => {
                                                            setParsedData({ ...parsedData, subCategory: sub });
                                                            setIsSubCatOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors",
                                                            parsedData.subCategory === sub
                                                                ? "bg-primary/10 text-primary font-semibold"
                                                                : "hover:bg-muted/60 text-foreground"
                                                        )}
                                                    >
                                                        <span>{sub}</span>
                                                        {parsedData.subCategory === sub && <Check className="w-4 h-4" strokeWidth={3} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className="h-px bg-border/10 mx-5" />
                        </>
                    )}

                    {/* Row 3: Wallet / Fund Source */}
                    <Popover open={isWalletOpen} onOpenChange={setIsWalletOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-card bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0 shadow-inner">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col items-start space-y-0.5">
                                        <span className="text-sm font-semibold tracking-tight">{selectedWallet?.name || 'Pilih Dompet'}</span>
                                        <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">Sumber Dana</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground/40">
                                    <span className="text-xs font-semibold uppercase tracking-widest">Adjust</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0 rounded-card-premium shadow-xl border-none overflow-hidden" align="center">
                            <div className="p-4 bg-popover/95 backdrop-blur-xl">
                                <p className="text-xs font-bold text-muted-foreground/40 mb-3 px-1 uppercase tracking-widest">Pilih Sumber Dana</p>
                                <div className="space-y-1">
                                    {wallets.map((wallet) => (
                                        <button
                                            key={wallet.id}
                                            type="button"
                                            onClick={() => {
                                                setParsedData({ ...parsedData, walletId: wallet.id });
                                                setIsWalletOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors",
                                                parsedData.walletId === wallet.id
                                                    ? "bg-primary/10 text-primary font-semibold"
                                                    : "hover:bg-muted/60 text-foreground"
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: wallet.color || '#3b82f6' }} />
                                                {wallet.name}
                                            </span>
                                            {parsedData.walletId === wallet.id && <Check className="w-4 h-4" strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-px bg-border/10 mx-5" />

                    {/* Row 4: Date & Time */}
                    <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-card bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0 shadow-inner">
                                        <CalendarClock className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col items-start space-y-0.5">
                                        <span className="text-sm font-semibold tracking-tight">
                                            {format(parsedDate, "d MMM yyyy, HH:mm", { locale: dateFnsLocaleId })}
                                        </span>
                                        <span className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">Waktu Transaksi</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground/40">
                                    <span className="text-xs font-semibold uppercase tracking-widest">Adjust</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-card-premium shadow-xl border-none overflow-hidden" align="center">
                            <div className="p-4 bg-popover/95 backdrop-blur-xl space-y-3">
                                <p className="text-xs font-bold text-muted-foreground/40 mb-1 px-1 uppercase tracking-widest">Waktu Transaksi</p>
                                <Calendar
                                    mode="single"
                                    selected={parsedDate}
                                    onSelect={handleDateSelect}
                                    locale={dateFnsLocaleId}
                                    initialFocus
                                />
                                <div className="flex items-center gap-2 px-1">
                                    <div className="relative flex-1">
                                        <Input
                                            type="time"
                                            value={timeStr}
                                            onChange={handleTimeChange}
                                            className="h-10 rounded-md bg-secondary/50 border-none shadow-inner text-sm pl-3"
                                        />
                                    </div>
                                    <Button size="sm" className="h-10 rounded-md shadow-lg px-4" onClick={() => setIsDateOpen(false)}>
                                        <Check className="h-4 w-4" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-px bg-border/10 mx-5" />

                    {/* Row 5: Description */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex items-start justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.99]">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-card bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0 shadow-inner">
                                        <Pencil className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground/80 italic truncate pr-4">
                                        "{parsedData.description}"
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/20 mt-3 shrink-0" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 rounded-card-glass shadow-xl border-none bg-popover/90 backdrop-blur-xl" side="top" sideOffset={10}>
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Keterangan</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        autoFocus
                                        className="h-11 rounded-md bg-secondary/50 border-none shadow-inner text-sm font-medium"
                                        placeholder="Tulis keterangan..."
                                    />
                                    <Button size="icon" className="h-11 w-11 rounded-md shadow-lg" onClick={() => setParsedData({ ...parsedData, description: editDesc })}>
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                </div>
            </div>
        </motion.div>
    );
};

