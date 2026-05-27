# PANDUAN PENYISIPAN REVISI KE DOKUMEN SKRIPSI

> Dokumen ini memetakan setiap bagian dari `08-revisi-dosen-2026-05-19.md` ke lokasi spesifik dalam dokumen skripsi `Copy of PA 3123510644_Ragel Listiyono_2026.docx`. Petunjuk disertai kalimat *anchor* yang dapat di-*search* (Ctrl+F) di Word untuk menemukan posisi tepat.

**Tanggal**: 19 Mei 2026
**Sumber revisi**: `docs/thesis-mods/08-revisi-dosen-2026-05-19.md`
**Target dokumen**: `Copy of PA 3123510644_Ragel Listiyono_2026.docx`

---

## RINGKASAN POSISI PENYISIPAN

| Revisi | Disisipkan ke | Sub-bab Target | Mode Penyisipan |
|---|---|---|---|
| 1. Justifikasi severity | BAB 2 | 2.2.1 — bagian "Severity-Weighted Scoring" | **Sisip + perluasan** |
| 2. Cara kerja Aho-Corasick + hasil scan | BAB 2 & BAB 3 | 2.2.1 (point ke-2) & 3.1.2 Langkah 2 | **Perluasan + tambah trace** |
| 3. Sanitasi URL decode | BAB 3 | 3.1.2 Langkah 3 (Pipeline Normalisasi) | **Tambahan setelah daftar 6 tahap** |
| 4. Data ke OpenRouter | BAB 3 | 3.1.6 Langkah 3-4 | **Sisip sub-bagian baru** |

---

# 🔹 REVISI 1 — JUSTIFIKASI SEVERITY

## Lokasi Penyisipan

**BAB 2 — DESKRIPSI SISTEM**
**Sub-bab**: `2.2.1 Mekanisme Deteksi Presisi Tinggi Berbasis Aho-Corasick`
**Bagian**: setelah heading **"4. Severity-Weighted Scoring"** dan setelah tabel ambang batas

### Cari kalimat anchor di Word:

> "Mekanisme ini memungkinkan sistem untuk membedakan antara serangan nyata (skor tinggi dari kombinasi *pattern* berbahaya) dan kecocokan yang bersifat kebetulan (skor rendah dari satu kata yang menyerupai *payload*)."

Kalimat ini berada **tepat sebelum sub-bab 2.2.2 Alur Kerja Pencegahan**.

### Apa yang harus disisipkan

**Sisipkan sebagai paragraf baru dan tabel justifikasi** setelah kalimat anchor di atas, sebelum heading `2.2.2`.

Dari `08-revisi-dosen-2026-05-19.md`, ambil:
- **Sub-bab 1.1** (Latar Belakang Pemilihan) — tentang OWASP, CVSS, CWE/SANS
- **Sub-bab 1.2** (Bobot Numerik Severity) — terutama tabel rasio non-linear dan justifikasi
- **Sub-bab 1.4** (Contoh Klasifikasi Pola Konkret) — kedua tabel (SQLi & XSS)
- **Sub-bab 1.5** (Implikasi Desain) — sebagai paragraf penutup

### Format penyisipan yang disarankan

Tambahkan heading baru **bernomor 5** di bawah sub-bab 2.2.1 (karena sudah ada poin 1-4):

```
5. Justifikasi Pemilihan Tingkat Severity

[Paragraf landasan akademik dari sub-bab 1.1]

[Tabel rasio dan justifikasi dari sub-bab 1.2]

[Tabel ambang BLOCK/WARN/LOGGED dari sub-bab 1.3 — DUPLIKASI dari yang sudah ada,
boleh dihapus karena sudah ada di skripsi]

[Tabel contoh klasifikasi pola dari sub-bab 1.4]

[Paragraf penutup implikasi desain dari sub-bab 1.5]
```

### ⚠️ Catatan penting

- Tabel `SEVERITY_WEIGHTS` di skripsi (line 702-712) **sudah ada** dan benar — jangan duplikasi.
- Tabel ambang `BLOCK/WARN/LOGGED` di skripsi (line 716-728) **sudah ada** — jangan duplikasi.
- Yang **belum ada** dan harus ditambah:
  - Justifikasi *kenapa* bobotnya 10/7/4/1 (rasio non-linear)
  - Standar industri (OWASP/CVSS/CWE) sebagai referensi akademik
  - Contoh konkret pola per kategori

---

# 🔹 REVISI 2 — CARA KERJA AHO-CORASICK & HASIL SCAN

## Lokasi Penyisipan (DUA TEMPAT)

### Tempat 1 — BAB 2 (Penjelasan Konsep)

**BAB 2** → `2.2.1 Mekanisme Deteksi Presisi Tinggi Berbasis Aho-Corasick`
**Bagian**: di dalam **point 2 "Algoritma Aho-Corasick Multi-Pattern String Matching"**

### Cari kalimat anchor:

> "Setelah automaton terbangun, pencarian dilakukan dalam single pass melalui seluruh input dengan kompleksitas waktu O(n + m + z)"

Penjelasan saat ini di skripsi hanya menyebut **2 tahap** (Trie + Failure Links). Belum ada **tahap ke-3 (Search)** yang eksplisit dan **propagasi output**.

### Apa yang harus disisipkan / diperluas

Dari `08-revisi-dosen-2026-05-19.md`, ambil:
- **Sub-bab 2.2 Tahap 1** — visualisasi trie ASCII (`he/she/his/hers`)
- **Sub-bab 2.2 Tahap 2** — penjelasan propagasi output (paragraf "Baris `child.output = [...child.output, ...child.fail.output]` sangat penting...") — **ini yang belum ada di skripsi**
- **Sub-bab 2.2 Tahap 3** — tambahkan sebagai tahap ke-3 yang eksplisit
- **Sub-bab 2.5** — tabel komparasi kompleksitas (naive vs regex vs Aho-Corasick)

### Format penyisipan

Ubah list "Proses pembangunan automaton terdiri dari dua tahap" menjadi **"tiga tahap"**:

```
Proses pembangunan automaton terdiri dari tiga tahap:

1. Pembangunan Trie: ... [konten existing]
   [Sisipkan visualisasi trie ASCII di sini]

2. Inisialisasi Failure Links: ... [konten existing]
   [TAMBAH paragraf propagasi output dari Tahap 2 sub-bab 2.2]

3. Pencarian (Search): [BARU — dari Tahap 3 sub-bab 2.2]
```

Setelah paragraf kompleksitas, tambahkan **tabel komparasi** dari sub-bab 2.5.

---

### Tempat 2 — BAB 3 (Hasil Scan & Trace)

**BAB 3** → `3.1.2 Pembangunan Mesin Deteksi Serangan` → **"Langkah 2 - Membangun Algoritma Pencocokan Pola (Aho-Corasick)"**

### Cari kalimat anchor:

> "Metode addPattern() membangun struktur *trie* (pohon pencarian) dari setiap pola. Metode build() menginisialisasi *failure links* menggunakan BFS"

Tepat **sebelum** "Langkah 3 - Membangun Pipeline Normalisasi Input"

### Apa yang harus disisipkan

Dari `08-revisi-dosen-2026-05-19.md`, ambil:
- **Sub-bab 2.3** — tabel *trace* eksekusi pada `union select from users` (penting: ini adalah hasil scan konkret)
- **Sub-bab 2.4** — tabel hasil pengujian dari 8 skenario di `aho-corasick.test.js`

### Format penyisipan

Tambahkan dua sub-bagian baru sebelum "Langkah 3":

```
Trace Eksekusi pada Input Aktual

[Paragraf pengantar trace + tabel trace dari sub-bab 2.3]

Hasil Pemindaian dari Pengujian Aktual

[Paragraf pengantar + tabel 8 skenario dari sub-bab 2.4]

[Paragraf penjelasan skenario 8 yang paling relevan]
```

### ⚠️ Catatan

- Skripsi sudah memiliki kode skeleton class AhoCorasick (line 1759-1806) — **biarkan**.
- Yang **belum ada** dan harus ditambah:
  - Trace step-by-step eksekusi search
  - Tabel hasil 8 skenario pengujian
  - Penjelasan propagasi output untuk substring overlap

---

# 🔹 REVISI 3 — CONTOH SANITASI URL DECODE

## Lokasi Penyisipan

**BAB 3** → `3.1.2 Pembangunan Mesin Deteksi Serangan` → **"Langkah 3 - Membangun Pipeline Normalisasi Input"**

### Cari kalimat anchor:

> "Penyerang sering menyamarkan serangan mereka agar tidak dikenali, untuk mengatasi penyamaran ini, dibangun sebuah proses normalisasi berlapis yang terdiri dari enam tahap pembersihan."

Setelah blok kode `function normalize(input) { ... }` (line 1822-1842) dan **sebelum** "Langkah 4 - Membangun Sistem Penilaian Ancaman".

### Apa yang harus disisipkan

Dari `08-revisi-dosen-2026-05-19.md`, ambil:
- **Sub-bab 3.2** — implementasi `urlDecode` & `doubleDecode` + alasan double-decode
- **Sub-bab 3.3** — Contoh 1: Single-encoded XSS dengan tabel before/after per tahap
- **Sub-bab 3.4** — Contoh 2: Double-encoded SQLi (paling penting — skenario evasion)
- **Sub-bab 3.5** — Contoh 3: Mixed evasion
- **Sub-bab 3.6** — diagram pipeline ASCII

### Format penyisipan

Tambahkan sub-bagian baru di bawah Langkah 3 dengan judul:

```
Contoh Sanitasi pada Pipeline Normalisasi

[Paragraf pengantar — kenapa decode 2x]
[Snippet kode urlDecode + doubleDecode dari sub-bab 3.2]

Contoh 1 — Single-Encoded XSS Payload
[Tabel trace 6 tahap]

Contoh 2 — Double-Encoded SQLi (Teknik Evasion)
[Tabel trace 6 tahap]
[Paragraf "Tanpa double-decode, serangan ini akan lolos"]

Contoh 3 — Mixed Evasion (Null Byte + HTML Entity + Case)
[Tabel trace 6 tahap]
[Paragraf catatan urutan tahap]

Visualisasi Pipeline
[Diagram ASCII pipeline]
```

### ⚠️ Catatan

- Skripsi sudah punya daftar 6 tahap (line 672-693) di BAB 2 — **biarkan**, itu untuk konsep.
- Skripsi sudah punya kode `function normalize()` di BAB 3 — **biarkan**, itu untuk implementasi.
- Yang **belum ada**:
  - Contoh konkret transformasi step-by-step
  - Tabel before/after per tahap
  - Justifikasi urutan tahap

---

# 🔹 REVISI 4 — DATA YANG DIKIRIM KE OPENROUTER

## Lokasi Penyisipan

**BAB 3** → `3.1.6 Integrasi Analitik AI` → di antara **"Langkah 3 - Penyusunan Prompt Terstruktur"** dan **"Langkah 4 - Pemanggilan Model AI"**

### Cari kalimat anchor:

> "*User prompt* menyajikan data dalam format yang mudah dipahami oleh model AI, kemudian meminta lima bagian analisis: ringkasan eksekutif, analisis ancaman, penilaian risiko, rekomendasi, dan perbandingan tren."

Tepat sebelum heading **"Langkah 4 - Pemanggilan Model AI melalui *OpenRouter API***".

### Apa yang harus disisipkan

Dari `08-revisi-dosen-2026-05-19.md`, ambil:
- **Sub-bab 4.1** — latar belakang kekhawatiran kebocoran data
- **Sub-bab 4.3.1** — schema lengkap objek statistik yang dikirim
- **Sub-bab 4.4** — **TABEL DATA YANG TIDAK DIKIRIM** (paling penting untuk dosen)
- **Sub-bab 4.5** — contoh konkret JSON body request HTTP
- **Sub-bab 4.7** — ringkasan data minimization / GDPR

### Format penyisipan

Tambahkan **sub-bagian baru** dengan judul yang eksplisit menjawab pertanyaan dosen:

```
Detail Data yang Dikirim ke Layanan AI Eksternal

[Paragraf pengantar tentang prinsip data minimization dari sub-bab 4.1]

Apa yang DIKIRIM ke OpenRouter
[Schema JSON dari sub-bab 4.3.1]
[Daftar 7 metrik agregasi]

Apa yang TIDAK DIKIRIM (untuk perlindungan privasi)
[Tabel 8 baris dari sub-bab 4.4]

Contoh Payload HTTP Aktual
[Blok JSON dari sub-bab 4.5]

[Paragraf penutup tentang data minimization GDPR Art. 5(1)(c) dari sub-bab 4.7]
```

### ⚠️ Catatan

- Skripsi sudah punya:
  - Kode `aggregateIncidents()` (line 2095-2139) — **biarkan**
  - Kode `buildAnalyticsPrompt()` (line 2188-2227) — **biarkan**
  - Kode `callOpenRouter()` (line 2245-2287) — **biarkan**
  - Kode struktur penyimpanan laporan (line 2331-2355) — **biarkan**
- Yang **belum ada** dan harus ditambah:
  - **Tabel eksplisit data apa saja yang dikirim/tidak dikirim** — ini inti revisi dosen
  - Justifikasi privacy-by-design
  - Contoh JSON request HTTP final yang nyata (3-8 KB)

---

# 📋 CHECKLIST PENYISIPAN

Gunakan checklist ini saat mengedit dokumen `.docx`:

## BAB 2 — DESKRIPSI SISTEM

- [ ] **2.2.1 point 2 (Aho-Corasick)** — Tambah penjelasan **propagasi output** sebagai bagian Tahap 2 (Failure Links)
- [ ] **2.2.1 point 2 (Aho-Corasick)** — Ubah "dua tahap" → "tiga tahap", tambah Tahap 3 (Pencarian)
- [ ] **2.2.1 point 2 (Aho-Corasick)** — Tambah visualisasi trie ASCII
- [ ] **2.2.1 point 2 (Aho-Corasick)** — Tambah tabel komparasi kompleksitas (naive/regex/AC)
- [ ] **2.2.1 setelah point 4** — Tambah point 5: **Justifikasi Pemilihan Tingkat Severity**
  - [ ] Latar belakang OWASP/CVSS/CWE
  - [ ] Tabel rasio non-linear & justifikasi
  - [ ] Tabel contoh klasifikasi pola (SQLi & XSS)
  - [ ] Paragraf implikasi desain

## BAB 3 — EKSPERIMEN

- [ ] **3.1.2 Langkah 2 (Aho-Corasick)** — Tambah sub-bagian **"Trace Eksekusi pada Input Aktual"**
- [ ] **3.1.2 Langkah 2 (Aho-Corasick)** — Tambah sub-bagian **"Hasil Pemindaian dari Pengujian Aktual"** dengan tabel 8 skenario
- [ ] **3.1.2 Langkah 3 (Pipeline Normalisasi)** — Tambah sub-bagian **"Contoh Sanitasi pada Pipeline Normalisasi"**
  - [ ] Snippet kode urlDecode + doubleDecode
  - [ ] Tabel trace Contoh 1: Single-encoded XSS
  - [ ] Tabel trace Contoh 2: Double-encoded SQLi (anti-evasion)
  - [ ] Tabel trace Contoh 3: Mixed evasion
  - [ ] Diagram pipeline ASCII
- [ ] **3.1.6 setelah Langkah 3** — Sisip sub-bagian **"Detail Data yang Dikirim ke Layanan AI Eksternal"**
  - [ ] Schema JSON objek agregasi
  - [ ] Tabel "Data yang TIDAK Dikirim"
  - [ ] Contoh payload HTTP JSON aktual
  - [ ] Paragraf data minimization

---

# 🎯 URUTAN PENGERJAAN YANG DISARANKAN

Untuk efisiensi, disarankan mengedit dengan urutan ini (dari yang paling kecil ke paling besar):

1. **Mulai dari Revisi 4** (BAB 3.1.6) — paling kontained, hanya sisip sub-bagian baru, tidak mengubah konten lama
2. **Lanjut Revisi 3** (BAB 3.1.2 Langkah 3) — sisip sub-bagian baru di posisi spesifik
3. **Lanjut Revisi 2 Bagian 2** (BAB 3.1.2 Langkah 2) — sisip dua sub-bagian baru
4. **Lanjut Revisi 1** (BAB 2.2.1 point 5) — tambah heading baru
5. **Terakhir Revisi 2 Bagian 1** (BAB 2.2.1 point 2) — paling banyak modifikasi (perluasan tahap, propagasi output, komparasi kompleksitas)

Total estimasi tambahan halaman ke skripsi: **13-17 halaman**.

---

# 🔍 LOOKUP TABEL ANCHOR (untuk Ctrl+F di Word)

Daftar kalimat *anchor* unik yang dapat di-*search* langsung di Word untuk menemukan posisi tepat:

| Anchor | Lokasi |
|---|---|
| `Mekanisme ini memungkinkan sistem untuk membedakan antara serangan nyata` | BAB 2.2.1 — sebelum 2.2.2 |
| `Setelah automaton terbangun, pencarian dilakukan dalam single pass` | BAB 2.2.1 point 2 |
| `Metode addPattern() membangun struktur trie` | BAB 3.1.2 Langkah 2 |
| `Penyerang sering menyamarkan serangan mereka agar tidak dikenali` | BAB 3.1.2 Langkah 3 (header) |
| `result = collapseWhitespace(result)` | BAB 3.1.2 Langkah 3 (akhir blok kode) |
| `User prompt menyajikan data dalam format yang mudah dipahami` | BAB 3.1.6 Langkah 3 (akhir) |

---

**Status**: Siap dieksekusi. Buka `08-revisi-dosen-2026-05-19.md` untuk konten yang akan disalin, gunakan dokumen ini sebagai peta penyisipan.
