import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useUI } from '@/components/ui-provider';
import type { Category } from '@/lib/categories';
import { categoryService } from '../services/category.service';

export const useCategoryActions = (user: User | null) => {
    const ui = useUI();

    const addCategory = useCallback(async (category: Partial<Category>) => {
        if (!user) return;
        try {
            // migrated from direct supabase call
            await categoryService.addCategory(user.id, category);
            ui.showToast("Kategori berhasil ditambahkan!", 'success');
        } catch (error) {
            console.error("Error adding category:", error);
            ui.showToast("Gagal menambahkan kategori.", 'error');
        }
    }, [user, ui]);

    const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
        if (!user) return;
        try {
            // migrated from direct supabase call
            await categoryService.updateCategory(id, updates);
            ui.showToast("Kategori berhasil diperbarui!", 'success');
        } catch (error) {
            console.error("Error updating category:", error);
            ui.showToast("Gagal memperbarui kategori.", 'error');
        }
    }, [user, ui]);

    const deleteCategory = useCallback(async (id: string) => {
        if (!user) return;
        try {
            // migrated from direct supabase call
            await categoryService.deleteCategory(id);
            ui.showToast("Kategori berhasil dihapus!", 'success');
        } catch (error) {
            console.error("Error deleting category:", error);
            ui.showToast("Gagal menghapus kategori.", 'error');
        }
    }, [user, ui]);

    return {
        addCategory,
        updateCategory,
        deleteCategory
    };
};
