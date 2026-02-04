import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUI } from '@/components/ui-provider';
import type { Category } from '@/lib/categories';

export const useCategoryActions = (user: User | null) => {
    const ui = useUI();
    const supabase = createClient();

    const addCategory = useCallback(async (category: Partial<Category>) => {
        if (!user) return;
        const { error } = await supabase.from('categories').insert({
            ...category,
            user_id: user.id,
            is_default: false
        });

        if (error) {
            console.error("Error adding category:", error);
            ui.showToast("Gagal menambahkan kategori.", 'error');
            return;
        }

        ui.showToast("Kategori berhasil ditambahkan!", 'success');
    }, [user, ui, supabase]);

    const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
        if (!user) return;
        const { error } = await supabase.from('categories').update(updates).eq('id', id);

        if (error) {
            console.error("Error updating category:", error);
            ui.showToast("Gagal memperbarui kategori.", 'error');
            return;
        }

        ui.showToast("Kategori berhasil diperbarui!", 'success');
    }, [user, ui, supabase]);

    const deleteCategory = useCallback(async (id: string) => {
        if (!user) return;
        const { error } = await supabase.from('categories').delete().eq('id', id).eq('is_default', false);

        if (error) {
            console.error("Error deleting category:", error);
            ui.showToast("Gagal menghapus kategori.", 'error');
            return;
        }

        ui.showToast("Kategori berhasil dihapus!", 'success');
    }, [user, ui, supabase]);

    return {
        addCategory,
        updateCategory,
        deleteCategory
    };
};
