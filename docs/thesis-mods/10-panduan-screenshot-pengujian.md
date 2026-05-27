# PANDUAN SCREENSHOT — Sub-bab 3.7.2 Pengujian Fungsional Sistem

> Panduan lengkap apa yang harus di-screenshot untuk setiap sub-bab pengujian fungsional. Beberapa modul adalah **backend logic** (bukan UI murni), jadi sebagian membutuhkan kombinasi screenshot dashboard + bukti teknis (terminal/DevTools/test result).

**Tanggal**: 21 Mei 2026
**Target**: BAB 3.7.2 (halaman 73-79 di skripsi PDF)
**Prinsip**: 1 sub-bab = minimal 1 screenshot. Modul backend butuh 2 screenshot (proses + hasil di dashboard).

---

## 🎯 PERSIAPAN SEBELUM SCREENSHOT

### 1. Generate Data Insiden Dummy (Wajib)

Sebelum screenshot dashboard, **dashboard harus berisi data**. Kalau database kosong, semua chart dan tabel akan kosong dan tidak meyakinkan untuk dosen.

Jalankan script seeding atau lakukan attack simulation manual via `curl`:

```bash
# Contoh attack dummy untuk mengisi insiden (jalankan beberapa kali)
curl "https://copcivil-cop.netlify.app/?id=1' OR '1'='1"
curl "https://copcivil-cop.netlify.app/search?q=<script>alert(1)</script>"
curl "https://copcivil-cop.netlify.app/api/file?path=../../../etc/passwd"
curl "https://copcivil-cop.netlify.app/exec?cmd=;cat /etc/passwd"
curl "https://copcivil-cop.netlify.app/?q=union%20select%20*%20from%20users"

# Ulangi 5-10 kali per kategori untuk dapat data yang variatif
```

### 2. Login Admin

URL login: `https://copcivil-cop.netlify.app/login` (atau apapun production URL Anda)

Setelah login, navigasi ke `/admin/security` (Dashboard Keamanan).

### 3. Setup Browser untuk Screenshot Bersih

- **Resolusi**: F11 untuk fullscreen, atau set browser ke 1920×1080
- **Zoom**: 100% (Ctrl+0)
- **Hapus bookmark bar**: View → Toggle Bookmarks
- **Tools screenshot**:
  - Windows: `Win + Shift + S` (Snipping Tool)
  - Browser DevTools full-page: `F12` → `Ctrl+Shift+P` → "Screenshot" → "Capture full size screenshot"

---

# 📸 PETA SCREENSHOT PER SUB-BAB

## 3.7.2.1 Modul Detection Engine

**Status**: ⚠️ Modul **backend murni** — tidak ada UI khusus. Bukti pengujian harus pakai kombinasi.

### Screenshot yang dibutuhkan (3 opsi, pilih 1-2):

#### Opsi A — Hasil Pengujian Vitest (RECOMMENDED)

Jalankan unit test detection engine, screenshot terminal:

```bash
cd ~/projects/cop-civil
npm test -- copcivil/__tests__/detector.test.js
```

**Screenshot**: terminal output yang menunjukkan **semua test PASS** (warna hijau).

📷 **Caption usulan**: *"Gambar 3.X — Hasil pengujian unit test modul Detection Engine (vitest). Seluruh skenario pencocokan multi-pattern berhasil dengan status PASS."*

#### Opsi B — Demonstrasi via Browser DevTools Console

1. Login admin → buka DevTools (F12) → tab Console
2. Jalankan attack simulation di tab baru (misal kunjungi URL `/?q=union+select+from+users`)
3. Screenshot **Network tab** yang menampilkan response 403 dengan body JSON `{"blocked": true, "category": "sqli", "score": 17}`

📷 **Caption usulan**: *"Gambar 3.X — Response detection engine via Edge Function. Request berisi payload SQLi terdeteksi dan dikembalikan dengan kode 403 beserta detail kategori dan skor."*

#### Opsi C — Tampilan Insiden di Dashboard

1. Setelah attack simulation, buka **Dashboard Keamanan** (`/admin/security`)
2. Screenshot bagian **"Insiden Terbaru"** yang menampilkan kategori (sqli/xss/cmdi/path_traversal) dan severity hasil deteksi engine

📷 **Caption usulan**: *"Gambar 3.X — Insiden hasil deteksi engine ditampilkan di dashboard, menunjukkan kategori, severity, dan aksi yang diambil."*

---

## 3.7.2.2 Modul Normalisasi Input Berlapis

**Status**: ⚠️ Modul **backend murni** — bukti pengujian via test atau request comparison.

### Screenshot yang dibutuhkan:

#### Opsi A — Hasil Pengujian Vitest (RECOMMENDED)

```bash
cd ~/projects/cop-civil
npm test -- copcivil/__tests__/normalizer.test.js
```

**Screenshot**: terminal output dengan **semua 7 grup test PASS** (urlDecode, doubleDecode, htmlEntityDecode, caseFold, stripSqlComments, collapseWhitespace, stripNullBytes, normalize full pipeline).

📷 **Caption usulan**: *"Gambar 3.X — Hasil pengujian unit test pipeline normalisasi 6 tahap. Setiap tahap normalisasi terverifikasi menangani teknik evasion sesuai spesifikasi."*

#### Opsi B — Demonstrasi Evasion Bypass via curl

Buat 2 screenshot side-by-side:

**Screenshot 1**: Request **biasa** (tanpa encoding) — terdeteksi
```bash
curl -v "https://copcivil-cop.netlify.app/?q=' OR 1=1"
# Response 403
```

**Screenshot 2**: Request **double-encoded** — tetap terdeteksi (proof normalizer bekerja)
```bash
curl -v "https://copcivil-cop.netlify.app/?q=%2527%2520OR%25201%253D1"
# Response 403 (karena double-decode)
```

📷 **Caption usulan**: *"Gambar 3.X — Pengujian pipeline normalisasi terhadap teknik evasion double URL encoding. Payload yang ter-encode dua kali tetap terdeteksi setelah melalui proses dekoding berlapis."*

---

## 3.7.2.3 Modul Netlify Edge Function (Security Gateway)

**Status**: ⚠️ Modul **backend** — tapi bisa screenshot output terminal & dashboard.

### Screenshot yang dibutuhkan (2 buah):

#### Screenshot 1 — Terminal Response Blokir (sudah ada di Gambar 3.3)

Kirim attack via curl, capture response 403 JSON:
```bash
curl -v "https://copcivil-cop.netlify.app/?q=union+select+*+from+users"
```

Anda **sudah punya** Gambar 3.3 yang serupa (line 1929 di skripsi). Bisa pakai ulang atau bikin baru lebih jelas.

📷 **Caption**: *"Gambar 3.X — Response Edge Function untuk request berisi payload SQL Injection. Edge Function mengembalikan HTTP 403 dengan body JSON terstruktur."*

#### Screenshot 2 — Netlify Functions Logs (RECOMMENDED)

1. Login ke Netlify Dashboard → pilih project `copcivil-cop`
2. Pilih tab **Logs** → **Edge Functions**
3. Filter ke fungsi `copcivil-edge`
4. Screenshot log entries yang menunjukkan request masuk + decision (allowed/blocked)

📷 **Caption**: *"Gambar 3.X — Log eksekusi Netlify Edge Function copcivil-edge. Setiap request yang masuk dicatat beserta tindakan yang diambil oleh gateway keamanan."*

---

## 3.7.2.4 Mekanisme IP Blocking

**Status**: ✅ **Punya UI** — di halaman Daftar Blokir.

### Screenshot yang dibutuhkan (2 buah):

#### Screenshot 1 — Halaman Daftar Blokir IP

1. Login admin → navigate ke `/admin/security/blocklist`
2. Pastikan ada minimal 3-5 IP terblokir (kalau kosong, lakukan seeding/auto-block dulu)
3. Screenshot halaman dengan kolom: **IP Address, Reason, Block Type (auto/manual), Expires At**

📷 **Caption**: *"Gambar 3.X — Halaman Daftar Blokir IP menampilkan IP yang otomatis diblokir setelah mencapai ambang batas insiden."*

#### Screenshot 2 — Demonstrasi Auto-Block via Repeated Request

Kirim 6 request berbahaya berturut-turut dari IP yang sama:
```bash
for i in {1..6}; do
  curl "https://copcivil-cop.netlify.app/?q=union+select+from+users"
  sleep 2
done
```

Lalu screenshot halaman Daftar Blokir yang menampilkan IP Anda baru saja di-auto-block dengan `block_type: auto`.

📷 **Caption**: *"Gambar 3.X — IP secara otomatis ditambahkan ke daftar blokir setelah mencapai ambang batas 5 insiden dalam 10 menit."*

---

## 3.7.2.5 Dashboard Admin dan API Layer

**Status**: ✅ **Penuh UI** — paling banyak screenshot di sini.

### Screenshot yang dibutuhkan (5 buah, satu per sub-halaman):

#### Screenshot 1 — Halaman Ringkasan (SecurityDashboardPage)

URL: `/admin/security`

Bagian yang harus terlihat:
- **3 kartu statistik atas**: Total Insiden 24 Jam, Serangan Diblokir 24 Jam, IP Diblokir Aktif
- **Pie Chart kategori** (sqli/xss/cmdi/path_traversal)
- **Tabel "Insiden Terbaru"** dengan kolom Waktu, IP, Kategori, Tingkat, Aksi

📷 **Caption**: *"Gambar 3.X — Dashboard Ringkasan menampilkan kartu statistik 24 jam, distribusi kategori serangan, dan daftar insiden terbaru."*

⚠️ **PASTIKAN**: data terisi (jangan kosong). Kalau perlu, lakukan attack simulation 10-20 kali dengan kategori variatif sebelum screenshot.

#### Screenshot 2 — Halaman Log Insiden (IncidentLogPage)

URL: `/admin/security/incidents`

Bagian yang harus terlihat:
- **Filter** (kategori, severity, action) di atas
- **Tabel insiden lengkap** (minimal 10-15 baris terlihat)
- **Pagination** di bawah ("Halaman 1 dari N (total insiden)")

📷 **Caption**: *"Gambar 3.X — Halaman Log Insiden menampilkan daftar lengkap insiden dengan filter kategori, severity, dan action, serta pagination."*

⚠️ **TIPS**: Aktifkan satu filter (misal severity=critical) dan screenshot — buktinya filter berfungsi.

#### Screenshot 3 — Halaman Daftar Blokir (BlocklistPage)

URL: `/admin/security/blocklist`

Sudah dibahas di 3.7.2.4. Pakai Screenshot 1 dari sub-bab tersebut **atau** ambil ulang yang lebih lengkap.

📷 **Caption**: *"Gambar 3.X — Halaman Daftar Blokir menampilkan IP yang diblokir dengan opsi unblock manual."*

#### Screenshot 4 — Halaman Laporan AI (AiReportPage)

URL: `/admin/security/reports`

Bagian yang harus terlihat:
- **Form pemilihan periode** (tanggal start-end)
- **Tombol "Generate Report"**
- **Tampilan laporan AI** yang sudah pernah di-generate (jika ada — kalau belum, generate dulu sekali)

📷 **Caption**: *"Gambar 3.X — Halaman Laporan AI dengan form pemilihan periode dan tampilan hasil laporan analisis berbasis kecerdasan buatan."*

⚠️ **WAJIB**: Generate minimal 1 laporan AI dulu sebelum screenshot, supaya halaman ada konten (bukan kosong).

#### Screenshot 5 — Halaman Konfigurasi Keamanan (SecurityConfigPage)

URL: `/admin/security/config`

Bagian yang harus terlihat:
- Form pengaturan (block threshold, warn threshold, auto-block window, dll)
- Pilihan model AI OpenRouter
- Whitelist IP

Anda **sudah punya** Gambar 2.19 di BAB 2 (line 1515 di skripsi) untuk halaman ini. Bisa pakai ulang atau ambil baru.

📷 **Caption**: *"Gambar 3.X — Halaman Konfigurasi Keamanan untuk mengelola parameter operasional sistem tanpa modifikasi kode."*

---

## 3.7.2.6 AI Analytics Pipeline

**Status**: ✅ **Punya UI** — di halaman Laporan AI.

### Screenshot yang dibutuhkan (2 buah):

#### Screenshot 1 — Proses Generate Laporan AI

1. URL: `/admin/security/reports`
2. Pilih periode (misal: 7 hari terakhir)
3. Klik "Generate Report"
4. Screenshot saat **loading state** (sedang memanggil OpenRouter) — opsional, atau...
5. Screenshot setelah **laporan jadi** dengan konten Markdown ter-render

📷 **Caption**: *"Gambar 3.X — Hasil generate laporan AI dengan konten Executive Summary, Threat Analysis, Risk Assessment, Recommendations, dan Trend Comparison."*

⚠️ **TIPS**: Screenshot harus menampilkan **konten laporan yang substantial** (minimal 5-8 paragraf terlihat). Kalau laporan terlalu pendek/kosong, pastikan database punya cukup insiden untuk dianalisis.

#### Screenshot 2 — Detail Konten Laporan (Optional, untuk perkuat bukti)

Setelah generate, scroll dan screenshot bagian **Recommendations** yang spesifik (misal: "1. Implement stricter input validation...").

📷 **Caption**: *"Gambar 3.X — Bagian Recommendations dari laporan AI yang berisi saran mitigasi spesifik berdasarkan data insiden aktual."*

---

# 📋 CHECKLIST SCREENSHOT FINAL

| Sub-bab | Screenshot | Halaman/URL Web | Status |
|---|---|---|---|
| 3.7.2.1 Detection Engine | Terminal vitest PASS atau Insiden Terbaru | Terminal / `/admin/security` | ☐ |
| 3.7.2.2 Normalisasi Input | Terminal vitest PASS atau curl evasion | Terminal | ☐ |
| 3.7.2.3 Edge Function — Response | Terminal curl 403 | Terminal | ☐ |
| 3.7.2.3 Edge Function — Logs | Netlify Dashboard Logs | Netlify Dashboard | ☐ |
| 3.7.2.4 IP Blocking — Daftar | Halaman Daftar Blokir | `/admin/security/blocklist` | ☐ |
| 3.7.2.4 IP Blocking — Auto-block demo | Halaman Daftar Blokir setelah seeding | `/admin/security/blocklist` | ☐ |
| 3.7.2.5 Dashboard Admin — Ringkasan | Halaman Ringkasan | `/admin/security` | ☐ |
| 3.7.2.5 Dashboard Admin — Log Insiden | Halaman Log Insiden | `/admin/security/incidents` | ☐ |
| 3.7.2.5 Dashboard Admin — Daftar Blokir | (Reuse dari 3.7.2.4) | `/admin/security/blocklist` | ☐ |
| 3.7.2.5 Dashboard Admin — Laporan AI | Halaman Laporan AI | `/admin/security/reports` | ☐ |
| 3.7.2.5 Dashboard Admin — Konfigurasi | Halaman Konfigurasi | `/admin/security/config` | ☐ |
| 3.7.2.6 AI Analytics — Hasil laporan | Halaman Laporan AI (rendered) | `/admin/security/reports` | ☐ |
| 3.7.2.6 AI Analytics — Recommendations | Bagian rekomendasi | `/admin/security/reports` | ☐ |

**Total minimal**: ~10-12 screenshot.

---

# ⚙️ TIPS PRAKTIS

## Cara mengisi data dummy cepat (kalau dashboard kosong)

Buat script bash sederhana untuk attack simulation berturut-turut:

```bash
#!/bin/bash
URL="https://copcivil-cop.netlify.app"

# 5 SQLi
for i in {1..5}; do curl -s "$URL/?id=$i' OR '1'='1" > /dev/null; sleep 1; done

# 5 XSS
for i in {1..5}; do curl -s "$URL/search?q=<script>alert($i)</script>" > /dev/null; sleep 1; done

# 5 CMDi
for i in {1..5}; do curl -s "$URL/exec?cmd=;cat /etc/passwd" > /dev/null; sleep 1; done

# 5 Path Traversal
for i in {1..5}; do curl -s "$URL/file?path=../../../etc/passwd" > /dev/null; sleep 1; done

echo "Done. Buka dashboard untuk verifikasi data."
```

Simpan sebagai `seed-attacks.sh`, jalankan: `bash seed-attacks.sh`

## Cara screenshot full-page di browser

**Chrome/Edge**:
1. F12 → Buka DevTools
2. Ctrl+Shift+P (Command Palette)
3. Ketik "screenshot"
4. Pilih "Capture full size screenshot"

Hasil: PNG yang menangkap **seluruh halaman** termasuk yang ter-scroll, bukan cuma yang terlihat.

## Cara penomoran gambar yang konsisten

Skripsi Anda saat ini sampai **Gambar 3.5**. Lanjutkan dari **Gambar 3.6** dst:

| Sub-bab | Nomor Gambar usulan |
|---|---|
| 3.7.2.1 Detection Engine | Gambar 3.6 |
| 3.7.2.2 Normalisasi | Gambar 3.7 |
| 3.7.2.3 Edge Function (Response) | Gambar 3.8 |
| 3.7.2.3 Edge Function (Logs) | Gambar 3.9 |
| 3.7.2.4 IP Blocking (Daftar) | Gambar 3.10 |
| 3.7.2.4 IP Blocking (Auto-block) | Gambar 3.11 |
| 3.7.2.5 Dashboard — Ringkasan | Gambar 3.12 |
| 3.7.2.5 Dashboard — Log Insiden | Gambar 3.13 |
| 3.7.2.5 Dashboard — Daftar Blokir | Gambar 3.14 |
| 3.7.2.5 Dashboard — Laporan AI | Gambar 3.15 |
| 3.7.2.5 Dashboard — Konfigurasi | Gambar 3.16 |
| 3.7.2.6 AI Analytics — Hasil | Gambar 3.17 |
| 3.7.2.6 AI Analytics — Recommendations | Gambar 3.18 |

⚠️ **Update DAFTAR GAMBAR** di front matter setelah menambah gambar ini.

---

**Status**: Siap dieksekusi. Login admin, jalankan seeding script, lalu ambil screenshot sesuai checklist di atas.
