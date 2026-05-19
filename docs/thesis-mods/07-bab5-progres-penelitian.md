# BAB 5 PROGRES PENELITIAN

> **Catatan**: Teks di bawah ini merupakan versi modifikasi BAB 5 yang telah disesuaikan 100% dengan projek Copcivil Security System.

Pada bagian ini memuat penjelasan progres penelitian proyek akhir yang dibagi menjadi 3 (tiga) pembahasan, yaitu bagian yang sudah dikerjakan, bagian yang belum dikerjakan, dan kendala yang dialami selama pengerjaan proyek akhir. Penelitian ini berfokus pada pengembangan modul keamanan berbasis *AI-Driven Web Intrusion Detection & Prevention System* (IDPS) bernama Copcivil Security System yang terintegrasi dengan aplikasi web CIVIL QTRACK.

---

## 5.1 BAGIAN YANG SUDAH DIKERJAKAN

Berikut merupakan bagian-bagian yang telah berhasil diselesaikan oleh penulis dalam pelaksanaan proyek akhir ini:

1. Mengumpulkan dan menyusun 115 pola serangan (*payload*) dalam empat kategori ancaman utama, yaitu *SQL Injection* (30 pola), *Cross-Site Scripting* (30 pola), *Command Injection* (30 pola), dan *Path Traversal* (25 pola), masing-masing dilengkapi dengan tingkat keparahan (*severity*).

2. Merancang arsitektur sistem keamanan berlapis (*layered security*) yang terdiri dari *Netlify Edge Function* sebagai *Layer 1* (gerbang keamanan) dan *Appwrite Functions* sebagai *Layer 2* (layanan *backend*).

3. Mengimplementasikan algoritma Aho-Corasick *automaton* untuk pencocokan *multi-pattern* secara simultan dengan kompleksitas waktu O(n + m + z), sehingga seluruh 115 pola serangan dapat dicocokkan dalam satu kali pemindaian.

4. Membangun *pipeline* normalisasi input berlapis 6 tahap (penghapusan *null bytes*, *double URL decoding*, *HTML entity decoding*, *case folding*, penghapusan komentar SQL, dan normalisasi *whitespace*) untuk mengungkap *payload* serangan yang disamarkan melalui teknik *encoding* dan *evasion*.

5. Mengimplementasikan sistem *severity-weighted scoring* dengan bobot per tingkat keparahan (*critical*=10, *high*=7, *medium*=4, *low*=1) dan ambang batas keputusan (*block* ≥ 15, *warn* ≥ 7) untuk menentukan tindakan respons secara akurat.

6. Membangun *Netlify Edge Function* (`copcivil-edge`) sebagai gerbang keamanan yang mengintercept setiap HTTP *request* pada *Deno runtime* di jaringan *edge*, melakukan pemindaian, dan mengambil keputusan blokir/peringatan/lewat secara *real-time*.

7. Menyiapkan basis data *Appwrite Cloud* yang terdiri dari empat koleksi (`security_incidents`, `ip_blocklist`, `ai_reports`, `security_config`) beserta seluruh atribut dan indeks yang diperlukan.

8. Mengembangkan tiga *Appwrite Functions* sebagai layanan *backend*: `copcivil-guard` untuk pencatatan insiden dan *auto-block* IP, `copcivil-blocklist` untuk manajemen daftar blokir, dan `copcivil-ai-report` untuk pembuatan laporan analisis AI.

9. Membangun mekanisme *auto-block* IP berdasarkan frekuensi insiden dalam jendela waktu konfigurabel, termasuk fitur *cache blocklist* di memori *edge isolate* yang di-*refresh* setiap 5 menit.

10. Membangun *dashboard* admin berbasis React yang terdiri dari lima halaman utama: ringkasan keamanan, log insiden, daftar blokir IP, laporan AI, dan konfigurasi sistem.

11. Mengintegrasikan *AI analytics pipeline* menggunakan *OpenRouter API* (*provider-agnostic*) yang mampu mengagregasi data insiden, membangun *prompt* terstruktur, dan menghasilkan laporan keamanan komprehensif melalui model *Large Language Model* (LLM).

12. Melaksanakan pengujian unit menggunakan *Vitest* untuk setiap modul secara individual, serta pengujian *end-to-end* dengan mengirimkan *payload* serangan nyata ke aplikasi yang telah di-*deploy* di *Netlify*.

13. Merancang diagram *Entity Relationship Diagram* (ERD) dan *Data Flow Diagram* (DFD) Level 0, 1, dan 2 yang menggambarkan struktur data dan alur proses sistem secara lengkap.

14. Menyusun dokumentasi skripsi BAB 1 (Pendahuluan), BAB 2 (Deskripsi Sistem), BAB 3 (Eksperimen), dan BAB 4 (Penutup) yang telah disesuaikan dengan implementasi sistem.

---

## 5.2 BAGIAN YANG BELUM DIKERJAKAN

Berikut merupakan bagian yang belum dikerjakan atau masih perlu disempurnakan:

1. Menyempurnakan tampilan *dashboard* admin agar *responsive* secara optimal pada berbagai ukuran layar perangkat, terutama pada perangkat *mobile*.

2. Melakukan pengujian dengan pengguna secara langsung (*user acceptance testing*) untuk memvalidasi bahwa antarmuka *dashboard* dan informasi yang disajikan mudah dipahami oleh administrator.

3. Menambahkan fitur notifikasi *real-time* (misalnya melalui *email* atau *webhook*) ketika terdeteksi serangan dengan tingkat keparahan *critical* atau ketika terjadi *auto-block* IP.

4. Mengimplementasikan mekanisme pembaruan otomatis (*auto-update*) untuk basis data pola serangan agar sistem dapat mengenali pola-pola serangan baru tanpa perlu pembaruan manual.

5. Melakukan pengujian performa (*load testing*) untuk mengukur batas kapasitas sistem dalam menangani volume *request* tinggi secara bersamaan.

---

## 5.3 KENDALA

Selama proses pengerjaan proyek akhir ini, terdapat beberapa kendala utama yang dialami oleh penulis, yaitu:

1. **Keterbatasan Lingkungan *Edge Runtime***: *Netlify Edge Function* berjalan pada *Deno runtime* yang memiliki batasan berbeda dengan *Node.js* standar. Beberapa *library* dan API yang umum digunakan pada *Node.js* tidak tersedia di *Deno runtime*, sehingga seluruh logika deteksi harus diimplementasikan secara mandiri (*pure JavaScript*) tanpa bergantung pada *library* eksternal.

2. **Kompleksitas Integrasi Antar-Layanan**: Sistem melibatkan empat layanan yang berbeda (*Netlify Edge Function*, *Appwrite Cloud Database*, *Appwrite Functions*, dan *OpenRouter API*) yang masing-masing memiliki mekanisme autentikasi, format data, dan batasan (*rate limit*) yang berbeda. Proses integrasi memerlukan penanganan *error* dan sinkronisasi data yang cermat agar seluruh komponen dapat bekerja secara harmonis.

3. **Penanganan Teknik *Evasion* yang Beragam**: Penyerang dapat menggunakan berbagai teknik penyamaran (*encoding*, *obfuscation*, *case manipulation*) untuk menghindari deteksi. Membangun *pipeline* normalisasi yang mampu mengungkap seluruh variasi penyamaran tanpa menghasilkan *false positive* memerlukan pengujian iteratif yang intensif.

4. **Ketergantungan pada Layanan Eksternal**: Sistem bergantung pada ketersediaan layanan *cloud* pihak ketiga (*Appwrite Cloud* dan *OpenRouter API*). Gangguan atau latensi pada layanan tersebut dapat memengaruhi kinerja sistem, sehingga diperlukan mekanisme *fallback* dan penanganan *error* yang memadai.

5. **Keterbatasan Kuota API AI**: Penggunaan *OpenRouter API* untuk menghasilkan laporan analisis AI memiliki biaya per pemanggilan. Hal ini memerlukan implementasi mekanisme *rate limiting* yang ketat dan pengelolaan kuota yang efisien agar tidak terjadi pembengkakan biaya selama pengembangan dan pengujian.
