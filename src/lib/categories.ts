export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg_color: string;
  sub_categories?: string[];
  type?: 'expense' | 'income' | 'internal';
  is_default?: boolean;
}

interface Categories {
  expense: Category[];
  income: Category[];
  internal: Category[];
}

export const categories: Categories = {
  expense: [
    { 
      id: 'cat-e-1', 
      name: 'Makanan', 
      icon: 'Utensils', 
      color: 'text-yellow-600 dark:text-yellow-500', 
      bg_color: 'bg-yellow-100 dark:bg-yellow-900/50',
      sub_categories: ['Restoran & Kafe', 'Bahan Makanan', 'Kopi', 'Jajanan', 'Delivery'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-2', 
      name: 'Belanja', 
      icon: 'ShoppingCart', 
      color: 'text-blue-600 dark:text-blue-500', 
      bg_color: 'bg-blue-100 dark:bg-blue-900/50',
      sub_categories: ['Fashion', 'Elektronik', 'Hobi', 'Rumah Tangga', 'Hadiah'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-3', 
      name: 'Transportasi', 
      icon: 'Car', 
      color: 'text-purple-600 dark:text-purple-500', 
      bg_color: 'bg-purple-100 dark:bg-purple-900/50',
      sub_categories: ['Transportasi Umum', 'Bensin', 'Gojek/Grab', 'Parkir', 'Servis & Cuci'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-4', 
      name: 'Tagihan', 
      icon: 'Phone', 
      color: 'text-cyan-600 dark:text-cyan-500', 
      bg_color: 'bg-cyan-100 dark:bg-cyan-900/50',
      sub_categories: ['Listrik', 'Air', 'Internet', 'Telepon'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-10',
      name: 'Langganan',
      icon: 'ReceiptText',
      color: 'text-orange-600 dark:text-orange-500',
      bg_color: 'bg-orange-100 dark:bg-orange-900/50',
      sub_categories: ['Software', 'Cloud Storage', 'Streaming Service', 'Lainnya'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-5', 
      name: 'Hiburan', 
      icon: 'Gamepad2', 
      color: 'text-pink-600 dark:text-pink-500', 
      bg_color: 'bg-pink-100 dark:bg-pink-900/50',
      sub_categories: ['Film & Bioskop', 'Konser & Acara', 'Game', 'Buku', 'Liburan'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-6', 
      name: 'Rumah', 
      icon: 'Home', 
      color: 'text-green-600 dark:text-green-500', 
      bg_color: 'bg-green-100 dark:bg-green-900/50',
      sub_categories: ['Sewa & Cicilan', 'Perbaikan', 'Dekorasi', 'Keamanan'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-7', 
      name: 'Pendidikan', 
      icon: 'GraduationCap', 
      color: 'text-indigo-600 dark:text-indigo-500', 
      bg_color: 'bg-indigo-100 dark:bg-indigo-900/50',
      sub_categories: ['Biaya Sekolah/Kuliah', 'Kursus & Pelatihan', 'Buku Pelajaran', 'Alat Tulis'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-8', 
      name: 'Kesehatan', 
      icon: 'HeartPulse', 
      color: 'text-pink-600 dark:text-pink-500', 
      bg_color: 'bg-pink-100 dark:bg-pink-900/50',
      sub_categories: ['Dokter & RS', 'Obat & Vitamin', 'Pemeriksaan'],
      is_default: true,
      type: 'expense'
    },
    { 
      id: 'cat-e-12', 
      name: 'Perawatan Diri', 
      icon: 'Sparkles', 
      color: 'text-fuchsia-600 dark:text-fuchsia-500', 
      bg_color: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
      sub_categories: ['Skincare', 'Potong Rambut', 'Perawatan Tubuh', 'Makeup'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-14',
      name: 'Keluarga',
      icon: 'Baby',
      color: 'text-violet-600 dark:text-violet-500',
      bg_color: 'bg-violet-100 dark:bg-violet-900/50',
      sub_categories: ['Perlengkapan Anak', 'Uang Saku', 'Dukungan Orang Tua', 'Mainan'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-15',
      name: 'Donasi & Sosial',
      icon: 'Heart',
      color: 'text-rose-500 dark:text-rose-400',
      bg_color: 'bg-rose-100 dark:bg-rose-900/50',
      sub_categories: ['Zakat', 'Sedekah', 'Sumbangan', 'Kondangan'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-11',
      name: 'Asuransi',
      icon: 'ShieldCheck',
      color: 'text-teal-600 dark:text-teal-500',
      bg_color: 'bg-teal-100 dark:bg-teal-900/50',
      sub_categories: ['Asuransi Jiwa', 'Asuransi Kesehatan', 'Asuransi Kendaraan', 'BPJS'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-13',
      name: 'Bayar Hutang',
      icon: 'HandCoins',
      color: 'text-pink-600 dark:text-pink-500',
      bg_color: 'bg-pink-100 dark:bg-pink-900/40',
      sub_categories: ['Cicilan', 'Pinjaman Teman', 'Kartu Kredit', 'Lainnya'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-9',
      name: 'Lain-lain',
      icon: 'Wrench',
      color: 'text-gray-600 dark:text-gray-500', 
      bg_color: 'bg-gray-100 dark:bg-gray-900/50',
      sub_categories: ['Hewan Peliharaan', 'Pajak', 'Biaya Admin Bank', 'Kebutuhan Kerja', 'Lainnya'],
      is_default: true,
      type: 'expense'
    },
  ],
  income: [
    { 
      id: 'cat-i-1', 
      name: 'Gaji', 
      icon: 'Briefcase', 
      color: 'text-teal-600 dark:text-teal-500', 
      bg_color: 'bg-teal-100 dark:bg-teal-900/50',
      sub_categories: ['Gaji Pokok', 'Tunjangan'],
      is_default: true,
      type: 'income'
    },
    { 
      id: 'cat-i-5', 
      name: 'Freelance', 
      icon: 'Briefcase', 
      color: 'text-cyan-600 dark:text-cyan-500', 
      bg_color: 'bg-cyan-100 dark:bg-cyan-900/50',
      sub_categories: ['Proyek Desain', 'Konsultasi', 'Penulisan', 'Lainnya'],
      is_default: true,
      type: 'income'
    },
    { 
      id: 'cat-i-2', 
      name: 'Bonus', 
      icon: 'Gift', 
      color: 'text-yellow-600 dark:text-yellow-500', 
      bg_color: 'bg-yellow-100 dark:bg-yellow-900/50',
      sub_categories: ['Bonus Kinerja', 'THR'],
      is_default: true,
      type: 'income'
    },
    { 
      id: 'cat-i-3', 
      name: 'Investasi', 
      icon: 'PiggyBank', 
      color: 'text-blue-600 dark:text-blue-500', 
      bg_color: 'bg-blue-100 dark:bg-blue-900/50',
      sub_categories: ['Dividen', 'Keuntungan Modal', 'Bunga'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-4',
      name: 'Lain-lain',
      icon: 'Handshake',
      color: 'text-gray-600 dark:text-gray-500',
      bg_color: 'bg-gray-100 dark:bg-gray-900/50',
      sub_categories: ['Hadiah Uang', 'Penjualan Barang'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-6',
      name: 'Terima Piutang',
      icon: 'Handshake',
      color: 'text-emerald-600 dark:text-emerald-500',
      bg_color: 'bg-emerald-100 dark:bg-emerald-900/40',
      sub_categories: ['Pembayaran Pinjaman', 'Refund', 'Lainnya'],
      is_default: true,
      type: 'income'
    },
  ],
  internal: [
    { 
      id: 'cat-t-1', 
      name: 'Transfer', 
      icon: 'ArrowRightLeft', 
      color: 'text-gray-600 dark:text-gray-500', 
      bg_color: 'bg-gray-100 dark:bg-gray-900/50',
      is_default: true,
      type: 'internal'
    },
  ]
};

const allCategories = [...categories.expense, ...categories.income, ...categories.internal];
const defaultCategory: Category = { 
  id: 'default', 
  name: 'Lain-lain', 
  icon: 'Wrench', 
  color: 'text-gray-600 dark:text-gray-500', 
  bg_color: 'bg-gray-100 dark:bg-gray-900/50',
  is_default: true,
  type: 'expense'
};

export const categoryDetails = (name: string): Category => {
  const category = allCategories.find(c => c.name === name);
  return category || defaultCategory;
};
