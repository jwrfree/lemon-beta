# Audit: Kenapa kategori sudah diterapkan di Input Cepat / Manual / Add Smart AI

## Ringkasan
Kategori memang **sengaja otomatis diterapkan** oleh beberapa mekanisme berbeda:
1. **Input Cepat (quick parse lokal)**: parser lokal mencocokkan teks user dengan nama kategori/sub-kategori, lalu langsung set `category`.
2. **Manual add/edit**: saat user mengetik deskripsi, hook AI suggestion bisa mengisi `category` otomatis jika confidence tinggi.
3. **Add Smart AI**: hasil AI (`extractTransaction`) dipetakan ulang ke kategori valid yang tersedia; jika cocok maka kategori langsung dipakai.

## Detail Teknis

### 1) Input Cepat (Optimistic Quick Parse)
- `processInput()` menjalankan `quickParseTransaction()` sebelum AI penuh untuk respons cepat.
- Jika confidence bukan `low`, data langsung dipasang ke state konfirmasi (`setParsedData`) termasuk `category`.
- Di `quickParseTransaction()`, pencarian kategori dilakukan dari:
  - nama kategori utama,
  - nama sub-kategori,
  - fuzzy word-level match.
- Karena `Pemberian & Hadiah` ada di daftar income categories, input yang relevan bisa langsung terpetakan ke kategori tersebut.

### 2) Manual Add/Edit
- Form manual memakai `useAiCategorySuggestion()`.
- Saat user mengetik deskripsi (>=3 karakter, bukan edit mode), sistem memanggil `suggestCategory(description, type)`.
- Bila confidence > 0.7 dan hasil cocok dengan kategori valid saat ini, sistem menjalankan `setValue('category', matchedCategory.name)`.
- Jadi kategori terlihat “sudah diterapkan” walau user belum pilih manual.

### 3) Add Smart AI (Extract + Normalize)
- Untuk Add Smart AI, `processInput()` memanggil `extractTransaction()` dengan konteks kategori+wallet.
- Hasil AI lalu dinormalisasi:
  - exact match nama kategori,
  - fallback fuzzy match,
  - jika match ketemu: `finalCategory` dipakai,
  - tipe transaksi (`income/expense`) juga bisa dioverride berdasarkan kategori yang match.
- Karena `Pemberian & Hadiah` termasuk kategori default income, hasil AI terkait gift/support akan diarahkan ke kategori itu.

## Kesimpulan
Perilaku kategori yang “sudah diterapkan/digunakan” pada Input Cepat, Manual, dan Add Smart AI **bukan bug**, melainkan desain fitur auto-classification berbasis:
- parser lokal (regex + keyword/fuzzy),
- AI suggest per deskripsi,
- AI extract + normalisasi ke kategori valid.

Jika diinginkan kategori tidak otomatis terisi, perlu ubah rules berikut:
- nonaktifkan quick parse optimistic,
- naikkan threshold confidence suggestion,
- atau jadikan hasil AI hanya “rekomendasi” tanpa auto-set value.
