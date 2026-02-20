# Lemon Mobile Blueprint

## 0. Release Snapshot – v2.2.0 (February 2026)
- **Status:** Released.
- **Fokus rilis:** Mencapai standar "Premium Fidelity" melalui optimasi performa, analitik mendalam, dan pengalaman PWA yang setara aplikasi native.
- **Highlight baru:** Analytics layer (Net Worth Trend, Saving Potential), update optimistik (zero-latency), skeleton screens, haptic feedback, dan overhaul UI desktop.

## 0.1 Previous Snapshot – v2.1.0 (January 2026)
- **Status:** Integrated.
- **Fokus rilis:** Memperkuat kecerdasan buatan (AI) untuk efisiensi pencatatan, pemantauan kesehatan hutang yang lebih mendalam, serta optimalisasi UI desktop.
- **Highlight baru:** Smart Add 2.0 didukung DeepSeek V3 (bulk add, wallet detection), dashboard Net Worth real-time, dan kalkulator estimasi biaya AI bagi developer.

## 1. Product Vision
Lemon adalah pendamping keuangan mobile-first yang mengutamakan kualitas "Premium Fidelity". Tujuannya: membuat keputusan finansial terasa ringan, informatif, dan dapat diandalkan melalui pencatatan instan tanpa latensi, pengingat proaktif, serta insight yang bisa ditindaklanjuti. Setiap interaksi dirancang untuk memberikan sensasi aplikasi high-end yang konsisten di seluruh ekosistem.

## 2. Experience Principles
1. **Thumb-friendly layout:** tindakan utama berada di area 44–56 px pada paruh bawah layar, dilengkapi quick actions yang selalu terlihat.
2. **Glanceable hierarchy:** saldo, cashflow, dan status budget selalu muncul di atas lipatan dengan tipografi besar dan kode warna.
3. **Predictable navigation:** 5 tab bawah (Home, Transactions, Budgets, Insights, More) dipadukan dengan segmented control, breadcrumbs, dan anchor nav di permukaan web.
4. **Contextual guidance:** copy microcopy menjelaskan dampak setiap aksi; snackbar/alert inline memberi arahan perbaikan.
5. **Inclusive motion:** animasi 0.28 s ease-out dengan fallback instan untuk pengguna `prefers-reduced-motion` dan perangkat low-power.
6. **Trust & Speed:** Keamanan biometrik dan **optimistic updates** untuk respon instan (zero-latency).
7. **Premium PWA:** Pengalaman instalasi mandiri dan dukungan offline yang setara aplikasi native.
8. **Complexity Control:** Seluruh permukaan produk wajib mematuhi [Complexity Control Guide](./complexity-control-guide.md) menggunakan model pengungkapan 3-lapis.

## 3. Information Architecture
1. **Landing & Onboarding**
   - Hero ringkas dengan CTA primer & sekunder, nav anchor, dan skip link.
   - Section fitur, keamanan, dan CTA akhir untuk mengkomunikasikan nilai dan bukti sosial.
2. **Home**
   - Wallet stack carousel + indikator saldo, quick actions (Catat, Reminder, Hutang, Scan).
   - Highlight hari ini: net cashflow, pengingat terdekat, status hutang.
3. **Transactions**
   - Segmented control (All, Income, Expense, Transfers, Debts).
   - Infinite scroll dengan group label (Today, Kemarin, dst) dan filter sheet lanjutan.
4. **Budgets**
   - Ringkasan bulanan, progress ring per kategori, rekomendasi AI, serta detail kategori dengan riwayat transaksi.
5. **Insights**
   - **Financial Analytics Layers:**
     - *Net Worth Trend:* Visualisasi pelacakan kekayaan bersih 6 bulan.
     - *Saving Potential:* Metrik efisiensi pengeluaran.
     - *Behavior Analytics:* Pola transaksi (Hari kerja vs Akhir pekan).
     - *Subscription Audit:* Analisis pengeluaran berulang.
   - Insight mingguan AI, tren kategori, widget Debt Health.
6.3. **More**
   - Assets & Liabilities (Net Worth): Pelacakan kekayaan bersih dengan dashboard khusus. Desktop version menyajikan visualisasi kartu gradien dan manajemen dompet yang dioptimalkan untuk layar lebar.
   - AI Token Calculator, Profil, Security (biometrik), Reminders calendar, Data (impor/ekspor), Bantuan, Feedback, serta log perubahan.

## 4. Core Flow Designs
### 4.0 Onboarding & Aktivasi
- **Entry:** landing CTA "Buat akun gratis" / "Lihat dashboard" atau deep link referral.
- **Langkah:** modal Sign Up (email/password, meter kekuatan), verifikasi email, optional biometric enrolment → sign in ulang → Home.
- **Fallback:** lupa password bottom sheet, alert error inline, CTA kembali ke login.

### 4.1 Transaction Logging
- Floating button "Catat" membuka bottom sheet Manual / Catat Cepat (AI).
- **Smart Add 2.0 (DeepSeek V3):** Mendukung input bahasa natural untuk satu atau banyak transaksi sekaligus (*bulk*).
- **Auto-mapping:** Deteksi otomatis kategori, sumber dana (wallet), dan deteksi pembayaran hutang secara cerdas.
- **Insights Instan:** Memberikan feedback langsung jika saldo tidak cukup atau melebihi budget saat konfirmasi AI.
- Field: amount keypad, tipe, wallet, kategori + sub, tanggal, catatan, tag, lokasi opsional.
- Smart defaults & suggestions: wallet terakhir, tanggal hari ini, auto-tag dari AI.
- Feedback: counter saldo animasi, toast dengan tombol undo, update grafis real-time di Home.

### 4.2 Wallet Management
- Swipe horizontal antar kartu; tapping membuka detail dengan riwayat dan tombol Transfer/Top Up.
- Pembuatan/penyuntingan wallet memakai stepper modal (nama, tipe, target saldo, ikon/warna).
- Peringatan limit/overdraft muncul sebagai badge merah dengan opsi membuat reminder otomatis.

### 4.3 Smart Reminders
- Use cases: tagihan, cicilan, tabungan, reimburse.
- Entry: Quick action, tab Reminders, atau konversi dari transaksi/hutang.
- Field: judul, link ke wallet/kategori/hutang, jumlah, tanggal jatuh tempo, frekuensi, kanal (push/email), catatan.
- Reminder center: calendar + list (filter All, Upcoming, Snoozed, Completed) dengan aksi mark done, snooze (preset & custom), skip.
- Automasi: pengingat gagal memicu digest email Senin pagi.

### 4.4 Comprehensive Debt & IOU Tracking
- Jenis: Loans (utang), IOU (piutang), Split Bills.
- Form: jumlah, counterparty (kontak / manual), klasifikasi (personal/bisnis/rumah tangga), tanggal mulai, jatuh tempo, bunga, frekuensi pembayaran, catatan, lampiran.
- Detail: ringkasan saldo, pembayaran berikutnya, timeline interaktif, aksi log payment/settle/convert reminder.
- Integrasi: Catat Cepat otomatis menyarankan matching debt bila pola sesuai.

### 4.5 Budgeting & Goals
- Landing budgets: daftar kategori dengan ring progress (warna adaptif) dan status (on track, warning, overspent).
- Detail: breakdown transaksi, rekomendasi AI, opsi adjust target & reset.
- Goals: target nominal + tanggal, progress visual + reminder otomatis jelang tenggat.

### 4.6 Insights & Decision Support
- Komponen: highlight minggu ini, tren kategori, perbandingan bulan-ke-bulan, prediksi cashflow, Debt Health index.
- AI summary: bahasa natural, menyertakan CTA tindakan (mis. "turunkan pengeluaran langganan 15%"), dapat dibagikan ke email.

### 4.7 Settings, Data & Support
- Profil (nama, foto, preferensi bahasa), Security (biometrik, 2FA), Data (impor CSV, ekspor PDF/JSON), Bantuan (FAQ, live chat, changelog), Feedback (kirim saran, request fitur).

## 5. Interaction & Motion Specs
- **Durasi & easing:** 0.28 s ease-out standar; overlay/modal 0.24 s.
- **Skeleton Screens:** Digunakan untuk transisi loading guna mempertahankan layout dan persepsi kecepatan.
- **Haptics:** Vibrasi ringan (iOS/Android) untuk aksi sukses (pencatatan), peringatan, dan konfirmasi.
- **Success Celebrations:** Animasi mikro saat target budget tercapai atau hutang lunas.
- **Reduced motion:** setiap komponen `motion.*` memeriksa `useReducedMotion` dan mematikan animasi ketika preferensi aktif.
- **Gestur:** swipe down menutup bottom sheet; long-press pada transaksi membuka konteks menu.

## 6. Visual System
- **Warna:**
  - **Primary:** Teal 600 (#0D9488) untuk light mode; Teal 400 (#2DD4BF) untuk dark mode.
  - **Secondary:** Lemon (#FDE047) untuk background; Yellow 600 (#CA8A04) untuk teks/ikon (kontras tinggi).
  - **Functional:** Success (#059669), Destructive (#DC2626), Warning (#D97706).
  - **Neutral:** Slate (Cool Gray) agar harmonis dengan Teal.
  - Token diekspos via CSS variable & Tailwind alias.
- **Tipografi:** Satoshi/Inter, skala 12–40 px, berat 400/500/600/700. Heading ≤ 64 karakter, paragraf ≤ 90 karakter untuk keterbacaan.
- **Spacing:** basis 4 px; layout section 24–48 px; card gap 24 px; form vertical rhythm 16 px.
- **Radius & elevation:** 
  - **Desktop:** Card radius diperkecil menjadi 8 px dengan shadow yang lebih tajam (Enterprise Look).
  - **Mobile:** Card radius 16 px, modal 24–32 px (Touch Friendly).
  - Shadow lembut + solid background untuk depth yang bersih.
- **Ikon & ilustrasi:** lucide-react 24 px, stroke 1.5 px; ilustrasi hero menggunakan path animasi dengan fallback statis.

## 7. Data Model Considerations
- **Reminders**: `title`, `userId`, `type`, `targetType`, `targetId`, `amount`, `dueDate`, `repeatRule`, `status`, `snoozeCount`, `channels`, `createdAt`, `updatedAt`.
- **Debts**: `userId`, `direction`, `counterparty`, `contactId`, `principal`, `outstandingBalance`, `interestRate`, `interestType`, `paymentFrequency`, `nextPaymentDate`, `endDate`, `status`, `notes`, `attachments`, `createdAt`, `updatedAt`.
- **DebtPayments**: `amount`, `paymentDate`, `method`, `walletId`, `notes`, `createdBy`.
- **Budgets**: `categoryId`, `userId`, `targetAmount`, `spentAmount`, `status`, `aiRecommendations`, `updatedAt`.
- Indeks: reminders (`userId + dueDate`, `userId + status`), debts (`userId + status`, `userId + nextPaymentDate`), budgets (`userId + categoryId`).

## 8. AI & Automation Hooks
- Catat Cepat menambahkan tag `reminderIntent` dan `debtMatchScore` untuk menghubungkan transaksi dengan automasi terkait.
- AI summarizer menghasilkan digest mingguan (chat + email) tentang overspending, reminder berisiko, dan hutang kritis.
- Cloud Functions menjadwalkan notifikasi, memperbarui proyeksi hutang, dan merangkum statistik budget harian.

## 9. Accessibility & Localization
- Bahasa utama Bahasa Indonesia; string disiapkan untuk lokal tambahan.
- Skip link, anchor nav, dan fokus ring jelas di landing; seluruh tombol keyboard-friendly.
- `aria-live` pada alert/feedback; ikon dekoratif menggunakan `aria-hidden`.
- Format angka mengikuti locale; label tanggal menggunakan frasa natural ("Besok", "3 hari lagi").
- Rencana: onboarding overlay dengan opsi bahasa Inggris, knowledge base berformat markdown.

## 10. Success Metrics
- Reminder completion rate ≥ 80% untuk pengguna aktif mingguan.
- 25% penurunan pembayaran hutang terlambat dibanding baseline sebelum rilis fitur debt.
- 60% konversi session-to-transaction di mobile dalam ≤ 4 tap.
- NPS ≥ +30 untuk pengalaman onboarding & pencatatan transaksi.

## 11. Roadmap Berikutnya
1. **Onboarding overlay interaktif** (checklist 3 langkah + video singkat) pada Q4 2025.
2. **Universal search & command palette** untuk transaksi, reminders, dan kontak.
3. **Wallet carousel indicator & grouping** untuk pengguna dengan banyak akun.
4. **Knowledge base & pusat bantuan** terintegrasi dengan status update real-time.
5. **Kolaborasi hutang** (undang kontak, histori bersama) sebagai bagian fase 3 roadmap debt.
