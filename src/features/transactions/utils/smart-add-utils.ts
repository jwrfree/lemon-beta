import { Category } from '@/lib/categories';

/**
 * Normalizes a string for fuzzy comparison by replacing non-alphanumeric
 * characters (punctuation, special symbols) with spaces and collapsing whitespace.
 */
const normalizeForFuzzy = (str: string): string =>
    str.replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Resolves a raw sub-category string to a valid sub-category from the available list based on the main category.
 * Uses exact match (case-insensitive) first, then falls back to bidirectional substring matching (fuzzy)
 * with special-character normalization so that e.g. "bayar parkir tol" matches "Parkir & Tol".
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

            // 2. Fuzzy match (substring, raw)
            if (!matchedSub) {
                matchedSub = categoryObj.sub_categories.find(s =>
                    s.toLowerCase().includes(normalizedSub) || normalizedSub.includes(s.toLowerCase())
                );
            }

            // 3. Fuzzy match (normalized – strips &, /, (, ) etc. before comparing)
            if (!matchedSub) {
                const normalizedInput = normalizeForFuzzy(rawSubCategory);
                matchedSub = categoryObj.sub_categories.find(s => {
                    const normalizedCandidate = normalizeForFuzzy(s);
                    return (
                        normalizedCandidate.includes(normalizedInput) ||
                        normalizedInput.includes(normalizedCandidate)
                    );
                });
            }

            if (matchedSub) {
                finalSubCategory = matchedSub;
            }
        }
    }
    return finalSubCategory;
};

// --- Quick Parser Types ---

/** Minimum character count for a sub-category word token to be used in word-level fuzzy matching. */
const MIN_WORD_MATCH_LENGTH = 4;

export interface QuickParseResult {
    amount: number;
    description: string;
    category: string;
    subCategory: string;
    walletName?: string;
    date: string;
    type: 'income' | 'expense';
    isNeed: boolean;
    confidence: 'low' | 'medium' | 'high';
}

/**
 * Perform instant regex-based parsing to give immediate feedback to user
 * while waiting for AI analysis.
 */
export const quickParseTransaction = (text: string, categories: { expense: Category[], income: Category[] }, walletNames: string[]): QuickParseResult => {
    const lowerText = text.toLowerCase();

    // 1. Extract Amount
    let amount = 0;
    // Match "50k", "50rb", "50.000", "50000"
    // Regex explanation:
    // (\d+[.,]?\d*) -> Capture number (e.g., 50, 50.5, 50,000)
    // \s* -> Optional space
    // (rb|k|jt|juta|ribu)? -> Optional suffix
    const amountMatch = lowerText.match(/(\d+[.,]?\d*)\s*(rb|k|jt|juta|ribu)?/i);

    if (amountMatch) {
        let val = parseFloat(amountMatch[1].replace(/,/g, '.')); // Handle decimal comma if any, though ID uses dot usually. simple parse.
        // If text uses dot for thousands (Indonesian), simple parseFloat might cut it off (50.000 -> 50).
        // Let's refine: remove dots if it looks like thousand separator (more than 3 digits total or followed by 3 digits)
        const rawNum = amountMatch[1];
        if (rawNum.includes('.') && rawNum.split('.')[1].length === 3) {
            val = parseFloat(rawNum.replace(/\./g, ''));
        }

        const suffix = amountMatch[2]?.toLowerCase();

        if (suffix === 'rb' || suffix === 'k' || suffix === 'ribu') {
            val *= 1000;
        } else if (suffix === 'jt' || suffix === 'juta') {
            val *= 1000000;
        }

        amount = val;
    }

    // 2. Extract Category & SubCategory
    let category = 'Lain-lain';
    let subCategory = '';
    let type: 'income' | 'expense' = 'expense';
    let foundMatch = false;

    // Helper to search categories
    const searchCats = (cats: Category[], txType: 'income' | 'expense') => {
        for (const cat of cats) {
            // Check main category name
            if (lowerText.includes(cat.name.toLowerCase())) {
                category = cat.name;
                type = txType;
                foundMatch = true;
                return true;
            }
            // Check subcategories
            if (cat.sub_categories) {
                for (const sub of cat.sub_categories) {
                    // Exact substring match
                    if (lowerText.includes(sub.toLowerCase())) {
                        category = cat.name;
                        subCategory = sub;
                        type = txType;
                        foundMatch = true;
                        return true;
                    }
                    // Word-level match: split sub-category by delimiters and check if
                    // any meaningful word (>= MIN_WORD_MATCH_LENGTH chars) appears in the input text.
                    const subWords = sub.toLowerCase().split(/[\s/&()[\],;-]+/).filter(w => w.length >= MIN_WORD_MATCH_LENGTH);
                    if (subWords.length > 0 && subWords.some(w => lowerText.includes(w))) {
                        category = cat.name;
                        subCategory = sub;
                        type = txType;
                        foundMatch = true;
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // Prioritize Expense search
    if (!searchCats(categories.expense, 'expense')) {
        searchCats(categories.income, 'income');
    }

    // 2.5 Transfer Detection (Quick Regex)
    const transferKeywords = ['pindah', 'transfer', 'kirim', 'tf', 'mutasi'];
    const isTransfer = transferKeywords.some(k => lowerText.includes(k));
    
    if (isTransfer) {
        category = 'Transfer';
        type = 'expense'; // Used as system trigger
        foundMatch = true;
    }

    // 3. Need vs Want Logic
    let isNeed = true;
    const wantCategories = ['Hiburan', 'Jalan-jalan', 'Liburan', 'Hobi', 'Gaya Hidup', 'Investasi']; 
    const wantKeywords = [
        'kopi', 'starbucks', 'jalan', 'nonton', 'game', 'jajan', 
        'netflix', 'spotify', 'mcd', 'kfc', 'cinema', 'xxi', 'topup',
        'mall', 'shopee', 'tokopedia', 'baju', 'kaos'
    ];

    if (wantCategories.includes(category)) {
        isNeed = false;
    }

    // Specific keywords override
    if (wantKeywords.some(w => lowerText.includes(w))) {
        isNeed = false;
    }

    // 4. Wallet Detection
    let walletName = undefined;
    const sortedWallets = [...walletNames].sort((a, b) => b.length - a.length); // Match longest first
    for (const w of sortedWallets) {
        if (lowerText.includes(w.toLowerCase())) {
            walletName = w;
            break;
        }
    }

    // 5. Date Detection
    let date = new Date().toISOString();
    if (lowerText.includes('kemarin')) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        date = d.toISOString();
    }

    return {
        amount,
        description: text, // Use full text as description initially
        category,
        subCategory,
        walletName,
        date,
        type,
        isNeed,
        confidence: amount > 0 && foundMatch ? 'medium' : 'low'
    };
};
