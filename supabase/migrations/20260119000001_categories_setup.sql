-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT, -- Nama icon Lucide
  color TEXT, -- Class warna Tailwind
  bg_color TEXT, -- Class background Tailwind
  type TEXT CHECK (type IN ('expense', 'income', 'internal')) NOT NULL,
  sub_categories TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view default categories and their own" ON public.categories
  FOR SELECT USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own categories" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

-- Insert Default Expense Categories
INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) VALUES
('Makanan', 'Utensils', 'text-yellow-600', 'bg-yellow-100', 'expense', TRUE, '{"Restoran & Kafe", "Bahan Makanan", "Kopi", "Jajanan", "Delivery"}'),
('Belanja', 'ShoppingCart', 'text-blue-600', 'bg-blue-100', 'expense', TRUE, '{"Fashion", "Elektronik", "Hobi", "Rumah Tangga", "Hadiah"}'),
('Transportasi', 'Car', 'text-purple-600', 'bg-purple-100', 'expense', TRUE, '{"Transportasi Umum", "Bensin", "Gojek/Grab", "Parkir", "Servis & Cuci"}'),
('Tagihan', 'Phone', 'text-cyan-600', 'bg-cyan-100', 'expense', TRUE, '{"Listrik", "Air", "Internet", "Telepon"}'),
('Hiburan', 'Gamepad2', 'text-pink-600', 'bg-pink-100', 'expense', TRUE, '{"Film & Bioskop", "Konser & Acara", "Game", "Buku", "Liburan"}'),
('Rumah', 'Home', 'text-green-600', 'bg-green-100', 'expense', TRUE, '{"Sewa & Cicilan", "Perbaikan", "Dekorasi", "Keamanan"}'),
('Pendidikan', 'GraduationCap', 'text-indigo-600', 'bg-indigo-100', 'expense', TRUE, '{"Biaya Sekolah/Kuliah", "Kursus & Pelatihan", "Buku Pelajaran", "Alat Tulis"}'),
('Kesehatan', 'HeartPulse', 'text-red-600', 'bg-red-100', 'expense', TRUE, '{"Dokter & RS", "Obat & Vitamin", "Pemeriksaan"}');

-- Insert Default Income Categories
INSERT INTO public.categories (name, icon, color, bg_color, type, is_default, sub_categories) VALUES
('Gaji', 'Briefcase', 'text-green-600', 'bg-green-100', 'income', TRUE, '{"Gaji Pokok", "Tunjangan"}'),
('Freelance', 'Briefcase', 'text-cyan-600', 'bg-cyan-100', 'income', TRUE, '{"Proyek Desain", "Konsultasi", "Penulisan"}'),
('Bonus', 'Gift', 'text-yellow-600', 'bg-yellow-100', 'income', TRUE, '{"Bonus Kinerja", "THR"}'),
('Investasi', 'PiggyBank', 'text-blue-600', 'bg-blue-100', 'income', TRUE, '{"Dividen", "Keuntungan Modal", "Bunga"}');
