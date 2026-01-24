
import { Utensils, ShoppingCart, Car, Phone, Gamepad2, Home, GraduationCap, HeartPulse, Wrench, Briefcase, Gift, PiggyBank, Handshake, LucideIcon, ArrowRightLeft, ReceiptText, ShieldCheck, Sparkles, HandCoins, Heart, Baby } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subCategories?: string[];
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
      icon: Utensils, 
      color: 'text-yellow-600 dark:text-yellow-500', 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
      subCategories: ['Restoran & Kafe', 'Bahan Makanan', 'Kopi', 'Jajanan', 'Delivery']
    },
    { 
      id: 'cat-e-2', 
      name: 'Belanja', 
      icon: ShoppingCart, 
      color: 'text-blue-600 dark:text-blue-500', 
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      subCategories: ['Fashion', 'Elektronik', 'Hobi', 'Rumah Tangga', 'Hadiah']
    },
    { 
      id: 'cat-e-3', 
      name: 'Transportasi', 
      icon: Car, 
      color: 'text-purple-600 dark:text-purple-500', 
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      subCategories: ['Transportasi Umum', 'Bensin', 'Gojek/Grab', 'Parkir', 'Servis & Cuci']
    },
    { 
      id: 'cat-e-4', 
      name: 'Tagihan', 
      icon: Phone, 
      color: 'text-cyan-600 dark:text-cyan-500', 
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/50',
      subCategories: ['Listrik', 'Air', 'Internet', 'Telepon']
    },
    {
      id: 'cat-e-10',
      name: 'Langganan',
      icon: ReceiptText,
      color: 'text-orange-600 dark:text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      subCategories: ['Software', 'Cloud Storage', 'Streaming Service', 'Lainnya']
    },
    { 
      id: 'cat-e-5', 
      name: 'Hiburan', 
      icon: Gamepad2, 
      color: 'text-pink-600 dark:text-pink-500', 
      bgColor: 'bg-pink-100 dark:bg-pink-900/50',
      subCategories: ['Film & Bioskop', 'Konser & Acara', 'Game', 'Buku', 'Liburan']
    },
    { 
      id: 'cat-e-6', 
      name: 'Rumah', 
      icon: Home, 
      color: 'text-green-600 dark:text-green-500', 
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      subCategories: ['Sewa & Cicilan', 'Perbaikan', 'Dekorasi', 'Keamanan']
    },
    { 
      id: 'cat-e-7', 
      name: 'Pendidikan', 
      icon: GraduationCap, 
      color: 'text-indigo-600 dark:text-indigo-500', 
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
      subCategories: ['Biaya Sekolah/Kuliah', 'Kursus & Pelatihan', 'Buku Pelajaran', 'Alat Tulis']
    },
    { 
      id: 'cat-e-8', 
      name: 'Kesehatan', 
      icon: HeartPulse, 
      color: 'text-pink-600 dark:text-pink-500', 
      bgColor: 'bg-pink-100 dark:bg-pink-900/50',
      subCategories: ['Dokter & RS', 'Obat & Vitamin', 'Pemeriksaan']
    },
    { 
      id: 'cat-e-12', 
      name: 'Perawatan Diri', 
      icon: Sparkles, 
      color: 'text-fuchsia-600 dark:text-fuchsia-500', 
      bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
      subCategories: ['Skincare', 'Potong Rambut', 'Perawatan Tubuh', 'Makeup']
    },
    {
      id: 'cat-e-14',
      name: 'Keluarga',
      icon: Baby,
      color: 'text-violet-600 dark:text-violet-500',
      bgColor: 'bg-violet-100 dark:bg-violet-900/50',
      subCategories: ['Perlengkapan Anak', 'Uang Saku', 'Dukungan Orang Tua', 'Mainan']
    },
    {
      id: 'cat-e-15',
      name: 'Donasi & Sosial',
      icon: Heart,
      color: 'text-rose-500 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-900/50',
      subCategories: ['Zakat', 'Sedekah', 'Sumbangan', 'Kondangan']
    },
    {
      id: 'cat-e-11',
      name: 'Asuransi',
      icon: ShieldCheck,
      color: 'text-teal-600 dark:text-teal-500',
      bgColor: 'bg-teal-100 dark:bg-teal-900/50',
      subCategories: ['Asuransi Jiwa', 'Asuransi Kesehatan', 'Asuransi Kendaraan', 'BPJS']
    },
    {
      id: 'cat-e-13',
      name: 'Bayar Hutang',
      icon: HandCoins,
      color: 'text-pink-600 dark:text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/40',
      subCategories: ['Cicilan', 'Pinjaman Teman', 'Kartu Kredit', 'Lainnya']
    },
    {
      id: 'cat-e-9',
      name: 'Lain-lain',
      icon: Wrench,
      color: 'text-gray-600 dark:text-gray-500', 
      bgColor: 'bg-gray-100 dark:bg-gray-900/50',
      subCategories: ['Hewan Peliharaan', 'Pajak', 'Biaya Admin Bank', 'Kebutuhan Kerja', 'Lainnya']
    },
  ],
  income: [
    { 
      id: 'cat-i-1', 
      name: 'Gaji', 
      icon: Briefcase, 
      color: 'text-teal-600 dark:text-teal-500', 
      bgColor: 'bg-teal-100 dark:bg-teal-900/50',
      subCategories: ['Gaji Pokok', 'Tunjangan']
    },
    { 
      id: 'cat-i-5', 
      name: 'Freelance', 
      icon: Briefcase, 
      color: 'text-cyan-600 dark:text-cyan-500', 
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/50',
      subCategories: ['Proyek Desain', 'Konsultasi', 'Penulisan', 'Lainnya']
    },
    { 
      id: 'cat-i-2', 
      name: 'Bonus', 
      icon: Gift, 
      color: 'text-yellow-600 dark:text-yellow-500', 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
      subCategories: ['Bonus Kinerja', 'THR']
    },
    { 
      id: 'cat-i-3', 
      name: 'Investasi', 
      icon: PiggyBank, 
      color: 'text-blue-600 dark:text-blue-500', 
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      subCategories: ['Dividen', 'Keuntungan Modal', 'Bunga']
    },
    {
      id: 'cat-i-4',
      name: 'Lain-lain',
      icon: Handshake,
      color: 'text-gray-600 dark:text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-900/50',
      subCategories: ['Hadiah Uang', 'Penjualan Barang']
    },
    {
      id: 'cat-i-6',
      name: 'Terima Piutang',
      icon: Handshake,
      color: 'text-emerald-600 dark:text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
      subCategories: ['Pembayaran Pinjaman', 'Refund', 'Lainnya']
    },
  ],
  internal: [
    { 
      id: 'cat-t-1', 
      name: 'Transfer', 
      icon: ArrowRightLeft, 
      color: 'text-gray-600 dark:text-gray-500', 
      bgColor: 'bg-gray-100 dark:bg-gray-900/50'
    },
  ]
};

const allCategories = [...categories.expense, ...categories.income, ...categories.internal];
const defaultCategory: Category = { 
  id: 'default', 
  name: 'Lain-lain', 
  icon: Wrench, 
  color: 'text-gray-600 dark:text-gray-500', 
  bgColor: 'bg-gray-100 dark:bg-gray-900/50',
};

export const categoryDetails = (name: string): Category => {
  const category = allCategories.find(c => c.name === name);
  return category || defaultCategory;
};
