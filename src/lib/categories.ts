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
      name: 'Konsumsi & F&B',
      icon: 'Utensils',
      color: 'text-yellow-600 dark:text-yellow-500',
      bg_color: 'bg-yellow-100 dark:bg-yellow-900/50',
      sub_categories: ['Makan Harian/Warteg', 'Restoran & Kafe', 'Jajanan & Kopi', 'Gofood/Grabfood', 'Bahan Masakan (Grocery)', 'Catering'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-2',
      name: 'Belanja & Lifestyle',
      icon: 'ShoppingCart',
      color: 'text-blue-600 dark:text-blue-500',
      bg_color: 'bg-blue-100 dark:bg-blue-900/50',
      sub_categories: ['Fashion & Pakaian', 'Elektronik & Gadget', 'Hobi & Koleksi', 'Skin Care & Perawatan', 'Keperluan Rumah Tangga', 'Marketplace (Tokped/Shopee)'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-3',
      name: 'Transportasi',
      icon: 'Car',
      color: 'text-purple-600 dark:text-purple-500',
      bg_color: 'bg-purple-100 dark:bg-purple-900/50',
      sub_categories: ['Ojek Online (Gojek/Grab)', 'Bensin', 'Parkir & Tol', 'Servis & Cuci Kendaraan', 'Transportasi Umum', 'Travel & Tiket Pesawat'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-4',
      name: 'Tagihan & Utilitas',
      icon: 'Zap',
      color: 'text-cyan-600 dark:text-cyan-500',
      bg_color: 'bg-cyan-100 dark:bg-cyan-900/50',
      sub_categories: ['Listrik (Token/Tagihan)', 'Pulsa & Paket Data', 'Internet & TV Kabel', 'Air (PDAM)', 'Iuran Keamanan/Lingkungan', 'BPJS Kesehatan'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-10',
      name: 'Langganan Digital',
      icon: 'Tv',
      color: 'text-orange-600 dark:text-orange-500',
      bg_color: 'bg-orange-100 dark:bg-orange-900/50',
      sub_categories: ['Hiburan (Netflix/Spotify)', 'Cloud (iCloud/Google One)', 'SaaS (ChatGPT/Premium Apps)', 'Youtube Premium'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-5',
      name: 'Hiburan & Wisata',
      icon: 'Gamepad2',
      color: 'text-pink-600 dark:text-pink-500',
      bg_color: 'bg-pink-100 dark:bg-pink-900/50',
      sub_categories: ['Bioskop', 'Game & Top Up', 'Liburan & Hotel', 'Event & Konser', 'Buku & Majalah', 'Staycation'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-6',
      name: 'Rumah & Properti',
      icon: 'Home',
      color: 'text-green-600 dark:text-green-500',
      bg_color: 'bg-green-100 dark:bg-green-900/50',
      sub_categories: ['Kos/Kontrakan', 'Cicilan Rumah', 'Renovasi & Perbaikan', 'Perabot & Dekorasi'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-8',
      name: 'Kesehatan & Medis',
      icon: 'HeartPulse',
      color: 'text-red-600 dark:text-red-500',
      bg_color: 'bg-red-100 dark:bg-red-900/50',
      sub_categories: ['Rumah Sakit & Dokter', 'Obat & Vitamin', 'Asuransi Kesehatan', 'Lab & Checkup', 'Kesehatan Mental'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-7',
      name: 'Pendidikan',
      icon: 'GraduationCap',
      color: 'text-indigo-600 dark:text-indigo-500',
      bg_color: 'bg-indigo-100 dark:bg-indigo-900/50',
      sub_categories: ['Biaya Sekolah/Kuliah', 'Kursus & Sertifikasi', 'Buku Pendidikan', 'Seminar'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-16',
      name: 'Bisnis & Produktivitas',
      icon: 'Briefcase',
      color: 'text-emerald-600 dark:text-emerald-500',
      bg_color: 'bg-emerald-100 dark:bg-emerald-900/50',
      sub_categories: ['Alat Kerja & Hardware', 'Iklan & Marketing', 'Co-working Space', 'Hosting & Domain'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-14',
      name: 'Keluarga & Anak',
      icon: 'Baby',
      color: 'text-violet-600 dark:text-violet-500',
      bg_color: 'bg-violet-100 dark:bg-violet-900/50',
      sub_categories: ['Susu & Popok', 'Uang Saku Anak', 'Kirim Orang Tua', 'Kebutuhan Bayi'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-15',
      name: 'Sosial & Donasi',
      icon: 'Heart',
      color: 'text-rose-500 dark:text-rose-400',
      bg_color: 'bg-rose-100 dark:bg-rose-900/50',
      sub_categories: ['Zakat & Sedekah', 'Kondangan & Hadiah', 'Sumbangan Sosial', 'Patungan'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-17',
      name: 'Investasi & Aset',
      icon: 'TrendingUp',
      color: 'text-emerald-600 dark:text-emerald-500',
      bg_color: 'bg-emerald-100 dark:bg-emerald-900/50',
      sub_categories: ['Reksa Dana', 'Saham & Obligasi', 'Crypto', 'Emas', 'Tabungan Berjangka'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-13',
      name: 'Cicilan & Pinjaman',
      icon: 'HandCoins',
      color: 'text-pink-600 dark:text-pink-500',
      bg_color: 'bg-pink-100 dark:bg-pink-900/40',
      sub_categories: ['Cicilan Kendaraan', 'Kartu Kredit', 'Paylater', 'Bayar Hutang Teman'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-9',
      name: 'Biaya Lain-lain',
      icon: 'Wrench',
      color: 'text-gray-600 dark:text-gray-500',
      bg_color: 'bg-gray-100 dark:bg-gray-900/50',
      sub_categories: ['Biaya Admin Bank', 'Pajak', 'Kebutuhan Mendadak', 'Lainnya'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-99',
      name: 'Penyesuaian Saldo',
      icon: 'Scale',
      color: 'text-orange-600 dark:text-orange-500',
      bg_color: 'bg-orange-100 dark:bg-orange-900/50',
      sub_categories: ['Koreksi'],
      is_default: true,
      type: 'expense'
    },
  ],
  income: [
    {
      id: 'cat-i-1',
      name: 'Gaji & Tetap',
      icon: 'Briefcase',
      color: 'text-teal-600 dark:text-teal-500',
      bg_color: 'bg-teal-100 dark:bg-teal-900/50',
      sub_categories: ['Gaji Pokok', 'Bonus & THR', 'Tunjangan', 'Lembur', 'Uang Makan/Transport'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-5',
      name: 'Bisnis & Freelance',
      icon: 'Code',
      color: 'text-cyan-600 dark:text-cyan-500',
      bg_color: 'bg-cyan-100 dark:bg-cyan-900/50',
      sub_categories: ['Proyek Jasa', 'Penjualan Produk', 'Komisi & Affiliate', 'Hasil AdSense/Ads', 'Tips'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-3',
      name: 'Investasi & Pasif',
      icon: 'TrendingUp',
      color: 'text-emerald-600 dark:text-emerald-500',
      bg_color: 'bg-emerald-100 dark:bg-emerald-900/50',
      sub_categories: ['Bunga Bank', 'Dividen & Kupon', 'Profit Trading/Emas', 'Sewa Properti', 'Royalti'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-8',
      name: 'Pemberian & Hadiah',
      icon: 'Gift',
      color: 'text-pink-600 dark:text-pink-500',
      bg_color: 'bg-pink-100 dark:bg-pink-900/50',
      sub_categories: ['Dari Keluarga', 'Hadiah & Angpao', 'Uang Saku', 'Zakat/Infaq Terima', 'Warisan'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-10',
      name: 'Refund & Cashback',
      icon: 'RefreshCw',
      color: 'text-blue-600 dark:text-blue-500',
      bg_color: 'bg-blue-100 dark:bg-blue-900/50',
      sub_categories: ['Cashback Belanja', 'Refund Pembatalan', 'Klaim Asuransi', 'Kelebihan Bayar'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-11',
      name: 'Penjualan Aset',
      icon: 'BadgeDollarSign',
      color: 'text-orange-600 dark:text-orange-500',
      bg_color: 'bg-orange-100 dark:bg-orange-900/50',
      sub_categories: ['Jual Barang Bekas', 'Jual Elektronik/HP', 'Jual Kendaraan', 'Jual Emas/Perhiasan', 'Jual Properti'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-6',
      name: 'Terima Piutang',
      icon: 'Handshake',
      color: 'text-indigo-600 dark:text-indigo-500',
      bg_color: 'bg-indigo-100 dark:bg-indigo-900/40',
      sub_categories: ['Pelunasan Teman', 'Refund Dana Talangan', 'Cicilan Piutang'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-4',
      name: 'Pendapatan Lain',
      icon: 'Wallet',
      color: 'text-gray-600 dark:text-gray-500',
      bg_color: 'bg-gray-100 dark:bg-gray-900/50',
      sub_categories: ['Uang Temuan', 'Kompensasi/Pesangon', 'Lainnya'],
      is_default: true,
      type: 'income'
    },
    {
      id: 'cat-i-99',
      name: 'Penyesuaian Saldo',
      icon: 'Scale',
      color: 'text-teal-600 dark:text-teal-500',
      bg_color: 'bg-teal-100 dark:bg-teal-900/50',
      sub_categories: ['Koreksi'],
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
