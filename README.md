# Lemon – Personal Finance Tracker

> **v2.2.0** · Released · February 2026

Lemon adalah pendamping keuangan modern yang membantu pekerja digital Indonesia mengendalikan pemasukan, pengeluaran, hutang, dan tujuan finansial dalam satu genggaman. Rilis v2.2.0 menghadirkan standar **"Premium Fidelity"** dengan statistik tingkat lanjut dan pengalaman PWA yang setara dengan aplikasi asli.

## ✨ Sorotan Utama & Peningkatan Terbaru
- **Analisis Finansial Mendalam:** 4 layer data baru: *Net Worth Trend* (6 bulan), *Saving Potential* (Efisiensi tabungan), *Behavior Analytics* (Weekday vs Weekend), dan *Subscription Audit*.
- **Premium UI/UX Fidelity:** Penggunaan *Skeleton Screens*, *Haptic Feedback*, dan animasi perayaan sukses yang memberikan sensasi aplikasi "High-End".
- **Optimistic Updates:** Respons UI instan (zero-latency) saat mencatat transaksi—angka saldo diperbarui sebelum konfirmasi server selesai.
- **PWA Elite Experience:** Dukungan instalasi mandiri melalui modul "Instal Lemon" yang mewah di pengaturan dan mode luring yang lebih tangguh.
- **Arsitektur Modular (Clean Code):** Refaktorisasi besar-besaran modul transaksi ke dalam *Service Layer* dan *Custom Hooks* untuk keandalan jangka panjang.
- **AI Smart Add 2.0:** Pencatatan super cepat dengan bahasa alami yang kini mendukung deteksi banyak transaksi sekaligus (bulk add) dan kategori granular (Sub-Kategori).
- **Overhaul UI/UX Desktop (Aset & Dompet):** Desain ulang halaman manajemen aset pada desktop dengan kartu ringkasan gradien dan hierarki visual enterprise.

*Untuk detail teknis lengkap, silakan lihat [CHANGELOG.md](./CHANGELOG.md).*

## 🧭 Alur Pengguna Utama
| Alur | Ringkasan |
| --- | --- |
| **Onboarding & Aktivasi** | Landing → CTA → modal Sign Up/Login → verifikasi email → optional biometric → Dashboard. |
| **Catat Transaksi Cepat** | Quick action "Catat" → pilih Manual/AI → isi detail → simpan → toast + counter saldo memperbarui. |
| **Smart Reminders** | Buat pengingat dari quick action/tab → pilih frekuensi & kanal → Reminder Center → notifikasi & snooze. |
| **Debt & IOU** | Form hutang/piutang lengkap → timeline pembayaran → integrasi dengan reminders & insight Debt Health. |
| **Budgeting** | Progress ring kategori, rekomendasi AI, dan penyesuaian target real-time. |
| **Insights** | Ringkasan mingguan AI, tren kategori, distribusi pengeluaran, dan rekomendasi tindakan. |

## 🎨 Prinsip Desain & Aksesibilitas
- Skala tipografi dan warna konsisten (teal/lemon) dengan rasio kontras AA.
- Spacing 4/8 px, radius 16–32 px, dan shadow lembut menjaga hierarki tanpa clutter.
- Fokus ring jelas, skip link, serta anchor nav mendukung navigasi keyboard.
- Semua animasi memakai standar 0.28 s ease-out dan menghormati preferensi reduced motion.
- Alert error & sukses menggunakan `aria-live`, ilustrasi dekoratif diberi `aria-hidden`.

## 📚 Dokumentasi
- [Design Audit](./docs/design-audit.md) – rangkuman heuristik, sistem desain, dan evaluasi alur lengkap.
- [Product Blueprint](./docs/blueprint.md) – referensi arsitektur informasi, flow detail, motion spec, dan roadmap.
- [Changelog](./CHANGELOG.md) – riwayat pembaruan fitur dan peningkatan teknis.
- [UX Writing Guide](./UX_WRITING_GUIDE.md) – panduan gaya penulisan microcopy.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **UI:** Tailwind CSS & shadcn/ui
- **Backend:** Supabase (Auth, Database, Realtime)
- **AI:** DeepSeek V3 (Core Extraction), Google Gemini & Genkit (Insights)
- **Form & Validasi:** React Hook Form & Zod
- **Animasi:** Framer Motion (dengan dukungan `prefers-reduced-motion`)

## 🚀 Menjalankan Secara Lokal
1. Clone repositori ini.
2. Instal dependensi: `npm install`
3. Jalankan server pengembangan: `npm run dev`
4. Buka [http://localhost:3000](http://localhost:3000) di browser.
5. Siapkan konfigurasi Firebase Anda sendiri pada variabel lingkungan sebelum menguji autentikasi.

Selamat merapikan keuangan! Jangan ragu membuka issue atau pull request untuk ide lanjutan.
