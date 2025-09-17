# Panduan Kontribusi untuk Lemon

Terima kasih telah mempertimbangkan untuk berkontribusi pada aplikasi Lemon! Kami sangat menghargai bantuan dari komunitas.

## Cara Memulai

1.  **Fork & Clone Repositori**:
    *   Buat *fork* dari repositori ini ke akun GitHub Anda.
    *   Clone *fork* tersebut ke mesin lokal Anda:
        ```bash
        git clone https://github.com/USERNAME_ANDA/lemon-app.git
        cd lemon-app
        ```

2.  **Instalasi Dependensi**:
    Proyek ini menggunakan `npm` sebagai manajer paket.
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**:
    *   Salin file `.env.local.example` menjadi `.env.local`.
    *   Isi variabel environment yang diperlukan, terutama konfigurasi Firebase Anda.

4.  **Jalankan Server Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## Struktur Proyek

Berikut adalah gambaran singkat tentang struktur folder utama:

-   `src/app`: Berisi semua rute dan halaman utama menggunakan Next.js App Router.
-   `src/components`: Komponen React yang dapat digunakan kembali.
    -   `ui/`: Komponen UI dasar dari `shadcn/ui`.
    -   Komponen lain adalah komponen spesifik aplikasi (misalnya, `add-transaction-form.tsx`).
-   `src/lib`: Berisi logika inti dan utilitas.
    -   `firebase.ts`: Konfigurasi dan inisialisasi Firebase.
    -   `categories.ts`: Definisi kategori dan ikon.
    -   `utils.ts`: Fungsi bantuan umum.
-   `src/hooks`: Custom React Hooks (misalnya, `useApp`).

## Alur Kerja Kontribusi

1.  **Buat Branch Baru**:
    Buat *branch* baru dari `main` untuk setiap fitur atau perbaikan yang Anda kerjakan.
    ```bash
    git checkout -b fitur/nama-fitur-keren
    ```

2.  **Lakukan Perubahan**:
    *   Tulis kode yang bersih, mudah dibaca, dan konsisten dengan gaya yang sudah ada.
    *   Pastikan untuk mengikuti pedoman styling dengan Tailwind CSS dan `shadcn/ui`.

3.  **Commit Perubahan Anda**:
    Gunakan pesan *commit* yang jelas dan deskriptif.
    ```bash
    git commit -m "feat: Menambahkan fitur X yang luar biasa"
    ```

4.  **Push ke Branch Anda**:
    ```bash
    git push origin fitur/nama-fitur-keren
    ```

5.  **Buka Pull Request**:
    *   Buka repositori *fork* Anda di GitHub dan klik tombol "New pull request".
    *   Berikan judul dan deskripsi yang jelas tentang perubahan yang Anda buat.
    *   Tunggu ulasan dan masukan.

Terima kasih telah membuat Lemon menjadi lebih baik!