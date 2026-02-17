import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { parseISO } from 'date-fns';

import { z } from 'zod';
import { unifiedTransactionSchema, UnifiedTransactionFormValues } from '../schemas/transaction-schema';
import { transactionService } from '../services/transaction.service';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { triggerHaptic } from '@/lib/utils';
import { Transaction } from '@/types/models';

interface UseTransactionFormProps {
    initialData?: Transaction | null;
    onSuccess?: () => void;
    type?: 'expense' | 'income' | 'transfer'; // Default type override
}

export const useTransactionForm = ({ initialData, onSuccess, type }: UseTransactionFormProps = {}) => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const router = useRouter();

    const isEditMode = !!initialData;

    // 1. Initialize Form with Zod Resolver
    // Use z.input to get pre-transform types (amount as string)
    const form = useForm<z.input<typeof unifiedTransactionSchema>>({
        resolver: zodResolver(unifiedTransactionSchema) as any,
        defaultValues: {
            type: type || 'expense',
            amount: '', // String for input handling
            description: '',
            date: new Date(),
            walletId: '',
            category: '',
            subCategory: '',
            location: '',
            // Transfer defaults
            fromWalletId: '',
            toWalletId: '',
        },
    });

    // 2. Populate Form Data on Edit
    useEffect(() => {
        if (initialData) {
            form.reset({
                type: initialData.type,
                amount: initialData.amount.toString(),
                description: initialData.description,
                date: parseISO(initialData.date),
                walletId: initialData.walletId,
                category: initialData.category,
                subCategory: initialData.subCategory || '',
                location: initialData.location || '',
            } as any);
        }
    }, [initialData, form]);

    // 3. Robust Submit Handler
    // Data here is post-transform (amount is number)
    const handleSubmit = useCallback(async (data: any) => {
        if (!user) {
            showToast("Sesi habis. Silakan login kembali.", "error");
            return;
        }

        triggerHaptic('medium');

        let result;
        if (isEditMode && initialData) {
            result = await transactionService.updateTransaction(user.id, initialData.id, data);
        } else {
            result = await transactionService.createTransaction(user.id, data);
        }

        if (result.error) {
            triggerHaptic('error');
            showToast(result.error, 'error');
            return;
        }

        // Success Flow
        triggerHaptic('success');

        // Let the UI component handle the animation/close
        if (onSuccess) onSuccess();

        // Optional: Refresh router to update server components if any
        router.refresh();

    }, [user, isEditMode, initialData, form, showToast, onSuccess, router]);

    // 4. Delete Handler
    const handleDelete = useCallback(async () => {
        if (!user || !initialData) return;

        triggerHaptic('medium');

        const result = await transactionService.deleteTransaction(user.id, initialData.id);

        if (result.error) {
            triggerHaptic('error');
            showToast(result.error, 'error');
            return;
        }

        triggerHaptic('success');
        showToast("Transaksi berhasil dihapus", 'success');
        if (onSuccess) onSuccess();
        router.refresh();

    }, [user, initialData, showToast, onSuccess, router]);

    return {
        form,
        isEditMode,
        isSubmitting: form.formState.isSubmitting,
        handleSubmit: form.handleSubmit(handleSubmit),
        handleDelete,
        errors: form.formState.errors,
    };
};
