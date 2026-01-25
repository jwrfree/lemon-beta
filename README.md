# Lemon – Personal Finance Tracker

> **v2.1.0** · Released · January 2026

Lemon adalah pendamping keuangan modern yang membantu pekerja digital Indonesia mengendalikan pemasukan, pengeluaran, hutang, dan tujuan finansial dalam satu genggaman. Rilis v2.1.0 memperkenalkan fitur pelacakan kekayaan bersih (Net Worth) yang komprehensif serta alat bantu estimasi biaya AI bagi developer.

## ✨ Sorotan Utama & Peningkatan Terbaru
- **Overhaul UI/UX Desktop (Aset & Dompet):** Desain ulang halaman manajemen aset pada desktop dengan kartu ringkasan gradien, daftar dompet modern, dan hierarki visual yang lebih baik.
- **Tracking Kekayaan Bersih:** Monitor aset (investasi, properti) & liabilitas (hutang, cicilan) dalam satu dashboard untuk melihat Net Worth secara real-time.
- **Visual Transaksi Konsisten:** Indikator warna merah (`rose-600`) yang konsisten untuk semua pengeluaran dan ikon yang seragam di seluruh aplikasi.
- **Kalkulator Token AI:** Alat bantu developer untuk estimasi biaya token DeepSeek V3 dan runway budget API.
- **Landing yang terstruktur & edukatif:** navigasi anchor, skip link, copy hero baru, serta CTA ganda (daftar & masuk) membuat pengguna cepat memahami nilai produk.
- **Autentikasi kaya kendali:** bottom sheet login/sign-up/forgot-password dengan pesan error inline, dukungan biometrik, dan `prefers-reduced-motion` untuk menjaga kenyamanan.
- **Ekosistem fitur lengkap:** pencatatan transaksi manual & AI, manajemen dompet, budgeting progresif, pengingat pintar, tracking hutang/piutang, dan insight AI.
- **Motion inklusif:** animasi 0.28 s ease-out yang otomatis dinonaktifkan ketika pengguna memilih reduced motion.
- **Dokumentasi mutakhir:** design audit, blueprint, changelog, serta README diperbarui agar tim lintas fungsi mendapat konteks rilis yang jelas.

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
- **Backend:** Firebase (Auth, Firestore, Functions)
- **AI:** Google Gemini & Genkit
- **Form & Validasi:** React Hook Form & Zod
- **Animasi:** Framer Motion (dengan dukungan `prefers-reduced-motion`)

## 🚀 Menjalankan Secara Lokal
1. Clone repositori ini.
2. Instal dependensi: `npm install`
3. Jalankan server pengembangan: `npm run dev`
4. Buka [http://localhost:3000](http://localhost:3000) di browser.
5. Siapkan konfigurasi Firebase Anda sendiri pada variabel lingkungan sebelum menguji autentikasi.

Selamat merapikan keuangan! Jangan ragu membuka issue atau pull request untuk ide lanjutan.
