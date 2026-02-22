-- Verification Script for Migration 20260222170000
-- Run this after applying the migration to verify all categories exist

-- Expected counts:
-- expense: 16 categories
-- income: 9 categories  
-- internal: 1 category
-- Total: 26 default categories

SELECT 
    type,
    COUNT(*) as category_count
FROM public.categories 
WHERE is_default = TRUE 
GROUP BY type
ORDER BY type;

-- Expected output:
-- expense  | 16
-- income   | 9
-- internal | 1

-- List all default expense categories (should be 16)
SELECT name, icon, sub_categories 
FROM public.categories 
WHERE is_default = TRUE AND type = 'expense'
ORDER BY name;

-- Expected expense categories:
-- 1. Belanja & Lifestyle
-- 2. Biaya Lain-lain
-- 3. Bisnis & Produktivitas
-- 4. Cicilan & Pinjaman
-- 5. Hiburan & Wisata
-- 6. Investasi & Aset
-- 7. Keluarga & Anak
-- 8. Kesehatan & Medis
-- 9. Konsumsi & F&B
-- 10. Langganan Digital
-- 11. Pendidikan
-- 12. Penyesuaian Saldo
-- 13. Rumah & Properti
-- 14. Sosial & Donasi
-- 15. Tagihan & Utilitas
-- 16. Transportasi

-- List all default income categories (should be 9)
SELECT name, icon, sub_categories 
FROM public.categories 
WHERE is_default = TRUE AND type = 'income'
ORDER BY name;

-- Expected income categories:
-- 1. Bisnis & Freelance
-- 2. Gaji & Tetap
-- 3. Investasi & Pasif
-- 4. Pemberian & Hadiah
-- 5. Pendapatan Lain
-- 6. Penjualan Aset
-- 7. Penyesuaian Saldo
-- 8. Refund & Cashback
-- 9. Terima Piutang

-- List all default internal categories (should be 1)
SELECT name, icon
FROM public.categories 
WHERE is_default = TRUE AND type = 'internal'
ORDER BY name;

-- Expected internal categories:
-- 1. Transfer

-- Verify no old category names remain
SELECT name, type 
FROM public.categories 
WHERE is_default = TRUE 
  AND name IN ('Makanan', 'Belanja', 'Tagihan', 'Hiburan', 'Rumah', 'Kesehatan', 'Gaji', 'Freelance', 'Bonus', 'Investasi', 'Langganan', 'Kerja & Bisnis', 'Investasi Keluar', 'Cicilan & Hutang', 'Lain-lain');

-- Expected: No rows (all old names should have been renamed)
