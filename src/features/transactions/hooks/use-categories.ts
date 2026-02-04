'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/categories';
import { resolveCategoryVisuals } from '@/lib/category-utils';

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchCategories = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error("Error fetching categories:", error);
                return;
            }

            if (data) {
                setCategories(data);
            }
        } catch (err) {
            console.error("Unexpected error fetching categories:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase]);

    useEffect(() => {
        if (!user) {
            setCategories([]);
            setIsLoading(false);
            return;
        }
        fetchCategories();

        const channel = supabase
            .channel('categories-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchCategories, supabase]);

    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
    const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);

    const getCategoryVisuals = useCallback((name: string) => {
        return resolveCategoryVisuals(name, categories);
    }, [categories]);

    return {
        categories,
        expenseCategories,
        incomeCategories,
        getCategoryVisuals,
        isLoading,
        refresh: fetchCategories
    };
};
