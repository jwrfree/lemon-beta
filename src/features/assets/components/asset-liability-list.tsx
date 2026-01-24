'use client';

import { useAssets } from '../hooks/use-assets';
import { formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AssetLiabilityListProps {
    items: any[];
    type: 'asset' | 'liability';
    onEdit: (item: any, type: 'asset' | 'liability') => void;
}

export const AssetLiabilityList = ({ items, type, onEdit }: AssetLiabilityListProps) => {
    const { deleteAssetLiability } = useAssets();

    if (items.length === 0) {
        const message = type === 'asset' ? "Aset yang kamu miliki akan muncul di sini." : "Daftar utang atau cicilanmu akan muncul di sini.";
        return <p className="text-muted-foreground text-sm text-center py-4">{message}</p>;
    }

    return (
        <div className="space-y-1">
            {items.map(item => {
                const { Icon } = getWalletVisuals(item.name, item.categoryKey);
                return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="p-2.5 bg-muted rounded-lg group-hover:bg-background transition-colors shadow-sm">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.categoryKey.replace('-', ' ')}</p>
                        </div>
                        <p className="font-bold tabular-nums text-sm">{formatCurrency(item.value)}</p>
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
