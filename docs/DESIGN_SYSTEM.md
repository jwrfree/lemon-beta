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

### Radius (The Golden Curve)
*   `rounded-[32px]` (3xl): Kontainer utama, Kartu Hero, dan Modal Bottom Sheet.
*   `rounded-2xl`: Komponen internal dalam kartu, input fields, dan tombol besar.
*   `rounded-full`: Badge status, chip kategori, dan avatar.

---

## 3. Komponen & Pola Reusable

### Komponen Atomik (Atoms)
*   **Atomic:** `Button`, `Badge`, `Input`, `Icons`.
*   **Molecules:** `MetricCard`, `WalletPill`, `CategorySelector`.
*   **Organisms:** `DynamicCardList`, `TransactionComposer`, `BudgetHero`.

### Karakteristik Komponen (Borderless Strategy)
1.  **NO INTERNAL BORDERS:** Dilarang menggunakan garis batas kaku (`border-border`). Pemisahan elemen internal wajib menggunakan **Background Shifts** (perbedaan opasitas latar) atau **Spacing**.
2.  **Visual Depth:** Gunakan elevasi bayangan untuk memisahkan kartu dari latar belakang aplikasi.
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

**Catatan Implementasi:**
Jangan takut menggunakan warna. Aplikasi Lemon harus terasa seperti asisten yang hidup, bukan sekadar spreadsheet. Prioritaskan kejernihan teks di atas latar belakang yang dinamis.
