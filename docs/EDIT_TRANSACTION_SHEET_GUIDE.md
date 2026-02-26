# Edit Transaction Sheet Guide

## Tujuan Iterasi

Dokumen ini menjelaskan iterasi terbaru untuk `EditTransactionSheet` dan `AmountInput` dengan fokus:

1. **Menurunkan cognitive load** melalui hirarki informasi yang jelas.
2. **Membuat state amount input lebih aman** dengan tokenisasi terstruktur.
3. **Menyediakan opsi custom numeric keyboard** (non-native) untuk input cepat di mobile.

---

## Informasi Hierarchy (Edit Drawer)

Urutan area pada drawer edit:

1. **Hero amount + Ringkasan**
   - Menampilkan nominal dan chip konteks cepat (kategori, dompet, tanggal).
2. **MagicBar**
   - Jalur cepat untuk patch AI berbasis teks.
3. **Informasi inti**
   - Type transaksi, amount, wallet, date, category.
4. **Intent pembelian** (khusus expense)
   - Kebutuhan vs Keinginan.
5. **Detail tambahan (collapsible)**
   - Lokasi dan deskripsi sebagai data opsional.
6. **Sticky footer actions**
   - Delete terpisah dari primary action simpan.

Pendekatan ini mengikuti prinsip **progressive disclosure**: data wajib muncul dulu, data opsional dibuka saat diperlukan.

---

## Model State Amount Input

`AmountInput` sekarang memakai 3 tahap state:

1. **Raw expression string**
   - Input menerima angka + operator dasar: `+ - * /`.
   - Karakter non-valid dibersihkan lewat `normalizeExpressionInput`.

2. **Tokenization**
   - String diubah ke token terstruktur:
     - `number`
     - `operator`
   - Operator invalid/beruntun dan trailing operator dipangkas.

3. **Evaluation + formatting**
   - Evaluasi deterministic dengan precedence:
     - tahap-1: `*` dan `/`
     - tahap-2: `+` dan `-`
   - Hasil diformat lokal Indonesia (`id-ID`) dan dibatasi minimal `0`.

### Kenapa ini dipilih?

- Menghindari evaluasi dinamis berbasis `Function`.
- Membuat behavior input lebih dapat diprediksi.
- Mempermudah validasi dan reasoning saat debugging.

---

## Custom Numeric Keyboard (Non-native)

Fitur dapat diaktifkan lewat prop:

```tsx
<AmountInput useCustomKeyboard ... />
```

### Perilaku

- Saat input fokus, keyboard custom dapat muncul.
- Tombol yang tersedia:
  - angka (`0-9`, `00`)
  - operator (`+`, `-`, `×`, `÷`)
  - backspace (`⌫`)
  - selesai (`Selesai`)
- Input native diset ke `inputMode="none"` ketika mode custom aktif.

### Catatan UX

- Untuk user yang terbiasa keyboard native, mode ini sebaiknya tetap bisa ditoggle.
- CTA **"Gunakan hasil tokenisasi ekspresi"** muncul saat operator terdeteksi agar transform state terlihat eksplisit.

---

## QA Checklist Singkat

1. Input angka biasa tersimpan dan terformat benar.
2. Input ekspresi campuran (`20000+5000*2`) menghasilkan total sesuai precedence.
3. Operator beruntun tidak menghasilkan crash.
4. Pembagian nol tidak menyebabkan error runtime.
5. Tombol `⌫` dan `Selesai` berjalan pada keypad custom.
6. Save action menampilkan amount hasil format terbaru.

---

## Known Limitation

- Ekspresi saat ini belum mendukung tanda kurung `(` `)`.
- Evaluasi dibatasi ke operator dasar untuk menjaga kompleksitas dan keterbacaan.
