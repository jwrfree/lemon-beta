import { useEffect, useState } from 'react';
import { useCategories } from '../hooks/use-transactions';
import { suggestCategory } from '@/ai/flows/suggest-category-flow';
import { UseFormSetValue } from 'react-hook-form';

interface UseAiCategorySuggestionProps {
    description: string;
    type: 'expense' | 'income';
    currentCategory: string;
    isEditMode: boolean;
    setValue: UseFormSetValue<any>;
}

export function useAiCategorySuggestion({
    description,
    type,
    currentCategory,
    isEditMode,
    setValue
}: UseAiCategorySuggestionProps) {
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [lastSuggestedDescription, setLastSuggestedDescription] = useState('');
    const { expenseCategories, incomeCategories } = useCategories();
    const categories = type === 'expense' ? expenseCategories : incomeCategories;

    useEffect(() => {
        if (isEditMode || !description || description.length < 3 || description === lastSuggestedDescription) return;

        const timer = setTimeout(async () => {
            setIsSuggesting(true);
            try {
                // Determine transaction type context for AI
                const result = await suggestCategory(description, type);

                if (result && result.confidence > 0.7) {
                    const matchedCategory = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());

                    // Only auto-apply when category is still empty,
                    // so AI suggestion does not override manual user selection.
                    const hasManualCategory = !!currentCategory?.trim();
                    if (matchedCategory && !hasManualCategory) {
                        setValue('category', matchedCategory.name, { shouldValidate: true });
                        setLastSuggestedDescription(description);
                    }
                }
            } catch (error) {
                console.error("AI Suggestion error", error);
            } finally {
                setIsSuggesting(false);
            }
        }, 800); // Debounce 800ms

        return () => clearTimeout(timer);
    }, [description, type, currentCategory, categories, setValue, isEditMode, lastSuggestedDescription]);

    return { isSuggesting, lastSuggestedDescription };
}
