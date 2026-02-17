import { Category } from '@/lib/categories';

/**
 * Resolves a raw sub-category string to a valid sub-category from the available list based on the main category.
 * Uses exact match (case-insensitive) first, then falls back to bidirectional substring matching (fuzzy).
 */
export const resolveSubCategory = (
    finalCategory: string | undefined,
    rawSubCategory: string | undefined,
    allCategories: Category[]
): string => {
    let finalSubCategory = '';

    if (finalCategory && rawSubCategory) {
        const categoryObj = allCategories.find(c => c.name === finalCategory);
        if (categoryObj && categoryObj.sub_categories && categoryObj.sub_categories.length > 0) {
            const normalizedSub = rawSubCategory.trim().toLowerCase();

            // 1. Exact match (case-insensitive)
            let matchedSub = categoryObj.sub_categories.find(s => s.toLowerCase() === normalizedSub);

            // 2. Fuzzy match (substring)
            if (!matchedSub) {
                matchedSub = categoryObj.sub_categories.find(s =>
                    s.toLowerCase().includes(normalizedSub) || normalizedSub.includes(s.toLowerCase())
                );
            }

            if (matchedSub) {
                finalSubCategory = matchedSub;
            }
        }
    }
    return finalSubCategory;
};
