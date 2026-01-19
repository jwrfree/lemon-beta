'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/providers/app-provider';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/categories';

export const useCategories = () => {
    const { user } = useApp();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchCategories = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (data) {
            setCategories(data);
        }
        setIsLoading(false);
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

    const addCategory = async (category: any) => {
        if (!user) return;
        const { error } = await supabase.from('categories').insert({
            ...category,
            user_id: user.id,
            is_default: false
        });
        return { error };
    };

    const updateCategory = async (id: string, updates: any) => {
        const { error } = await supabase.from('categories').update(updates).eq('id', id);
        return { error };
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id).eq('is_default', false);
        return { error };
    };

    return {
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory,
        refresh: fetchCategories
    };
};
