import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { parseISO } from 'date-fns';

import { unifiedTransactionSchema, UnifiedTransactionFormValues } from '../schemas/transaction-schema';
import { transactionService } from '../services/transaction.service';
import { useAuth } from '@/providers/auth-provider';
import { useUI } from '@/components/ui-provider';
import { triggerHaptic } from '@/lib/utils';
import { Transaction, Wallet } from '@/types/models';
import { patchTransactionLiquid } from '@/ai/flows/liquid-patch-flow';

interface UseTransactionFormProps {
    initialData?: Transaction | null;
    onSuccess?: () => void;
    type?: 'expense' | 'income' | 'transfer'; // Default type override
    context?: { wallets: Wallet[], categories: string[] }; // Context for AI
}

export const useTransactionForm = ({ initialData, onSuccess, type, context }: UseTransactionFormProps = {}) => {
    const { user } = useAuth();
    const { showToast } = useUI();
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const router = useRouter();

    const isEditMode = !!initialData;

    // 1. Initialize Form with Zod Resolver
    const form = useForm<UnifiedTransactionFormValues>({
        resolver: zodResolver(unifiedTransactionSchema),
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
                // Transfer specific logic handles mapped fields if needed
                fromWalletId: '',
                toWalletId: '',
            });
        }
    }, [initialData, form]);

    // 3. AI Patch Logic
    const applyLiquidPatch = useCallback(async (text: string) => {
        if (!text || !user || !context) return;

        setIsAiProcessing(true);
        setAiExplanation(null);

        try {
            const currentState = form.getValues();
            const patch = await patchTransactionLiquid(text, currentState, {
                wallets: context.wallets.map(w => ({ id: w.id, name: w.name })),
                categories: context.categories
            });

            if (patch.confidence > 0.6) {
                // Apply the patch to the form
                if (patch.amount) form.setValue('amount', patch.amount.toString(), { shouldDirty: true });
                if (patch.category) form.setValue('category', patch.category, { shouldDirty: true });
                if (patch.subCategory) form.setValue('subCategory', patch.subCategory, { shouldDirty: true });
                if (patch.location) form.setValue('location', patch.location, { shouldDirty: true });
                if (patch.description) form.setValue('description', patch.description, { shouldDirty: true });
                if (patch.walletId) form.setValue('walletId', patch.walletId, { shouldDirty: true });
                
                if (patch.explanation) {
                    setAiExplanation(patch.explanation);
                    triggerHaptic('success');
                }
            }
        } catch (err) {
            console.error("[useTransactionForm] AI Patch Error:", err);
        } finally {
            setIsAiProcessing(false);
        }
    }, [user, context, form]);

    // 4. Robust Submit Handler
    const handleSubmit = useCallback(async (data: UnifiedTransactionFormValues) => {
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

    }, [user, isEditMode, initialData, showToast, onSuccess, router]);

    // 5. Delete Handler
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
        isAiProcessing,
        aiExplanation,
        applyLiquidPatch,
        handleSubmit: form.handleSubmit(handleSubmit),
        handleDelete,
        errors: form.formState.errors,
    };
};
