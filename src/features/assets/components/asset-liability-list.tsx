'use client';

import { useAssets } from '../hooks/use-assets';
import { formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { Button } from '@/components/ui/button';
import { MoreVertical, TrendingUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Asset, Liability } from '@/types/models';

interface AssetLiabilityListProps {
    items: (Asset | Liability)[];
    type: 'asset' | 'liability';
    onEdit: (item: Asset | Liability, type: 'asset' | 'liability') => void;
}

export const AssetLiabilityList = ({ items, type, onEdit }: AssetLiabilityListProps) => {
    const { deleteAssetLiability, goldPrice } = useAssets();

    if (items.length === 0) {
        const message = type === 'asset' ? "Aset yang kamu miliki akan muncul di sini." : "Daftar utang atau cicilanmu akan muncul di sini.";
        return <p className="text-muted-foreground text-sm text-center py-4">{message}</p>;
    }

    return (
        <div className="space-y-1">
            {items.map(item => {
                const { Icon, logo } = getWalletVisuals(item.name, item.categoryKey);
                return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="p-2.5 bg-muted rounded-lg group-hover:bg-background transition-colors shadow-sm relative flex items-center justify-center overflow-hidden">
                            {logo ? (
                                <>
                                    <img
                                        src={logo}
                                        alt={item.name}
                                        className="h-5 w-5 object-contain rounded-full"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const icon = e.currentTarget.nextElementSibling;
                                            if (icon) icon.classList.remove('hidden');
                                        }}
                                    />
                                    <Icon className="h-5 w-5 text-muted-foreground hidden" />
                                </>
                            ) : (
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            )}
                            {item.categoryKey === 'gold' && goldPrice && (
                                <div className="absolute -top-1 -right-1 bg-teal-500 rounded-full p-0.5 border-2 border-background">
                                    <TrendingUp className="h-2 w-2 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{item.name}</p>
                                {item.categoryKey === 'gold' && 'quantity' in item && item.quantity && (
                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                                        {item.quantity} gr
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                                {item.categoryKey.replace('-', ' ')}
                                {item.categoryKey === 'gold' && goldPrice && (
                                    <span className="ml-1 text-xs text-teal-600 font-medium">
                                        • Harga: {formatCurrency(goldPrice)}/gr
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium tabular-nums text-sm">
                                {item.categoryKey === 'gold' && 'quantity' in item && item.quantity && goldPrice
                                    ? formatCurrency(item.quantity * goldPrice)
                                    : formatCurrency(item.value)}
                            </p>
                            {item.categoryKey === 'gold' && 'quantity' in item && item.quantity && goldPrice && (
                                <p className={cn(
                                    "text-xs font-medium",
                                    (item.quantity * goldPrice) > item.value ? "text-teal-600" : "text-rose-600"
                                )}>
                                    {(item.quantity * goldPrice) > item.value ? '+' : ''}
                                    {formatCurrency((item.quantity * goldPrice) - item.value)}
                                </p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Buka menu untuk ${item.name}`}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(item, type)}>
                                    Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                            Hapus
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Yakin mau menghapus {item.name}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini tidak dapat dibatalkan dan akan menghapus entri ini secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteAssetLiability(item.id, type)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Ya, Hapus
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            })}
        </div>
    );
};

