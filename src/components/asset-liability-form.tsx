
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    const { addAssetLiability, updateAssetLiability, showToast } = useApp();
    
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
                <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                {!isEditMode && (
                    <Tabs value={type} onValueChange={(v) => handleTypeChange(v as 'asset' | 'liability')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="asset">Aset</TabsTrigger>
                            <TabsTrigger value="liability">Liabilitas</TabsTrigger>
                        </TabsList>
                    </Tabs>
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
                        className="text-2xl h-14 font-bold"
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
                <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : ''}`}
                </Button>
            </div>
        </>
    );
};
