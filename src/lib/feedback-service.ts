import { createClient } from '@/lib/supabase/client';

export interface FeedbackEntry {
    originalInput: string;
    predictedCategory: string;
    correctedCategory: string;
}

/**
 * Menyimpan koreksi pengguna ke database untuk pembelajaran AI.
 * Panggil fungsi ini saat pengguna menyimpan transaksi setelah mengedit kategori hasil AI.
 */
export const saveAICorrection = async (feedback: FeedbackEntry) => {
    const supabase = createClient();
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('ai_feedback').insert({
            user_id: user.id,
            original_input: feedback.originalInput,
            predicted_category: feedback.predictedCategory,
            corrected_category: feedback.correctedCategory
        });
    } catch (error) {
        console.error('Error saving AI feedback:', error);
    }
};

/**
 * Mengambil contoh koreksi sebelumnya untuk dijadikan context (Few-Shot Learning).
 * Gunakan hasil fungsi ini saat menyusun prompt untuk AI.
 */
export const getFewShotExamples = async (limit = 5) => {
    const supabase = createClient();
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data } = await supabase
            .from('ai_feedback')
            .select('original_input, corrected_category')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return data?.map((item: { original_input: string; corrected_category: string }) => 
            `Input: "${item.original_input}" -> Kategori: "${item.corrected_category}"`
        ) || [];
    } catch (error) {
        console.error('Error fetching AI examples:', error);
        return [];
    }
};
