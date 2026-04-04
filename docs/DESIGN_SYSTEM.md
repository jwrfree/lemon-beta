# Lemon Design System
**Version 1.2.0 (Architecture & Dynamic DNA UI)**

Dokumen ini adalah sumber kebenaran (*Single Source of Truth*) untuk bahasa desain dan standar arsitektur aplikasi Lemon. Arah desain saat ini mengadopsi estetika **Apple Music & Spotify** yang kaya warna, dinamis, dan memiliki kedalaman visual yang imersif.

---

## 1. Filosofi Desain & Engineering

### Modularitas & Skalabilitas
Setiap fitur dibangun sebagai modul independen. UI harus atomik (Atoms, Molecules, Organisms) dan logika bisnis terisolasi dalam hooks.

### "Dynamic DNA"
Setiap item (Wallet, Category, Goal) memiliki identitas visual unik. UI harus beradaptasi secara dinamis berdasarkan data item tersebut, menciptakan antarmuka yang terasa personal dan tidak membosankan.
*   **Vibrant Fidelity:** Menggunakan warna cerah namun terkontrol dengan pendaran cahaya (*ambient glow*).
*   **Fluidity:** Animasi transisi antar-elemen yang terasa organik menggunakan *spring physics*.
*   **Visual Depth:** Menghindari garis batas kaku (borderless), mengandalkan elevasi bayangan dan gradien.

---

## 2. Token Visual & Estetika "Dynamic"

### Dynamic Backgrounds (Apple Music Style)
Kartu utama wajib menggunakan latar belakang dinamis yang mengikuti warna identitas data.

| Teknik | Deskripsi | Implementasi Tailwind |
| :--- | :--- | :--- |
| **Mesh Gradients** | Campuran gradien halus dengan lingkaran cahaya tak beraturan. | `bg-gradient-to-br from-color-500 via-color-600 to-color-800` |
| **Ambient Glow** | Lingkaran cahaya blur di pojok kartu yang memberikan tekstur. | `blur-3xl opacity-20 rounded-full` di dalam `overflow-hidden` |
| **Contrast Protection** | Lapisan transparan untuk menjaga keterbacaan teks. | `bg-white/5` atau `bg-black/10` dengan `backdrop-blur-md` |

**Aturan Main:**
*   **Sync with Data:** Warna kartu "Hiburan" harus Pink, "Investasi" harus Emerald, dsb.
*   **Colored Shadows:** Bayangan kartu wajib memiliki rona warna yang sama dengan latar belakang kartu (`shadow-color/20`).
*   **Glass Insets:** Gunakan kontainer internal semi-transparan di dalam kartu untuk mengelompokkan data detail.

### Radius & Sizing (The Golden Curve)
*   `rounded-[32px]` (3xl): Kontainer utama, Kartu Hero, dan Modal Bottom Sheet.
*   `rounded-xl` (16px) / `rounded-2xl` (20px): Komponen utama seperti tombol (CTA), input fields, dan primary cards.
*   `h-12` (48px): Tinggi standar untuk tombol utama (Primary CTA) di mobile agar nyaman ditekan (tap target).
*   `rounded-full`: Badge status, chip kategori, dan avatar.

---

## 3. Typography & Navigation Scale

### Dashboard & Section Headers
*   **Standard Header:** `text-sm font-semibold` (14px) dengan warna `muted-foreground/70`. Memberikan kesan clean dan tidak mendominasi visual.
*   **Action Label:** `text-sm font-semibold` (14px). Gunakan pola **"Lihat semua"** + **`CaretRight`** (size 14) untuk navigasi ke halaman list lengkap.

### Functional Typography
*   **Bottom Navigation Label:** `text-label-xs` (9.5px). Ukuran optimal untuk menjaga kehalusan antarmuka navigasi mobile tanpa kehilangan keterbacaan.
*   **Metric Values:** `text-display-lg` atau `text-title-lg` dengan `tabular-nums` untuk angka keuangan agar posisi desimal sejajar.

---

## 4. Komponen & Pola Reusable

### Komponen Atomik (Atoms)
*   **Atomic:** `Button`, `Badge`, `Input`, `Icons`.
*   **Molecules:** `MetricCard`, `WalletPill`, `CategorySelector`.
*   **Organisms:** `DynamicCardList`, `TransactionComposer`, `BudgetHero`.

### Tombol & Kontras (Visibility Protection)
1.  **NO INTERNAL BORDERS:** Dilarang menggunakan garis batas kaku (`border-border`). Pemisahan elemen internal wajib menggunakan **Background Shifts** (perbedaan opasitas latar) atau **Spacing**.
2.  **Primary Button Protection:** Tombol utama (`bg-primary`) wajib menggunakan `!text-primary-foreground` untuk mencegah konflik warna yang menyebabkan teks tidak terbaca (black-on-black).
3.  **Visual Depth & Shadows (Strict Guidelines):** 
    *   **No Nested Shadows:** Dilarang menumpuk bayangan (shadow di dalam container bershadow). Gunakan *subtle backgrounds* (`bg-muted/50`, `bg-secondary/50`) atau *subtle borders* (`border border-border/40`) untuk elemen anak di dalam *card* utama.
    *   **Flat & Subtle by Default:** Utamakan *flat design* dengan pembatas ruang halus. Shadow HANYA digunakan untuk hierarki *z-axis* yang jelas (seperti *floating action buttons*, *modals*, *popovers*, atau *sticky headers/footers*).
    *   **Performance First:** Dilarang menganimasi properti `box-shadow` secara langsung (karena memicu *repaint* mahal di *mobile GPU*). Jika butuh efek *glow* atau animasi, gunakan elemen pseudo/absolut di belakang (sebagai *backdrop*) dan animasikan `opacity` atau `transform` (*hardware accelerated*).
3.  **Adaptive UI:** Komponen harus terlihat bagus baik dengan latar belakang putih (`light`) maupun latar berwarna dinamis.

---

## 4. Pola Interaksi (UX)

### Haptics & Feedback
*   Memberikan getaran mikro pada setiap interaksi bermakna (sukses simpan, ganti tab).
*   Gunakan `AnimatePresence` dan `layoutId` untuk transisi elemen yang "mengalir" tanpa *jumping*.

### Optimistic UI
*   Zero-latency updates. UI harus berubah seketika sebelum respon server diterima.
*   Rollback state otomatis jika terjadi error di sisi server.

---

## 5. Standar Engineering & Penamaan

### Panduan Penamaan (Naming Conventions)
*   **Files:** `kebab-case.tsx` (komponen), `camelCase.ts` (utility/logic).
*   **Components:** `PascalCase`.
*   **Hooks:** `useHookName`.

### Spesifikasi State Management
1.  **Global:** React Context (Providers) untuk data lintas fitur.
2.  **Server:** Custom hooks dengan listener *real-time* (EventEmitter).
3.  **Local:** `useState` untuk interaksi mikro.

### Strategi Versioning API
*   Wajib menggunakan suffix versi pada RPC Supabase: `nama_fungsi_v{n}` (Contoh: `create_transaction_v1`).

---

## 6. Semantic Tokens (layout-tokens.ts)

Untuk mempercepat pengembangan dan menjaga konsistensi kontainer/tipografi, gunakan token semantik dari `@/lib/layout-tokens`:

| Token | CSS Utility | Kegunaan |
| :--- | :--- | :--- |
| `layout.sectionHeader` | `text-sm font-semibold ...` | Header utama di dashboard / section. |
| `layout.actionButtonLabel` | `text-sm font-semibold ...` | Label untuk tombol navigasi "Lihat semua". |
| `layout.primaryCTA` | `h-12 rounded-xl` | Standar tinggi dan radius untuk tombol utama. |
| `layout.container` | `mx-auto w-full ...` | Standar wrapper untuk isi halaman (standard width). |

**Gunakan `cn()` untuk menggabungkan token dengan kelas spesifik lainnya.**

---

**Catatan Implementasi:**
Jangan takut menggunakan warna. Aplikasi Lemon harus terasa seperti asisten yang hidup, bukan sekadar spreadsheet. Prioritaskan kejernihan teks di atas latar belakang yang dinamis.
