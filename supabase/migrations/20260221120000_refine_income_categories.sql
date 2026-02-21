-- Migration: Refine and Expand Default Income Categories
-- Date: 2026-02-21

-- 1. Create a temporary mapping or just do it directly
-- Update Transactions first to match new names (to maintain UI consistency)
UPDATE public.transactions SET category = 'Gaji & Tetap' WHERE category = 'Gaji' AND type = 'income';
UPDATE public.transactions SET category = 'Bisnis & Freelance' WHERE category = 'Freelance' AND type = 'income';
UPDATE public.transactions SET category = 'Pemberian & Hadiah' WHERE category = 'Bonus' AND type = 'income';
UPDATE public.transactions SET category = 'Investasi & Pasif' WHERE category = 'Investasi' AND type = 'income';
UPDATE public.transactions SET category = 'Pendapatan Lain' WHERE category = 'Lain-lain' AND type = 'income';

-- 2. Update existing default income categories
UPDATE public.categories SET 
  name = 'Gaji & Tetap', 
  icon = 'Briefcase', 
  color = 'text-teal-600', 
  bg_color = 'bg-teal-100', 
  sub_categories = '{"Gaji Pokok", "Bonus & THR", "Tunjangan", "Lembur", "Uang Makan/Transport"}'
WHERE name = 'Gaji' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Bisnis & Freelance', 
  icon = 'Code', 
  color = 'text-cyan-600', 
  bg_color = 'bg-cyan-100', 
  sub_categories = '{"Proyek Jasa", "Penjualan Produk", "Komisi & Affiliate", "Hasil AdSense/Ads", "Tips"}'
WHERE name = 'Freelance' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Pemberian & Hadiah', 
  icon = 'Gift', 
  color = 'text-pink-600', 
  bg_color = 'bg-pink-100', 
  sub_categories = '{"Dari Keluarga", "Hadiah & Angpao", "Uang Saku", "Zakat/Infaq Terima", "Warisan"}'
WHERE name = 'Bonus' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Investasi & Pasif', 
  icon = 'TrendingUp', 
  color = 'text-emerald-600', 
  bg_color = 'bg-emerald-100', 
  sub_categories = '{"Bunga Bank", "Dividen & Kupon", "Profit Trading/Emas", "Sewa Properti", "Royalti"}'
WHERE name = 'Investasi' AND is_default = TRUE;

-- 3. Add new default income categories if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Refund & Cashback' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Refund & Cashback', 'RefreshCw', 'text-blue-600', 'bg-blue-100', 'income', TRUE, '{"Cashback Belanja", "Refund Pembatalan", "Klaim Asuransi", "Kelebihan Bayar"}');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Penjualan Aset' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Penjualan Aset', 'BadgeDollarSign', 'text-orange-600', 'bg-orange-100', 'income', TRUE, '{"Jual Barang Bekas", "Jual Elektronik/HP", "Jual Kendaraan", "Jual Emas/Perhiasan", "Jual Properti"}');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Pendapatan Lain' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) 
        VALUES ('Pendapatan Lain', 'Wallet', 'text-gray-600', 'bg-gray-100', 'income', TRUE, '{"Uang Temuan", "Kompensasi/Pesangon", "Lainnya"}');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Terima Piutang' AND is_default = TRUE) THEN
        INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories)
        VALUES ('Terima Piutang', 'Handshake', 'text-indigo-600', 'bg-indigo-100', 'income', TRUE, '{"Pelunasan Teman", "Refund Dana Talangan", "Cicilan Piutang"}');
    END IF;
END $$;

-- 4. Update 'Penyesuaian Saldo' for consistency
UPDATE public.categories SET
  icon = 'Scale',
  color = 'text-teal-600',
  bg_color = 'bg-teal-100',
  sub_categories = '{"Koreksi"}'
WHERE name = 'Penyesuaian Saldo' AND is_default = TRUE;
