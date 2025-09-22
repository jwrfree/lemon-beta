
'use client';

import { useApp } from '@/components/app-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { Button } from './ui/button';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface AssetLiabilityListProps {
    items: any[];
    type: 'asset' | 'liability';
    onEdit: (item: any, type: 'asset' | 'liability') => void;
}

export const AssetLiabilityList = ({ items, type, onEdit }: AssetLiabilityListProps) => {
    const { deleteAssetLiability } = useApp();

    if (items.length === 0) {
        const message = type === 'asset' ? "Aset yang kamu miliki akan muncul di sini." : "Daftar utang atau cicilanmu akan muncul di sini.";
        return <p className="text-muted-foreground text-sm text-center py-4">{message}</p>;
    }

    return (
        <div className="space-y-3">
            {items.map(item => {
                const { Icon } = getWalletVisuals(item.name, item.categoryKey);
                return (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                        <div className="p-2 bg-muted rounded-md">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.value)}</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
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
