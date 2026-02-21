'use client';

import React, { useState, useEffect } from 'react';
import { useAssets } from '../hooks/use-assets';
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES, type AssetCategory } from '../constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useUI } from '@/components/ui-provider';
import { cn } from '@/lib/utils';
import type { Asset, Liability } from '@/types/models';

type AssetOrLiabilityWithMeta = (Asset & { type: 'asset' }) | (Liability & { type: 'liability' });
type AssetOrLiabilityFormInitialData = (Partial<Asset> & { type: 'asset' }) | (Partial<Liability> & { type: 'liability' });

interface AssetLiabilityFormProps {
    onClose: () => void;
    initialData?: AssetOrLiabilityFormInitialData | null;
}

export const AssetLiabilityForm = ({ onClose, initialData = null }: AssetLiabilityFormProps) => {
    const { addAssetLiability, updateAssetLiability } = useAssets();
    const { showToast } = useUI();

    const isEditMode = !!initialData?.id;

    const [type, setType] = useState<'asset' | 'liability'>(initialData?.type || 'asset');
    const [name, setName] = useState(initialData?.name || '');
    const [value, setValue] = useState('');
    const [quantity, setQuantity] = useState((initialData as Partial<Asset>)?.quantity?.toString() || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [categoryKey, setCategoryKey] = useState(initialData?.categoryKey || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCategory = ASSET_CATEGORIES.find(c => c.key === categoryKey);
    const hasUnit = type === 'asset' && selectedCategory?.unit;

    useEffect(() => {
        if (initialData?.value) {
            const formattedValue = new Intl.NumberFormat('id-ID').format(initialData.value);
            setValue(formattedValue);
        }
    }, [initialData]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setValue(formattedValue);
    };

    const handleTypeChange = (newType: 'asset' | 'liability') => {
        setType(newType);
        setCategoryKey(''); // Reset category when type changes
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !value || !categoryKey) {
            showToast('Harap isi semua kolom yang wajib diisi.', 'error');
            return;
        }
        setIsSubmitting(true);
        const parsedQuantity = hasUnit ? parseFloat(quantity.replace(',', '.')) : undefined;
        const itemData = {
            name,
            value: parseInt(value.replace(/[^0-9]/g, '')),
            categoryKey,
            notes,
            quantity: hasUnit ? (isNaN(parsedQuantity as number) ? 0 : parsedQuantity) : undefined,
        };

        try {
            if (isEditMode && initialData?.id) {
                await updateAssetLiability(initialData.id, type, itemData);
            } else {
                await addAssetLiability({ ...itemData, type });
            }
            onClose();
        } catch (error) {
            showToast(`Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} entri.`, 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = isEditMode ? `Edit ${type === 'asset' ? 'Aset' : 'Liabilitas'}` : 'Tambah Entri Baru';

    const assetGroups = React.useMemo(() => {
        const groups: Record<string, AssetCategory[]> = {};
        ASSET_CATEGORIES.forEach(cat => {
            if (cat.hidden) return;
            const groupName = cat.group || 'Lainnya';
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(cat);
        });
        return groups;
    }, []);

    return (
        <div className="w-full h-full md:h-auto flex flex-col bg-background md:rounded-xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
                <h2 className="text-xl font-medium">{title}</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="bg-muted rounded-full hover:bg-muted/80"
                    aria-label="Tutup formulir"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Tutup formulir</span>
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                <div className="flex-1 space-y-4">
                    {!isEditMode && (
                        <Tabs value={type} onValueChange={(v) => handleTypeChange(v as 'asset' | 'liability')} className="w-full">
                            <TabsList className="bg-muted p-1 rounded-2xl h-11 w-full grid grid-cols-2">
                                <TabsTrigger value="asset" className="h-full rounded-xl font-medium text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Aset</TabsTrigger>
                                <TabsTrigger value="liability" className="h-full rounded-xl font-medium text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">Liabilitas</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="categoryKey" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kategori</Label>
                        <Select onValueChange={setCategoryKey} value={categoryKey}>
                            <SelectTrigger id="categoryKey" className="h-12 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {type === 'asset' ? (
                                    Object.entries(assetGroups).map(([groupName, cats]) => (
                                        <SelectGroup key={groupName}>
                                            <SelectLabel className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">{groupName}</SelectLabel>
                                            {cats.map((cat) => (
                                                <SelectItem key={cat.key} value={cat.key} className="rounded-lg">
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))
                                ) : (
                                    LIABILITY_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.key} value={cat.key} className="rounded-lg">
                                            {cat.label}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nama {type === 'asset' ? 'Aset' : 'Liabilitas'}</Label>
                        <Input
                            id="name"
                            placeholder={type === 'asset' ? 'e.g., Rumah, Saham BBCA' : 'e.g., KPR, Cicilan Mobil'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-12 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className={cn("grid gap-4", hasUnit ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                        {hasUnit && (
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Jumlah ({selectedCategory?.unit})
                                </Label>
                                <Input
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={`0 ${selectedCategory?.unit}`}
                                    className="h-12 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground px-1 italic">
                                    *Masukkan jumlah {selectedCategory?.unit} untuk tracking harga otomatis.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="value" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {hasUnit ? 'Estimasi Nilai Saat Ini' : 'Nilai / Saldo'}
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">Rp</span>
                                <Input
                                    id="value"
                                    placeholder="0"
                                    value={value}
                                    onChange={handleAmountChange}
                                    required
                                    inputMode="numeric"
                                    className="h-12 pl-11 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 font-medium text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Catatan (Opsional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Tambahkan catatan di sini..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <div className="pt-6 mt-auto">
                    <Button type="submit" className="w-full rounded-lg" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : ''}`}
                    </Button>
                </div>
            </form>
        </div >
    );
};

