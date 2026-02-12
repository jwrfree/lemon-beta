import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Control, Controller, FieldValues, Path, UseFormSetValue } from 'react-hook-form';
import { Wallet } from '@/types/models';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletSelectorProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    wallets: Wallet[];
    label: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
    excludedWalletId?: string;
    onCreateNew?: () => void;
}

export function WalletSelector<T extends FieldValues>({
    control,
    name,
    wallets,
    label,
    error,
    placeholder = "Pilih dompet",
    disabled = false,
    excludedWalletId,
    onCreateNew
}: WalletSelectorProps<T>) {

    const availableWallets = excludedWalletId
        ? wallets.filter(w => w.id !== excludedWalletId)
        : wallets;

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className={cn(error && "text-destructive")}>{label}</Label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={disabled}
                    >
                        <SelectTrigger id={name} className={cn("h-12", error && "border-destructive focus:ring-destructive")}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableWallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: wallet.color || '#3b82f6' }}
                                        />
                                        {wallet.name}
                                    </span>
                                </SelectItem>
                            ))}
                            {onCreateNew && (
                                <div className="p-1 border-t mt-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs font-medium text-muted-foreground"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onCreateNew();
                                        }}
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        Buat Dompet Baru
                                    </Button>
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    );
}
