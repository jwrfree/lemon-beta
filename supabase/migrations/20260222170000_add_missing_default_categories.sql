-- Migration: Add Missing Default Categories
-- Date: 2026-02-22
-- Purpose: Ensure all categories defined in src/lib/categories.ts exist in the database
--          This addresses the issue where some categories were referenced in updates but never inserted

DO $$ 
BEGIN
    -- Add missing expense categories
    -- Note: Some were referenced in 20260221130000_refine_expense_categories.sql but never inserted
    
    -- Langganan Digital (was 'Langganan' in update migration)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Langganan Digital' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Langganan Digital', 'Tv', 'text-orange-600', 'bg-orange-100', 'expense', TRUE, 
                '{"Hiburan (Netflix/Spotify)", "Cloud (iCloud/Google One)", "SaaS (ChatGPT/Premium Apps)", "Youtube Premium"}');
    END IF;

    -- Rumah & Properti (was 'Rumah' in initial setup, needs proper naming)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Rumah & Properti' AND is_default = TRUE) THEN
        -- First, update the old 'Rumah' to 'Rumah & Properti'
        UPDATE public.categories SET 
            name = 'Rumah & Properti',
            sub_categories = '{"Kos/Kontrakan", "Cicilan Rumah", "Renovasi & Perbaikan", "Perabot & Dekorasi"}'
        WHERE name = 'Rumah' AND is_default = TRUE;
    END IF;

    -- Bisnis & Produktivitas (was 'Kerja & Bisnis' in update migration)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Bisnis & Produktivitas' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Bisnis & Produktivitas', 'Briefcase', 'text-emerald-600', 'bg-emerald-100', 'expense', TRUE, 
                '{"Alat Kerja & Hardware", "Iklan & Marketing", "Co-working Space", "Hosting & Domain"}');
    END IF;

    -- Keluarga & Anak (completely new)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Keluarga & Anak' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Keluarga & Anak', 'Baby', 'text-violet-600', 'bg-violet-100', 'expense', TRUE, 
                '{"Susu & Popok", "Uang Saku Anak", "Kirim Orang Tua", "Kebutuhan Bayi"}');
    END IF;

    -- Sosial & Donasi (completely new)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Sosial & Donasi' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Sosial & Donasi', 'Heart', 'text-rose-500', 'bg-rose-100', 'expense', TRUE, 
                '{"Zakat & Sedekah", "Kondangan & Hadiah", "Sumbangan Sosial", "Patungan"}');
    END IF;

    -- Investasi & Aset (was 'Investasi Keluar' in update migration)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Investasi & Aset' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Investasi & Aset', 'TrendingUp', 'text-emerald-600', 'bg-emerald-100', 'expense', TRUE, 
                '{"Reksa Dana", "Saham & Obligasi", "Crypto", "Emas", "Tabungan Berjangka"}');
    END IF;

    -- Cicilan & Pinjaman (was 'Cicilan & Hutang' in update migration)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Cicilan & Pinjaman' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Cicilan & Pinjaman', 'HandCoins', 'text-pink-600', 'bg-pink-100', 'expense', TRUE, 
                '{"Cicilan Kendaraan", "Kartu Kredit", "Paylater", "Bayar Hutang Teman"}');
    END IF;

    -- Biaya Lain-lain (was 'Lain-lain' in update migration, needs proper naming)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Biaya Lain-lain' AND is_default = TRUE) THEN
        -- Update the old 'Lain-lain' to 'Biaya Lain-lain' if it exists
        UPDATE public.categories SET 
            name = 'Biaya Lain-lain',
            sub_categories = '{"Biaya Admin Bank", "Pajak", "Kebutuhan Mendadak", "Lainnya"}'
        WHERE name = 'Lain-lain' AND is_default = TRUE AND type = 'expense';
        
        -- If it doesn't exist, insert it
        IF NOT FOUND THEN
            INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
            VALUES ('Biaya Lain-lain', 'Wrench', 'text-gray-600', 'bg-gray-100', 'expense', TRUE, 
                    '{"Biaya Admin Bank", "Pajak", "Kebutuhan Mendadak", "Lainnya"}');
        END IF;
    END IF;

    -- Penyesuaian Saldo - Expense (completely new)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Penyesuaian Saldo' AND is_default = TRUE AND type = 'expense') THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Penyesuaian Saldo', 'Scale', 'text-orange-600', 'bg-orange-100', 'expense', TRUE, 
                '{"Koreksi"}');
    END IF;

    -- Penyesuaian Saldo - Income (completely new)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Penyesuaian Saldo' AND is_default = TRUE AND type = 'income') THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Penyesuaian Saldo', 'Scale', 'text-teal-600', 'bg-teal-100', 'income', TRUE, 
                '{"Koreksi"}');
    END IF;

    -- Transfer - Internal (ensure it exists with correct name)
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Transfer' AND is_default = TRUE AND type = 'internal') THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default) 
        VALUES ('Transfer', 'ArrowRightLeft', 'text-gray-600', 'bg-gray-100', 'internal', TRUE);
    END IF;

    -- Update Pendapatan Lain if it was inserted with wrong name
    UPDATE public.categories SET
        name = 'Pendapatan Lain',
        icon = 'Wallet',
        color = 'text-gray-600',
        bg_color = 'bg-gray-100'
    WHERE name = 'Lain-lain' AND is_default = TRUE AND type = 'income';

END $$;
