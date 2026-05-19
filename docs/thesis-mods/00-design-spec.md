---
description: Design spec for Copcivil thesis document modification (BAB 1-4)
---

# Copcivil Thesis Modification — Design Spec

**Date**: 2026-04-30
**Author**: Cascade (AI assistant)
**Purpose**: Memodifikasi dokumen tesis SPPA agar selaras 100% dengan projek Copcivil yang sesungguhnya.

---

## Keputusan Kunci

| Aspek | Keputusan |
|---|---|
| Nama sistem | Copcivil Security System |
| Judul tesis | "Implementasi Sistem Deteksi dan Pencegahan Serangan Web Berbasis Aho-Corasick dengan IP Blocking Otomatis dan Analitik AI pada Aplikasi CIVIL QTRACK" |
| Konteks app | CIVIL QTRACK (inspeksi jalan/kontrak untuk UPT Malang) — sebut lengkap |
| Stack | React 19 + Vite 6 + JavaScript + Netlify Edge (Deno) + Appwrite Cloud + Appwrite Functions (Node.js 18) |
| Kategori serangan | 4: SQLi, XSS, CMDi, Path Traversal |
| Output | Markdown per BAB |

---

## Ringkasan Perubahan per BAB

### BAB 1 — PENDAHULUAN
- **Judul** → judul baru
- **Latar belakang** → ganti referensi Xpecto Shield → Copcivil Security System, tambah konteks CIVIL QTRACK
- **Identifikasi permasalahan** → sesuaikan 5 poin ke stack aktual (React + Vite, bukan Next.js/TypeScript)
- **Batasan masalah** → React + Vite + JS, Netlify Edge, 4 kategori (SQLi, XSS, CMDi, Path Traversal)
- **Tujuan** → sesuaikan deskripsi sistem
- **Manfaat** → minor adjustment

### BAB 2 — DESKRIPSI SISTEM
- **Deskripsi umum** → Copcivil Security System, bukan Xpecto Shield
- **Deskripsi permasalahan** → 4 kategori serangan (hapus SSRF, LFI, tambah CMDi)
- **Deskripsi solusi** → scoring berbasis bobot severity (bukan confidence 0.6+bonus), normalizer 6 tahap aktual
- **Tabel payload** → sesuaikan dari JSON files aktual
- **2.2.1 Mekanisme deteksi** → sesuaikan confidence scoring → weight scoring
- **2.2.2 Alur kerja** → Netlify Edge Function + Appwrite Functions (bukan Next.js middleware)
- **Desain alur** → sesuaikan diagram
- **Arsitektur** → React + Vite frontend, Netlify Edge, Appwrite Functions, Appwrite DB
- **Use Case Diagram** → sesuaikan aktor dan fungsi
- **DFD Level 0, 1, 2** → buat baru berdasarkan arsitektur aktual
- **ERD** → buat baru berdasarkan 4 koleksi Appwrite aktual
- **2.5 Mockup** → panduan screenshot untuk halaman aktual
- **Penelitian terkait** → bisa dipertahankan, minor update relevansi

### BAB 3 — EKSPERIMEN
- **Parameter** → sesuaikan ke 4 kategori, React + Vite, Netlify
- **Karakteristik data** → payload JSON (bukan txt), jumlah aktual per kategori
- **Tempat ujicoba** → Netlify dev (local), Netlify (production)
- **Perangkat lunak** → React 19, Vite 6, JavaScript (bukan TypeScript), Vitest, Netlify CLI
- **Hasil eksperimen** → sesuaikan modul, tabel pengujian

### BAB 4 — PENUTUP
- **Kesimpulan** → sesuaikan ke Copcivil, React + Vite, 4 kategori
- **Saran** → update sesuai kondisi aktual

---

## Diagram yang Akan Dibuat

### ERD
- **Tool**: dbdiagram.io (DBML format) + Mermaid (backup)
- **Entitas**: security_incidents, ip_blocklist, ai_reports, security_config
- **Relasi**: Berdasarkan ip_address sebagai foreign key implisit

### DFD Level 0
- **External entities**: Hacker, Admin
- **Process**: Copcivil Security System
- **Data stores**: Appwrite Database
- **Tool**: draw.io (XML) atau Mermaid flowchart

### DFD Level 1
- **Processes**: Deteksi Serangan, Pencegahan (IP Blocking), Pencatatan Insiden, Analitik AI
- **Data stores**: security_incidents, ip_blocklist, ai_reports, security_config

### DFD Level 2
- Level 2 untuk setiap proses di Level 1:
  1. Deteksi Serangan → Normalisasi Input, Pattern Matching (Aho-Corasick), Scoring
  2. Pencegahan → IP Check, Auto-Block, Manual Block/Unblock
  3. Pencatatan → Edge Log, Guard Log
  4. Analitik AI → Agregasi Data, Prompt Construction, LLM Call, Report Storage

---

## Deliverables (File Output)

```
docs/thesis-mods/
├── 00-design-spec.md          ← (this file)
├── 01-erd-dfd.md              ← ERD (DBML + Mermaid) + DFD (Mermaid)
├── 02-bab1-pendahuluan.md     ← BAB 1 lengkap
├── 03-bab2-deskripsi-sistem.md← BAB 2 lengkap
├── 04-bab3-eksperimen.md      ← BAB 3 lengkap
├── 05-bab4-penutup.md         ← BAB 4 lengkap
└── 06-mockup-guide.md         ← Panduan screenshot mockup
```
