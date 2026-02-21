# Lemon Design System
**Version 1.1.0 (Architecture & Apple-Inspired Fidelity)**

Dokumen ini adalah sumber kebenaran (*Single Source of Truth*) untuk bahasa desain dan standar arsitektur aplikasi Lemon. Arah desain saat ini mengadopsi estetika **Apple (iOS/macOS)** dengan fondasi kode yang modular dan skalabel.

---

## 1. Filosofi Desain & Engineering

### Modularitas & Skalabilitas
Setiap fitur harus dibangun sebagai modul independen yang dapat diperluas tanpa merusak fungsionalitas inti. Hindari *tight coupling* antar layer UI dan data.

### "Liquid Intelligence"
Antarmuka harus terasa hidup, responsif, dan cerdas. Bukan sekadar formulir statis, melainkan asisten yang mengalir.
*   **Fluidity:** Animasi halus (`spring` physics) dan transisi tanpa hambatan.
*   **Intelligence:** UI beradaptasi dengan konteks (misal: logo merchant muncul otomatis).
*   **Depth:** Menggunakan cahaya dan bayangan untuk hierarki, bukan garis batas yang kaku.

### Pilar Visual (Apple-Inspired)
1.  **Glassmorphism & Blur:** Penggunaan `backdrop-blur-xl` dan transparansi (`bg-white/90`) untuk memberikan konteks spasial.
2.  **Typography-First:** Angka dan informasi utama ditampilkan besar dan tebal (*Hero Content*).
3.  **Visual Depth:** Menghindari border garis (`border-border`) untuk elemen utama. Gunakan **Deep Shadows** (`shadow-2xl`) dan **Ambient Glow** untuk memisahkan elemen dari latar belakang.
4.  **Rounded Organic:** Sudut yang sangat tumpul (`rounded-[32px]` atau `rounded-3xl`) untuk kesan ramah dan modern.

---

## 2. Token Visual

### Warna (Semantic Tokens)
Menggunakan variabel CSS HSL untuk dukungan mode gelap otomatis.

| Token | Deskripsi | Penggunaan |
| :--- | :--- | :--- |
| `primary` | Teal (`--teal-600`) | Aksi utama, brand identity, elemen aktif. |
| `destructive` | Rose (`--rose-600`) | Error, penghapusan, pengeluaran (expense). |
| `success` | Emerald (`--emerald-600`) | Berhasil, pemasukan (income), status positif. |
| `warning` | Yellow (`--yellow-600`) | Peringatan, status tertunda. |
| `background` | Slate-50 / Slate-950 | Latar belakang aplikasi utama. |
| `card` | White / Slate-900 | Kontainer konten (Cards, Modals). |

### Tipografi
*   **Font Family:** `Inter` (UI) & `Geist Mono` (Angka/Data).
*   **Tracking (Letter Spacing):**
    *   `tracking-tighter`: Untuk *Hero Numbers* (Saldo, Total Transaksi) agar terlihat padat dan menyatu.
    *   `tracking-widest`: Untuk *Micro-labels* (KATEGORI, TANGGAL) agar mudah dipindai pada ukuran kecil.

### Radius (Shape)
*   `rounded-full`: Tombol aksi, kapsul kategori, avatar.
*   `rounded-[32px]` (3xl): Kartu utama (Result Card, Dashboard Card).
*   `rounded-[24px]` (2xl): Input fields, elemen sekunder.
*   `rounded-lg`: Elemen kecil di dalam kartu (ikon, badge).

### Shadows & Depth
Sistem bayangan berlapis untuk menciptakan ilusi ketinggian.

*   **Floating Card:** `shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]` (Bayangan lembut tapi luas).
*   **Input Field:** `shadow-sm` saat diam, `ring-4 ring-primary/10` saat fokus (Glow, bukan border tajam).
*   **Ambient Glow:** Gradien blur (`blur-3xl`) di belakang elemen penting untuk *highlight*.

---

## 3. Komponen & Pola Reusable

### Komponen Atomik (Atoms)
Komponen dasar yang tidak bisa dipecah lagi dan tidak memiliki *logic* bisnis.
*   **Atomic:** `Button`, `Badge`, `Input`, `Icons`.
*   **Molecules:** `MetricCard`, `WalletPill`, `CategorySelector`.
*   **Organisms:** `DashboardOverview`, `TransactionForm`, `BudgetCard`.

### Karakteristik Komponen
1.  **Reusable:** Harus menerima `className` dan `props` standar untuk fleksibilitas.
2.  **Terukur (Scalable):** Desain harus berfungsi baik pada mobile (small) maupun desktop (expanded).
3.  **Stateless Preferred:** Sebisa mungkin komponen UI murni menerima data via props untuk memudahkan testing.

### Input Fields ("The Magic Bar")
Jangan gunakan input standar dengan border abu-abu.
*   **Style:** `bg-card` atau `bg-secondary/50` + `rounded-2xl` + `shadow-sm`.
*   **Focus:** Tanpa outline border. Gunakan *colored shadow* atau *ring* transparan.
*   **Metaphor:** Input bar harus terasa "mengapung" di atas konten.

### Result & Confirmation Cards
*   **Background:** `bg-white/90` (Light) / `bg-black/40` (Dark) dengan `backdrop-blur-xl`.
*   **Border:** Tipis transparan (`border-white/20`) untuk definisi tepi yang halus.
*   **Layout:**
    *   *Hero Amount* di tengah atas.
    *   Detail dikelompokkan dalam *Inset Group* (`bg-secondary/30 rounded-2xl`).
    *   Pemisah menggunakan garis halus (`divide-y` atau `h-px`).

---

## 4. Pola Interaksi (UX)

### Haptics
Berikan umpan balik fisik pada setiap interaksi bermakna.
*   **Light:** Saat menekan tombol navigasi, tab, atau toggle.
*   **Medium:** Saat sukses menyimpan, menghapus, atau aksi destruktif.
*   **Success/Error:** Pola getaran khusus untuk notifikasi status.

### Optimistic UI
Jangan biarkan pengguna menunggu spinner (`isLoading`) untuk aksi sederhana.
*   **Update Instan:** UI harus berubah *sebelum* request server selesai (misal: tambah transaksi, update budget).
*   **Rollback:** Kembalikan ke state awal hanya jika server gagal.

---

## 5. Standar Engineering & Penamaan

### Panduan Penamaan (Naming Conventions)
Konsistensi adalah kunci skalabilitas.
*   **Files:** `kebab-case.tsx` untuk komponen, `camelCase.ts` untuk utility/hooks.
*   **Components:** `PascalCase`. (Contoh: `SmartAddOverlay`).
*   **Hooks:** Awali dengan `use`. (Contoh: `useWallets`).
*   **CSS Classes:** Gunakan Tailwind dengan urutan: `Layout` -> `Spacing` -> `Typography` -> `Visual` (Colors/Shadows).

### Spesifikasi State Management
1.  **Global State:** Gunakan **React Context** (Providers) untuk data yang diakses banyak fitur (Auth, Wallets, UI State).
2.  **Server State:** Gunakan custom hooks dengan sinkronisasi *real-time* Supabase (EventEmitter).
3.  **Local State:** Gunakan `useState` / `useReducer` untuk *form state* atau interaksi UI mikro.
4.  **Event Driven:** Gunakan `EventEmitter` untuk komunikasi antar-provider (misal: trigger refresh saldo setelah transaksi).

### Strategi Versioning API (Supabase RPC)
Selalu gunakan suffix versi pada fungsi database (RPC) untuk menjaga kompatibilitas ke belakang (*backward compatibility*).
*   Format: `nama_fungsi_v{n}` (Contoh: `create_transaction_v1`).
*   **V1:** Versi stabil awal.
*   **V2:** Gunakan jika ada perubahan *breaking changes* pada parameter atau logika bisnis inti yang mempengaruhi client lama.

---

**Catatan Implementasi:**
Saat membuat fitur baru, selalu rujuk ke prinsip "Apple-Inspired" dan standar engineering ini. Prioritaskan kebersihan visual (sedikit garis, banyak ruang) dan struktur kode yang modular.
