'use client';

import React, { useState, useEffect } from 'react';
import { useAssets } from '../hooks/use-assets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUI } from '@/components/ui-provider';
import { cn } from '@/lib/utils';

interface AssetLiabilityFormProps {
  onClose: () => void;
  initialData?: any | null;
}

const assetCategories = [
    { key: 'cash', label: 'Kas & Setara Kas' },
    { key: 'investment', label: 'Investasi' },
    { key: 'property', label: 'Properti' },
    { key: 'other', label: 'Lainnya' },
];

const liabilityCategories = [
    { key: 'loan', label: 'Pinjaman' },
    { key: 'credit-card', label: 'Kartu Kredit' },
    { key: 'other', label: 'Lainnya' },
];

export const AssetLiabilityForm = ({ onClose, initialData = null }: AssetLiabilityFormProps) => {
    const { addAssetLiability, updateAssetLiability } = useAssets();
    const { showToast } = useUI();
    
    const isEditMode = !!initialData?.id;

    const [type, setType] = useState<'asset' | 'liability'>(initialData?.type || 'asset');
    const [name, setName] = useState(initialData?.name || '');
    const [value, setValue] = useState('');
    const [categoryKey, setCategoryKey] = useState(initialData?.categoryKey || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const itemData = {
            name,
            value: parseInt(value.replace(/[^0-9]/g, '')),
            categoryKey,
        };

        try {
            if (isEditMode) {
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
    const categories = type === 'asset' ? assetCategories : liabilityCategories;

    return (
        <>
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                <h2 className="text-xl font-bold">{title}</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="bg-muted rounded-full"
                    aria-label="Tutup formulir"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Tutup formulir</span>
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                {!isEditMode && (
                    <div className="grid w-full grid-cols-2 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('asset')}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                type === 'asset' ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                            )}
                        >
                            Aset
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('liability')}
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                type === 'liability' ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"
                            )}
                        >
                            Liabilitas
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Nama {type === 'asset' ? 'Aset' : 'Liabilitas'}</Label>
                    <Input
                        id="name"
                        placeholder={type === 'asset' ? 'e.g., Rumah, Saham BBCA' : 'e.g., KPR, Cicilan Mobil'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="value">Nilai / Jumlah</Label>
                    <Input
                        id="value"
                        placeholder="Rp 0"
                        value={value}
                        onChange={handleAmountChange}
                        required
                        inputMode="numeric"
                        size="lg"
                        className="text-2xl font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="categoryKey">Kategori</Label>
                    <Select onValueChange={setCategoryKey} value={categoryKey}>
                        <SelectTrigger id="categoryKey">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.key} value={cat.key}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </form>
            <div className="p-4 border-t sticky bottom-0 bg-background z-10">
                <Button type="submit" onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : ''}`}
                </Button>
            </div>
        </>
    );
};
