import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/categories';

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    },

    async addCategory(userId: string, category: Partial<Category>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('categories').insert({
            ...category,
            user_id: userId,
            is_default: false,
        });

        if (error) {
            throw error;
        }
    },

    async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('categories').update(updates).eq('id', id);

        if (error) {
            throw error;
        }
    },

    async deleteCategory(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase.from('categories').delete().eq('id', id).eq('is_default', false);

        if (error) {
            throw error;
        }
    },
};
