# BAB 2 DESKRIPSI SISTEM

> **Catatan**: Teks di bawah ini merupakan versi modifikasi BAB 2 yang telah disesuaikan 100% dengan projek Copcivil Security System. Salin dan tempel ke dokumen Word tesis Anda. Bagian diagram (ERD, DFD, Use Case) perlu Anda buat ulang menggunakan kode di file `01-erd-dfd.md`. Bagian mockup perlu di-screenshot manual dari aplikasi yang berjalan.

---

Sistem ini merepresentasikan sebuah paradigma pertahanan proaktif dalam keamanan siber, yang terwujud sebagai *Web-based Intrusion Detection and Prevention System* (IDPS). Copcivil Security System diimplementasikan sebagai modul keamanan yang terintegrasi dengan aplikasi web CIVIL QTRACK, dirancang untuk membangun pertahanan yang tidak hanya mampu mendeteksi, tetapi juga secara aktif mencegah dan memitigasi serangan siber terhadap aplikasi web secara *real-time*. Sistem beroperasi melalui dua lapisan keamanan: *Netlify Edge Function* sebagai *gateway* keamanan di *edge* yang menganalisis setiap HTTP *request* masuk, serta *Appwrite Functions* sebagai lapisan *backend* untuk pencatatan insiden, manajemen *blocklist*, dan analitik AI. Seluruh hasil deteksi dan analisis ditampilkan melalui *dashboard* admin yang intuitif untuk *monitoring* dan pengambilan keputusan.

Fungsionalitas inti sistem ini bertumpu pada tiga pilar utama yang saling terintegrasi untuk menciptakan sebuah lapisan keamanan yang komprehensif:

**Deteksi *Real-time***: Sistem secara berkelanjutan memonitor dan menganalisis seluruh permintaan HTTP yang masuk, termasuk URL *path*, *query parameters*, *header* HTTP, *cookies*, dan *referer*. Kemampuan ini memastikan tidak ada lalu lintas yang luput dari pengawasan, memungkinkan identifikasi ancaman pada titik masuk paling awal menggunakan algoritma Aho-Corasick *multi-pattern matching* yang berjalan di *Netlify Edge Function*.

**Pencegahan Otomatis**: Ketika sebuah permintaan teridentifikasi sebagai ancaman dengan skor kumulatif di atas *threshold* pemblokiran (default: 15), sistem tidak hanya mencatatnya, tetapi juga mengambil tindakan pencegahan secara instan. Ini mencakup pemblokiran permintaan berbahaya sebelum mencapai logika inti aplikasi dan secara otomatis memasukkan alamat IP penyerang ke dalam daftar blokir berdasarkan jumlah insiden dalam jendela waktu tertentu. Mekanisme ini secara signifikan mempersempit peluang bagi penyerang untuk melakukan eksploitasi lebih lanjut.

**Analitik Cerdas Berbasis AI**: Sistem ini mengintegrasikan analitik berbasis Kecerdasan Buatan (AI) melalui *OpenRouter API* yang bersifat *provider-agnostic*. Dengan meneruskan data insiden serangan ke *Large Language Model* (LLM) eksternal, sistem memperoleh analisis mendalam mengenai pola serangan, penilaian tingkat ancaman, dan rekomendasi mitigasi yang adaptif. Pendekatan ini mengubah data mentah serangan menjadi intelijen keamanan yang dapat ditindaklanjuti.

---

## 2.1 DESKRIPSI PERMASALAHAN

Aplikasi web modern merupakan aset digital vital bagi organisasi, namun sekaligus menjadi target utama serangan siber. Ancaman terus berevolusi, dengan penyerang mengembangkan teknik yang semakin canggih untuk mengeksploitasi kerentanan. Kegagalan dalam melindungi aplikasi web dapat mengakibatkan konsekuensi yang merusak, termasuk pencurian data sensitif, kerugian finansial yang signifikan, kerusakan reputasi, dan gangguan operasional.

Selain itu, penyerang semakin mahir menggunakan teknik *evasion* untuk melewati sistem deteksi tradisional. Teknik seperti *double URL encoding*, *HTML entity encoding*, penyisipan komentar SQL, *null byte injection*, dan manipulasi *case* digunakan untuk menyamarkan *payload* serangan agar tidak terdeteksi oleh *Web Application Firewall* (WAF) konvensional. Hal ini menuntut sistem deteksi yang tidak hanya mencocokkan *pattern*, tetapi juga mampu normalisasi input melalui proses dekoding berlapis sebelum melakukan analisis.

Copcivil Security System dirancang secara spesifik untuk mengatasi serangkaian vektor serangan yang paling umum dan merusak yang menargetkan logika aplikasi dan penanganan input pengguna. Sistem ini memfokuskan pertahanannya pada empat jenis teknik eksploitasi utama yang secara konsisten menjadi ancaman serius menurut *OWASP* Top 10:

1. ***SQL Injection*** merupakan teknik serangan yang memanfaatkan celah keamanan pada aplikasi web dengan menyisipkan kode SQL berbahaya melalui input pengguna. Serangan ini dapat memberikan akses tidak sah ke basis data, memungkinkan penyerang untuk mengambil, memodifikasi, atau menghapus data sensitif.

2. ***Cross-Site Scripting* (XSS)** merupakan serangan yang menyisipkan skrip berbahaya ke dalam halaman web yang dilihat oleh pengguna lain. Serangan ini dapat mencuri informasi sesi, melakukan tindakan atas nama pengguna, atau mengalihkan pengguna ke situs berbahaya.

3. ***Command Injection* (CMDi)** merupakan serangan yang memungkinkan penyerang mengeksekusi perintah sistem operasi secara tidak sah melalui input aplikasi web. Serangan ini dapat mengakibatkan pengambilalihan server, penghapusan data, atau eskalasi hak akses.

4. ***Directory Traversal* (*Path Traversal*)** memungkinkan penyerang mengakses *file* dan direktori yang berada di luar direktori *root* aplikasi web. Serangan ini dapat mengekspos *file* konfigurasi sensitif, kode sumber, atau data sistem yang seharusnya tidak dapat diakses.

---

## 2.2 DESKRIPSI SOLUSI

Untuk mengatasi permasalahan keamanan siber yang kompleks, dikembangkan *Copcivil Security System — AI-Driven Web Intrusion Detection & Prevention System*. Sistem ini merupakan solusi komprehensif yang menggabungkan deteksi berbasis *signature* menggunakan algoritma Aho-Corasick, normalisasi input berlapis, *severity-weighted scoring*, pencegahan otomatis berbasis jumlah insiden, dan analitik AI untuk memberikan perlindungan berlapis terhadap ancaman modern. Berikut adalah klasifikasi mengenai teknik ancaman yang ditangani oleh sistem:

**Tabel 2.1: Klasifikasi Teknik Serangan dan *Payload***

| Teknik Serangan | Jumlah *Pattern* | Format Sumber | Distribusi *Severity* |
|---|---|---|---|
| *SQL Injection* (SQLi) | 30 | sqli.json | Critical: 7, High: 11, Medium: 8, Low: 4 |
| *Cross-Site Scripting* (XSS) | 30 | xss.json | Critical: 2, High: 16, Medium: 11, Low: 1 |
| *Command Injection* (CMDi) | 30 | cmdi.json | Critical: 9, High: 17, Medium: 4 |
| *Directory Traversal* (*Path Traversal*) | 25 | path-traversal.json | Critical: 5, High: 15, Medium: 5 |
| **Total** | **115** | **4 file JSON** | — |

### 2.2.1 Mekanisme Deteksi Berbasis Aho-Corasick

Inti dari kemampuan pertahanan sistem ini terletak pada mekanisme deteksi berbasis *signature* (*Signature-based Intrusion Detection System* atau SIDS) yang menggunakan algoritma Aho-Corasick. Pendekatan ini dipilih karena kemampuannya yang terbukti dalam mendeteksi serangan yang telah diketahui dengan tingkat akurasi tinggi dan *false positive* yang rendah, serta efisiensi dalam mencocokkan banyak pola secara simultan.

1. ***Payload Database***

   Sistem menggunakan basis data berisi 115 pola serangan yang dikategorikan ke dalam empat *file* JSON terpisah berdasarkan jenis ancaman: `sqli.json`, `xss.json`, `cmdi.json`, dan `path-traversal.json`. Setiap *file* berisi *array* objek *pattern* dengan metadata yang mencakup ID unik, *string* pola serangan, tingkat *severity* (*critical*, *high*, *medium*, *low*), dan deskripsi opsional. Seluruh pola dimuat ke dalam Aho-Corasick *automaton* saat inisialisasi sistem.

2. **Algoritma Aho-Corasick *Multi-Pattern String Matching***

   Berbeda dengan pendekatan *Regular Expression* (Regex) tradisional yang memproses setiap pola secara individual, algoritma Aho-Corasick membangun sebuah *finite automaton* dari seluruh pola serangan sekaligus. Proses pembangunan *automaton* terdiri dari dua tahap:

   a. **Pembangunan *Trie***: Seluruh pola serangan dimasukkan ke dalam struktur data *trie*, dimana setiap *node* merepresentasikan satu karakter dan setiap jalur dari *root* ke *leaf* merepresentasikan satu pola lengkap.

   b. **Inisialisasi *Failure Links***: Menggunakan algoritma *Breadth-First Search* (BFS), *failure links* dibuat untuk setiap *node* dalam *trie*. *Failure links* memungkinkan *automaton* untuk melompat ke posisi yang tepat ketika terjadi ketidakcocokan, tanpa perlu memulai pencarian dari awal.

   Setelah *automaton* terbangun, pencarian dilakukan dalam *single pass* melalui seluruh input dengan kompleksitas waktu O(n + m + z), dimana n adalah panjang input, m adalah total panjang semua pola, dan z adalah jumlah kecocokan yang ditemukan. Ini jauh lebih efisien dibandingkan pencocokan regex per pola yang memiliki kompleksitas O(n × k) dimana k adalah jumlah pola.

3. ***Pipeline* Normalisasi Input Berlapis**

   Sebelum input dianalisis oleh *detection engine*, seluruh input melewati *pipeline* normalisasi berlapis yang dirancang untuk mengalahkan teknik *evasion*. *Pipeline* ini terdiri dari enam tahap yang dieksekusi secara berurutan:

   a. **Penghapusan *Null Bytes***: Menghapus karakter *null byte* (`\x00`) yang digunakan untuk memotong validasi input.

   b. ***Double URL Decoding***: Mengonversi *encoding* persen ganda (%25XX → %XX → karakter asli) untuk menangani teknik *double encoding*. Jika dekoding gagal, input asli dipertahankan.

   c. ***HTML Entity Decoding***: Mengonversi entitas HTML bernama (`&lt;`, `&amp;`, `&quot;`, `&#39;`, `&apos;`), desimal (`&#60;`), dan heksadesimal (`&#x3c;`) menjadi karakter asli.

   d. ***Case Folding***: Mengonversi seluruh karakter menjadi *lowercase* untuk menangani teknik *case manipulation* (misalnya `UnIoN SeLeCt` → `union select`).

   e. **Penghapusan Komentar SQL**: Menghapus komentar *block* (`/* ... */`), komentar *line* (`-- ...`), dan komentar *hash* (`# ...`) yang digunakan untuk memecah *payload* SQL.

   f. **Normalisasi *Whitespace***: Menggabungkan seluruh urutan *whitespace* menjadi satu spasi tunggal dan memangkas spasi di awal dan akhir *string*.

4. ***Severity-Weighted Scoring***

   Setelah kandidat kecocokan ditemukan oleh Aho-Corasick *automaton*, sistem menghitung skor ancaman kumulatif menggunakan bobot berdasarkan tingkat *severity* setiap *pattern* yang tercocok. Perhitungan skor menggunakan sistem bobot sebagai berikut:

   | Tingkat *Severity* | Bobot |
   |---|---|
   | *Critical* | 10 |
   | *High* | 7 |
   | *Medium* | 4 |
   | *Low* | 1 |

   Skor kumulatif dari seluruh kecocokan menentukan aksi yang diambil:

   | Skor Total | Aksi | Deskripsi |
   |---|---|---|
   | ≥ 15 | `blocked` | *Request* diblokir, insiden dicatat |
   | ≥ 7 dan < 15 | `warned` | *Request* diloloskan, insiden dicatat sebagai peringatan |
   | < 7 | `logged` | *Request* diloloskan, tidak dicatat |

   Mekanisme ini memungkinkan sistem untuk membedakan antara serangan nyata (skor tinggi dari kombinasi *pattern* berbahaya) dan kecocokan yang bersifat kebetulan (skor rendah dari satu kata yang menyerupai *payload*). Skor ≥ 15 biasanya menunjukkan kombinasi beberapa *pattern* berbahaya secara bersamaan, contohnya `<script>alert(1)</script>` yang menghasilkan skor 7 (untuk `<script>`) + 4 (untuk `alert(`) + 7 (untuk `</script>`) = 18.

### 2.2.2 Alur Kerja Pencegahan dan Mitigasi Otomatis

Sistem beroperasi melalui alur kerja tiga fase yang terotomatisasi, dirancang untuk merespons ancaman dari deteksi awal hingga mitigasi penuh.

**Deteksi *Real-time***

1. ***Input Monitoring***: *Netlify Edge Function* mengintercept setiap HTTP *request* yang masuk ke aplikasi web. Fungsi ini mengekstrak seluruh input yang dapat dipindai, meliputi URL *path*, *query parameters*, *cookies*, dan *header referer*, lalu menggabungkannya menjadi satu *string* input untuk analisis.

2. **Normalisasi Input**: Seluruh input yang diekstrak melewati *pipeline* normalisasi berlapis (6 tahap) untuk menormalisasi dan mengungkap *payload* yang disembunyikan menggunakan teknik *evasion*.

3. ***Pattern Matching***: Mesin deteksi menggunakan Aho-Corasick *automaton* untuk mencocokkan seluruh input terhadap 115 pola serangan secara simultan dalam satu kali pemindaian.

4. ***Severity-Weighted Scoring***: Setiap kecocokan dihitung bobot skornya berdasarkan *severity*, dan skor kumulatif menentukan aksi.

5. **Kategorisasi**: Jika ancaman tervalidasi dengan skor di atas *threshold*, sistem mengklasifikasikan jenis serangan berdasarkan kategori *payload* yang tercocok. Kategori dominan (skor tertinggi) menjadi kategori utama insiden.

**Pencegahan dan Mitigasi**

1. ***Request Blocking***: Permintaan berbahaya (skor ≥ 15) segera diblokir sebelum mencapai logika aplikasi. Sistem mengembalikan respons JSON dengan status 403 Forbidden dan *header* `X-Copcivil-Blocked: true`.

2. ***Incident Logging***: Setiap insiden (baik `blocked` maupun `warned`) dicatat secara asinkron (*fire-and-forget*) ke *Appwrite Function* `copcivil-guard` yang menyimpan data insiden ke basis data.

3. ***Auto IP Blocking***: Setelah insiden dicatat, *Appwrite Function* `copcivil-guard` menghitung jumlah insiden dari IP yang sama dalam jendela waktu tertentu (default: 10 menit). Ketika jumlah insiden mencapai ambang batas (default: 5 insiden), IP tersebut secara otomatis dimasukkan ke dalam koleksi `ip_blocklist` dengan durasi pemblokiran yang dapat dikonfigurasi (default: 24 jam). IP yang terdaftar di *whitelist* dikecualikan dari mekanisme *auto-block*.

**Pencatatan dan Dokumentasi**

Setiap insiden keamanan yang terdeteksi dicatat secara komprehensif ke koleksi `security_incidents` di *Appwrite Cloud*. Log insiden mencakup data yang kaya konteks:

- ***timestamp***: Waktu pasti terjadinya serangan.
- ***ip_address***: Alamat IP sumber penyerang.
- ***layer***: Lapisan deteksi (`edge` atau `function`).
- ***request_url***: URL *path* yang diserang.
- ***request_method***: Metode HTTP yang digunakan (GET, POST, dll.).
- ***attack_category***: Kategori serangan yang terdeteksi (sqli, xss, cmdi, path_traversal).
- ***matched_patterns***: ID *pattern* spesifik yang tercocok (JSON *array*).
- ***severity***: Tingkat keparahan tertinggi dari kecocokan yang ditemukan.
- ***threat_score***: Skor ancaman kumulatif dari hasil analisis.
- ***action_taken***: Tindakan yang diambil (`blocked`, `warned`, atau `logged`).
- ***user_agent***: Informasi peramban atau klien yang digunakan oleh penyerang.

**Analitik AI untuk Intelijen Ancaman**

Komponen AI berfungsi untuk mengekstrak wawasan tingkat tinggi dari data serangan yang berhasil dideteksi, mengubahnya menjadi intelijen ancaman proaktif. Sistem menggunakan *OpenRouter API* yang bersifat *provider-agnostic*, sehingga dapat bekerja dengan berbagai penyedia AI seperti OpenAI, Anthropic (Claude), dan lainnya. *Pipeline* analitik AI bekerja sebagai berikut:

1. ***Data Aggregation***: Sistem mengambil insiden dari basis data dalam periode yang diminta dan mengagregasi menjadi statistik: total insiden, distribusi per kategori, per *severity*, per aksi, 10 IP penyerang teratas, 10 URL target teratas, dan rata-rata skor ancaman.

2. ***Prompt Construction***: *System prompt* (instruksi analis keamanan siber) dan *user prompt* (data statistik dalam format *Markdown*) dikonstruksi secara dinamis berdasarkan data yang tersedia.

3. ***AI Processing***: Data dan *prompt* dikirimkan ke LLM eksternal melalui *OpenRouter API* untuk dianalisis.

4. ***Response Parsing***: Respons AI disimpan sebagai laporan terstruktur ke koleksi `ai_reports` di Appwrite.

Laporan AI yang dihasilkan mencakup:

- ***Executive Summary***: Ringkasan eksekutif status keamanan untuk manajemen.
- ***Threat Analysis***: Analisis mendalam pola serangan dan perilaku penyerang.
- ***Risk Assessment***: Penilaian tingkat risiko keamanan (*Critical*/*High*/*Medium*/*Low*).
- ***Recommendations***: Rekomendasi tindakan pencegahan yang spesifik dan dapat ditindaklanjuti.
- ***Trend Comparison***: Perbandingan tren dan eskalasi yang perlu diwaspadai.

---

## 2.3 PENELITIAN TERKAIT

> **Catatan**: Bagian penelitian terkait (2.3.1 — 2.3.4 dan Tabel 2.2) dari tesis lama dapat dipertahankan karena masih relevan. Beberapa penyesuaian minor yang diperlukan:
>
> 1. Ganti semua referensi "Xpecto Shield" → "Copcivil Security System"
> 2. Ganti "Aspri Cyber" → "Copcivil Security System"
> 3. Pada kolom "Relevansi dengan Proyek IDPS" di Tabel 2.2, ganti referensi ke "proyek IDPS" menjadi "Copcivil Security System"
> 4. Bagian 2.3.3 tentang SSRF: tetap pertahankan sebagai referensi kontekstual, tapi tambahkan catatan bahwa Copcivil saat ini fokus pada 4 kategori (tanpa SSRF)

---

## 2.4 DESAIN SISTEM

Desain sistem merupakan sebuah tahap dalam pengembangan sistem yang terdiri dari proses pendefinisian arsitektur, komponen, modul, antarmuka, dan data untuk memenuhi persyaratan atau kebutuhan yang telah didefinisikan untuk mencapai sebuah solusi yang efektif. Tahap ini juga memfasilitasi identifikasi potensi masalah sejak dini sehingga solusi dapat diimplementasikan secara tepat.

### 2.4.1 Desain Alur Sistem

1. **Alur Admin dengan Analitik AI**

   Administrator sistem berinteraksi dengan *dashboard* untuk memonitor, menganalisis, dan mengelola data serangan:

   a. Admin mengakses *dashboard* dan melihat statistik keamanan *real-time* (total serangan 24 jam, IP diblokir aktif, distribusi kategori serangan).

   b. Admin melihat daftar insiden serangan dengan detail lengkap dan dapat melakukan filter berdasarkan kategori, *severity*, aksi, dan pencarian IP.

   c. Admin mengelola daftar IP yang diblokir (membuka blokir manual, memblokir IP baru, menjalankan pembersihan IP kedaluwarsa).

   d. Admin memilih rentang waktu dan men-*trigger* pembuatan laporan analitik AI.

   e. Sistem mengirimkan data insiden teragregasi ke LLM eksternal melalui *OpenRouter API*.

   f. AI memproses data dan menghasilkan laporan komprehensif (*executive summary*, *threat analysis*, *risk assessment*, *recommendations*, *trend comparison*).

   g. Laporan AI ditampilkan di *dashboard* dan disimpan ke koleksi `ai_reports` di Appwrite untuk referensi.

   h. Admin dapat mengkonfigurasi parameter sistem seperti ambang batas pemblokiran, durasi *auto-block*, model AI, dan daftar IP *whitelist*.

   > **[SISIPKAN GAMBAR: Alur Admin — buat ulang menggunakan draw.io sesuai deskripsi di atas]**

   ***Gambar 2.1 Alur Admin***

2. **Alur Deteksi dan Pencegahan Serangan**

   Alur utama Copcivil Security System dalam mendeteksi dan mencegah serangan web diilustrasikan sebagai berikut:

   a. HTTP *Request* masuk ke aplikasi dan diintercept oleh *Netlify Edge Function* (`copcivil-edge`).

   b. *Edge function* memeriksa apakah *path* termasuk *static asset* (`.js`, `.css`, `.png`, dll). Jika ya, *request* langsung diteruskan tanpa pemindaian.

   c. *Edge function* me-*refresh* *cache blocklist* dari Appwrite (setiap 5 menit).

   d. IP klien diekstrak dari *header* `x-nf-client-connection-ip` atau `x-forwarded-for`.

   e. IP diperiksa terhadap *cached blocklist*. Jika IP diblokir, *request* langsung ditolak dengan respons 403.

   f. *Scan targets* diekstrak (URL *path*, *query params*, *cookies*, *referer*) dan digabungkan menjadi satu *string*.

   g. *Detection engine* menormalisasi input (6 tahap) dan menjalankan Aho-Corasick *pattern matching*.

   h. *Scorer* menghitung skor kumulatif berdasarkan bobot *severity* setiap kecocokan.

   i. Jika skor ≥ 15 (`blocked`): *request* diblokir, insiden dikirim secara asinkron ke `copcivil-guard`.

   j. Jika skor ≥ 7 (`warned`): *request* diloloskan, insiden tetap dikirim ke `copcivil-guard`.

   k. Jika skor < 7 (`logged`): *request* diloloskan tanpa pencatatan.

   l. `copcivil-guard` menyimpan insiden ke `security_incidents` dan menjalankan pengecekan *auto-block*.

   > **[SISIPKAN GAMBAR: Flowchart alur deteksi — buat ulang menggunakan draw.io]**

   ***Gambar 2.2 Alur Deteksi dan Pencegahan Serangan***

### 2.4.2 Desain Sistem Arsitektur

Copcivil Security System dikembangkan dengan arsitektur berlapis (*layered architecture*) yang terdiri dari empat komponen utama yang saling terintegrasi:

> **[SISIPKAN GAMBAR: Diagram arsitektur — buat menggunakan draw.io dengan 4 lapisan berikut]**

***Gambar 2.3 Desain Arsitektur Sistem Copcivil Security System***

1. ***Client App* (React + Vite)**

   *Client App* merupakan antarmuka utama yang digunakan oleh pengguna untuk berinteraksi dengan sistem melalui aplikasi web di peramban. Aplikasi ini dibangun menggunakan React 19 sebagai *library* antarmuka pengguna dan Vite 6 sebagai *build tool* dan *development server*. Aplikasi berjalan di sisi klien (*client-side*) dan bertugas untuk mengirimkan permintaan ke *backend* melalui *Appwrite SDK*, serta menerima dan menyajikan data secara visual kepada pengguna. Komponen-komponen utama *frontend* meliputi halaman *dashboard* keamanan, log insiden, manajemen *blocklist*, laporan AI, dan konfigurasi sistem.

2. ***Netlify Edge Function* (Layer 1 — Security Gateway)**

   *Netlify Edge Function* (`copcivil-edge`) berjalan di *Deno runtime* pada *edge network* Netlify dan berfungsi sebagai *gateway* keamanan pertama. Setiap HTTP *request* yang masuk ke aplikasi melewati fungsi ini terlebih dahulu. Fungsi ini melakukan: pengecekan *static asset bypass*, *refresh cache blocklist*, pengecekan IP *blocklist*, ekstraksi *scan targets*, deteksi *pattern* menggunakan Aho-Corasick, dan pengambilan keputusan (*block*/*warn*/*pass*). Insiden yang terdeteksi dikirim secara asinkron ke *Appwrite Function* `copcivil-guard`.

3. ***Appwrite Functions* (Layer 2 — Backend Services)**

   Tiga *Appwrite Functions* berjalan di *Node.js 18 runtime* dan menyediakan layanan *backend*:

   - **`copcivil-guard`**: Menerima log insiden dari *edge function*, menyimpan ke basis data, dan menjalankan mekanisme *auto-block*.
   - **`copcivil-ai-report`**: Mengagregasi data insiden, membangun *prompt*, memanggil LLM melalui *OpenRouter API*, dan menyimpan laporan AI.
   - **`copcivil-blocklist`**: Mengelola operasi CRUD *blocklist* (list, block manual, unblock, cleanup expired).

4. ***Appwrite Cloud* (Database & Authentication)**

   *Appwrite Cloud* menyediakan layanan *Backend-as-a-Service* yang mencakup basis data NoSQL (4 koleksi: `security_incidents`, `ip_blocklist`, `ai_reports`, `security_config`), autentikasi pengguna, dan eksekusi *serverless functions*. Seluruh data keamanan disimpan secara terpusat dan dapat diakses oleh *frontend* melalui *Appwrite SDK* serta oleh *backend* melalui *Appwrite Server SDK*.

### 2.4.3 *Use Case Diagram*

*Use Case Diagram* menggambarkan interaksi antara berbagai aktor pengguna dengan Copcivil Security System, serta menampilkan hubungan dan keterkaitan antara *use case* yang ada.

> **[SISIPKAN GAMBAR: Use Case Diagram — buat di draw.io dengan aktor dan use case berikut]**

***Gambar 2.4 Use Case Diagram***

**Aktor:**

1. **Administrator (Web Admin)**

   Pengguna yang memiliki peran penting dalam menjaga keamanan sistem. Tugas utamanya meliputi:
   - Memonitor statistik keamanan *real-time* melalui *dashboard*
   - Melihat dan memfilter log insiden serangan
   - Mengelola daftar IP yang diblokir (blokir manual, unblok, *cleanup*)
   - Men-*trigger* pembuatan laporan analitik AI
   - Mengkonfigurasi parameter sistem (ambang batas, durasi *auto-block*, model AI, *whitelist* IP)

2. **Hacker (Aktor Eksternal)**

   Aktor eksternal yang memiliki tujuan untuk mengeksploitasi kerentanan pada sistem. Interaksi Hacker dengan sistem berupa:
   - Mengirimkan HTTP *request* dengan *payload* berbahaya
   - Menerima respons blokir (403 Forbidden) jika terdeteksi
   - IP diblokir secara otomatis jika melebihi ambang batas insiden

**Daftar *Use Case*:**

| No | *Use Case* | Aktor | Deskripsi |
|---|---|---|---|
| UC-01 | Memonitor *Dashboard* Keamanan | Admin | Melihat statistik: total insiden 24 jam, serangan diblokir, IP aktif diblokir, distribusi kategori |
| UC-02 | Melihat Log Insiden | Admin | Melihat daftar insiden, filter berdasarkan kategori/severity/aksi, pencarian IP |
| UC-03 | Mengelola *Blocklist* IP | Admin | Memblokir IP manual, membuka blokir, membersihkan IP kedaluwarsa |
| UC-04 | Men-*trigger* Laporan AI | Admin | Memilih periode dan menghasilkan laporan analisis keamanan berbasis AI |
| UC-05 | Mengkonfigurasi Sistem | Admin | Mengubah *threshold*, durasi *auto-block*, model AI, *whitelist* IP |
| UC-06 | Mengirim *Request* Berbahaya | Hacker | Mengirim HTTP *request* berisi *payload* serangan |
| UC-07 | Menerima Respons Blokir | Hacker | Menerima 403 Forbidden saat *payload* terdeteksi |
| UC-08 | Diblokir Otomatis | Hacker | IP otomatis diblokir setelah melebihi ambang batas insiden |

### 2.4.4 *Data Flow Diagram*

*Data Flow Diagram* menggambarkan aliran data antara entitas luar dengan sistem, serta memperlihatkan bagaimana data diproses, disimpan, dan diteruskan antar komponen dalam sistem.

> **Catatan**: Kode Mermaid lengkap untuk DFD Level 0, 1, dan 2 tersedia di file `01-erd-dfd.md`. Gunakan kode tersebut di mermaid.live untuk menghasilkan gambar, atau buat manual di draw.io mengikuti deskripsi berikut.

**DFD Level 0**

> **[SISIPKAN GAMBAR: DFD Level 0 — lihat kode di 01-erd-dfd.md bagian 2.1]**

***Gambar 2.5 Data Flow Diagram Level 0***

Diagram konteks menunjukkan interaksi antara dua entitas eksternal dengan Copcivil Security System. **Hacker** mengirimkan HTTP *request* yang berpotensi mengandung *payload* serangan ke sistem. Sistem memproses *request* tersebut dan mengembalikan respons blokir (403 Forbidden) jika terdeteksi berbahaya. **Administrator** berinteraksi dengan sistem melalui *dashboard* admin untuk memonitor insiden, mengelola daftar blokir IP, men-*trigger* analisis AI, dan mengkonfigurasi parameter sistem. Seluruh data disimpan di **Database Appwrite** yang mencakup insiden keamanan, daftar blokir IP, laporan AI, dan konfigurasi sistem.

**DFD Level 1**

> **[SISIPKAN GAMBAR: DFD Level 1 — lihat kode di 01-erd-dfd.md bagian 2.2]**

***Gambar 2.6 Data Flow Diagram Level 1***

DFD Level 1 merinci Copcivil Security System menjadi empat proses utama: (1) Deteksi Serangan — menerima HTTP *request*, menjalankan normalisasi dan *pattern matching*; (2) Pencegahan & IP *Blocking* — memeriksa *blocklist*, memblokir *request*, menjalankan *auto-block*; (3) Pencatatan Insiden — menyimpan log insiden ke basis data secara asinkron; (4) Analitik AI — mengagregasi data, memanggil LLM, menyimpan laporan. Keempat proses berinteraksi dengan empat *data store*: `security_incidents`, `ip_blocklist`, `ai_reports`, dan `security_config`.

**DFD Level 2 — Deteksi Serangan**

> **[SISIPKAN GAMBAR: DFD Level 2 Deteksi — lihat kode di 01-erd-dfd.md bagian 2.3]**

***Gambar 2.7 Data Flow Diagram Level 2 — Deteksi Serangan***

Proses deteksi serangan terdiri dari empat sub-proses: (1.1) Ekstraksi *Scan Targets* — mengekstrak URL, *query*, *cookies*, *header*; (1.2) Normalisasi Input — *pipeline* 6 tahap; (1.3) *Pattern Matching* Aho-Corasick — pemindaian simultan terhadap 115 pola; (1.4) *Scoring* & Klasifikasi — penghitungan bobot dan penentuan aksi.

**DFD Level 2 — Pencegahan & IP *Blocking***

> **[SISIPKAN GAMBAR: DFD Level 2 Pencegahan — lihat kode di 01-erd-dfd.md bagian 2.4]**

***Gambar 2.8 Data Flow Diagram Level 2 — Pencegahan & IP Blocking***

Proses pencegahan terdiri dari lima sub-proses: (2.1) Cek IP *Blocklist* — pengecekan *cache* yang di-*refresh* setiap 5 menit; (2.2) Blokir *Request* — pembuatan respons 403; (2.3) *Auto-Block* IP — pemblokiran otomatis berdasarkan jumlah insiden; (2.4) Blokir/Unblok Manual — operasi manual oleh administrator; (2.5) *Cleanup Expired* — pembersihan IP kedaluwarsa.

**DFD Level 2 — Pencatatan Insiden**

> **[SISIPKAN GAMBAR: DFD Level 2 Pencatatan — lihat kode di 01-erd-dfd.md bagian 2.5]**

***Gambar 2.9 Data Flow Diagram Level 2 — Pencatatan Insiden***

Proses pencatatan terdiri dari tiga sub-proses: (3.1) *Build Log Payload* — pembangunan *payload* di *edge function*; (3.2) *Build Incident Record* — penyusunan *record* di *guard function*; (3.3) *Sanitize & Truncate* — sanitasi dan pemotongan untuk penyimpanan aman.

**DFD Level 2 — Analitik AI**

> **[SISIPKAN GAMBAR: DFD Level 2 Analitik — lihat kode di 01-erd-dfd.md bagian 2.6]**

***Gambar 2.10 Data Flow Diagram Level 2 — Analitik AI***

Proses analitik AI terdiri dari lima sub-proses: (4.1) Validasi & *Rate Limit*; (4.2) Agregasi Data Insiden; (4.3) Konstruksi *Prompt*; (4.4) Panggil LLM API; (4.5) Simpan Laporan.

### 2.4.5 *Entity Relationship Diagram*

ERD ini menggambarkan struktur basis data Copcivil Security System yang diimplementasikan menggunakan *Appwrite Cloud*. Basis data `copcivil_security` terdiri dari empat koleksi utama yang saling terelasi secara logis.

> **Catatan**: Kode DBML (untuk dbdiagram.io) dan Mermaid (untuk mermaid.live) tersedia di file `01-erd-dfd.md`. Gunakan dbdiagram.io untuk hasil ERD paling profesional.

> **[SISIPKAN GAMBAR: ERD — generate dari kode di 01-erd-dfd.md bagian 1.1 atau 1.2]**

***Gambar 2.11 Entity Relationship Diagram Sistem***

ERD terdiri dari empat entitas utama:

1. **`security_incidents`** — Menyimpan setiap insiden keamanan yang terdeteksi dengan 15 atribut, meliputi informasi IP penyerang, waktu kejadian, URL yang diserang, kategori serangan, skor ancaman, dan tindakan yang diambil.

2. **`ip_blocklist`** — Mengelola daftar alamat IP yang diblokir dengan 7 atribut, mencakup informasi alasan pemblokiran, waktu kedaluwarsa, jenis blokir (otomatis/manual), dan status aktif.

3. **`ai_reports`** — Menyimpan laporan analisis keamanan AI dengan 9 atribut, berisi ringkasan eksekutif, rekomendasi mitigasi, statistik insiden, dan metadata model AI.

4. **`security_config`** — Menyimpan konfigurasi sistem dengan 3 atribut, memungkinkan administrator mengatur parameter operasional tanpa mengubah kode sumber.

Relasi antar entitas bersifat implisit (Appwrite menggunakan arsitektur NoSQL tanpa *foreign key* formal). Atribut `ip_address` pada `security_incidents` terhubung secara logis dengan `ip_blocklist`. Koleksi `ai_reports` menganalisis data dari `security_incidents` berdasarkan rentang waktu. Koleksi `security_config` mengatur parameter operasional untuk ketiga koleksi lainnya.

---

## 2.5 MOCKUP WEBSITE

> **Bagian ini berisi panduan untuk screenshot halaman aktual. Lihat file `06-mockup-guide.md` untuk petunjuk detail.**

Tampilan antarmuka yang disajikan berikut merupakan tangkapan layar (*screenshot*) dari implementasi aktual Copcivil Security System yang terintegrasi dengan aplikasi CIVIL QTRACK. Antarmuka dibangun menggunakan React 19 dengan komponen *dashboard* admin yang menyediakan *monitoring* keamanan *real-time*.

### Halaman Login

> **[SISIPKAN SCREENSHOT: `npm run dev` → buka `http://localhost:5173/login`]**

***Gambar 2.12 Halaman Login***

Halaman ini berfungsi sebagai gerbang utama untuk mengakses *dashboard* dan fitur-fitur manajemen lainnya. Pengguna (administrator) harus memasukkan *email* dan *password* yang valid melalui autentikasi *Appwrite* untuk dapat masuk ke dalam sistem. Ini adalah lapisan keamanan pertama untuk memastikan hanya pihak yang berwenang yang dapat mengelola dan memonitor sistem.

### *Sidebar* Admin

> **[SISIPKAN SCREENSHOT: Buka `/admin/dashboard` → screenshot bagian sidebar kiri, perhatikan menu "Keamanan" yang dapat diekspansi]**

***Gambar 2.13 Sidebar Admin***

Menu navigasi utama yang menjadi pusat kendali sistem. Menu ini memberikan akses cepat ke semua modul fungsional:

1. ***Dashboard***: Menampilkan ringkasan operasional CIVIL QTRACK.
2. **Manajemen *User***: Mengelola akun pengguna.
3. **Manajemen Kontrak**: Mengelola data kontrak.
4. **Laporan Inspeksi**: Mengelola laporan inspeksi jalan.
5. **Notifikasi**: Mengelola notifikasi sistem.
6. **Keamanan** (grup menu Copcivil):
   - **Ringkasan**: *Dashboard* keamanan (*overview*).
   - **Log Insiden**: Daftar insiden serangan yang terdeteksi.
   - **Daftar Blokir**: Manajemen IP *blocklist*.
   - **Laporan AI**: Laporan analisis keamanan berbasis AI.
   - **Konfigurasi**: Pengaturan parameter sistem keamanan.

### *Dashboard* Keamanan (Ringkasan)

> **[SISIPKAN SCREENSHOT: Buka `/admin/security`]**

***Gambar 2.14 Dashboard Keamanan — Ringkasan***

Halaman ringkasan keamanan menyajikan pandangan tingkat tinggi (*at-a-glance*) dari status keamanan sistem. Halaman ini menampilkan tiga kartu statistik utama: **Total Insiden (24 Jam)**, **Serangan Diblokir (24 Jam)**, dan **IP Diblokir Aktif**. Di bawahnya terdapat *pie chart* distribusi kategori serangan dan tabel insiden terbaru dengan kolom: Waktu, IP, Kategori, Tingkat, dan Aksi.

### Log Insiden

> **[SISIPKAN SCREENSHOT: Buka `/admin/security/incidents`]**

***Gambar 2.15 Log Insiden***

Halaman log insiden menyediakan daftar lengkap seluruh insiden keamanan yang terdeteksi. Administrator dapat melakukan filter berdasarkan kategori serangan, tingkat *severity*, dan jenis aksi. Tabel menampilkan detail insiden termasuk *timestamp*, alamat IP, kategori, tingkat keparahan, skor ancaman, dan aksi yang diambil.

### Daftar Blokir IP

> **[SISIPKAN SCREENSHOT: Buka `/admin/security/blocklist`]**

***Gambar 2.16 Daftar Blokir IP***

Halaman daftar blokir IP adalah inti dari fungsi pencegahan. Halaman ini menampilkan semua alamat IP yang telah diblokir oleh sistem. Informasi yang disajikan mencakup alamat IP, alasan pemblokiran, jenis blokir (otomatis/manual), jumlah insiden, waktu pemblokiran, dan status. Administrator dapat melakukan blokir IP manual dengan menyertakan alasan, membuka blokir IP, dan menjalankan pembersihan IP yang telah kedaluwarsa.

### Laporan AI

> **[SISIPKAN SCREENSHOT: Buka `/admin/security/ai-reports`]**

***Gambar 2.17 Laporan Analitik AI***

Halaman laporan AI memungkinkan administrator untuk menghasilkan laporan analisis keamanan berbasis *Large Language Model*. Administrator memilih rentang waktu analisis, lalu sistem mengagregasi data insiden dan mengirimkannya ke LLM melalui *OpenRouter API*. Laporan yang dihasilkan mencakup ringkasan eksekutif, analisis pola, penilaian risiko, dan rekomendasi mitigasi. Setiap laporan ditampilkan dalam format *card* yang dapat diekspansi.

### Konfigurasi Keamanan

> **[SISIPKAN SCREENSHOT: Buka `/admin/security/config`]**

***Gambar 2.18 Konfigurasi Keamanan***

Halaman konfigurasi memungkinkan administrator mengatur parameter operasional sistem tanpa mengubah kode sumber. Konfigurasi dibagi menjadi empat bagian:

1. **Ambang Batas Deteksi**: *Block threshold* (default: 15) dan *Warn threshold* (default: 7).
2. **Kebijakan *Auto-Block***: Jumlah insiden sebelum *auto-block* (5), jendela waktu (10 menit), dan durasi pemblokiran (24 jam).
3. **Model AI**: Model LLM yang digunakan untuk laporan (default: `anthropic/claude-sonnet-4`).
4. **IP *Whitelist***: Daftar IP yang dikecualikan dari mekanisme *auto-block*.
