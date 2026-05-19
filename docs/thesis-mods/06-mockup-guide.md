# Panduan Screenshot Mockup Website (Bagian 2.5)

> **Tujuan**: Panduan ini menjelaskan halaman mana yang perlu di-screenshot, cara mengaksesnya, dan deskripsi teks yang sudah disiapkan di BAB 2. Anda hanya perlu menjalankan aplikasi, membuka halaman, dan mengambil screenshot.

---

## Persiapan

### 1. Jalankan Aplikasi

```bash
cd /home/ragel/Documents/projek-w/cop-civil-pa/cop-civil-main
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

### 2. Login sebagai Admin

1. Buka `http://localhost:5173/login`
2. Login dengan akun admin Appwrite
3. Setelah login, navigasi ke `http://localhost:5173/admin/dashboard`

### 3. Pastikan Ada Data

Untuk screenshot yang informatif, pastikan ada data insiden di database Appwrite:
- Jalankan beberapa tes dari testing guide (`docs/superpowers/specs/2026-04-29-copcivil-testing-guide.md`) untuk menghasilkan insiden
- Atau, jika sudah ada data dari pengujian sebelumnya, langsung screenshot

---

## Daftar Screenshot yang Dibutuhkan

### Screenshot 1: Halaman Login
- **URL**: `http://localhost:5173/login`
- **Gambar**: 2.12
- **Tips**: Screenshot sebelum login, tampilkan form email dan password
- **Kondisi**: Logout terlebih dahulu jika sudah login

### Screenshot 2: Sidebar Admin
- **URL**: `http://localhost:5173/admin/dashboard`
- **Gambar**: 2.13
- **Tips**: Klik menu "Keamanan" di sidebar agar sub-menu terbuka (Ringkasan, Log Insiden, Daftar Blokir, Laporan AI, Konfigurasi). Screenshot bagian sidebar saja (crop). Pastikan menu keamanan dalam keadaan expanded.
- **Kondisi**: Sidebar harus terlihat (jika layar kecil, klik hamburger menu)

### Screenshot 3: Dashboard Keamanan (Ringkasan)
- **URL**: `http://localhost:5173/admin/security`
- **Gambar**: 2.14
- **Tips**: Full page screenshot. Pastikan terlihat: 3 kartu statistik (Total Insiden 24 Jam, Serangan Diblokir 24 Jam, IP Diblokir Aktif), pie chart kategori, dan tabel insiden terbaru.
- **Kondisi**: Harus ada data insiden agar chart dan tabel terisi

### Screenshot 4: Log Insiden
- **URL**: `http://localhost:5173/admin/security/incidents`
- **Gambar**: 2.15
- **Tips**: Full page screenshot. Tampilkan tabel insiden dengan beberapa baris data. Jika ada filter, tampilkan dalam keadaan default.
- **Kondisi**: Harus ada data insiden

### Screenshot 5: Daftar Blokir IP
- **URL**: `http://localhost:5173/admin/security/blocklist`
- **Gambar**: 2.16
- **Tips**: Full page screenshot. Jika ada IP yang diblokir, tampilkan daftar. Jika tidak, tampilkan state kosong.
- **Kondisi**: Idealnya ada minimal 1 IP yang diblokir (jalankan auto-block test)

### Screenshot 6: Laporan AI
- **URL**: `http://localhost:5173/admin/security/ai-reports`
- **Gambar**: 2.17
- **Tips**: Jika sudah ada laporan, tampilkan salah satu yang terbuka/expanded. Jika belum, screenshot form trigger laporan dan state kosong.
- **Kondisi**: Idealnya sudah ada 1 laporan AI yang ter-generate

### Screenshot 7: Konfigurasi Keamanan
- **URL**: `http://localhost:5173/admin/security/config`
- **Gambar**: 2.18
- **Tips**: Full page screenshot. Tampilkan form konfigurasi dengan nilai-nilai yang sudah terisi (block threshold, warn threshold, auto-block settings, model AI, whitelist).
- **Kondisi**: Konfigurasi harus sudah tersimpan di Appwrite

---

## Tips Mengambil Screenshot

1. **Resolusi**: Gunakan resolusi layar 1920×1080 untuk konsistensi
2. **Browser**: Gunakan Chrome atau Firefox dalam mode normal (bukan incognito)
3. **Crop**: Crop bagian yang tidak relevan (misalnya address bar, taskbar OS)
4. **Format**: Simpan sebagai PNG untuk kualitas terbaik
5. **Penamaan file**: Gunakan format `gambar-2-XX-nama-halaman.png`
6. **Dark/Light mode**: Pastikan konsisten — gunakan satu theme untuk semua screenshot
7. **Full page**: Untuk halaman yang panjang, gunakan Chrome DevTools → Ctrl+Shift+P → "Capture full size screenshot"

---

## Teks Deskripsi (Sudah ada di BAB 2)

Teks deskripsi untuk setiap mockup sudah ditulis lengkap di file `03-bab2-deskripsi-sistem.md` bagian **2.5 MOCKUP WEBSITE**. Anda tinggal:

1. Ambil screenshot sesuai panduan di atas
2. Sisipkan screenshot ke dokumen Word di posisi yang ditandai `[SISIPKAN SCREENSHOT: ...]`
3. Tambahkan caption gambar sesuai yang tertera (Gambar 2.12 s.d. 2.18)
4. Sesuaikan formatting (center align, ukuran gambar ~80% lebar halaman)

---

## Catatan Penting

- Jika Anda menjalankan Netlify Edge Function secara lokal (dengan `netlify dev`), pastikan edge function aktif sebelum mengirim payload tes — ini diperlukan agar data insiden tercatat
- Jika hanya menjalankan `npm run dev` (Vite saja), dashboard tetap bisa diakses tetapi edge function tidak berjalan — data insiden harus sudah ada di Appwrite dari pengujian sebelumnya
- Untuk screenshot Laporan AI, pastikan OPENROUTER_API_KEY sudah dikonfigurasi di Appwrite Function environment variables
