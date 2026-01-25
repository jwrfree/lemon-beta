# Lemon Mobile Blueprint

## 0. Release Snapshot – v2.0.0 (22 September 2025)
- **Status:** Ready to Launch.
- **Fokus rilis:** menuntaskan audit desain menyeluruh, memoles landing & modal autentikasi, memastikan setiap alur utama siap produksi, dan memperbarui dokumentasi agar seluruh tim selaras.
- **Highlight baru:** navigasi anchor pada landing, dukungan `prefers-reduced-motion` di seluruh animasi, copy hero edukatif, serta penegasan jalur pemulihan akun yang jelas.

## 1. Product Vision
Lemon adalah pendamping keuangan mobile-first untuk pekerja digital dan pelaku usaha mandiri. Tujuannya: membuat keputusan finansial terasa ringan, informatif, dan dapat diandalkan melalui pencatatan cepat, pengingat proaktif, serta insight yang bisa ditindaklanjuti. Setiap interaksi dirancang agar dapat dilakukan dengan satu tangan, mudah dipahami, dan konsisten di seluruh ekosistem.

## 2. Experience Principles
1. **Thumb-friendly layout:** tindakan utama berada di area 44–56 px pada paruh bawah layar, dilengkapi quick actions yang selalu terlihat.
2. **Glanceable hierarchy:** saldo, cashflow, dan status budget selalu muncul di atas lipatan dengan tipografi besar dan kode warna.
3. **Predictable navigation:** 5 tab bawah (Home, Transactions, Budgets, Insights, More) dipadukan dengan segmented control, breadcrumbs, dan anchor nav di permukaan web.
4. **Contextual guidance:** copy microcopy menjelaskan dampak setiap aksi; snackbar/alert inline memberi arahan perbaikan.
5. **Inclusive motion:** animasi 0.28 s ease-out dengan fallback instan untuk pengguna `prefers-reduced-motion` dan perangkat low-power.
6. **Trust by default:** keamanan (biometrik, enkripsi) dan dokumentasi (FAQ, blueprint) selalu terlihat sehingga pengguna yakin untuk melanjutkan.

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
   - Insight mingguan AI, tren kategori, distribusi pengeluaran, widget Debt Health, highlight pengingat.
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
- **Durasi & easing:** 0.28 s ease-out standar; overlay/modal 0.24 s; daftar animasi 0.28 s dengan delay 0.08 s per item.
- **Reduced motion:** setiap komponen `motion.*` memeriksa `useReducedMotion` dan mematikan animasi ketika preferensi aktif.
- **Haptics:** vibrasi ringan (iOS/Android) untuk aksi berhasil, peringatan, dan swipe to dismiss.
- **Gestur:** swipe down menutup bottom sheet; drag handle tersedia visualnya; long-press pada transaksi membuka konteks menu.

## 6. Visual System
- **Warna:**
  - **Primary:** Teal 600 (#0D9488) untuk light mode; Teal 400 (#2DD4BF) untuk dark mode.
  - **Secondary:** Lemon (#FDE047) untuk background; Yellow 600 (#CA8A04) untuk teks/ikon (kontras tinggi).
  - **Functional:** Success (#059669), Destructive (#DC2626), Warning (#D97706).
  - **Neutral:** Slate (Cool Gray) agar harmonis dengan Teal.
  - Token diekspos via CSS variable & Tailwind alias.
- **Tipografi:** Satoshi/Inter, skala 12–40 px, berat 400/500/600/700. Heading ≤ 64 karakter, paragraf ≤ 90 karakter untuk keterbacaan.
- **Spacing:** basis 4 px; layout section 24–48 px; card gap 24 px; form vertical rhythm 16 px.
- **Radius & elevation:** Card radius 16 px, modal 24–32 px, bottom sheet `rounded-t-2xl`; shadow lembut + border semi transparan untuk depth.
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
