'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useUI } from '@/components/ui-provider';
import { useGoals } from '@/features/goals/hooks/use-goals';
import type { Goal } from '@/types/models';


const goalIcons = [
    { name: 'Rocket', Icon: Rocket },
    { name: 'Car', Icon: Car },
    { name: 'Home', Icon: Home },
    { name: 'Gift', Icon: Gift },
    { name: 'Briefcase', Icon: Briefcase },
    { name: 'GraduationCap', Icon: GraduationCap },
    { name: 'Plane', Icon: Plane },
    { name: 'Computer', Icon: Computer },
];

interface GoalFormProps {
  onClose: () => void;
  initialData?: Goal | null;
}

export const GoalForm = ({ onClose, initialData = null }: GoalFormProps) => {
    const { addGoal, updateGoal, deleteGoal } = useGoals();
    const { showToast } = useUI();
    const isEditMode = !!initialData;

    const [name, setName] = useState(initialData?.name || '');
    const [icon, setIcon] = useState(initialData?.icon || 'Rocket');
    const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount ? new Intl.NumberFormat('id-ID').format(initialData.targetAmount) : '');
    const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount ? new Intl.NumberFormat('id-ID').format(initialData.currentAmount) : '');
    const [targetDate, setTargetDate] = useState<Date | undefined>(initialData?.targetDate ? parseISO(initialData.targetDate) : undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('id-ID').format(parseInt(rawValue) || 0);
        setter(formattedValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedTarget = parseInt(targetAmount.replace(/[^0-9]/g, ''));
        if (!name || !targetAmount || parsedTarget <= 0 || !targetDate) {
            showToast('Nama, jumlah, dan tanggal target wajib diisi.', 'error');
            return;
        }
        setIsSubmitting(true);
        const goalData = {
            name,
            icon,
            targetAmount: parsedTarget,
            currentAmount: parseInt(currentAmount.replace(/[^0-9]/g, '')) || 0,
            targetDate: targetDate.toISOString(),
        };

        try {
            if (isEditMode) {
                await updateGoal(initialData.id, goalData);
            } else {
                await addGoal(goalData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;
        setIsDeleting(true);
        try {
            await deleteGoal(initialData.id);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-md bg-background rounded-t-2xl shadow-lg flex flex-col h-fit max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background rounded-t-2xl z-10">
                    <h2 className="text-xl font-bold">{isEditMode ? 'Edit Target' : 'Target Baru'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="bg-muted rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Target</Label>
                        <Input id="name" placeholder="e.g., MacBook Pro Baru" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label>Pilih Ikon</Label>
                        <div className="grid grid-cols-8 gap-2">
                            {goalIcons.map(({ name: iconName, Icon }) => (
                                <Button
                                    key={iconName}
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className={cn("aspect-square h-auto w-auto", icon === iconName && "ring-2 ring-primary")}
                                    onClick={() => setIcon(iconName)}
                                >
                                    <Icon className="h-6 w-6" />
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="targetAmount">Jumlah Target</Label>
                        <Input id="targetAmount" placeholder="Rp 0" value={targetAmount} onChange={handleAmountChange(setTargetAmount)} required inputMode="numeric" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="currentAmount">Sudah Terkumpul</Label>
                             <Input id="currentAmount" placeholder="Rp 0" value={currentAmount} onChange={handleAmountChange(setCurrentAmount)} inputMode="numeric" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetDate">Tanggal Target</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="targetDate"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !targetDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {targetDate ? format(targetDate, "d MMM yyyy", { locale: dateFnsLocaleId }) : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={targetDate}
                                        onSelect={setTargetDate}
                                        initialFocus
                                        locale={dateFnsLocaleId}
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                </form>
                 <div className="p-4 border-t sticky bottom-0 bg-background flex gap-2">
                    <Button type="submit" onClick={handleSubmit} className="flex-1" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : `Simpan ${isEditMode ? 'Perubahan' : 'Target'}`}
                    </Button>
                    {isEditMode && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="icon" disabled={isDeleting}>
                                <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Yakin mau menghapus target ini?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan dan akan menghapus target &apos;{initialData.name}&apos; secara permanen.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
