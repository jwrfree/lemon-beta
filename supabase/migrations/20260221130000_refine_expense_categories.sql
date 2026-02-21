-- Migration: Refine and Expand Default Expense Categories
-- Date: 2026-02-21

-- 1. Update Transactions first to match new names (to maintain UI consistency)
UPDATE public.transactions SET category = 'Konsumsi & F&B' WHERE category = 'Makanan' AND type = 'expense';
UPDATE public.transactions SET category = 'Belanja & Lifestyle' WHERE category = 'Belanja' AND type = 'expense';
UPDATE public.transactions SET category = 'Tagihan & Utilitas' WHERE category = 'Tagihan' AND type = 'expense';
UPDATE public.transactions SET category = 'Langganan Digital' WHERE category = 'Langganan' AND type = 'expense';
UPDATE public.transactions SET category = 'Hiburan & Wisata' WHERE category = 'Hiburan' AND type = 'expense';
UPDATE public.transactions SET category = 'Kesehatan & Medis' WHERE category = 'Kesehatan' AND type = 'expense';
UPDATE public.transactions SET category = 'Bisnis & Produktivitas' WHERE category = 'Kerja & Bisnis' AND type = 'expense';
UPDATE public.transactions SET category = 'Investasi & Aset' WHERE category = 'Investasi Keluar' AND type = 'expense';
UPDATE public.transactions SET category = 'Cicilan & Pinjaman' WHERE category = 'Cicilan & Hutang' AND type = 'expense';
UPDATE public.transactions SET category = 'Biaya Lain-lain' WHERE category = 'Lain-lain' AND type = 'expense';

-- 2. Update existing default expense categories
UPDATE public.categories SET 
  name = 'Konsumsi & F&B', 
  icon = 'Utensils', 
  color = 'text-yellow-600', 
  bg_color = 'bg-yellow-100', 
  sub_categories = '{"Makan Harian/Warteg", "Restoran & Kafe", "Jajanan & Kopi", "Gofood/Grabfood", "Bahan Masakan (Grocery)", "Catering"}'
WHERE name = 'Makanan' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Belanja & Lifestyle', 
  icon = 'ShoppingCart', 
  color = 'text-blue-600', 
  bg_color = 'bg-blue-100', 
  sub_categories = '{"Fashion & Pakaian", "Elektronik & Gadget", "Hobi & Koleksi", "Skin Care & Perawatan", "Keperluan Rumah Tangga", "Marketplace (Tokped/Shopee)"}'
WHERE name = 'Belanja' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Tagihan & Utilitas', 
  icon = 'Zap', 
  color = 'text-cyan-600', 
  bg_color = 'bg-cyan-100', 
  sub_categories = '{"Listrik (Token/Tagihan)", "Pulsa & Paket Data", "Internet & TV Kabel", "Air (PDAM)", "Iuran Keamanan/Lingkungan", "BPJS Kesehatan"}'
WHERE name = 'Tagihan' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Langganan Digital', 
  icon = 'Tv', 
  color = 'text-orange-600', 
  bg_color = 'bg-orange-100', 
  sub_categories = '{"Hiburan (Netflix/Spotify)", "Cloud (iCloud/Google One)", "SaaS (ChatGPT/Premium Apps)", "Youtube Premium"}'
WHERE name = 'Langganan' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Hiburan & Wisata', 
  icon = 'Gamepad2', 
  color = 'text-pink-600', 
  bg_color = 'bg-pink-100', 
  sub_categories = '{"Bioskop", "Game & Top Up", "Liburan & Hotel", "Event & Konser", "Buku & Majalah", "Staycation"}'
WHERE name = 'Hiburan' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Kesehatan & Medis', 
  icon = 'HeartPulse', 
  color = 'text-red-600', 
  bg_color = 'bg-red-100', 
  sub_categories = '{"Rumah Sakit & Dokter", "Obat & Vitamin", "Asuransi Kesehatan", "Lab & Checkup", "Kesehatan Mental"}'
WHERE name = 'Kesehatan' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Bisnis & Produktivitas', 
  icon = 'Briefcase', 
  color = 'text-emerald-600', 
  bg_color = 'bg-emerald-100', 
  sub_categories = '{"Alat Kerja & Hardware", "Iklan & Marketing", "Co-working Space", "Hosting & Domain"}'
WHERE name = 'Kerja & Bisnis' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Investasi & Aset', 
  icon = 'TrendingUp', 
  color = 'text-emerald-600', 
  bg_color = 'bg-emerald-100', 
  sub_categories = '{"Reksa Dana", "Saham & Obligasi", "Crypto", "Emas", "Tabungan Berjangka"}'
WHERE name = 'Investasi Keluar' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Cicilan & Pinjaman', 
  icon = 'HandCoins', 
  color = 'text-pink-600', 
  bg_color = 'bg-pink-100', 
  sub_categories = '{"Cicilan Kendaraan", "Kartu Kredit", "Paylater", "Bayar Hutang Teman"}'
WHERE name = 'Cicilan & Hutang' AND is_default = TRUE;

UPDATE public.categories SET 
  name = 'Biaya Lain-lain', 
  icon = 'Wrench', 
  color = 'text-gray-600', 
  bg_color = 'bg-gray-100', 
  sub_categories = '{"Biaya Admin Bank", "Pajak", "Kebutuhan Mendadak", "Lainnya"}'
WHERE name = 'Lain-lain' AND is_default = TRUE;
