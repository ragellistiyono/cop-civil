# PANDUAN REVISI V2 — 27 Mei 2026

> Dokumen ini menyelesaikan 4 poin revisi dari dosen pembimbing (Bu Fitri) terhadap dokumen skripsi yang sudah disisipkan revisi sebelumnya. Mencakup revisi struktur Tujuan, paragraf penjelas untuk gambar/tabel, perbaikan penjelasan tabel, dan restrukturisasi sub-bab AI Analytics & Tabel 3.12.

**Tanggal**: 27 Mei 2026
**Sumber**: `Copy of PA 3123510644_Ragel Listiyono_2023.docx` (104 halaman)
**Target output**: 4 revisi terpadu siap copy-paste ke skripsi

---

## DAFTAR REVISI

| No | Topik | Tindakan | Halaman Target |
|---|---|---|---|
| 1 | Tujuan per poin | Restrukturisasi 1 paragraf naratif → 5 poin mirror Identifikasi Permasalahan | 12 |
| 2 | Penjelasan gambar/tabel | Tambah paragraf intro (sebelum) + penjelas (sesudah) di **semua** caption | tersebar |
| 3 | Konsistensi penjelasan tabel | Standarisasi pola "kalimat pengantar → tabel → kalimat interpretasi" | tersebar |
| 4 | Tabel 3.12 nyangkut di AI Analytics | Pisah jadi sub-bab `3.7.3 Ringkasan Hasil Pengujian Fungsional` dengan intro yang jelas | 95 |

---

# 🔹 REVISI 1 — TUJUAN PER POIN MIRROR IDENTIFIKASI

## Lokasi

**BAB 1 — PENDAHULUAN**, sub-bab **1.4 TUJUAN**, halaman **12**.

## Yang sekarang (problematic)

Tujuan saat ini ditulis dalam **1 paragraf naratif panjang** (~25 baris) yang mencakup banyak hal, tetapi dosen ingin formatnya **per poin** mirror dengan **Identifikasi Permasalahan** (yang sudah punya 5 poin di sub-bab 1.2).

## Mapping Identifikasi → Tujuan

Identifikasi Permasalahan punya 5 poin "Bagaimana ...", maka Tujuan harus punya 5 poin "Mengembangkan/Mengimplementasikan ..." yang **menjawab** masing-masing.

## ✏️ Teks Pengganti — Sub-bab 1.4 TUJUAN (siap copy-paste)

```
1.4 TUJUAN

Berdasarkan identifikasi permasalahan yang telah diuraikan, penelitian 
proyek akhir ini bertujuan untuk mengembangkan Copcivil Security System, 
yaitu sebuah AI-Driven Web Intrusion Detection & Prevention System (IDPS) 
yang diimplementasikan sebagai modul keamanan terintegrasi pada aplikasi 
web CIVIL QTRACK. Secara spesifik, tujuan penelitian ini dapat 
dijabarkan sebagai berikut:

1. Merancang dan mengimplementasikan sistem deteksi serangan web berbasis 
   algoritma Aho-Corasick yang mampu mencocokkan pola serangan secara 
   simultan dengan performa real-time pada lapisan edge computing.

2. Mengimplementasikan mekanisme normalisasi input berlapis enam tahap 
   (penghapusan null bytes, double URL decoding, HTML entity decoding, 
   case folding, penghapusan komentar SQL, dan normalisasi whitespace) 
   yang efektif dalam mengalahkan teknik evasion yang umum digunakan 
   penyerang untuk melewati sistem deteksi.

3. Membangun sistem pencegahan otomatis berbasis IP blocking dengan 
   ambang batas akumulasi skor ancaman dan jumlah insiden, yang mampu 
   merespons ancaman secara real-time dan terintegrasi dengan basis 
   data Appwrite Cloud.

4. Mengintegrasikan analitik berbasis Large Language Model (LLM) yang 
   bersifat provider-agnostic melalui OpenRouter API untuk menghasilkan 
   laporan analisis keamanan komprehensif yang mencakup ringkasan 
   eksekutif, analisis pola, penilaian risiko, dan rekomendasi mitigasi.

5. Mengimplementasikan seluruh sistem sebagai modul keamanan yang 
   terintegrasi dengan aplikasi web berbasis React dan Vite, kompatibel 
   dengan Netlify Edge Functions dan Appwrite Cloud, serta menyediakan 
   dashboard admin dengan kemampuan monitoring real-time.
```

## ✓ Verifikasi mirror

| Poin | Identifikasi (1.2) | Tujuan (1.4) |
|---|---|---|
| 1 | Bagaimana merancang sistem deteksi Aho-Corasick? | **Merancang** sistem deteksi Aho-Corasick |
| 2 | Bagaimana implementasi normalisasi berlapis? | **Mengimplementasikan** normalisasi 6 tahap |
| 3 | Bagaimana membangun pencegahan otomatis IP blocking? | **Membangun** sistem IP blocking otomatis |
| 4 | Bagaimana integrasi analitik LLM? | **Mengintegrasikan** analitik LLM via OpenRouter |
| 5 | Bagaimana sistem terintegrasi dengan React+Vite+Netlify+Appwrite? | **Mengimplementasikan** sebagai modul terintegrasi |

Setiap poin Tujuan **menjawab langsung** poin Identifikasi yang setara.

---

# 🔹 REVISI 2 — PARAGRAF PENJELAS UNTUK SEMUA GAMBAR/TABEL

## Prinsip

Untuk setiap gambar/tabel, gunakan **pola 3 bagian**:

```
[1] Kalimat pengantar (intro, sebelum gambar/tabel)
    "Sebagaimana ditunjukkan pada Gambar/Tabel X.Y, ..."

[2] Gambar atau Tabel itu sendiri

[3] Kalimat interpretasi (closing, setelah gambar/tabel)
    "Pada Gambar/Tabel X.Y di atas, dapat dilihat bahwa ..."
```

## Daftar lengkap caption yang butuh paragraf penjelas

Total **41 dari 53 caption** belum punya paragraf penjelas yang memadai. Berikut paragraf penjelas siap-tempel untuk masing-masing.

---

### BAB 2 — Penelitian Terkait & Desain Sistem

#### Tabel 2.8 — Perbandingan Penelitian Terkait

**Pengantar (sebelum tabel):**
> Untuk memberikan gambaran posisi penelitian ini terhadap penelitian terdahulu, disusun perbandingan antara penelitian-penelitian yang telah dibahas dengan penelitian yang dilakukan dalam proyek akhir ini. Perbandingan tersebut disajikan pada Tabel 2.8 berikut.

**Penjelas (setelah tabel):**
> Berdasarkan Tabel 2.8 di atas, terlihat bahwa penelitian-penelitian terdahulu umumnya berfokus pada pendekatan deep learning yang membutuhkan dataset besar dan sumber daya komputasi tinggi. Penelitian ini menempati posisi yang berbeda dengan menggabungkan pendekatan signature-based berbasis Aho-Corasick yang efisien untuk lapisan edge dan analitik AI berbasis LLM untuk laporan ancaman. Kombinasi ini memberikan keunggulan dalam hal latensi rendah dan kemampuan menghasilkan laporan kontekstual.

---

#### Gambar 2.1 — Alur Admin

**Pengantar:**
> Alur kerja administrator dalam mengoperasikan dashboard keamanan dimulai dari proses autentikasi hingga pengambilan keputusan operasional. Alur lengkap tersebut digambarkan pada Gambar 2.1 berikut.

**Penjelas:**
> Pada Gambar 2.1 di atas, dapat dilihat bahwa administrator harus melalui proses login terlebih dahulu sebelum dapat mengakses dashboard. Setelah autentikasi berhasil, administrator memiliki akses ke fitur monitoring insiden, manajemen daftar blokir IP, generate laporan AI, dan konfigurasi parameter sistem.

---

#### Gambar 2.2 — User Request URL (Normal Flow)

**Pengantar:**
> Alur permintaan pengguna ketika mengakses aplikasi web pada kondisi normal melibatkan interaksi antara client, edge function, dan aplikasi. Alur tersebut diilustrasikan pada Gambar 2.2 berikut.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 2.2, setiap permintaan dari pengguna terlebih dahulu melewati Netlify Edge Function yang berperan sebagai gerbang keamanan. Permintaan yang lolos pemeriksaan akan diteruskan ke aplikasi, sedangkan permintaan yang mencurigakan akan dikembalikan dengan respons blokir.

---

#### Gambar 2.3 — User Request URL (Attack Flow)

**Pengantar:**
> Skenario alur permintaan ketika pengguna mengirimkan payload serangan ditangani secara berbeda oleh sistem. Alur penanganan serangan tersebut dapat dilihat pada Gambar 2.3.

**Penjelas:**
> Pada Gambar 2.3 di atas, terlihat bahwa permintaan yang mengandung payload berbahaya akan dideteksi oleh detection engine. Sistem kemudian mengembalikan respons HTTP 403 dengan body JSON yang mencantumkan kategori serangan, skor ancaman, dan tindakan yang diambil.

---

#### Gambar 2.4 — Desain Sistem Arsitektur

**Pengantar:**
> Desain arsitektur sistem secara keseluruhan menggambarkan komponen-komponen utama beserta interaksi antar layanan. Gambaran arsitektur tersebut disajikan pada Gambar 2.4 berikut.

**Penjelas:**
> Berdasarkan Gambar 2.4 di atas, dapat dilihat bahwa arsitektur sistem terdiri dari empat lapisan utama: lapisan client (browser), lapisan edge (Netlify Edge Function), lapisan backend (Appwrite Functions), dan lapisan data (Appwrite Cloud Database). Pemisahan lapisan ini memungkinkan tanggung jawab masing-masing komponen tetap terlokalisasi dan mudah dikembangkan secara independen.

---

#### Gambar 2.5 — Use Case Diagram

**Pengantar:**
> Untuk memetakan interaksi antara aktor dan fungsionalitas sistem, disusun diagram use case yang menggambarkan kemampuan utama yang dimiliki masing-masing aktor. Diagram tersebut disajikan pada Gambar 2.5 berikut.

**Penjelas:**
> Pada Gambar 2.5 di atas, terdapat dua aktor utama yaitu Administrator dan Pengguna Umum. Administrator memiliki akses penuh terhadap dashboard keamanan, manajemen blocklist, dan laporan AI, sedangkan pengguna umum hanya berinteraksi dengan aplikasi web yang dilindungi oleh sistem keamanan secara transparan.

---

#### Gambar 2.6 — Data Flow Diagram Level 0

**Pengantar:**
> Diagram alir data tingkat 0 menampilkan pandangan paling abstrak dari sistem, di mana sistem direpresentasikan sebagai satu kesatuan yang berinteraksi dengan entitas eksternal. Visualisasi tingkat 0 tersebut disajikan pada Gambar 2.6.

**Penjelas:**
> Sebagaimana terlihat pada Gambar 2.6, sistem berinteraksi dengan tiga entitas eksternal utama yaitu pengguna umum (yang mengirimkan request HTTP), administrator (yang mengoperasikan dashboard), dan layanan AI eksternal OpenRouter (yang menyediakan kapabilitas analisis LLM).

---

#### Gambar 2.7 — Data Flow Diagram Level 1

**Pengantar:**
> Pada tingkat yang lebih detail, sistem dipecah menjadi proses-proses utama beserta aliran data antar prosesnya. Pemecahan tersebut diperlihatkan pada Gambar 2.7 berikut.

**Penjelas:**
> Berdasarkan Gambar 2.7, sistem dipecah menjadi empat proses utama yaitu deteksi serangan, pencegahan & IP blocking, pencatatan insiden, dan analitik AI. Masing-masing proses memiliki data store yang spesifik dan saling terhubung melalui aliran data yang terstruktur.

---

#### Gambar 2.8 — DFD Level 2: Proses Deteksi Serangan

**Pengantar:**
> Untuk memahami detail implementasi proses deteksi serangan, dilakukan dekomposisi lebih lanjut menjadi sub-proses yang lebih granular. Hasil dekomposisi proses deteksi tersebut digambarkan pada Gambar 2.8.

**Penjelas:**
> Pada Gambar 2.8 di atas, dapat dilihat bahwa proses deteksi terdiri dari sub-proses normalisasi input, pencocokan pola via Aho-Corasick automaton, penghitungan skor severity, dan pengambilan keputusan tindakan. Setiap sub-proses memiliki input dan output yang terdefinisi dengan jelas.

---

#### Gambar 2.9 — DFD Level 2: Pencegahan & IP Blocking

**Pengantar:**
> Proses pencegahan dan IP blocking memiliki alur internal yang melibatkan akumulasi insiden, pengecekan ambang batas, dan manajemen daftar blokir. Detail proses tersebut disajikan pada Gambar 2.9.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 2.9, ketika sebuah IP mencatat sejumlah insiden yang melebihi ambang batas dalam jendela waktu tertentu, sistem secara otomatis menambahkan IP tersebut ke koleksi ip_blocklist dengan durasi kedaluwarsa yang dapat dikonfigurasi.

---

#### Gambar 2.10 — DFD Level 2: Pencatatan Insiden

**Pengantar:**
> Proses pencatatan insiden bertanggung jawab merekam seluruh kejadian deteksi serangan ke basis data untuk keperluan audit dan analitik. Alur pencatatan tersebut digambarkan pada Gambar 2.10.

**Penjelas:**
> Pada Gambar 2.10 di atas, terlihat bahwa setiap insiden yang terdeteksi melewati proses ekstraksi metadata, pembentukan log payload, dan persistence ke koleksi security_incidents di Appwrite Cloud. Mekanisme ini menjamin tidak ada insiden yang hilang dari rekaman audit.

---

#### Gambar 2.11 — DFD Level 2: Analitik AI

**Pengantar:**
> Proses analitik AI berlangsung secara terpisah dari deteksi real-time, melibatkan pengambilan data insiden, agregasi statistik, dan pemanggilan model LLM eksternal. Alur lengkap proses ini disajikan pada Gambar 2.11.

**Penjelas:**
> Berdasarkan Gambar 2.11, alur analitik AI dimulai dari permintaan administrator, dilanjutkan dengan pengambilan dan agregasi data insiden, penyusunan prompt terstruktur, pemanggilan OpenRouter API, dan diakhiri dengan penyimpanan laporan ke koleksi ai_reports.

---

#### Gambar 2.12 — Entity Relationship Diagram

**Pengantar:**
> Untuk merepresentasikan struktur data dan relasi antar koleksi pada basis data Appwrite Cloud, disusun diagram relasi entitas. Diagram tersebut diperlihatkan pada Gambar 2.12 berikut.

**Penjelas:**
> Pada Gambar 2.12 di atas, terdapat empat koleksi utama yaitu security_incidents, ip_blocklist, ai_reports, dan security_config. Relasi antar koleksi sebagian besar bersifat logis (referensial) melalui field ip_address dan timestamp, mengikuti paradigma NoSQL yang fleksibel pada Appwrite.

---

#### Gambar 2.13 — Login Page (Mockup)

**Pengantar:**
> Halaman login merupakan titik masuk utama administrator ke sistem dashboard. Rancangan tampilan halaman login disajikan pada Gambar 2.13.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 2.13, halaman login dirancang dengan tampilan yang minimalis dan fokus pada formulir autentikasi (email dan password). Hanya pengguna dengan kredensial valid yang dapat melanjutkan ke dashboard admin.

---

#### Gambar 2.14 — Dashboard Admin (Sidebar)

**Pengantar:**
> Setelah autentikasi berhasil, administrator akan masuk ke dashboard utama yang menyediakan navigasi ke seluruh fitur sistem. Tampilan dashboard tersebut diperlihatkan pada Gambar 2.14.

**Penjelas:**
> Pada Gambar 2.14 di atas, dapat dilihat bahwa dashboard admin menggunakan layout dengan sidebar navigasi di sisi kiri yang memuat lima halaman utama: Ringkasan, Log Insiden, Daftar Blokir, Laporan AI, dan Konfigurasi.

---

#### Gambar 2.15 — Dashboard Admin Keamanan (Ringkasan)

**Pengantar:**
> Halaman ringkasan keamanan menampilkan gambaran umum status keamanan dalam 24 jam terakhir secara visual. Tampilan halaman ringkasan tersebut disajikan pada Gambar 2.15.

**Penjelas:**
> Berdasarkan Gambar 2.15, halaman ringkasan terdiri dari tiga kartu statistik utama (total insiden, jumlah blokir, IP aktif diblokir), pie chart distribusi kategori serangan, dan tabel insiden terbaru. Komposisi ini memungkinkan administrator memperoleh insight cepat tanpa perlu navigasi mendalam.

---

#### Gambar 2.16 — Dashboard Admin Log Insiden

**Pengantar:**
> Untuk mengakses detail seluruh insiden yang pernah tercatat, administrator dapat menggunakan halaman log insiden yang dilengkapi fitur pencarian dan filter. Tampilan halaman tersebut digambarkan pada Gambar 2.16.

**Penjelas:**
> Pada Gambar 2.16 di atas, terlihat bahwa halaman log insiden menyajikan data dalam bentuk tabel dengan kolom-kolom utama yaitu waktu, IP, kategori, severity, dan tindakan. Filter di bagian atas memungkinkan administrator menyaring data berdasarkan kriteria spesifik.

---

#### Gambar 2.17 — Dashboard Admin Daftar Blokir IP

**Pengantar:**
> Daftar IP yang sedang diblokir dapat dilihat dan dikelola melalui halaman khusus blocklist. Rancangan halaman tersebut diperlihatkan pada Gambar 2.17.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 2.17, halaman daftar blokir menampilkan tabel berisi IP terblokir lengkap dengan alasan, jenis blokir (otomatis atau manual), dan waktu kedaluwarsa. Administrator dapat melakukan operasi unblock secara manual jika diperlukan.

---

#### Gambar 2.18 — Dashboard Admin Laporan AI (catatan: nomor 2.19 di skripsi sepertinya typo, harusnya 2.18)

**Pengantar:**
> Halaman laporan AI memungkinkan administrator membuat dan melihat laporan analisis keamanan berbasis LLM untuk periode tertentu. Tampilan halaman tersebut disajikan pada Gambar 2.18.

**Penjelas:**
> Pada Gambar 2.18 di atas, dapat dilihat bahwa administrator dapat memilih rentang waktu analisis melalui form periode, kemudian sistem akan men-generate laporan komprehensif yang ditampilkan dalam format Markdown ter-render.

---

#### Gambar 2.19 — Dashboard Admin Konfigurasi Keamanan

**Pengantar:**
> Untuk memberikan keleluasaan administrator dalam menyesuaikan parameter operasional sistem tanpa modifikasi kode, disediakan halaman konfigurasi. Tampilan halaman tersebut diperlihatkan pada Gambar 2.19.

**Penjelas:**
> Berdasarkan Gambar 2.19, halaman konfigurasi memungkinkan pengaturan ambang batas skor pemblokiran, durasi blokir otomatis, model AI OpenRouter, dan whitelist IP. Perubahan konfigurasi langsung berlaku tanpa perlu redeploy aplikasi.

---

### BAB 3 — Implementasi & Pengujian

#### Gambar 3.1 — Struktur Proyek

**Pengantar:**
> Struktur direktori proyek dirancang dengan memisahkan kode sumber berdasarkan tanggung jawab fungsionalnya. Visualisasi struktur tersebut diperlihatkan pada Gambar 3.1 di Visual Studio Code.

**Penjelas:**
> Pada Gambar 3.1 di atas, terlihat bahwa proyek terorganisir menjadi direktori utama yaitu `copcivil/` (logika keamanan inti), `src/` (antarmuka React), `functions/` (Appwrite Functions), dan `netlify/` (Edge Function). Pemisahan ini memudahkan pemeliharaan dan kolaborasi tim pengembang.

---

#### Gambar 3.2 — Contoh Isi Payload Database

**Pengantar:**
> Untuk memberikan gambaran konkret tentang struktur data pola serangan, ditampilkan cuplikan isi salah satu file payload JSON. Cuplikan tersebut disajikan pada Gambar 3.2.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 3.2, setiap entri pola serangan terdiri dari atribut id (identifier unik), pattern (string pola), severity (tingkat keparahan), dan description (penjelasan opsional). Format ini konsisten di seluruh empat file kategori.

---

#### Tabel 3.2 — Hasil Pengujian Fungsional Algoritma Aho-Corasick

**Pengantar:**
> Untuk memvalidasi kebenaran implementasi algoritma Aho-Corasick, dilakukan pengujian fungsional dengan delapan skenario yang mencakup kasus tipikal dan kasus khusus (edge case). Hasil pengujian disajikan pada Tabel 3.2 berikut.

**Penjelas:**
> Berdasarkan Tabel 3.2 di atas, seluruh delapan skenario pengujian berhasil dilewati. Skenario yang paling penting untuk konteks Copcivil adalah skenario 8 (pola sebagai substring dari pola lain), yang membuktikan bahwa propagasi output via failure link berfungsi dengan benar untuk mendeteksi pola tumpang-tindih dalam satu kali pemindaian.

---

#### Tabel 3.4 — Trace Sanitasi Double-Encoded SQL Injection

**Pengantar:**
> Skenario double-encoded merupakan teknik evasion klasik yang sering digunakan penyerang untuk melewati WAF dengan single-decode. Trace lengkap penanganan payload double-encoded oleh pipeline normalisasi disajikan pada Tabel 3.4.

**Penjelas:**
> Pada Tabel 3.4 di atas, terlihat dengan jelas bahwa setelah tahap urlDecode pertama (2a), payload masih dalam bentuk ter-encode (`%27%20OR%201%3D1`). Hanya setelah tahap urlDecode kedua (2b) payload baru menjadi terbaca sebagai `' OR 1=1`. Ini membuktikan bahwa tanpa mekanisme double-decode, serangan tipe ini akan lolos dari deteksi.

---

#### Gambar 3.3 — Contoh Respons Blokir di Terminal

**Pengantar:**
> Untuk memvisualisasikan keluaran sistem ketika menangani serangan, dilakukan pengujian dengan curl yang mengirimkan payload berbahaya. Hasil terminal pengujian tersebut diperlihatkan pada Gambar 3.3.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 3.3, respons sistem berupa JSON terstruktur dengan field `blocked: true`, `category`, `score`, dan `action`. Format respons yang terstandar ini memudahkan integrasi dan logging di sisi konsumen.

---

#### Gambar 3.4 — Koleksi Basis Data

**Pengantar:**
> Untuk mendukung operasi sistem, disusun empat koleksi penyimpanan pada Appwrite Cloud. Visualisasi koleksi-koleksi tersebut disajikan pada Gambar 3.4.

**Penjelas:**
> Pada Gambar 3.4 di atas, terdapat empat koleksi yaitu security_incidents, ip_blocklist, ai_reports, dan security_config. Masing-masing memiliki schema yang spesifik dan dapat diakses melalui Appwrite SDK dari frontend maupun Appwrite Functions.

---

#### Gambar 3.5 — Ringkasan Dashboard Admin (catatan: nomor di skripsi sekarang dobel "Gambar 3.4" — perbaiki jadi 3.5)

**Pengantar:**
> Setelah seluruh komponen backend dan frontend selesai dibangun, dashboard admin dapat diakses dan digunakan untuk monitoring real-time. Tampilan dashboard pada kondisi operasional disajikan pada Gambar 3.5.

**Penjelas:**
> Berdasarkan Gambar 3.5, dashboard berhasil menampilkan kartu statistik 24 jam, distribusi kategori serangan, dan tabel insiden terbaru sesuai data aktual yang tersimpan di Appwrite. Antarmuka responsif dan dapat diakses dari berbagai ukuran layar.

---

#### Tabel 3.7 — Daftar Data yang Tidak Dikirim ke Layanan AI Eksternal

**Pengantar:**
> Untuk memberikan transparansi mengenai prinsip data minimization yang diterapkan, disusun daftar eksplisit data yang TIDAK dikirim ke OpenRouter. Daftar tersebut disajikan pada Tabel 3.7 berikut.

**Penjelas:**
> Sebagaimana ditunjukkan pada Tabel 3.7, payload mentah, body request HTTP, headers, daftar IP lengkap, dan informasi sesi pengguna secara eksplisit tidak dikirim ke layanan AI eksternal. Pendekatan ini sejalan dengan prinsip GDPR Art. 5(1)(c) tentang data minimization, sehingga risiko kebocoran informasi sensitif dapat ditekan.

---

#### Tabel 3.8 — Rincian Dataset Payload Serangan

**Pengantar:**
> Dataset pola serangan yang digunakan dalam sistem dikategorikan berdasarkan jenis ancaman dan tingkat severity. Rincian distribusi dataset tersebut disajikan pada Tabel 3.8.

**Penjelas:**
> Pada Tabel 3.8 di atas, terlihat bahwa total 115 pola serangan terbagi menjadi empat kategori dengan distribusi yang relatif merata: SQL Injection (30 pola), Cross-Site Scripting (30 pola), Command Injection (30 pola), dan Path Traversal (25 pola). Distribusi severity bervariasi sesuai dengan tingkat bahaya masing-masing pola.

---

#### Tabel 3.9 — Struktur Data Konfigurasi

**Pengantar:**
> Setiap parameter konfigurasi sistem disimpan sebagai key-value pair pada koleksi security_config. Struktur data konfigurasi tersebut disajikan pada Tabel 3.9.

**Penjelas:**
> Sebagaimana ditunjukkan pada Tabel 3.9, koleksi security_config terdiri dari field key (identifier unik), value (nilai konfigurasi dalam string), dan description (penjelasan opsional). Struktur sederhana ini memungkinkan penambahan parameter baru tanpa modifikasi schema.

---

#### Tabel 3.11 — Spesifikasi Perangkat Lunak

**Pengantar:**
> Pengembangan dan pengujian sistem dilakukan menggunakan kombinasi perangkat lunak yang mendukung ekosistem JavaScript modern. Spesifikasi perangkat lunak yang digunakan disajikan pada Tabel 3.11.

**Penjelas:**
> Berdasarkan Tabel 3.11, pengembangan dilakukan dengan Node.js 22, Vite 6, React 19, Vitest sebagai test runner, dan Netlify CLI untuk pengujian Edge Function lokal. Seluruh perangkat lunak yang digunakan bersifat open source dan mendukung pengembangan modern.

---

### BAB 3.7 — Pengujian Fungsional (Sub-bab F. AI Analytics & Tabel 3.12)

Bagian ini dibahas tersendiri di **Revisi 4** karena terkait restrukturisasi.

---

#### Gambar 3.6 — Hasil Pengujian Unit Test Detection Engine

**Pengantar:**
> Untuk memvalidasi kebenaran detection engine, dilakukan pengujian unit menggunakan framework Vitest dengan berbagai skenario pencocokan pola. Hasil eksekusi pengujian tersebut diperlihatkan pada Gambar 3.6.

**Penjelas:**
> Pada Gambar 3.6 di atas, terlihat bahwa seluruh skenario pengujian detection engine berhasil dilewati dengan status PASS (warna hijau). Hal ini mengonfirmasi bahwa logika pencocokan multi-pattern, perhitungan skor, dan pengambilan keputusan tindakan berjalan sesuai spesifikasi.

---

#### Gambar 3.7 — Hasil Pengujian Unit Test Pipeline Normalisasi (catatan: nomor di skripsi sekarang dobel "Gambar 3.6" — perbaiki jadi 3.7)

**Pengantar:**
> Pipeline normalisasi enam tahap diuji secara terisolasi untuk memastikan setiap tahap berfungsi sesuai dengan teknik evasion yang ditargetkan. Hasil pengujian disajikan pada Gambar 3.7.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 3.7, ketujuh grup pengujian (urlDecode, doubleDecode, htmlEntityDecode, caseFold, stripSqlComments, collapseWhitespace, stripNullBytes, dan normalize full pipeline) berhasil dilewati. Pengujian ini membuktikan bahwa pipeline normalisasi dapat menangani teknik evasion umum yang digunakan penyerang.

---

#### Gambar 3.8 — Response Edge Function untuk Payload SQL Injection (catatan: di skripsi sekarang nomor 3.7 — geser jadi 3.8)

**Pengantar:**
> Edge function copcivil-edge merupakan komponen yang melakukan intercept request di lapisan jaringan terdekat dengan pengguna. Untuk memvalidasi fungsionalitasnya, dilakukan pengujian dengan curl yang mengirimkan payload SQL Injection. Hasil pengujian tersebut diperlihatkan pada Gambar 3.8.

**Penjelas:**
> Pada Gambar 3.8 di atas, dapat dilihat bahwa request berisi payload `union select` direspons dengan kode HTTP 403 dan body JSON yang menyebutkan kategori serangan (sqli), skor ancaman, dan tindakan yang diambil (blocked). Edge function berhasil melakukan tugasnya sebagai gerbang keamanan.

---

#### Gambar 3.9 — Halaman Daftar Blokir IP (catatan: di skripsi sekarang nomor 3.8 — geser jadi 3.9)

**Pengantar:**
> Mekanisme IP blocking otomatis bekerja di belakang layar dengan menambahkan IP yang melebihi ambang batas insiden ke daftar blokir. Untuk memvisualisasikan hasil mekanisme tersebut, ditampilkan halaman daftar blokir setelah simulasi serangan berulang. Halaman tersebut diperlihatkan pada Gambar 3.9.

**Penjelas:**
> Berdasarkan Gambar 3.9, sistem berhasil mendeteksi dan secara otomatis memblokir IP yang mengirimkan lebih dari lima request berbahaya dalam jendela waktu sepuluh menit. Field `block_type` bernilai `auto` mengindikasikan bahwa pemblokiran dilakukan oleh sistem, bukan tindakan manual administrator.

---

#### Gambar 3.10 — Dashboard Ringkasan Statistik 24 Jam

**Pengantar:**
> Halaman ringkasan dashboard merupakan tampilan utama yang dilihat administrator setelah login. Halaman ini menampilkan statistik real-time dalam jendela 24 jam terakhir. Tampilan halaman tersebut diperlihatkan pada Gambar 3.10.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 3.10, halaman ringkasan menyajikan tiga kartu statistik utama, pie chart distribusi kategori, dan tabel insiden terbaru. Data yang ditampilkan diperbarui secara real-time mengikuti perubahan di basis data Appwrite.

---

#### Gambar 3.11 — Halaman Log Insiden

**Pengantar:**
> Untuk memeriksa detail seluruh insiden secara lengkap, administrator dapat menggunakan halaman log insiden yang dilengkapi filter dan paginasi. Halaman tersebut diperlihatkan pada Gambar 3.11.

**Penjelas:**
> Pada Gambar 3.11 di atas, terlihat bahwa halaman log insiden menampilkan tabel insiden dengan filter aktif (kategori dan severity), serta paginasi di bagian bawah. Setiap baris menampilkan informasi waktu, IP, kategori, severity, dan tindakan yang diambil sistem.

---

#### Gambar 3.12 — Halaman Daftar Blokir (di skripsi sekarang masih nomor 3.9.2)

**Pengantar:**
> Tampilan operasional halaman daftar blokir dapat diakses melalui menu navigasi sidebar. Tampilan tersebut diperlihatkan pada Gambar 3.12.

**Penjelas:**
> Berdasarkan Gambar 3.12, halaman daftar blokir menyajikan tabel IP yang sedang aktif diblokir lengkap dengan opsi unblock manual dan informasi waktu kedaluwarsa.

---

#### Gambar 3.13 — Halaman Laporan AI (di skripsi sekarang masih nomor 3.9.3)

**Pengantar:**
> Halaman laporan AI memungkinkan administrator membuat laporan analisis keamanan untuk periode tertentu. Tampilan halaman tersebut diperlihatkan pada Gambar 3.13.

**Penjelas:**
> Pada Gambar 3.13 di atas, terlihat formulir pemilihan periode di bagian atas dan area tampilan laporan di bagian bawah. Setelah administrator memilih periode dan menekan tombol Generate, sistem akan memanggil OpenRouter API dan menampilkan laporan dalam format Markdown ter-render.

---

#### Gambar 3.14 — Halaman Konfigurasi Keamanan (di skripsi sekarang masih nomor 3.9.4)

**Pengantar:**
> Untuk mengakomodasi penyesuaian parameter operasional, sistem menyediakan halaman konfigurasi yang dapat diakses melalui sidebar. Tampilan halaman tersebut diperlihatkan pada Gambar 3.14.

**Penjelas:**
> Sebagaimana ditunjukkan pada Gambar 3.14, halaman konfigurasi memungkinkan administrator mengubah parameter seperti ambang batas skor pemblokiran, durasi auto-block, model AI OpenRouter, dan whitelist IP tanpa perlu modifikasi kode atau redeploy.

---

# 🔹 REVISI 3 — KONSISTENSI PENJELASAN TABEL

## Prinsip

Selain Tabel 3.5 yang sudah punya intro, beberapa tabel lain hanya muncul tiba-tiba tanpa kalimat pengantar. Standarkan dengan **pola intro+caption+penjelas** seperti yang dijabarkan di Revisi 2.

## Daftar tabel prioritas yang butuh perbaikan

Sudah dicakup di Revisi 2 di atas. Berikut **rekap khusus tabel** yang sebelumnya kurang penjelasan:

| Tabel | Status saat ini | Status setelah revisi |
|---|---|---|
| Tabel 2.8 (Perbandingan Penelitian) | Tidak ada intro/penjelas | ✓ ditambahkan |
| Tabel 3.2 (Hasil Pengujian Aho-Corasick) | Intro singkat | ✓ disempurnakan |
| Tabel 3.4 (Trace Double-Encoded SQLi) | Intro ada tapi pendek | ✓ ditambah penjelas penting tentang anti-evasion |
| Tabel 3.7 (Data tidak dikirim) | Tidak ada penjelas | ✓ ditambah konteks GDPR |
| Tabel 3.8 (Dataset Payload) | Tidak ada intro | ✓ ditambahkan |
| Tabel 3.9 (Struktur Konfigurasi) | Tidak ada intro | ✓ ditambahkan |
| Tabel 3.11 (Spesifikasi Perangkat Lunak) | Tidak ada intro | ✓ ditambahkan |

Tabel yang sudah punya intro+penjelas memadai (tidak perlu diubah): Tabel 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.3, 3.5, 3.6, 3.10.

---

# 🔹 REVISI 4 — RESTRUKTURISASI AI ANALYTICS & TABEL 3.12

## Masalah saat ini

Halaman 95 menempatkan **Tabel 3.12 (Hasil Pengujian Fungsional Sistem)** **tepat setelah** sub-bab `F. AI Analytics Pipeline`. Akibatnya, tabel ini terkesan **hanya milik sub-bab AI Analytics**, padahal sebenarnya merupakan **ringkasan keseluruhan 12 modul pengujian (A-F)**.

Selain itu, **Gambar 3.9.5** yang berlabel "Halaman Konfigurasi Keamanan" muncul sebelum Tabel 3.12 — ini juga salah tempat (seharusnya milik sub-bab E. Dashboard Admin, bukan F. AI Analytics).

## Solusi: Pisahkan jadi sub-bab `3.7.3 Ringkasan Hasil Pengujian Fungsional`

Struktur baru:

```
3.7.2 Tampilan Fungsional Sistem
   A. Modul Detection Engine
   B. Modul Normalisasi Input Berlapis
   C. Modul Netlify Edge Function (Security Gateway)
   D. Mekanisme IP Blocking
   E. Dashboard Admin dan API Layer
   F. AI Analytics Pipeline       ← SELESAI di sini, tanpa tabel

3.7.3 Ringkasan Hasil Pengujian Fungsional   ← SUB-BAB BARU
   [paragraf pengantar]
   Tabel 3.12 Hasil Pengujian Fungsional Sistem
   [paragraf interpretasi]
```

## ✏️ Teks pengganti untuk akhir sub-bab F. AI Analytics

**Hapus** `Gambar 3.9.5 Halaman Konfigurasi Keamanan` dari sub-bab F (karena sudah ada sebagai bagian dari sub-bab E sebagai Gambar 3.14). Akhiri sub-bab F dengan paragraf penutup yang sudah ada (yang menyebutkan AI analytics berfungsi dengan baik).

**Tambahan paragraf khusus untuk AI Analytics agar lebih jelas "untuk apa":**

```
Tujuan utama integrasi AI Analytics Pipeline adalah memberikan kapabilitas 
analisis lanjutan yang melampaui dashboard statistik konvensional. Dengan 
memanfaatkan kemampuan reasoning Large Language Model, sistem dapat 
menghasilkan insight kontekstual yang mencakup analisis pola serangan, 
penilaian risiko organisasi, dan rekomendasi mitigasi yang spesifik 
terhadap data aktual. Hal ini sangat membantu administrator yang tidak 
memiliki latar belakang khusus di bidang keamanan siber, karena laporan 
AI dapat menjelaskan implikasi teknis dalam bahasa yang mudah dipahami 
oleh stakeholder non-teknis.

AI Analytics Pipeline juga berperan sebagai jembatan antara data 
operasional (insiden mentah) dan keputusan strategis (kebijakan keamanan). 
Laporan yang dihasilkan dapat digunakan sebagai dasar audit periodik, 
laporan ke manajemen, atau evaluasi efektivitas kebijakan keamanan yang 
sedang diterapkan.
```

## ✏️ Sub-bab BARU: 3.7.3 Ringkasan Hasil Pengujian Fungsional

**Sisipkan setelah sub-bab `F. AI Analytics Pipeline` selesai, sebelum sub-bab `4.1 Bagian yang Sudah Dikerjakan`:**

```
3.7.3 Ringkasan Hasil Pengujian Fungsional

Setelah seluruh modul (A sampai F) diuji secara individual sebagaimana 
diuraikan pada sub-bab 3.7.2, dilakukan rekapitulasi hasil pengujian 
fungsional menyeluruh. Rekapitulasi ini mencakup dua belas pengujian 
yang merepresentasikan seluruh kapabilitas inti Copcivil Security System, 
mulai dari komponen pencocokan pola, normalisasi input, gerbang keamanan, 
mekanisme blocking, dashboard administrasi, hingga pipeline analitik AI. 
Ringkasan hasil pengujian seluruh modul disajikan pada Tabel 3.12 berikut.

[Tabel 3.12 Hasil Pengujian Fungsional Sistem]

Berdasarkan Tabel 3.12 di atas, dapat disimpulkan bahwa seluruh dua 
belas modul fungsional Copcivil Security System berhasil melewati 
pengujian dengan status "Selesai & Berfungsi". Hal ini menunjukkan 
bahwa sistem yang dibangun telah memenuhi seluruh skenario pengujian 
yang dirancang sesuai dengan parameter fungsional pada sub-bab 3.2.1. 
Setiap modul yang diuji bekerja sesuai dengan spesifikasi yang 
diharapkan, baik secara independen maupun secara terintegrasi. Hasil 
pengujian ini menjadi dasar verifikasi bahwa sistem siap untuk 
digunakan dalam lingkungan operasional aplikasi web CIVIL QTRACK.
```

## Diagram perubahan struktur

**Sebelum** (problematic):
```
3.7.2 Tampilan Fungsional Sistem
  ...
  F. AI Analytics Pipeline
    [paragraf]
    Gambar 3.9.5 Halaman Konfigurasi  ← SALAH TEMPAT
    Tabel 3.12 Hasil Pengujian        ← KESAN MILIK F SAJA
```

**Sesudah** (rekomen):
```
3.7.2 Tampilan Fungsional Sistem
  ...
  E. Dashboard Admin
    Gambar 3.10, 3.11, 3.12, 3.13, 3.14 (termasuk Konfigurasi)
  F. AI Analytics Pipeline
    [paragraf — tujuan & manfaat]
    [paragraf — implementasi]
    [paragraf — kesimpulan F]
    
3.7.3 Ringkasan Hasil Pengujian Fungsional   ← SUB-BAB BARU
  [paragraf pengantar — menjelaskan ringkasan 12 modul A-F]
  Tabel 3.12 Hasil Pengujian Fungsional Sistem
  [paragraf interpretasi — kesimpulan keseluruhan]
```

---

# 📋 CHECKLIST EKSEKUSI

## BAB 1
- [ ] Ganti sub-bab 1.4 TUJUAN dengan teks 5 poin baru (Revisi 1)

## BAB 2
- [ ] Tambah paragraf intro+penjelas untuk Tabel 2.8
- [ ] Tambah paragraf intro+penjelas untuk Gambar 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12
- [ ] Tambah paragraf intro+penjelas untuk Gambar 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19

## BAB 3 — Sub-bab 3.1 sampai 3.6
- [ ] Tambah paragraf intro+penjelas untuk Gambar 3.1, 3.2
- [ ] Tambah paragraf intro+penjelas untuk Tabel 3.2 (Aho-Corasick test)
- [ ] Sempurnakan paragraf di sekitar Tabel 3.4 (Double-Encoded)
- [ ] Tambah paragraf intro+penjelas untuk Gambar 3.3, 3.4
- [ ] Perbaiki nomor "Gambar 3.4 Ringkasan dashboard admin" → harus jadi **Gambar 3.5**
- [ ] Tambah paragraf intro+penjelas untuk Tabel 3.7
- [ ] Tambah paragraf intro+penjelas untuk Tabel 3.8
- [ ] Tambah paragraf intro+penjelas untuk Tabel 3.9
- [ ] Tambah paragraf intro+penjelas untuk Tabel 3.11

## BAB 3 — Sub-bab 3.7.2 (Pengujian Fungsional)
- [ ] Tambah paragraf intro+penjelas untuk Gambar 3.6 (Detection Engine test)
- [ ] Perbaiki nomor "Gambar 3.6 Hasil pengujian unit test pipeline" → harus jadi **Gambar 3.7**
- [ ] Tambah paragraf intro+penjelas untuk Gambar 3.7 (yang sudah jadi)
- [ ] Geser nomor Gambar 3.7 (Edge Function) → menjadi **Gambar 3.8**
- [ ] Geser nomor Gambar 3.8 (IP Blocking) → menjadi **Gambar 3.9**
- [ ] Geser nomor Gambar 3.9 (Dashboard) → menjadi **Gambar 3.10**
- [ ] Geser nomor Gambar 3.10 (Log Insiden) → menjadi **Gambar 3.11**
- [ ] Geser nomor Gambar 3.9.2 (Daftar Blokir) → menjadi **Gambar 3.12**
- [ ] Geser nomor Gambar 3.9.3 (Laporan AI) → menjadi **Gambar 3.13**
- [ ] Geser nomor Gambar 3.9.4 (Konfigurasi) → menjadi **Gambar 3.14**
- [ ] **Hapus** Gambar 3.9.5 (duplikat Konfigurasi yang nyangkut di sub-bab F)
- [ ] Tambah paragraf "Tujuan utama AI Analytics Pipeline..." di sub-bab F (Revisi 4)

## BAB 3 — Sub-bab BARU 3.7.3
- [ ] Tambah heading baru `3.7.3 Ringkasan Hasil Pengujian Fungsional`
- [ ] Pindahkan **Tabel 3.12** ke sub-bab baru ini
- [ ] Tambah paragraf pengantar (sebelum tabel)
- [ ] Tambah paragraf interpretasi (sesudah tabel)

## DAFTAR GAMBAR / DAFTAR TABEL
- [ ] Update DAFTAR GAMBAR di front matter dengan nomor baru (3.6 sampai 3.14, hapus 3.9.5)
- [ ] DAFTAR TABEL tetap (Tabel 3.12 nomornya sama, hanya pindah lokasi sub-bab)

---

**Status**: Siap dieksekusi. Empat revisi dosen tertangani secara terstruktur dengan paragraf siap copy-paste.
