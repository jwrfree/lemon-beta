import React, { useState } from 'react';
import { 
  CaretDown, 
  CaretUp,
  Plus,
  Bell,
  CreditCard,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  WarningCircle
} from '@/lib/icons';
export default function MobileDashboard() {
  // State untuk mengontrol Progressive Disclosure pada chart
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  // State simulasi untuk Contextual Widget (hanya muncul jika ada tagihan kritis)
  const [hasCriticalDebt] = useState(true); 

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      {/* LAYER 1: Glance (Hero Section) */}
      {/* Menggunakan solid Teal-600 dan shadow lembut agar terlihat premium & clean */}
      <section className="bg-teal-600 rounded-2xl p-6 text-white shadow-md mb-6 relative overflow-hidden">
        {/* Ornamen visual minimalis, tidak menggunakan blur circles yang padat */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <p className="text-teal-100 text-sm font-medium mb-1">Total Saldo</p>
          <h1 className="text-3xl font-bold mb-4">Rp 12.500.000</h1>
          
          {/* Mandatory Insight Sentence (< 90 kata) sesuai panduan audit */}
          <div className="bg-teal-700/50 rounded-xl p-3 border border-teal-500/30 backdrop-blur-sm">
            <p className="text-xs text-teal-50 leading-relaxed">
              <span className="font-semibold text-yellow-300 mr-1">Insight:</span> 
              Pengeluaranmu minggu ini turun 12%. Pertahankan ritme ini untuk capai target bulananmu!
            </p>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: Plus, label: 'Catat' },
          { icon: Bell, label: 'Pengingat' },
          { icon: CreditCard, label: 'Hutang' },
          { icon: QrCode, label: 'Scan' },
        ].map((action, i) => (
          <button key={i} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-teal-600 group-active:scale-95 transition-transform">
              <action.icon size={24} weight="regular" />
            </div>
            <span className="text-xs font-medium text-slate-600">{action.label}</span>
          </button>
        ))}
      </section>

      {/* CONTEXTUAL WIDGET: Rule 4 (Hanya muncul saat status kritis) */}
      {hasCriticalDebt && (
        <section className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
          <div className="mt-0.5 text-red-500">
            <WarningCircle size={20} weight="regular" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800 mb-1">Tagihan Kritis</h3>
            <p className="text-xs text-red-600 leading-relaxed mb-3">
              Cicilan Paylater jatuh tempo besok. Saldo BCA utama kamu cukup untuk melunasi sekarang.
            </p>
            <button className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 active:bg-red-300 px-3 py-1.5 rounded-lg transition-colors">
              Bayar Sekarang
            </button>
          </div>
        </section>
      )}

      {/* LAYER 2: Wallet Stack Carousel */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-semibold text-slate-800">Dompet Kamu</h2>
        </div>
        {/* Snap-scroll horizontal container, hidden scrollbar */}
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Wallet 1: Primary */}
          <div className="min-w-[140px] bg-slate-800 rounded-2xl p-4 text-white snap-center shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet size={16} weight="regular" />
              <span className="text-xs font-medium">BCA Utama</span>
            </div>
            <p className="text-lg font-bold">Rp 8.500.000</p>
          </div>
          
          {/* Wallet 2: E-Wallet */}
          <div className="min-w-[140px] bg-blue-600 rounded-2xl p-4 text-white snap-center shadow-sm">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet size={16} weight="regular" />
              <span className="text-xs font-medium">GoPay</span>
            </div>
            <p className="text-lg font-bold">Rp 1.200.000</p>
          </div>
          
          {/* Add Wallet Button */}
          <button className="min-w-[60px] border-2 border-slate-200 border-dashed rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 active:bg-slate-200 transition-colors snap-center">
            <Plus size={24} weight="regular" />
          </button>
        </div>
      </section>

      {/* LAYER 2: Expand (Collapsible Chart) */}
      {/* Chart disembunyikan secara default, hanya menampilkan summary text */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsChartExpanded(!isChartExpanded)}
        >
          <div>
            <h2 className="text-base font-semibold text-slate-800">Tren Pengeluaran</h2>
            { !isChartExpanded && (
              <p className="text-sm text-slate-500 mt-1">Rp 4.200.000 bulan ini</p>
            )}
          </div>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            {isChartExpanded ? <CaretUp size={20} weight="regular" /> : <CaretDown size={20} weight="regular" />}
          </button>
        </div>

        {/* Expanded State (Hanya muncul jika di-tap) */}
        {isChartExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Area Grafik - Di sini nantinya komponen Recharts/ChartJS di-render */}
            <div className="h-40 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-col gap-2 mb-4">
              <span className="text-sm text-slate-400 font-medium">[ Area Rendering Grafik ]</span>
            </div>
            
            {/* Extra detail info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Rata-rata Harian</p>
                <p className="text-sm font-semibold text-slate-800">Rp 140.000</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Top Kategori</p>
                <p className="text-sm font-semibold text-slate-800">F&B</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* LAYER 2: Recent Transactions (Strictly Max 2 Items) */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Transaksi Terbaru</h2>
        </div>

        <div className="space-y-4">
          {/* Transaksi 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <ArrowUpRight size={20} weight="regular" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Makan Siang</p>
                <p className="text-xs text-slate-500">Hari ini, 12:30 • BCA</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-800">-Rp 45.000</p>
          </div>

          {/* Transaksi 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                <ArrowDownRight size={20} weight="regular" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Gaji Bulanan</p>
                <p className="text-xs text-slate-500">Kemarin, 09:00 • Mandiri</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-teal-600">+Rp 8.500.000</p>
          </div>
        </div>

        {/* LAYER 3: Deep Dive */}
        {/* Tombol sekunder ini akan membawa user ke halaman detail transaksi penuh */}
        <button className="w-full mt-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors">
          Lihat Semua Transaksi
        </button>
      </section>
    </div>
  );
}
