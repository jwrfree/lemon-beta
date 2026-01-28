# Panduan UX Writing untuk Aplikasi Lemon

Dokumen ini adalah panduan untuk menulis semua teks (copy) yang ada di dalam aplikasi Lemon. Tujuannya adalah untuk menciptakan pengalaman pengguna yang konsisten, bersahabat, dan jelas.

## Prinsip Utama

Gaya bahasa Lemon didasarkan pada tiga prinsip utama:

1.  **Bersahabat & Personal**
    Nada bicara kita akrab, seolah-olah teman baik sedang membantu mengelola keuangan. Kita tidak kaku atau terlalu formal, tapi juga tidak "lebay" atau terlalu gaul.
    - **Gunakan sapaan "kamu"**, bukan "Anda".
    - Buat pengguna merasa didukung dan tidak dihakimi.

2.  **Jelas & Ringkas**
    Setiap teks harus mudah dimengerti dalam sekali baca. Hindari jargon keuangan yang rumit dan istilah teknis.
    - Langsung ke intinya.
    - Gunakan kalimat aktif dan sederhana.

3.  **Membantu & Memotivasi**
    Teks kita harus memandu pengguna, terutama saat mereka baru memulai atau menghadapi kesulitan.
    - Berikan instruksi yang jelas.
    - Pada layar kosong (empty state), berikan ajakan bertindak (call to action) yang memotivasi.
    - Saat terjadi error, jelaskan apa yang salah dan bagaimana cara memperbaikinya dengan tenang.

## Gaya Bahasa & Nada

### Sapaan
- **Gunakan**: `kamu`, `milikmu`.
- **Hindari**: `Anda`, `milik Anda`.

**Contoh**:
- 👍: "Lihat semua dompet kamu."
- 👎: "Lihat semua dompet Anda."

### Pesan Aksi (Tombol & Link)
Gunakan kata kerja yang jelas dan spesifik.

- **Gunakan**: "Buat Anggaran Baru", "Simpan Transaksi", "Lihat Semua", "Hapus".
- **Hindari**: "Kirim", "Oke", "Submit".

### Judul Halaman & Modal
Harus deskriptif dan langsung menjelaskan isinya.

- **Contoh**: "Tambah Transaksi Baru", "Edit Dompet", "Konfirmasi Hapus".

### Pesan Konfirmasi (Toasts & Alerts)
Singkat, jelas, dan memberikan rasa lega.

- **Contoh Sukses**: "Transaksi berhasil ditambahkan!", "Anggaran berhasil dibuat!", "Perubahan berhasil disimpan."
- **Contoh Info**: "Kamu berhasil keluar."

### Pesan Error
Jelaskan masalahnya dari perspektif pengguna dan tawarkan solusi. Jangan menyalahkan.

- **Gunakan**: "Nama anggaran tidak boleh kosong.", "Dompet asal dan tujuan tidak boleh sama."
- **Hindari**: "Error: Input tidak valid.", "Proses gagal."

### Layar Kosong (Empty States)
Jadikan sebagai kesempatan untuk memandu dan memotivasi pengguna.

- **Contoh**:
    - "Belum ada transaksi di sini. Yuk, tambahkan transaksi pertamamu!"
    - "Mulai lacak pengeluaranmu dengan membuat anggaran pertama."
    - "Kamu belum punya dompet. Yuk, buat dompet pertamamu untuk memulai!"

## Terminologi Konsisten

Untuk menjaga konsistensi, gunakan istilah-istilah berikut di seluruh aplikasi:

| Istilah yang Digunakan | Alternatif yang Dihindari |
| :-------------------- | :-------------------------- |
| **Dompet**            | Akun, Rekening, Kantong     |
| **Transaksi**         | Entri, Catatan              |
| **Anggaran**          | Budget                      |
| **Target**            | Goal, Sasaran, Impian       |
| **Pemasukan**         | Income, Pendapatan          |
| **Pengeluaran**       | Expense, Biaya, Beban       |
| **Kategori**          | Jenis, Tipe                 |
| **Transfer**          | Pindah Dana, Kirim Uang     |
| **Kelola**            | Atur, Manajemen             |
| **Simpan**            | Submit, Kirim, Ok           |
| **Catat Cepat**       | Smart Add, Input Cerdas     |

## Percakapan AI (Conversational Refinement)

Fitur Catat Cepat (Smart Add) kini mendukung interaksi dua arah. Gunakan prinsip berikut saat AI berinteraksi dengan pengguna:

### Klarifikasi Ambigu
Saat AI tidak yakin dengan input pengguna, ajukan pertanyaan yang membantu namun tetap santai.
- **Gunakan**: "Ini masuk ke kategori 'Kebutuhan' atau 'Gaya Hidup' (Lifestyle) nih?", "Pesanannya mau dimasukkan ke dompet BCA atau Tunai?"
- **Hindari**: "Input tidak jelas. Pilih kategori.", "Data tidak lengkap."

### Koreksi Lewat Chat
Berikan respon yang menunjukkan AI mengerti koreksi pengguna.
- **Contoh Input Pengguna**: "Eh salah, tadi pakai kartu kredit BCA."
- **Contoh Respon AI (Implicit)**: AI langsung memperbarui data di layar tanpa pesan tambahan yang panjang, atau cukup dengan "Oke, sudah aku ganti ke kartu kredit BCA ya!"

