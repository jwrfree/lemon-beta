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
      sub_categories: ['Warteg/Rumah Makan', 'Restoran & Kafe', 'Jajanan & Kopi', 'Gofood/Grabfood', 'Bahan Masak', 'Catering'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-2',
      name: 'Belanja',
      icon: 'ShoppingCart',
      color: 'text-blue-600 dark:text-blue-500',
      bg_color: 'bg-blue-100 dark:bg-blue-900/50',
      sub_categories: ['Marketplace (Tokped/Shopee)', 'Minimarket (Alfa/Indo)', 'Supermarket', 'Fashion', 'Elektronik', 'Hobi', 'Skincare/Makeup'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-3',
      name: 'Transportasi',
      icon: 'Car',
      color: 'text-purple-600 dark:text-purple-500',
      bg_color: 'bg-purple-100 dark:bg-purple-900/50',
      sub_categories: ['Ojek Online', 'Bensin', 'Tol & Parkir', 'Servis & Cuci', 'Transportasi Umum', 'Travel & Pesawat'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-4',
      name: 'Tagihan',
      icon: 'Phone',
      color: 'text-cyan-600 dark:text-cyan-500',
      bg_color: 'bg-cyan-100 dark:bg-cyan-900/50',
      sub_categories: ['Token/Tagihan Listrik', 'Pulsa & Paket Data', 'Internet & TV Kabel', 'Air (PDAM)', 'BPJS Kesehatan', 'Pajak'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-10',
      name: 'Langganan',
      icon: 'ReceiptText',
      color: 'text-orange-600 dark:text-orange-500',
      bg_color: 'bg-orange-100 dark:bg-orange-900/50',
      sub_categories: ['Netflix/Spotify', 'Google One/iCloud', 'Youtube Premium', 'SaaS/ChatGPT', 'Gym Membership'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-5',
      name: 'Hiburan',
      icon: 'Gamepad2',
      color: 'text-pink-600 dark:text-pink-500',
      bg_color: 'bg-pink-100 dark:bg-pink-900/50',
      sub_categories: ['Bioskop', 'Game/Top Up', 'Buku & Majalah', 'Konser/Event', 'Staycation', 'Liburan'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-6',
      name: 'Rumah & Properti',
      icon: 'Home',
      color: 'text-green-600 dark:text-green-500',
      bg_color: 'bg-green-100 dark:bg-green-900/50',
      sub_categories: ['Kos/Kontrakan', 'Cicilan Rumah', 'Perbaikan/Renovasi', 'Keamanan & Iuran', 'Perabot/Dekorasi'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-16',
      name: 'Kerja & Bisnis',
      icon: 'Briefcase',
      color: 'text-indigo-600 dark:text-indigo-500',
      bg_color: 'bg-indigo-100 dark:bg-indigo-900/50',
      sub_categories: ['Co-working Space', 'Hardware/Alat Kerja', 'Iklan/Marketing', 'Hosting/Domain', 'Meeting/Client'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-7',
      name: 'Pendidikan',
      icon: 'GraduationCap',
      color: 'text-indigo-600 dark:text-indigo-500',
      bg_color: 'bg-indigo-100 dark:bg-indigo-900/50',
      sub_categories: ['Biaya Sekolah/Kuliah', 'Kursus Online', 'Buku Pendidikan', 'Seminar/Sertifikasi'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-8',
      name: 'Kesehatan',
      icon: 'HeartPulse',
      color: 'text-red-600 dark:text-red-500',
      bg_color: 'bg-red-100 dark:bg-red-900/50',
      sub_categories: ['Rumah Sakit/Dokter', 'Obat & Vitamin', 'Asuransi', 'Kesehatan Mental', 'Pemeriksaan/Lab'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-14',
      name: 'Keluarga & Anak',
      icon: 'Baby',
      color: 'text-violet-600 dark:text-violet-500',
      bg_color: 'bg-violet-100 dark:bg-violet-900/50',
      sub_categories: ['Susu & Popok', 'Mainan/Sekolah Anak', 'Uang Saku', 'Kirim Orang Tua'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-15',
      name: 'Sosial & Donasi',
      icon: 'Heart',
      color: 'text-rose-500 dark:text-rose-400',
      bg_color: 'bg-rose-100 dark:bg-rose-900/50',
      sub_categories: ['Kondangan/Hadiah', 'Zakat & Sedekah', 'Patungan', 'Sumbangan Sosial'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-17',
      name: 'Investasi Keluar',
      icon: 'TrendingUp',
      color: 'text-emerald-600 dark:text-emerald-500',
      bg_color: 'bg-emerald-100 dark:bg-emerald-900/50',
      sub_categories: ['Reksa Dana', 'Saham/Obligasi', 'Crypto', 'Emas', 'Tabungan Berjangka'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-13',
      name: 'Cicilan & Hutang',
      icon: 'HandCoins',
      color: 'text-pink-600 dark:text-pink-500',
      bg_color: 'bg-pink-100 dark:bg-pink-900/40',
      sub_categories: ['Paylater', 'Kartu Kredit', 'Cicilan Kendaraan', 'Pinjaman Teman'],
      is_default: true,
      type: 'expense'
    },
    {
      id: 'cat-e-9',
      name: 'Lain-lain',
      icon: 'Wrench',
      color: 'text-gray-600 dark:text-gray-500',
      bg_color: 'bg-gray-100 dark:bg-gray-900/50',
      sub_categories: ['Hewan Peliharaan', 'Biaya Admin Bank', 'Kebutuhan Mendadak', 'Lainnya'],
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
