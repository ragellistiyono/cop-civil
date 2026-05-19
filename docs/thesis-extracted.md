+------------------------------------------------------------+------------------------+
| ![logo pens                                                | **PROPOSAL**           |
| kecil.png](media/image16.png){width="0.8005577427821522in" |                        |
| height="0.7874015748031497in"}                             | **LAPORAN AKHIR**      |
+============================================================+========================+

**Sistem Deteksi dan Pencegahan Eksploitasi Web serta Mitigasi dengan IP
Blocking dan Pelaporan Analitik Berbasis AI**

**Ragel Listiyono**

NRP. 3123510644

**DOSEN PEMBIMBING**

Fitri Setyorini, ST., M.Sc

NIP. 197707072001122001

Yesta Medya Mahardhika, S.Tr.Kom., M.T.

NIP. 199008182022032005

**PROGRAM STUDI DIPLOMA TIGA**

**TEKNIK INFORMATIKA**

**DEPARTEMEN TEKNIK INFORMATIKA DAN KOMPUTER**

**POLITEKNIK ELEKTRONIKA NEGERI SURABAYA**

**2025**

# **BAB 1** **PENDAHULUAN**

## **1.1 LATAR BELAKANG**

Perkembangan pesat teknologi informasi mendorong organisasi untuk
memanfaatkan website sebagai aset digital utama dalam menyebarkan
informasi dan menjalankan layanan. Peningkatan ketergantungan terhadap
website ini secara langsung turut memperbesar permukaan serangan dan
potensi ancaman keamanan siber yang membahayakan integritas data serta
reputasi organisasi.

Banyak website modern mengandalkan *Content Management System* (CMS)
untuk kemudahan pengelolaan konten. Namun, struktur modular CMS yang
bergantung pada tema dan plugin dari pihak ketiga justru menciptakan
celah kerentanan baru, terutama jika pengelola lalai melakukan pembaruan
rutin. Celah ini membuka pintu bagi berbagai vektor serangan siber,
seperti *SQL Injection, Cross-Site Scripting (XSS), Directory Traversal
(Path Traversal), Server-Side Request Forgery (SSRF), Local File
Inclusion (LFI)* yang dapat mengakibatkan pencurian data sensitif,
perusakan tampilan (*defacement*), hingga distribusi *malware(Hoang Xuan
Dau, 2022) \[1\]* .

Kondisi tersebut diperparah oleh fakta bahwa administrator atau
pengelola website seringkali tidak memiliki keahlian teknis mendalam di
bidang keamanan siber. Keterbatasan ini menyebabkan mereka kesulitan
untuk mendeteksi dan merespons ancaman secara efektif dan tepat waktu.
Hal ini menciptakan sebuah kesenjangan krusial: ketiadaan sebuah sistem
yang mampu memantau, mendeteksi, dan mencegah serangan secara otomatis
dan *real-time*, sekaligus memberikan peringatan yang mudah dipahami.

Kebutuhan akan sistem deteksi dan pencegahan serangan yang otomatis
menjadi sangat mendesak untuk mengatasi gap pengetahuan administrator
website tersebut. **Sistem Deteksi Serangan, Pencegahan Exploitasi dan
Mitigasi dengan Analitik berbasis AI** dapat menjadi solusi efektif
dengan kemampuan mendeteksi payload serangan secara real-time, melakukan
mitigasi otomatis melalui IP blocking, dan memberikan analisis cerdas
untuk meningkatkan pemahaman administrator tentang ancaman yang
dihadapi. Integrasi AI dalam sistem keamanan siber memungkinkan analisis
pola serangan yang lebih akurat dan rekomendasi mitigasi yang adaptif
sesuai dengan karakteristik ancaman yang berkembang(Kannan & Pajasri,
2025) \[3\].

## 1.2 IDENTIFIKASI PERMASALAHAN 

Berdasarkan latar belakang yang telah diuraikan, terdapat beberapa
permasalahan utama yang perlu mendapat perhatian serius dalam konteks
keamanan website . Dari penjabaran tersebut, maka permasalahan utama
dapat diidentifikasi sebagai berikut:

1.  Bagaimana merancang dan mengimplementasikan sistem deteksi serangan
    web berbasis algoritma Aho-Corasick yang mampu mencocokkan ribuan
    pola serangan secara simultan dengan performa real-time?

2.  Bagaimana mengimplementasikan mekanisme multi-layer input decoding
    yang efektif dalam mengalahkan berbagai teknik evasion (URL
    encoding, HTML entities, Unicode normalization, Base64 encoding)
    yang digunakan penyerang untuk melewati sistem deteksi?

3.  Bagaimana membangun sistem pencegahan otomatis (IP blocking)
    berbasis strike count yang mampu merespons ancaman yang terdeteksi
    secara real-time?

4.  Bagaimana mengintegrasikan AI analytics berbasis Large Language
    Model (LLM) untuk menghasilkan laporan analisis keamanan yang
    komprehensif dari data insiden serangan?

5.  Bagaimana mengimplementasikan seluruh sistem sebagai library
    TypeScript yang terintegrasi dengan framework Next.js dan kompatibel
    dengan Node.js Runtime maupun Edge Runtime?

## 1.3 BATASAN MASALAH

Agar penelitian tetap terarah dan fokus, berikut ruang lingkup yang
menjadi batasan dalam penelitian ini:

1.  Sistem dikembangkan sebagai library *TypeScript* bernama Xpecto
    Shield yang terintegrasi dengan framework *Next.js* versi 15.5 ke
    atas menggunakan App Router.

2.  Teknologi yang digunakan meliputi TypeScript sebagai bahasa
    pemrograman utama, *Next.js* sebagai full-stack framework,
    *Appwrite* sebagai *Backend-as-a-Service* (database dan
    autentikasi), React untuk komponen dashboard, dan OpenAI compatible
    API sebagai AI analytics provider.

3.  Deteksi serangan dibatasi pada lima kategori teknik eksploitasi
    utama: SQL Injection (SQLi), Cross-Site Scripting (XSS), Path
    Traversal, Server-Side Request Forgery (SSRF), dan Local File
    Inclusion (LFI).

4.  Algoritma deteksi menggunakan Aho-Corasick multi-pattern string
    matching dengan precision validation dan confidence scoring, bukan
    machine learning classifier.

5.  AI analytics menggunakan *Large Language Model (LLM)* eksternal
    melalui *OpenAI-compatible* chat completions API, sistem bersifat
    *provider-agnostic* dan tidak melatih model sendiri.

## 1.4 TUJUAN

Penelitian proyek akhir ini bertujuan untuk mengembangkan Xpecto Shield,
sebuah *AI-Driven Web Intrusion Detection & Prevention System (IDPS)*
yang diimplementasikan sebagai *library TypeScript* terintegrasi dengan
*framework Next.js*. Sistem ini mengimplementasikan algoritma
Aho-Corasick untuk mencocokkan ribuan pola serangan web secara simultan
dengan performa real-time, dilengkapi multi-layer input decoder untuk
mengalahkan teknik evasion, serta confidence scoring untuk mengurangi
false positive. Sistem dirancang untuk mendeteksi lima kategori teknik
eksploitasi utama *SQL Injection, XSS, Path Traversal, SSRF,* dan *LFI*
kemudian mengklasifikasikan dan merespons ancaman secara otomatis
melalui mekanisme IP blocking berbasis strike count. Setiap insiden
serangan yang terdeteksi dicatat secara komprehensif ke database
*Appwrite* dan dapat dianalisis menggunakan AI analytics berbasis LLM
untuk menghasilkan laporan keamanan yang mencakup ringkasan eksekutif,
analisis pola, penilaian risiko, dan rekomendasi mitigasi kontekstual.
Seluruh hasil deteksi dan analisis ditampilkan melalui dashboard admin
berbasis React yang menyediakan monitoring real-time, sehingga
administrator dapat mengambil keputusan keamanan berdasarkan data yang
akurat dan terkini. Sistem ini bertujuan untuk memberikan solusi
keamanan yang komprehensif, mudah diintegrasikan, dan berdaya guna
tinggi bagi developer dan administrator aplikasi web.

**1.5 MANFAAT**

Xpecto Shield sebagai AI-Driven Web IDPS dengan pendekatan *Aho-Corasick
multi-pattern matching* merupakan solusi dalam upaya peningkatan
keamanan aplikasi web terhadap ancaman eksploitasi kerentanan.
Pendekatan ini menyajikan deteksi real-time yang memudahkan identifikasi
dan pencegahan serangan berdasarkan lima kategori teknik eksploitasi
utama. Manfaat dari penelitian ini adalah sebagai berikut:

1.  Bagi Organisasi dan Perusahaan

Penelitian ini menyediakan sistem perlindungan proaktif yang memberikan
keamanan berlapis terhadap serangan siber dengan cakupan deteksi SQL
Injection, XSS, Path Traversal, SSRF, dan LFI. Hal ini memberikan
dukungan perlindungan aset digital berbasis data dalam pencegahan
kerugian finansial dan reputasi, serta memudahkan monitoring ancaman
keamanan secara kontinu. Sistem ini mengurangi downtime website dan
memastikan kontinuitas bisnis dengan biaya yang optimal dibandingkan
potensi kerugian dari serangan siber yang berhasil.

2.  Bagi Developer dan Administrator Website

Developer memperoleh manfaat berupa library yang mudah diintegrasikan ke
dalam proyek Next.js dengan konfigurasi minimal. Administrator website
mendapatkan dashboard intuitif yang memungkinkan monitoring real-time
tanpa memerlukan keahlian mendalam dalam keamanan siber. Integrasi AI
analytics memberikan wawasan mendalam mengenai landscape ancaman melalui
laporan keamanan yang komprehensif, sehingga mendorong waktu respons
yang lebih cepat dan pengambilan keputusan yang berbasis data.

# BAB 2

# DESKRIPSI SISTEM

Sistem ini merepresentasikan sebuah paradigma pertahanan proaktif dalam
keamanan siber, yang terwujud sebagai Web-based Intrusion Detection and
Prevention System (IDPS). Xpecto Shield diimplementasikan sebagai
library TypeScript yang terintegrasi dengan framework Next.js, dirancang
untuk membangun pertahanan website yang tidak hanya mampu mendeteksi,
tetapi juga secara aktif mencegah dan memitigasi serangan siber terhadap
aplikasi web secara real-time. Sistem beroperasi melalui middleware
interceptor yang menganalisis setiap HTTP request masuk, serta
menyediakan dashboard admin yang intuitif untuk monitoring dan
pengambilan keputusan.

Fungsionalitas inti sistem ini bertumpu pada tiga pilar utama yang
saling terintegrasi untuk menciptakan sebuah lapisan keamanan yang
komprehensif:

**Deteksi *Real-time***: Sistem secara berkelanjutan memonitor dan
menganalisis seluruh permintaan HTTP yang masuk, termasuk URL path,
query parameters, header HTTP, cookie, dan request body. Kemampuan ini
memastikan tidak ada lalu lintas yang luput dari pengawasan,
memungkinkan identifikasi ancaman pada titik masuk paling awal
menggunakan algoritma Aho-Corasick multi-pattern matching.

**Pencegahan Otomatis**: Ketika sebuah permintaan teridentifikasi
sebagai ancaman dengan skor kepercayaan di atas threshold yang
dikonfigurasi, sistem tidak hanya mencatatnya, tetapi juga mengambil
tindakan pencegahan secara instan. Ini mencakup pemblokiran permintaan
berbahaya sebelum mencapai logika inti aplikasi dan secara otomatis
memasukkan alamat IP penyerang ke dalam daftar blokir berdasarkan
mekanisme strike count. Mekanisme ini secara signifikan mempersempit
peluang bagi penyerang untuk melakukan eksploitasi lebih lanjut.

**Analitik Cerdas Berbasis AI**: Sistem ini mengintegrasikan analitik
berbasis Kecerdasan Buatan (AI) melalui OpenAI-compatible chat
completions API yang bersifat provider-agnostic. Dengan meneruskan data
insiden serangan ke Large Language Model (LLM) eksternal, sistem
memperoleh analisis mendalam mengenai pola serangan, penilaian tingkat
ancaman, dan rekomendasi mitigasi yang adaptif. Pendekatan ini mengubah
data mentah serangan menjadi intelijen keamanan yang dapat
ditindaklanjuti.

## 2.1 DESKRIPSI PERMASALAHAN

Aplikasi web modern merupakan aset digital vital bagi organisasi, namun
sekaligus menjadi target utama serangan siber. Ancaman terus berevolusi,
dengan penyerang mengembangkan teknik yang semakin canggih untuk
mengeksploitasi kerentanan. Kegagalan dalam melindungi aplikasi web
dapat mengakibatkan konsekuensi yang merusak, termasuk pencurian data
sensitif, kerugian finansial yang signifikan, kerusakan reputasi, dan
gangguan operasional. Selain itu, penyerang semakin mahir menggunakan
teknik evasion untuk melewati sistem deteksi tradisional. Teknik seperti
double URL encoding, HTML entity encoding, Unicode fullwidth
substitution, null byte injection, dan Base64 encoding digunakan untuk
menyamarkan payload serangan agar tidak terdeteksi oleh Web Application
Firewall (WAF) konvensional. Hal ini menuntut sistem deteksi yang tidak
hanya mencocokkan pattern, tetapi juga mampu normalisasi input melalui
proses *decoding* berlapis sebelum melakukan analisis. Sistem Xpecto
Shield IDPS dirancang secara spesifik untuk mengatasi serangkaian vektor
serangan yang paling umum dan merusak yang menargetkan logika aplikasi
dan penanganan input pengguna. Sistem ini memfokuskan pertahanannya pada
lima jenis teknik eksploitasi utama yang secara konsisten menjadi
ancaman serius menurut *OWASP* Top 10:

1.  **SQL Injection** merupakan teknik serangan yang memanfaatkan celah
    keamanan pada aplikasi web dengan menyisipkan kode SQL berbahaya
    melalui input pengguna. Serangan ini dapat memberikan akses tidak
    sah ke database, memungkinkan penyerang untuk mengambil,
    memodifikasi, atau menghapus data sensitif.

2.  **Cross-Site Scripting (XSS)** serangan yang menyisipkan skrip
    berbahaya ke dalam halaman web yang dilihat oleh pengguna lain.
    Serangan ini dapat mencuri informasi sesi, melakukan tindakan atas
    nama pengguna, atau mengalihkan pengguna ke situs berbahaya.

3.  **Directory Traversal (Path Traversal)** memungkinkan penyerang
    mengakses file dan direktori yang berada di luar direktori root
    aplikasi web. Serangan ini dapat mengekspos file konfigurasi
    sensitif, kode sumber, atau data sistem yang seharusnya tidak dapat
    diakses.

4.  **Server-Side Request Forgery (SSRF)** adalah serangan yang memaksa
    server untuk melakukan permintaan HTTP ke sistem internal atau
    eksternal yang tidak diinginkan. Serangan ini dapat digunakan untuk
    menjelajahi jaringan internal atau mengakses layanan yang seharusnya
    tidak dapat diakses dari luar.

5.  **Local File Inclusion (LFI)** memungkinkan penyerang untuk
    menyertakan file lokal yang tidak dimaksudkan untuk diakses, yang
    dapat mengakibatkan eksekusi kode berbahaya atau pengungkapan
    informasi sensitif.

## 2.2 DESKRIPSI SOLUSI

Untuk mengatasi permasalahan keamanan siber yang kompleks, dikembangkan
*Xpecto Shield AI-Driven Web Intrusion Detection & Prevention System*.
Sistem ini merupakan solusi komprehensif yang menggabungkan deteksi
berbasis signature menggunakan algoritma Aho-Corasick, multi-layer input
decoding, confidence scoring, pencegahan otomatis berbasis strike count,
dan analitik AI untuk memberikan perlindungan berlapis terhadap ancaman
modern. Berikut adalah klasifikasi mengenai teknik ancaman *OWASP* Top
10 yang ditangani oleh sistem:

**Tabel 2.1 : Klasifikasi Teknik Serangan dan Payload**

  Teknik Serangan                        Jumlah Payloads   Source Payloads
  -------------------------------------- ----------------- -------------------------------------------------------------------------------------------------------------
  SQL Injection                          585               [[SQL Attacks]{.underline}](https://github.com/coffinxp/payloads/blob/main/allsqli.txt)
  Cross-Site Scripting (XSS)             2669              [[Xss Attacks]{.underline}](https://github.com/coffinxp/payloads/blob/main/xss.txt)
  Directory Traversal (Path Traversal)   847               [[Directory Traversal]{.underline}](https://github.com/coffinxp/payloads/blob/main/directory_traversal.txt)
  Server-Side Request Forgery (SSRF)     122               [[SSRF Attacks]{.underline}](https://github.com/coffinxp/payloads/blob/main/ssrf.txt)
  Local File Inclusion (LFI)             1000              [[LFI Attacks]{.underline}](https://raw.githubusercontent.com/coffinxp/payloads/refs/heads/main/lfi.txt)

### 2.2.1 Mekanisme Deteksi Presisi Tinggi Berbasis Aho-Corasick

Inti dari kemampuan pertahanan sistem ini terletak pada mekanisme
deteksi berbasis signature (Signature-based Intrusion Detection System
atau SIDS) yang menggunakan algoritma Aho-Corasick. Pendekatan ini
dipilih karena kemampuannya yang terbukti dalam mendeteksi serangan yang
telah diketahui dengan tingkat akurasi yang sangat tinggi dan false
positif yang rendah, serta efisiensi dalam mencocokkan ribuan pola
secara simultan.

1.  ***Payload Database***

Sistem menggunakan database berisi \~11.050 payload serangan yang
dikategorikan ke dalam lima file terpisah berdasarkan jenis ancaman:
sqli.txt, xss.txt, lfi.txt, ssrf.txt, dan path-traversal.txt. Setiap
file berisi satu pola serangan per baris yang dimuat ke dalam
Aho-Corasick automaton saat inisialisasi sistem.

2.  ***Algoritma Aho-Corasick Multi-Pattern String Matching***

Berbeda dengan pendekatan Regular Expression (Regex) tradisional yang
memproses setiap pola secara individual, algoritma Aho-Corasick
membangun sebuah finite automaton dari seluruh pola serangan sekaligus.
Proses pembangunan automaton terdiri dari dua tahap:

1.  Pembangunan Trie: Seluruh pola serangan dimasukkan ke dalam struktur
    data trie, dimana setiap node merepresentasikan satu karakter dan
    setiap jalur dari root ke leaf merepresentasikan satu pola lengkap.

2.  Inisialisasi Failure Links: Menggunakan algoritma *Breadth-First
    Search (BFS)*, failure links dibuat untuk setiap node dalam trie.
    Failure links memungkinkan automaton untuk melompat ke posisi yang
    tepat ketika terjadi ketidakcocokan, tanpa perlu memulai pencarian
    dari awal.

Setelah automaton terbangun, pencarian dilakukan dalam single pass
melalui seluruh input dengan kompleksitas waktu O(n + m + z), dimana n
adalah panjang input, m adalah total panjang semua pola, dan z adalah
jumlah kecocokan yang ditemukan. Ini jauh lebih efisien dibandingkan
pencocokan regex per pola yang memiliki kompleksitas O(n × k) dimana k
adalah jumlah pola.

> **3. *Multi-Layer Input Decoder***
>
> Sebelum input dianalisis oleh detection engine, seluruh input melewati
> pipeline dekoding berlapis yang dirancang untuk mengalahkan teknik
> evasion. Pipeline ini terdiri dari enam lapisan dekoding yang
> dieksekusi secara berurutan:

1.  Double URL Decoding: Mengonversi encoding persen ganda (%25XX → %XX
    → karakter asli) untuk menangani teknik double encoding.

2.  URL Decoding: Mengonversi encoding persen standar (%XX) menjadi
    karakter asli.

3.  HTML Entity Decoding: Mengonversi entitas HTML bernama (\&lt;,
    \&amp;), desimal (\&#60;), dan heksadesimal (\&#x3c;) menjadi
    karakter asli.

4.  *Unicode Normalization*: Mengkonversi karakter *full width Unicode
    (U+FF01--U+FF5E)* menjadi ekuivalen *ASCII*, menangani teknik
    substitusi Unicode.

5.  Null Byte Removal: Menghapus null bytes dan representasinya (%00,
    \\0, \\\\0, \\\\x00) yang digunakan untuk memotong validasi input.

6.  Base64 Detection & Decoding: Mendeteksi dan mendekode segmen yang
    di-encode menggunakan Base64 (minimal 16 karakter dan valid Base64
    charset).

**4. Precision Validation dan Confidence Scoring**

Setelah kandidat kecocokan ditemukan oleh Aho-Corasick automaton, sistem
melakukan validasi presisi untuk menghitung skor kepercayaan (confidence
score) yang menentukan apakah kecocokan tersebut merupakan ancaman nyata
atau false positive. Perhitungan skor terdiri dari tiga komponen:

1.  Base Score (0.6): Skor dasar yang diberikan untuk setiap kecocokan
    yang ditemukan.

2.  Length Ratio Bonus (0--0.2): Bonus berdasarkan rasio panjang pola
    terhadap panjang input. Pola yang panjang dalam input yang pendek
    mengindikasikan ancaman dengan tingkat kepercayaan lebih tinggi.

3.  Context Keyword Bonus (0--0.2): Bonus berdasarkan keberadaan kata
    kunci kontekstual yang relevan dengan kategori serangan (misalnya,
    kata \"SELECT\", \"UNION\", \"DROP\" untuk SQL Injection, atau
    \"script\", \"onerror\", \"alert\" untuk XSS).

Total skor maksimum adalah 1.0. Ancaman hanya dilaporkan jika skor
kepercayaan melebihi threshold yang dikonfigurasi (default: 0.7).
Mekanisme ini secara signifikan mengurangi false positive, karena
kecocokan yang bersifat kebetulan (misalnya, kata \"select\" dalam
konteks non-SQL) tidak akan melewati threshold karena kurangnya konteks
pendukung.

### 2.2.2 Alur Kerja Pencegahan dan Mitigasi Otomatis

Sistem beroperasi melalui alur kerja tiga fase yang terotomatisasi,
dirancang untuk merespons ancaman, dari deteksi awal hingga mitigasi
penuh.

**Deteksi *Real-time***

1.  ***Input Monitoring**: Middleware* mengintercept setiap HTTP request
    yang masuk ke aplikasi web dan mengekstrak seluruh input yang dapat
    dipindai, meliputi URL path, query parameters, header HTTP, cookie,
    dan request body (JSON maupun form-encoded).

2.  ***Multi-Layer Decoding***: Seluruh input yang diekstrak melewati
    pipeline dekoding berlapis (6 lapisan) untuk menormalisasi dan
    mengungkap payload yang disembunyikan menggunakan teknik evasion.

3.  ***Pattern Matching***: Mesin deteksi menggunakan Aho-Corasick
    automaton untuk mencocokkan seluruh input terhadap \~11.050 pola
    serangan secara simultan dalam satu kali pemindaian.

4.  ***Precision Validation***: Kandidat kecocokan divalidasi
    menggunakan confidence scoring yang mempertimbangkan rasio panjang
    dan konteks kata kunci.

5.  **Kategorisasi**: Jika ancaman tervalidasi dengan skor di atas
    threshold, sistem mengklasifikasikan jenis serangan berdasarkan
    kategori payload yang tercocok.

**Pencegahan dan Mitigasi**

1.  ***Request Blocking***

Permintaan berbahaya segera diblokir sebelum mencapai logika aplikasi.
Sistem mengembalikan halaman blokir bertemakan cyberpunk untuk request
HTML atau respons JSON error untuk API request.

2.  ***Strike Counting***

Setiap IP yang mengirimkan request berbahaya mendapat satu strike yang
disimpan di in-memory cache.

3.  ***Auto IP Blocking***

Ketika jumlah strike dari suatu IP mencapai batas maksimum (default: 3
strike), IP tersebut secara otomatis dimasukkan ke dalam block cache
dengan durasi pemblokiran yang dapat dikonfigurasi.

**Logging dan Dokumentasi**

Setelah ancaman berhasil dideteksi dan dicegah, sistem beralih ke fase
dokumentasi yang menjadi fondasi untuk analisis lebih lanjut.

**Pencatatan Data yang Kaya Konteks**

Setiap insiden keamanan yang terdeteksi dicatat secara komprehensif ke
database Appwrite. Log insiden mencakup data yang kaya konteks:

- ***Timestamp***: Waktu pasti terjadinya serangan.

- ***attacker ip***: Alamat IP sumber penyerang.

- ***payload***: *Payload* berbahaya spesifik yang digunakan.

- ***URL Path***: Path yang diserang.

- ***HTTP Method:*** Metode HTTP yang digunakan (GET, POST, PUT, dll.).

- ***Attack Category:*** Kategori serangan yang terdeteksi (sqli, xss,
  lfi, ssrf, path-traversal).

- ***Matched Payload:*** Payload spesifik yang tercocok dengan database.

- ***Confidence Score:*** Skor kepercayaan dari hasil analisis.

- ***Raw Input:*** Input mentah sebelum dekoding.

- ***Action Taken:*** Tindakan yang diambil (blocked, logged, atau
  monitored).

- ***user_agent***: Informasi peramban atau klien yang digunakan oleh
  penyerang.

**Analitik AI untuk Intelijen Ancaman**

Komponen AI berfungsi untuk mengekstrak wawasan tingkat tinggi dari data
serangan yang berhasil dideteksi, mengubahnya menjadi intelijen ancaman
proaktif. Sistem menggunakan OpenAI-compatible chat completions API yang
bersifat provider-agnostic, sehingga dapat bekerja dengan berbagai
provider AI seperti OpenAI, OpenRouter, Anthropic (Claude), dan lainnya.
Pipeline AI analytics bekerja sebagai berikut:

1.  Data Preparation: Sistem menyiapkan ringkasan data insiden dan
    statistik keamanan yang terstruktur.

2.  Prompt Construction: System prompt dan user prompt dikonstruksi
    secara dinamis berdasarkan data yang tersedia, memberikan konteks
    spesifik kepada AI sebagai cybersecurity analyst.

3.  AI Processing: Data dan prompt dikirimkan ke LLM eksternal melalui
    API untuk dianalisis.

4.  Response Parsing: Respons AI di-parse menjadi laporan terstruktur
    yang mencakup lima komponen utama.

> Laporan AI yang dihasilkan mencakup:

- Executive Summary: Ringkasan eksekutif status keamanan untuk
  manajemen.

- Pattern Analysis: Identifikasi pola serangan yang berulang dan vektor
  serangan dominan.

- Trend Analysis: Analisis tren perubahan dalam landscape ancaman.

- Risk Assessment: Penilaian tingkat risiko keamanan secara keseluruhan
  dengan severity scoring.

- Recommendations: Rekomendasi tindakan pencegahan lanjutan yang
  spesifik dan dapat ditindaklanjuti.

## 2.3 PENELITIAN TERKAIT

Penelitian terkait dapat menjadi referensi antara penelitian yang
dilakukan dengan penelitian yang sudah ada, selain itu dapat menjadi
perbandingan terkait kelebihan dan kekurangan antara penelitian yang
terdahulu dan penelitian sekarang.

### **2.3.1 Deep Learning Algorithms Used in Intrusion Detection Systems** \[4\]

Penelitian ini dilakukan oleh Richard Kimanzi, Peter Kimanga, Dedan
Cherori, dan Patrick K. Gikunda dari Department of Computer Science,
Dedan Kimathi University of Technology, Kenya, pada tahun 2024.
Penelitian ini menyajikan tinjauan sistematis terhadap algoritma deep
learning yang digunakan dalam sistem deteksi intrusi selama lima tahun
terakhir (2019-2023), dengan fokus pada berbagai arsitektur seperti
Convolutional Neural Networks (CNN), Recurrent Neural Networks (RNN),
Deep Belief Networks (DBN), Deep Neural Networks (DNN), Long Short-Term
Memory (LSTM), autoencoders (AE), Multi-Layer Perceptrons (MLP), dan
Self-Normalizing Networks (SNN). Studi ini menganalisis kekuatan dan
keterbatasan setiap pendekatan deep learning dalam hal akurasi deteksi,
efisiensi komputasi, skalabilitas, dan adaptabilitas terhadap ancaman
yang berkembang, dengan menggunakan dataset benchmark seperti KDD99,
NSL-KDD, UNSW-NB15, CICIDS2017, dan BoT-IoT untuk evaluasi performa.
Penelitian menunjukkan bahwa model hybrid dan teknik seperti CNN dengan
Fast Fourier transformation mencapai akurasi hingga 99%, sementara
beberapa model seperti APAE dan DNN-based systems menunjukkan performa
superior dalam mendeteksi serangan DDoS dan anomali jaringan IoT. Tujuan
utama penelitian ini adalah memberikan wawasan komprehensif kepada
peneliti dan praktisi industri tentang algoritma deep learning terdepan
untuk meningkatkan kerangka keamanan lingkungan jaringan melalui deteksi
intrusi yang lebih robust dan efisien.

### **2.3.2 A Systematic Review on the Integration of Explainable Artificial Intelligence in Intrusion Detection Systems to Enhancing Transparency and Interpretability in Cybersecurity** \[5\]

Penelitian ini dilakukan oleh Vincent Zibi Mohale dan Ibidun Christiana
Obagbuwa dari Sol Plaatje University, South Africa, tahun 2025.
Penelitian ini menyajikan systematic review tentang integrasi
Explainable Artificial Intelligence (XAI) dalam Intrusion Detection
Systems (IDS) untuk meningkatkan transparansi dan interpretabilitas
dalam cybersecurity. Dengan mengikuti guidelines PRISMA, penelitian ini
menganalisa 20 studi yang dipilih dari 78 artikel awal melalui database
IEEE Xplore, SpringerLink, ScienceDirect, dan ACM Digital Library untuk
periode 2017-2023, mengevaluasi berbagai teknik XAI seperti SHAP, LIME,
rule-based models, dan hybrid models. Temuan utama menunjukkan bahwa
model berbasis aturan dan tree-based XAI lebih disukai karena
interpretabilitasnya meskipun masih menghadapi trade-off dengan akurasi
deteksi, serta mengidentifikasi kesenjangan dalam standardisasi dan
skalabilitas. Tujuan penelitian ini adalah memberikan framework
konseptual bagi peneliti dan praktisi dalam memilih teknik XAI
berdasarkan kebutuhan operasional spesifik untuk mendukung pengembangan
cybersecurity yang lebih transparan dan resilient.

### **2.3.3 Developers A Study of SSRF Defenses in PHP Applications** \[6\]

Dalam aplikasi web PHP, yaitu penelitian oleh Wessels et al. yang
menganalisis kerentanan SSRF dan mekanisme pertahanan dalam 27.078
aplikasi PHP open-source menggunakan framework analisis statis SURFER
berbasis Code Property Graph (CPG). Penelitian tersebut menemukan bahwa
mayoritas aplikasi rentan terhadap SSRF karena kurangnya implementasi
mekanisme pertahanan yang memadai, dengan hanya dua aplikasi yang
menerapkan fitur SSR yang aman. Sementara itu, penelitian yang Anda
rujuk tentang implementasi K-Means untuk klasterisasi data stunting di
Jawa Barat memiliki domain yang berbeda, yaitu analisis data kesehatan
menggunakan teknik clustering untuk mengelompokkan kabupaten/kota
berdasarkan tingkat stunting guna mendukung pengambilan keputusan
pemerintah dalam penanggulangan stunting.

### **2.3.4 A Survey on Intrusion Detection System Based on Deep Learning** \[2\]

Penelitian ini dilakukan oleh Saddam Hussain, Professor Santosh Nagar,
dan Professor Anurag Shrivastava dari CSE, NIIST, pada tahun 2025.
Penelitian ini menyajikan survei komprehensif tentang sistem deteksi
intrusi berbasis deep learning yang mengeksplorasi arsitektur seperti
Convolutional Neural Networks (CNN), Recurrent Neural Networks (RNN),
dan model hybrid untuk meningkatkan akurasi deteksi ancaman siber. Studi
ini menganalisis kemampuan deep learning dalam mengatasi keterbatasan
metode tradisional signature-based dan statistical approaches yang
sering gagal mendeteksi serangan canggih seperti zero-day attacks dan
polymorphic malware. Penelitian mengkaji berbagai teknik deep learning
yang mencapai akurasi deteksi hingga 92% dengan tingkat false alarm
rendah, sambil mengidentifikasi tantangan utama seperti penanganan
dataset tidak seimbang, biaya komputasi tinggi, dan ketahanan terhadap
adversarial attacks. Tujuan utama penelitian ini adalah memberikan
pemahaman komprehensif tentang peran transformatif deep learning dalam
membangun IDS yang robust dan efisien untuk kebutuhan keamanan siber
modern, serta mengidentifikasi tren emerging seperti explainable AI,
transfer learning, dan federated learning sebagai arah penelitian masa
depan.

**Tabel 2.2 : Perbandingan Penelitian Terkait**

+-----------------+-------+--------------+------------------+------------------+
| Peneliti/Sumber | Tahun | Fokus        | Temuan           | Relevansi dengan |
|                 |       | Penelitian   | Utama/Kontribusi | Proyek IDPS      |
+-----------------+-------+--------------+------------------+------------------+
| Richard Kimanzi | 2024  | Tinjauan     | Menganalisis     | Memberikan       |
|                 |       | algoritma    | kekuatan dan     | konteks untuk    |
|                 |       | *Deep        | kelemahan        | tren masa depan  |
|                 |       | Learning*    | berbagai         | dalam evolusi    |
|                 |       | (DL) untuk   | arsitektur DL    | IDS dan          |
|                 |       | IDS          | (CNN, RNN, LSTM) | memvalidasi      |
|                 |       |              | untuk deteksi    | pendekatan       |
|                 |       |              | anomali.         | hibrida (SIDS +  |
|                 |       |              |                  | AI).             |
|                 |       |              | (Kimanzi et al., |                  |
|                 |       |              | 2024)            |                  |
+-----------------+-------+--------------+------------------+------------------+
| Vincent Zibi    | 2020  | Tinjauan     | Menekankan       | Secara langsung  |
| Mohale dan      |       | sistematis   | pentingnya XAI   | mendukung desain |
| Ibidun          |       | tentang      | untuk mengatasi  | fitur respons    |
| Christiana      |       | *Explainable | masalah,         | intelijen AI     |
| Obagbuwa        |       | AI* (XAI)    | meningkatkan     | sebagai bentuk   |
|                 |       | dalam IDS    | kepercayaan      | XAI, yang        |
|                 |       |              | analis, dan      | memberikan       |
|                 |       |              | mengurangi       | transparansi dan |
|                 |       |              | *false           | konteks.         |
|                 |       |              | positive*.       |                  |
|                 |       |              |                  |                  |
|                 |       |              | (Mohale &        |                  |
|                 |       |              | Obagbuwa, 2025)  |                  |
+-----------------+-------+--------------+------------------+------------------+
| Malte Wessels   | 2024  | Analisis     | Menemukan bahwa  | Menegaskan       |
|                 |       | skala besar  | lebih dari       | kembali urgensi  |
|                 |       | kerentanan   | separuh aplikasi | dan relevansi    |
|                 |       | SSRF         | yang dianalisis  | dari penargetan  |
|                 |       |              | tidak memiliki   | spesifik         |
|                 |       |              | pertahanan       | terhadap         |
|                 |       |              | terhadap SSRF,   | serangan SSRF    |
|                 |       |              | menyoroti        | dalam sistem     |
|                 |       |              | prevalensi       | IDPS.            |
|                 |       |              | masalah          |                  |
|                 |       |              | tersebut.        |                  |
|                 |       |              |                  |                  |
|                 |       |              | (Wessels et al., |                  |
|                 |       |              | 2024)            |                  |
+-----------------+-------+--------------+------------------+------------------+
| Saddam Hussain  | 2025  | Survei IDS   | Mengidentifikasi | Menginformasikan |
|                 |       | berbasis     | tantangan utama  | keputusan desain |
|                 |       | *Deep        | dalam DL-IDS     | untuk            |
|                 |       | Learning*    | seperti dataset  | memanfaatkan API |
|                 |       |              | yang tidak       | AI eksternal     |
|                 |       |              | seimbang dan     | daripada         |
|                 |       |              | kebutuhan        | membangun model  |
|                 |       |              | komputasi yang   | DL internal,     |
|                 |       |              | tinggi.          | untuk            |
|                 |       |              |                  | menghindari      |
|                 |       |              | (Hussain et al., | tantangan ini    |
|                 |       |              | 2025)            |                  |
+=================+=======+==============+==================+==================+

##  **2.4 DESAIN SISTEM**

Desain sistem merupakan sebuah tahap dalam pengembangan sistem yang
terdiri dari proses pendefinisian arsitektur, komponen, modul,
antarmuka, dan data untuk memenuhi persyaratan atau kebutuhan yang telah
didefinisikan untuk mencapai sebuah solusi yang efektif. Tahap ini juga
memfasilitasi identifikasi potensi masalah sejak dini sehingga solusi
dapat diimplementasikan secara tepat.

### 2.4.1 Desain Alur Sistem

1.  **Alur Admin dengan Analaitik AI**

Administrator sistem berinteraksi dengan dashboard untuk memonitor,
menganalisis, dan mengelola data serangan:

1.  Admin mengakses dashboard dan melihat statistik keamanan real-time
    (total serangan, IP diblokir, distribusi kategori).

2.  Admin melihat daftar insiden serangan dengan detail lengkap dan
    dapat melakukan filter serta pencarian.

3.  Admin mengelola daftar IP yang diblokir (unblock manual, lihat
    detail strike).

4.  Admin memilih data insiden untuk dianalisis dan men-trigger AI
    Analytics.

5.  Sistem mengirimkan data insiden terstruktur ke LLM eksternal melalui
    OpenAI-compatible API.

6.  AI memproses data dan menghasilkan laporan komprehensif (executive
    summary, pattern analysis, trend analysis, risk assessment,
    recommendations).

7.  Laporan AI ditampilkan di dashboard dan disimpan ke database
    Appwrite untuk referensi.

8.  Admin dapat mengkonfigurasi parameter sistem seperti confidence
    threshold, maximum strikes, dan durasi pemblokiran.

![](media/image19.png){width="4.251077209098862in"
height="3.2083333333333335in"}

**Gambar 2.1 Alur Admin**

**2. Alur Deteksi dan Pencegahan Serangan**

Alur utama sistem Xpecto Shield dalam mendeteksi dan mencegah serangan
web diilustrasikan sebagai berikut:

1.  HTTP Request masuk ke aplikasi Next.js dan diintercept oleh Shield
    Middleware.

2.  Middleware memeriksa apakah path termasuk dalam protectedPaths dan
    bukan excludePaths.

3.  IP klien diperiksa terhadap whitelist dan block cache. Jika IP
    diblokir, request langsung ditolak.

4.  Request Analyzer mengekstrak seluruh input yang dapat dipindai (URL
    path, query params, headers, cookies, body).

5.  Multi-Layer Input Decoder menormalisasi seluruh input melalui 6
    lapisan dekoding.

6.  Detection Engine (Aho-Corasick) melakukan multi-pattern matching
    terhadap seluruh input.

7.  Precision Validator menghitung confidence score untuk setiap
    kandidat kecocokan.

8.  Jika ancaman terdeteksi (score \> threshold), sistem mencatat strike
    untuk IP tersebut.

9.  Jika jumlah strike mencapai maxStrikes, IP otomatis diblokir.

10. Incident log dibuat dan dikirim ke backend (Appwrite) secara
    asinkron.

11. Block response dikembalikan ke klien (HTML page atau JSON error).

12. Jika tidak ada ancaman, request diteruskan ke aplikasi.

![](media/image18.png){width="4.729166666666667in"
height="6.2892355643044615in"}

**Gambar 2.3 *User request url***

### 2.4.2 Desain Sistem Arsitektur

Xpecto Shield dikembangkan sebagai library TypeScript yang terintegrasi
dengan framework Next.js. Arsitektur sistem terdiri dari empat lapisan
utama yang saling terintegrasi:

![](media/image3.png){width="4.251077209098862in"
height="2.388888888888889in"}

***Gambar 2.4 Desain sistem dari solusi yang ditawarkan***

1.  **Client App**

> *Client App* merupakan antarmuka utama yang digunakan oleh pengguna
> untuk berinteraksi dengan sistem, baik melalui aplikasi web di
> browser. Aplikasi ini berjalan di sisi klien *client-side* dan
> bertugas untuk mengirimkan permintaan *request* ke server backend
> melalui jaringan internet, serta menerima respons *respons* yang
> kemudian diolah dan disajikan secara visual kepada pengguna.

2.  **TypeScript + Next.js (Framework)**

> TypeScript digunakan sebagai bahasa pemrograman utama karena
> menyediakan static typing yang memastikan keamanan tipe data di
> seluruh codebase. Next.js 15.5+ dengan App Router digunakan sebagai
> full-stack framework yang mendukung dua mode runtime:

- Node.js Runtime: Mendukung filesystem access untuk memuat payload dari
  file secara dinamis.

- Edge Runtime: Mode ringan yang menggunakan compiled payloads yang
  sudah di-bundle untuk performa optimal di environment serverless
  seperti Vercel Edge Functions.

> Pemilihan Next.js didasarkan pada popularitasnya sebagai framework
> React full-stack terdepan dan dukungannya terhadap middleware native
> yang memungkinkan intercept request di level framework, sebelum
> request mencapai logika aplikasi.

3.  **Core Layer - Detection Engine**

> Core layer mencakup seluruh komponen inti yang bertanggung jawab untuk
> deteksi ancaman:

- *AhoCorasickAutomaton*: Implementasi algoritma Aho-Corasick untuk
  multi-pattern matching. Membangun trie dan failure links saat
  inisialisasi, kemudian melakukan pencarian dalam O(n) per request.

- *InputDecoder*: Pipeline dekoding berlapis 6 tahap untuk normalisasi
  input dan mengalahkan teknik evasion.

- *DetectionEngine*: Modul koordinasi yang menggabungkan input decoding,
  Aho-Corasick matching, dan precision validation menjadi satu pipeline
  analisis.

4.  **React.js**

> React.js adalah sebuah pustaka library JavaScript yang populer,
> dikembangkan oleh Facebook, dan digunakan secara luas dalam
> pengembangan antarmuka pengguna web. React.js berfokus pada pembuatan
> komponen UI yang interaktif, memiliki *state* stateful, dan dapat
> digunakan kembali *reusable*, sehingga sangat efisien untuk membangun
> aplikasi web berskala besar dan kompleks. sebagai fondasi untuk **Web
> App Dashboard Admin**. Aplikasi web ini menjadi penghubung antara
> pengguna di perangkat desktop atau laptop dengan server. React.js
> bertugas untuk :

1.  mengirimkan *request* ke RESTful API yang dibangun menggunakan Go,

2.  menerima dan mengolah *response* yang berisi data untuk ditampilkan
    dalam bentuk dasbor, tabel, formulir, dan elemen visual lainnya yang
    mudah dipahami oleh pengguna.

**2.4.3 Use Case Diagram**

Use Case Diagram menggambarkan interaksi antara berbagai level pengguna
dengan sistem informasi Ababil Learning Center dan Companion App, serta
menampilkan hubungan dan keterkaitan antara use case yang ada untuk
mendukung pelaksanaan fungsi-fungsi utama sistem.

![](media/image15.png){width="4.251077209098862in"
height="2.8194444444444446in"}

***Gambar 2.5 Use Case Diagram***

1.  **Web Administrator**

pengguna yang memiliki peran penting dalam menjaga keamanan sistem.
Tugas utamanya meliputi pemantauan aktivitas sistem dan log keamanan,
konfigurasi mekanisme deteksi serangan, serta pengelolaan respons
terhadap insiden keamanan seperti pemblokiran alamat IP yang
mencurigakan

2.  **Hacker**

aktor eksternal yang memiliki tujuan untuk mengeksploitasi kerentanan
pada sistem. Interaksi Hacker dengan sistem umumnya berupa upaya untuk
mengirimkan berbagai jenis input atau payload berbahaya guna mendapatkan
akses tidak sah, mencuri data, atau mengganggu layanan.

### 2.4.4 Data Flow Diagram

Data Flow Diagram menggambarkan aliran data antara entitas luar dengan
sistem, serta memperlihatkan bagaimana data diproses, disimpan, dan
diteruskan antar komponen dalam sistem.

**DFD Level 0**

![](media/image7.jpg){width="4.251077209098862in"
height="3.513888888888889in"}

***Gambar 2.6 Data flow diagram level 0***

Sistem Aspri Cyber menerima input dari Hacker berupa \"Mengumpulkan
Informasi\", \"Mencoba teknik exploitasi\", \"Exploitasi Automation\",
dan \"Exploitasi Manual\". Kemudian, sistem memproses informasi tersebut
dan menghasilkan output yang dikirimkan kepada Admin, yaitu
\"Mengirimkan Notifikasi\", \"Mendeteksi Exploitasi\", \"Memblokir IP
Address\", dan \"Memberikan saran mitigasi\".

Secara ringkas, DFD Level 0 ini mengilustrasikan interaksi utama antara
entitas eksternal (Hacker dan Admin) dengan Sistem Aspri Cyber,
menunjukkan aliran data masuk dari Hacker yang berpotensi sebagai
ancaman, dan aliran data keluar ke Admin sebagai tindakan respons dan
mitigasi dari sistem

**DFD Level 1**

![](media/image5.jpg){width="4.251077209098862in"
height="3.4166666666666665in"}

***Gambar 2.7 Data Flow Diagram Level 1***

Secara keseluruhan, DFD Level 1 ini merinci bagaimana sistem mendeteksi
ancaman dari Hacker melalui proses Celah Keamanan, kemudian mencoba
mencegahnya melalui Pencegahan Exploitasi (termasuk memblokir IP),
melakukan mitigasi terhadap serangan yang mungkin berulang melalui
proses Mitigasi, dan memanfaatkan Analitis Berbasi AI untuk analisis
mendalam. Semua aktivitas ini dilaporkan dan dikelola oleh Admin.

DFD Level 2

![](media/image22.jpg){width="4.251077209098862in"
height="3.5555555555555554in"}

***Gambar 2.8 Data flow Diagram level 2 Celah Keamanan***

informasi hasil deteksi teknik exploitasi tersebut) dikumpulkan atau
diteruskan ke entitas atau proses selanjutnya yang di DFD Level 1
direpresentasikan sebagai output dari \"Celah Keamanan\" (misalnya, ke
Admin atau ke proses Pencegahan Exploitasi). Dalam diagram ini, semua
output tersebut mengarah kembali ke sebuah titik yang merepresentasikan
agregasi atau hasil dari proses \"Celah Keamanan\" secara keseluruhan.

Singkatnya, DFD Level 2 untuk \"Celah Keamanan\" ini mengilustrasikan
bagaimana sistem secara modular mendeteksi berbagai jenis teknik
serangan umum yang dilancarkan oleh Hacker, dengan masing-masing jenis
serangan ditangani oleh sub-prosesnya sendiri.

![](media/image8.jpg){width="4.251077209098862in"
height="4.111111111111111in"}

***Gambar 2.9 Data flow diagram level 2 Pencegahan Exploitasi***

Setiap sub-proses deteksi ini berinteraksi dengan Detection engine.
Mereka mengirimkan \"File deteksi engine\" ke Detection engine dan juga
tampaknya menerima \"File deteksi engine\" dari Detection engine. Ini
mengindikasikan bahwa Detection engine bisa jadi merupakan basis data
signature, aturan deteksi, atau modul analisis yang digunakan dan
diperbarui oleh masing-masing sub-proses deteksi.

Hasil dari setiap sub-proses deteksi payload ini, berupa \"File deteksi
engine\" (yang dalam konteks ini kemungkinan berarti laporan deteksi
atau file yang berisi informasi mengenai payload yang terdeteksi),
dikirimkan kepada Admin.

DFD Level 2 untuk \"Pencegahan Exploitasi\" ini menggambarkan bagaimana
sistem melakukan deteksi terhadap berbagai jenis payload berbahaya.
Setiap jenis payload dianalisis oleh sub-prosesnya masing-masing yang
memanfaatkan dan mungkin juga mengupdate sebuah Detection engine
sentral. Informasi hasil deteksi dari semua jenis serangan ini kemudian
dilaporkan kepada Admin untuk tindakan lebih lanjut yang mengarah pada
pencegahan.

![](media/image6.jpg){width="4.251077209098862in"
height="3.263888888888889in"}

***Gambar 2.10 Data flow diagram level 2 Mitigasi***

Semua sub-proses dalam Mitigasi ini berkontribusi pada Update File
Projek. Ini mengindikasikan bahwa \"Update File Projek\" merupakan log
aktivitas mitigasi, repositori patch, dokumentasi konfigurasi keamanan
yang telah diperbarui, atau basis data status keamanan sistem.

Secara ringkas, DFD Level 2 untuk \"Mitigasi\" ini menggambarkan
bagaimana sistem, di bawah arahan Admin, melakukan serangkaian tindakan
untuk mengatasi kerentanan dan menjaga keamanan. Tindakan-tindakan ini
meliputi analisis, penutupan celah, pembaruan, dan pemeliharaan rutin,
di mana semua hasilnya dicatat atau digunakan untuk memperbarui status
atau konfigurasi proyek/sistem.

![](media/image2.jpg){width="4.251077209098862in"
height="3.4444444444444446in"}

***Gambar 2.11 Data flow diagram level 2 Analitik AI***

Menguraikan lebih detail proses Analitik AI dari DFD Level 1. Proses ini
dipecah menjadi beberapa sub-proses yang memanfaatkan kecerdasan buatan
untuk berbagai fungsi analisis dan respons keamanan. Semua sub-proses
ini berinteraksi dengan sumber daya AI api keys LLM dan melaporkan
hasilnya kepada Admin.

DFD Level 2 untuk \"Analitik AI\" menunjukkan bagaimana sistem
menggunakan berbagai modul AI yang ditenagai oleh sumber daya LLM untuk
melakukan deteksi anomali, analisis log, penemuan celah otomatis, dan
respons otomatis. Semua output dan temuan dari aktivitas analitik AI ini
disediakan untuk Admin guna pengambilan keputusan dan tinjauan lebih
lanjut.

### 2.4.5 Entity Relationship Diagram

ERD ini secara komprehensif merancang struktur basis data yang bertujuan
untuk mengelola dan menghubungkan berbagai aspek informasi dalam Sistem
Aspri Cyber. Sistem ini dirancang untuk menangani data mulai dari
entitas pengguna seperti admin yang memiliki peran dan detail login,
hingga sistem aspri cyber yang menjadi objek perlindungan dengan atribut
seperti nama dan versinya. Di sisi ancaman, terdapat entitas hacker yang
mencatat informasi pelaku potensial, serta vulnerability yang
mendetailkan setiap celah keamanan yang ditemukan beserta tingkat
keparahannya dan identifikasi CVE. Selain itu, sistem juga mengenali
payload sebagai entitas yang menyimpan informasi spesifik mengenai
muatan berbahaya, dan detection_engine yang merepresentasikan perangkat
atau mekanisme pendeteksi ancaman.

![](media/image11.png){width="4.251077209098862in"
height="3.0277777777777777in"}

***Gambar 2.12 Desain Entity Relationship Diagram Sistem***

## 2.5 MOCKUP WEBSITE

Mockup merupakan representasi visual dari sebuah produk untuk memberikan
gambaran sebelum produk tersebut diimplementasikan, dalam konteks ini
representasi visualnya berupa user interface. User interface sendiri
terdiri dari tata letak halaman, warna, ikon, dan tipografi. Berikut
merupakan mockup sementara dari Sistem Deteksi Serangan, Pencegahan
Eksploitasi, dan Mitigasi dengan Analitik Berbasis AI

### Login page

![](media/image1.png){width="4.251077209098862in"
height="3.6527777777777777in"}

***Gambar 2.13 Login Page***

Halaman ini berfungsi sebagai gerbang utama untuk mengakses dasbor dan
fitur-fitur manajemen lainnya. Pengguna (administrator) harus memasukkan
*username* dan *password* yang valid untuk dapat masuk ke dalam sistem.
Ini adalah lapisan keamanan pertama untuk memastikan hanya pihak yang
berwenang yang dapat mengelola dan memonitor sistem.

### Dashboard sidebar admin

![](media/image10.png){width="2.7083333333333335in" height="3.5625in"}

***Gambar 2.14 Dashboard Sidebar Admin***

menu navigasi utama yang menjadi pusat kendali sistem. Menu ini
memberikan akses cepat ke semua modul fungsional:

1.  **Beranda:** Menampilkan ringkasan status keamanan secara
    keseluruhan.

2.  **Deteksi Serangan:** Menampilkan log dan detail dari semua serangan
    yang terdeteksi.

3.  **Daftar IP Diblokir:** Mengelola daftar alamat IP yang diblokir
    secara otomatis maupun manual.

4.  **Laporan Mitigasi:** Menyajikan laporan insiden keamanan yang telah
    ditangani.

5.  **Pengaturan:** Tempat untuk mengonfigurasi semua parameter sistem.

### Dashboard admin

![](media/image9.png){width="4.251077209098862in"
height="2.763888888888889in"}

***Gambar 2.15 Dashboard Admin***

Halaman **Beranda (Dashboard Overview)** menyajikan pandangan tingkat
tinggi (at-a-glance) dari status keamanan sistem. Halaman ini
menampilkan metrik-metrik kunci seperti:

1.  **Total Attacks Detected:** Jumlah total serangan yang berhasil
    dideteksi.

2.  **IPs Blocked:** Jumlah alamat IP yang sedang dalam status diblokir.

3.  **Active Threats:** Ancaman aktif yang memerlukan perhatian segera.

4.  **System Health:** Indikator kesehatan sistem secara keseluruhan.

Selain itu, halaman ini juga menampilkan tabel **\"Recent Attack
Detections\"** yang berisi daftar serangan terbaru, lengkap dengan jenis
serangan, waktu, IP pelaku, dan payload yang digunakan. Ini merupakan
implementasi dari fungsi **Deteksi** pada sistem

### Dashboard admin deteksi serangan

![](media/image4.png){width="4.251077209098862in"
height="2.7777777777777777in"}

***Gambar 2.16 Dashboard Admin Deteksi Serangan***

Halaman **Deteksi Serangan (Attack Detection)** menyediakan analisis
mendalam tentang semua ancaman yang terdeteksi. Administrator dapat
melakukan pencarian dan penyaringan (filter) berdasarkan IP, payload,
jenis serangan, status, dan rentang waktu. Halaman ini menampilkan KPI
(Key Performance Indicator) dari mesin deteksi, seperti:

1.  **Tingkat Deteksi:** Persentase keberhasilan sistem dalam mendeteksi
    serangan.

2.  **False Positive Rate:** Persentase alarm palsu yang dihasilkan.

3.  **Waktu Respon Rata-rata:** Kecepatan sistem dalam mendeteksi sebuah
    serangan.

### Dashboard admin Daftar IP Di Blokir

![](media/image14.png){width="4.251077209098862in"
height="0.9861111111111112in"}

***Gambar 2.17 Dashboard Admin Daftar IP di Blokir***

Halaman **Blocked IPs (Daftar IP Diblokir)** adalah inti dari fungsi
**Pencegahan Exploitasi**. Halaman ini menampilkan semua alamat IP yang
telah diblokir oleh sistem. Informasi yang disajikan mencakup alasan
pemblokiran (misalnya, terlalu banyak percobaan serangan), status
(permanen atau temporer), jumlah serangan dari IP tersebut, dan sejak
kapan IP itu diblokir. Administrator juga dapat melakukan aksi manual
seperti membuka blokir atau memblokir IP secara permanen dari halaman
ini.

### Dashboard admin Laporan Mitigasi

![](media/image21.png){width="4.251077209098862in"
height="2.0972222222222223in"}

***Gambar* 2.18 Dashboard Admin Laporan Mitigasi**

Halaman **Security Reports (Laporan Mitigasi)** berfungsi untuk melihat
dan menganalisis insiden keamanan secara historis. Halaman ini
memungkinkan administrator untuk memfilter laporan berdasarkan jenis,
tingkat keparahan (severity), dan status resolusi (pending, resolved).
Fitur **Export Reports** memungkinkan data ini diekspor untuk keperluan
audit atau dokumentasi. Ini adalah bagian penting dari siklus
**Mitigasi**, di mana insiden yang sudah ditangani didokumentasikan dan
dianalisis.

### Dashboard admin Pengaturan - Deteksi Serangan

![](media/image23.png){width="4.251077209098862in"
height="1.2777777777777777in"}

***Gambar* 2.19 Dashboard admin Pengaturan - Deteksi Serangan**

halaman konfigurasi untuk modul **Deteksi Serangan**. Administrator
dapat menyesuaikan parameter deteksi, seperti:

1.  **Threshold:** Menentukan batas percobaan serangan (misalnya, 3 kali
    percobaan SQL Injection) sebelum alarm terpicu.

2.  **Scan Interval:** Frekuensi pemindaian log atau trafik.

3.  **Enable AI-powered threat detection:** Pilihan untuk mengaktifkan
    atau menonaktifkan mesin deteksi berbasis AI, yang menjadi inti dari
    judul tugas akhir Anda. Ini menunjukkan bahwa sistem dapat beralih
    antara deteksi berbasis aturan (rule-based) dan deteksi cerdas
    (AI-based).

### Dashboard admin Pengaturan - Pemblokiran IP

![](media/image20.png){width="4.251077209098862in"
height="1.3194444444444444in"}

***Gambar 2.20 Dashboard Admin Pengaturan - Pemblokiran IP***

Halaman pengaturan **Pemblokiran IP (IP Blocking)** adalah tempat untuk
mengonfigurasi kebijakan **Pencegahan** otomatis. Administrator dapat
mengatur:

1.  **Auto-Block Duration:** Durasi pemblokiran otomatis (dalam jam).

2.  **Maximum Strikes Before Block:** Jumlah serangan yang diizinkan
    dari satu IP sebelum diblokir secara otomatis.

3.  **Whitelist IP Addresses:** Daftar IP yang dikecualikan dari aturan
    pemblokiran otomatis (misalnya, IP internal kantor).

4.  **Enable automatic IP blocking:** Saklar utama untuk mengaktifkan
    fitur pencegahan proaktif ini.

### Dashboard admin Pengaturan - Notifikasi

![](media/image17.png){width="4.251077209098862in"
height="1.3888888888888888in"}

***Gambar 2.21 Dashboard Admin Pengaturan - Notifikasi***

Halaman pengaturan **Notifikasi** memungkinkan administrator untuk
mengelola sistem peringatan. Fitur ini penting untuk **Mitigasi** yang
cepat. Pengguna dapat memilih kanal notifikasi (Browser Push, Telegram).

### Dashboard Admin Pengaturan - Backup & Log

![](media/image13.png){width="4.251077209098862in"
height="1.3194444444444444in"}

***Gambar 2.22 Dashboard Admin Pengaturan - Backup & Log***

Halaman **Backup & Log** berfungsi untuk mengelola data sistem dan log
keamanan. Administrator dapat mengkonfigurasi pencadangan otomatis,
interval pencadangan, dan periode retensi (penyimpanan) untuk data
backup maupun data log. Fitur **Restore From Backup** sangat penting
untuk pemulihan pasca-insiden. Pengelolaan log yang baik juga krusial
untuk keperluan **Analitik** dan forensik digital jangka panjang.

### Dashboard Admin Pengaturan - Sistem

![](media/image12.png){width="4.251077209098862in"
height="1.0972222222222223in"}

***Gambar 2.23 Dashboard Admin Pengaturan - Sistem***

Halaman **Pengaturan Sistem (System Settings)** ini berisi konfigurasi
umum yang berkaitan dengan preferensi antarmuka dan fungsionalitas dasar
aplikasi. Halaman ini tidak secara langsung mengatur logika deteksi atau
pencegahan, namun sangat penting untuk kegunaan dan keamanan sistem
manajemen itu sendiri.

##  

##  

# BAB 3 EKSPERIMEN

### Bab ini menjelaskan tahap eksperimen yang dilakukan terhadap sistem Xpecto Shield, yaitu sistem deteksi dan pencegahan eksploitasi web berbasis Next.js Middleware, Appwrite, dan analitik AI. Eksperimen difokuskan pada pengujian kemampuan sistem dalam mendeteksi payload berbahaya, memblokir sumber serangan secara otomatis berdasarkan kebijakan strike, mencatat insiden secara terstruktur, serta menyajikan ringkasan analitik untuk mendukung pengambilan keputusan keamanan aplikasi web. 

## 3.1 PARAMETER EKSPERIMEN

#### Parameter ujicoba disusun agar dapat merepresentasikan kebutuhan fungsional dan non-fungsional sistem Xpecto Shield pada lingkungan pengembangan (local environment) dan simulasi integrasi aplikasi host. 

#### Parameter Fungsional

- Deteksi serangan multi-kategori (SQL Injection, Cross-Site Scripting,
  Path Traversal, Local File Inclusion, dan Server-Side Request
  Forgery).

- Analisis multi-permukaan input pada request: URL path, query
  parameter, body, header, dan cookie.

- Pemblokiran akses secara otomatis saat IP mencapai ambang batas strike
  sesuai konfigurasi.

- Pencatatan insiden keamanan ke basis data Appwrite secara terstruktur.

- Penyediaan API dashboard untuk statistik insiden, daftar IP terblokir,
  dan konfigurasi sistem.

- Pemanggilan analitik AI untuk menghasilkan ringkasan pola serangan,
  level risiko, dan rekomendasi mitigasi.

#### Parameter Non-Fungsional

- Kinerja deteksi: proses pemindaian request ditargetkan tetap ringan
  dengan pendekatan Aho-Corasick (single pass matching) dan validasi
  presisi tahap kedua.

- Keandalan: sistem tetap dapat melanjutkan alur aplikasi host ketika
  terjadi gangguan non-kritis (misalnya kegagalan layanan AI), tanpa
  menurunkan fungsi inti proteksi request.

- Keamanan data: validasi input API dashboard, pembatasan akses endpoint
  admin melalui authCheck, dan pemisahan konfigurasi rahasia menggunakan
  environment variable.

- Kemudahan integrasi: library dapat dipasang pada aplikasi Next.js
  dengan perubahan minimum pada middleware, API route, dan halaman
  dashboard admin.

## 3.2 KARAKTERISTIK DATA

Karakteristik data mendeskripsikan jenis, sumber, sifat, dan struktur
data yang digunakan dalam pengembangan serta pengujian sistem Xpecto
Shield. Data merupakan komponen fundamental yang menentukan efektivitas
deteksi, karena algoritma Aho-Corasick bekerja berdasarkan pencocokan
input terhadap kumpulan pola serangan yang telah terdefinisi. Selain
data payload serangan, sistem juga mengelola data operasional berupa log
insiden, daftar IP yang diblokir, laporan analisis AI, dan konfigurasi
sistem. Bagian ini menguraikan secara rinci karakteristik dari setiap
jenis data yang digunakan, sumber perolehannya, alasan pemilihan, serta
keterbatasan yang dihadapi dalam proses pengumpulan data.

### 3.2.1 Dataset Payload Serangan

Dataset payload serangan merupakan komponen utama dari sistem Xpecto
Shield. Dataset ini berisi kumpulan string serangan yang telah
dikategorikan berdasarkan jenis ancaman. Setiap file payload berisi satu
pola serangan per baris yang dimuat ke dalam Aho-Corasick automaton
untuk pencocokan multi pattern secara simultan. Berikut adalah rincian
dataset payload yang digunakan:

  ---------------------------------------------------------------
  **No**        **Kategori    **Nama File**        **Jumlah
                Serangan**                         Payload**
  ------------- ------------- -------------------- --------------
  1             SQL Injection sqli.txt             \~600
                (SQLi)                             

  2             Cross-Site    xss.txt              \~5.500
                Scripting                          
                (XSS)                              

  3             Local File    lfi.txt              \~2.300
                Inclusion                          
                (LFI)                              

  4             Server-Side   ssrf.txt             \~150
                Request                            
                Forgery                            
                (SSRF)                             

  5             Path          path-traversal.txt   \~2.500
                Traversal                          

  **6**         **Total**     **-**                **\~11.050**
  ---------------------------------------------------------------

### *Tabel 3.1: Rincian Dataset Payload Serangan*

### 

### 

### 3.2.2 Sumber Data

### Sumber data yang digunakan dalam sistem ini berasal dari:

### Payload database open-source yang dikumpulkan dari berbagai sumber keamanan siber, termasuk repository SecLists, *PayloadsAllTheThings*, dan *OWASP Testing Guide*.

### Data serangan yang dihasilkan dari pengujian penetrasi manual menggunakan teknik evasion lanjutan.

### Data input simulasi yang dirancang untuk menguji false positive detection, yaitu input aman yang mengandung kata-kata yang menyerupai payload serangan.

### 

### 3.2.3 Karakteristik Data

### Karakteristik data yang digunakan dalam sistem ini meliputi berbagai entitas utama yang saling berelasi. Berikut penjelasannya:

### Data Payload Serangan

### Berisi kumpulan string serangan yang telah dikategorikan ke dalam lima kategori ancaman utama. Setiap payload merupakan representasi dari teknik serangan yang umum digunakan oleh penyerang dalam eksploitasi aplikasi web.

### Data Incident Log

### Menyimpan catatan setiap insiden serangan yang terdeteksi oleh sistem, meliputi timestamp, IP address penyerang, URL path yang diserang, metode HTTP, kategori serangan, payload yang tercocok, skor kepercayaan, input mentah, aksi yang diambil (blocked/logged), dan user agent.

### Data Blocked IP

### Berisi daftar alamat IP yang diblokir secara otomatis maupun manual, termasuk alasan pemblokiran, jumlah strike, waktu pemblokiran, waktu kedaluwarsa, kategori serangan terakhir, dan status aktif.

### Data AI Report

### Menyimpan laporan analisis keamanan yang dihasilkan oleh model AI/LLM, meliputi ringkasan eksekutif, analisis pola, analisis tren, penilaian risiko, rekomendasi, dan tingkat ancaman.

### Data Settings

### Berisi konfigurasi sistem yang dapat disesuaikan oleh administrator, seperti confidence threshold, jumlah strike maksimum, dan durasi pemblokiran IP.

### 3.2.4 Alasan Penggunaan Data

Data payload serangan dipilih karena mampu merepresentasikan ancaman
keamanan web yang paling umum dan kritis menurut OWASP Top 10. Lima
kategori serangan yang digunakan (SQLi, XSS, LFI, SSRF, dan Path
Traversal) mencakup vektor serangan utama yang sering dieksploitasi oleh
penyerang untuk menembus pertahanan aplikasi web. Selain itu, penggunaan
payload dari sumber open-source yang telah teruji memastikan bahwa
pengujian dilakukan dengan data yang realistis dan komprehensif.

### 3.2.5 Latar Belakang Pengambilan Data

### Data payload diperoleh dari kombinasi sumber terbuka dan teknik pengujian penetrasi. Repository seperti SecLists dan PayloadsAllTheThings menyediakan koleksi payload yang terus diperbarui oleh komunitas keamanan siber global. Selain itu, beberapa payload dirancang secara khusus untuk menguji kemampuan input decoder dalam menangani teknik evasion lanjutan seperti double URL encoding, Unicode fullwidth substitution, dan Base64 encoding.

### 

### 3.2.6 Keterbatasan Dalam Pengambilan Data

### Dalam proses pengumpulan data, terdapat beberapa keterbatasan yang dihadapi, yaitu:

### Dataset payload tidak mencakup seluruh variasi serangan yang mungkin terjadi, terutama zero-day exploit dan teknik evasion yang belum terdokumentasi.

### Beberapa payload memiliki tingkat spesifisitas yang rendah, sehingga berpotensi menimbulkan false positive pada input yang mengandung kata-kata umum.

### Data serangan SSRF relatif lebih sedikit dibandingkan kategori lainnya karena keterbatasan sumber payload open-source untuk kategori tersebut.

### 

## 3.3 TEMPAT UJICOBA

Uji coba dilakukan di dua lingkungan utama, yaitu:

1.  Local Environment (Developer Testing)

> Sistem dijalankan secara lokal di perangkat pengembang untuk
> memastikan seluruh fungsi utama berjalan dengan baik. Pengujian
> dilakukan menggunakan server lokal Next.js dengan runtime Node.js,
> dimana library Xpecto Shield diintegrasikan sebagai middleware yang
> mengintercept setiap HTTP request masuk.

2.  Development Application (Dev App)

> Selain local environment, pengujian juga dilakukan menggunakan
> aplikasi pengembangan khusus (dev app) yang dibangun dengan Next.js.
> Aplikasi ini menyediakan antarmuka untuk melihat dashboard monitoring
> dan halaman testing yang memungkinkan pengiriman payload serangan
> secara langsung ke middleware untuk memvalidasi deteksi dan
> pemblokiran secara real-time. Pada tahap saat ini, pengujian dilakukan
> secara lengkap di local environment dan development application.
> Sistem telah teruji dan siap untuk diintegrasikan ke dalam aplikasi
> Next.js produksi.

## 3.4 WAKTU UJICOBA

Uji coba sistem dilaksanakan dalam beberapa tahap, yang terbagi menjadi
dua fase utama:

1.  Tahap Pengembangan dan Pengujian Unit

> Dilakukan selama proses pengembangan, dimana setiap modul diuji secara
> individual menggunakan Vitest sebagai test runner. Pengujian ini
> mencakup unit testing terhadap Aho-Corasick automaton, input decoder,
> dan detection engine untuk memastikan setiap komponen berfungsi secara
> mandiri dengan benar.

2.  Tahap Pengujian Integrasi

> Dilakukan setelah seluruh modul terintegrasi, dimana sistem diuji
> secara menyeluruh menggunakan dev app. Pengujian ini mencakup
> pengiriman payload serangan dari berbagai kategori melalui HTTP
> request dan memvalidasi bahwa middleware berhasil mendeteksi dan
> memblokir serangan dengan tepat. Selain itu, dilakukan pengujian
> terhadap mekanisme IP blocking, incident logging, dan dashboard
> monitoring.

## 3.5 SPESIFIKASI PERALATAN UJICOBA

Uji coba sistem dilakukan menggunakan perangkat keras dan perangkat
lunak yang mendukung pengembangan serta implementasi library berbasis
TypeScript/Node.js. Spesifikasi yang digunakan dijelaskan sebagai
berikut.

### 3.5.1 Perangkat Keras (Hardware)

Perangkat keras yang digunakan dalam proses pengujian meliputi:

  -----------------------------------------------------
  **Komponen**               **Spesifikasi**
  -------------------------- --------------------------
  Perangkat                  Laptop Lenovo LOQ

  Prosesor                   Intel® Core™ i5-12450HX
                             (12th Gen)

  RAM                        12 GB

  Penyimpanan (Storage)      SSD 512 GB

  Sistem Jaringan            Wi-Fi (Wireless
                             Connection)
  -----------------------------------------------------

*Tabel 3.2: Spesifikasi Perangkat Keras*

Laptop ini berfungsi sebagai server lokal dan client untuk menjalankan
Next.js development server, Vitest test runner, serta seluruh komponen
sistem selama pengujian berlangsung.

### 3.5.2 Perangkat Lunak (Software)

Perangkat lunak utama yang digunakan dalam pengembangan dan pengujian
sistem adalah sebagai berikut:

  -----------------------------------------------------
  **Kategori**               **Nama / Versi**
  -------------------------- --------------------------
  Sistem Operasi             Linux (Ubuntu/Debian
                             Based)

  Runtime                    Node.js 22.x

  Framework                  Next.js 15.5+ (App Router)

  Bahasa Pemrograman         TypeScript 5.7+

  Build Tool                 tsup 8.x

  Test Runner                Vitest 3.x

  Database (Backend)         Appwrite Cloud

  AI/LLM Provider            OpenAI-compatible API
                             (OpenRouter)

  Text Editor / IDE          Visual Studio Code

  Web Browser                Google Chrome / Firefox
  -----------------------------------------------------

*Tabel 3.3: Perangkat Lunak*

## 3.6 HASIL EKSPERIMEN

Pada tahap ini, sistem telah melewati fase pengujian internal secara
menyeluruh. Pengujian dilakukan untuk memastikan setiap modul utama
telah berjalan dengan baik, dapat mendeteksi serangan secara akurat, dan
mengambil tindakan pencegahan yang tepat.

### 3.6.1 Implementasi Fitur

Pada tahap ini, fitur yang telah diimplementasikan mencakup:

1.  Aho-Corasick Automaton untuk multi-pattern string matching dengan
    kompleksitas waktu O(n + m + z).

2.  Multi-layer input decoder dengan 6 lapisan dekoding (URL, Double
    URL, HTML entities, Unicode normalization, null byte removal, dan
    Base64 decoding).

3.  Hybrid detection engine dengan precision validation dan contextual
    scoring.

4.  Next.js middleware interceptor dengan dukungan Edge Runtime dan
    Node.js Runtime.

5.  Request analyzer yang mengekstrak input dari URL path, query
    parameters, headers, cookies, dan request body.

6.  Sistem strike-based IP blocking dengan in-memory cache dan
    sinkronisasi ke database Appwrite.

7.  Block response builder dengan halaman blokir bertemakan cyberpunk
    untuk request HTML dan respons JSON untuk API request.

8.  Dashboard admin dengan komponen React untuk monitoring real-time.

9.  AI analytics pipeline menggunakan OpenAI-compatible API untuk
    generasi laporan keamanan.

10. Dashboard API route handlers untuk operasi CRUD insiden, IP,
    laporan, dan pengaturan.

### 3.6.2 Pengujian Fungsional Sistem

Pengujian dilakukan dengan metode Black Box Testing, dengan cara
memberikan input berupa payload serangan ke berbagai titik masuk HTTP
request. Setiap hasil pengujian didokumentasikan dan diverifikasi
terhadap respons sistem.

#### 3.6.2.1 Modul Detection Engine

Detection engine merupakan inti dari sistem Xpecto Shield. Modul ini
menggunakan algoritma Aho-Corasick untuk melakukan pencocokan
multi-pattern secara simultan terhadap input yang telah melalui proses
dekoding. Engine dibangun dengan membuat trie dari seluruh payload,
kemudian failure links diinisialisasi menggunakan BFS (Breadth-First
Search) untuk memungkinkan pencarian yang efisien. Setiap input yang
masuk akan melalui proses decode dengan 6 lapisan, kemudian dicari
kecocokan menggunakan automaton. Kandidat kecocokan kemudian divalidasi
menggunakan precision scoring yang mempertimbangkan rasio panjang pola
terhadap input dan keberadaan keyword kontekstual.

Berfungsi dengan baik. Engine berhasil membangun automaton dari \~11.050
pola serangan dan mampu melakukan pemindaian dalam waktu sub-milidetik.
Sistem confidence scoring berhasil membedakan antara ancaman nyata dan
false positive.

#### 3.6.2.2 Modul Multi-Layer Input Decoder

Input decoder berfungsi untuk menormalisasi seluruh input sebelum
dilakukan pemindaian oleh detection engine. Modul ini menerapkan
pipeline dekoding berlapis untuk mengalahkan teknik evasion yang umum
digunakan oleh penyerang, meliputi:

1.  Double URL Decoding: mengonversi %25XX menjadi %XX kemudian menjadi
    karakter asli.

2.  URL Decoding: mengonversi encoding persen standar (%XX) menjadi
    karakter.

3.  HTML Entity Decoding: mengonversi entitas HTML bernama (\&lt;,
    \&amp;), desimal (\&#39;), dan heksadesimal (\&#x27;) menjadi
    karakter.

4.  Unicode Normalization: mengkonversi karakter fullwidth Unicode
    (U+FF01--U+FF5E) menjadi ekuivalen ASCII.

5.  Null Byte Removal: menghapus null bytes dan representasinya (%00,
    \\0, \\\\0, \\\\x00).

6.  Base64 Detection & Decoding: mendeteksi dan mendekode segmen yang
    di-encode dengan Base64 (minimal 16 karakter).

Seluruh lapisan dekoding berfungsi dengan baik. Pengujian menunjukkan
bahwa modul ini berhasil menangani berbagai teknik evasion, termasuk
kombinasi encoding berlapis yang sering digunakan untuk melewati WAF
(Web Application Firewall) tradisional.

#### 3.6.2.3 Modul Middleware Interceptor

Shield middleware terintegrasi dengan Next.js sebagai middleware yang
mengintercept setiap HTTP request masuk. Middleware melakukan
langkah-langkah berikut:

1.  Memeriksa apakah path termasuk dalam daftar proteksi
    (protectedPaths) dan bukan dalam daftar pengecualian (excludePaths).

2.  Memverifikasi apakah IP klien termasuk dalam whitelist.

3.  Memeriksa block cache untuk menentukan apakah IP telah diblokir.

4.  Mengekstrak seluruh input yang dapat dipindai dari request (URL
    path, query params, headers, cookies, body).

5.  Menjalankan analisis deteksi menggunakan detection engine.

6.  Jika ancaman terdeteksi, mencatat strike dan melakukan auto-blocking
    jika melebihi batas.

7.  Membuat incident log dan mengirimkan callback insiden secara
    asinkron.

8.  Mengembalikan respons blokir (HTML atau JSON tergantung jenis
    request).

Middleware berfungsi dengan baik pada kedua runtime (Node.js dan Edge).
Sistem berhasil mengintercept, menganalisis, dan memblokir request yang
mengandung payload serangan. Respons blokir menampilkan halaman
cyberpunk-themed yang informatif dengan detail insiden.

#### 3.6.2.4 Mekanisme IP Blocking

Sistem IP blocking menggunakan pendekatan strike-based, dimana setiap IP
yang mengirimkan request berbahaya mendapat satu strike. Ketika jumlah
strike mencapai batas maksimum (default: 3), IP tersebut secara otomatis
dimasukkan ke dalam block cache. Block cache berfungsi sebagai fast-path
cache di memori untuk menghindari overhead query database pada setiap
request. Cache otomatis dibersihkan secara periodik setiap 60 detik
untuk menghapus entri yang telah kedaluwarsa. Mekanisme IP blocking
berfungsi dengan baik. Sistem berhasil menghitung strike secara akurat,
melakukan auto-blocking setelah mencapai batas, dan membersihkan cache
secara otomatis sesuai durasi yang dikonfigurasi.

**3.6.2.5 Dashboard Admin dan API Layer**

Dashboard admin dibangun menggunakan React sebagai komponen
ShieldDashboard yang menampilkan informasi keamanan secara real-time.
Dashboard API menyediakan endpoint RESTful untuk mengakses data insiden,
IP yang diblokir, laporan AI, dan pengaturan sistem. API dilengkapi
dengan mekanisme autentikasi melalui fungsi authCheck yang dapat
dikustomisasi oleh pengguna. Dashboard dan API layer berfungsi dengan
baik. Seluruh endpoint CRUD beroperasi sesuai spesifikasi, dan dashboard
menampilkan data monitoring secara akurat.

#### 3.6.2.6 AI Analytics Pipeline

AI analytics pipeline menggunakan OpenAI-compatible chat completions API
untuk menghasilkan laporan analisis keamanan yang komprehensif. Pipeline
ini menerima data insiden dan statistik, kemudian mengirimkan prompt
terstruktur ke model AI untuk menghasilkan laporan yang mencakup
ringkasan eksekutif, analisis pola, analisis tren, penilaian risiko, dan
rekomendasi. Sistem dirancang provider-agnostic, sehingga dapat bekerja
dengan berbagai provider AI seperti OpenAI, OpenRouter, Anthropic, dan
lainnya melalui format API yang kompatibel.

AI analytics pipeline berfungsi dengan baik. Laporan yang dihasilkan
informatif dan actionable, dengan fallback mechanism yang memastikan
sistem tetap berjalan meskipun API AI tidak tersedia.

Dari hasil pengujian, seluruh fitur utama telah berjalan dengan baik dan
terintegrasi secara menyeluruh. Tabel berikut menunjukkan hasil
pengujian dari masing-masing modul.

  ----------------------------------------------------------------------
  **No**     **Modul /      **Skenario      **Hasil yang    **Status**
             Fitur**        Pengujian**     Diharapkan**    
  ---------- -------------- --------------- --------------- ------------
  1          Aho-Corasick   Build automaton Automaton       Selesai &
             Automaton      dari \~11.050   terbangun;      Berfungsi
                            pola; lakukan   pencarian       
                            multi-pattern   mengembalikan   
                            search.         kecocokan yang  
                                            tepat.          

  2          Multi-Layer    Kirim input     Seluruh lapisan Selesai &
             Input Decoder  dengan double   dekoding        Berfungsi
                            URL encoding,   menghasilkan    
                            HTML entities,  string asli     
                            fullwidth       yang benar.     
                            Unicode, null                   
                            bytes, Base64.                  

  3          Detection      Analisis input  Serangan        Selesai &
             Engine         berisi payload  terdeteksi      Berfungsi
                            SQLi, XSS, LFI, dengan          
                            SSRF, Path      confidence      
                            Traversal.      score di atas   
                                            threshold 0.7.  

  4          Confidence     Analisis input  Base score      Selesai &
             Scoring        pendek vs.      0.6 + length    Berfungsi
                            panjang; input  bonus (0-0.2) + 
                            dengan/tanpa    context bonus   
                            context         (0-0.2); max    
                            keywords.       1.0.            

  5          Request        Kirim request   Seluruh titik   Selesai &
             Analyzer       dengan payload  masuk input     Berfungsi
                            di query, body  terekstrak dan  
                            (JSON/form),    dapat           
                            headers,        dianalisis.     
                            cookies.                        

  6          Shield         Integrasi       Request         Selesai &
             Middleware     middleware      berbahaya       Berfungsi
             (Node.js)      dengan Next.js; terblokir;      
                            kirim payload   request bersih  
                            serangan.       diloloskan.     

  7          Shield         Jalankan        Deteksi dan     Selesai &
             Middleware     middleware di   blocking        Berfungsi
             (Edge)         Edge Runtime    berjalan tanpa  
                            menggunakan     error runtime.  
                            compiled                        
                            payloads.                       

  8          IP Blocking    Kirim 3+        IP otomatis     Selesai &
             (Auto)         request         diblokir        Berfungsi
                            berbahaya dari  setelah         
                            IP yang sama.   mencapai        
                                            maxStrikes;     
                                            request         
                                            selanjutnya     
                                            langsung        
                                            diblokir.       

  9          Block Response Kirim request   Request HTML    Selesai &
                            HTML dan JSON   menampilkan     Berfungsi
                            yang terblokir. halaman blokir; 
                                            request JSON    
                                            mengembalikan   
                                            JSON error.     

  10         Incident       Trigger deteksi Log insiden     Selesai &
             Logging        serangan;       tersimpan di    Berfungsi
                            verifikasi log  Appwrite dengan 
                            disimpan.       data lengkap.   

  11         Dashboard      Akses           Dashboard       Selesai &
             Admin          dashboard;      menampilkan     Berfungsi
                            tampilkan       data real-time  
                            statistik dan   dengan          
                            daftar insiden. visualisasi     
                                            yang tepat.     

  12         AI Report      Generate        Laporan AI      Selesai &
             Generation     laporan         tergenerate     Berfungsi
                            keamanan dari   dengan analisis 
                            data insiden.   pola, tren,     
                                            risiko, dan     
                                            rekomendasi.    
  ----------------------------------------------------------------------

*Tabel 3.4: Hasil Pengujian Fungsional Sistem*

*Halaman ini sengaja dikosongkan*

# BAB 4 PENUTUP

## 4.1 KESIMPULAN

Berdasarkan hasil pengembangan dan evaluasi yang telah dilakukan, sistem
Xpecto Shield --- AI-Driven Web Intrusion Detection & Prevention System
(IDPS) telah berhasil diimplementasikan sebagai library TypeScript yang
terintegrasi dengan framework Next.js dan mampu dijalankan di lingkungan
pengujian lokal maupun lingkungan serverless (Edge Runtime).

Sistem telah dikembangkan dengan arsitektur modular yang terdiri dari
empat lapisan utama: Core (detection engine dan Aho-Corasick automaton),
Middleware (request interception dan response building), API (dashboard
route handlers dan Appwrite integration), serta Dashboard (React
components untuk monitoring). Struktur sistem telah berjalan stabil
dengan alur pemrosesan data yang berfungsi sesuai rancangan arsitektur
awal.

Secara fungsional, hingga tahap ini telah berhasil diimplementasikan
beberapa modul inti sebagai berikut:

1.  **Aho-Corasick Multi-Pattern String Matching**

> Sistem telah mengimplementasikan algoritma Aho-Corasick untuk
> melakukan pencocokan multi-pattern secara simultan dengan kompleksitas
> waktu O(n + m + z). Automaton berhasil dibangun dari \~11.050 pola
> serangan dan mampu melakukan pemindaian dalam waktu sub-milidetik per
> request.

2.  **Multi-Layer Input Decoder**

> Pipeline dekoding berlapis telah berhasil diimplementasikan dengan 6
> lapisan dekoding (URL, Double URL, HTML entities, Unicode
> normalization, null byte removal, dan Base64 decoding). Modul ini
> efektif dalam mengalahkan berbagai teknik evasion yang umum digunakan
> oleh penyerang.

3.  **Hybrid Detection Engine**

> Detection engine menggabungkan pencocokan pattern Aho-Corasick dengan
> precision validation dan contextual scoring untuk menghasilkan skor
> kepercayaan yang akurat. Sistem berhasil membedakan antara ancaman
> nyata dan false positive.

4.  **Next.js Middleware Integration**

> Shield middleware telah terintegrasi dengan Next.js sebagai middleware
> interceptor yang kompatibel dengan Node.js Runtime dan Edge Runtime.
> Sistem berhasil mengintercept, menganalisis, dan memblokir request
> berbahaya secara real-time.

5.  **Strike-Based IP Blocking**

> Mekanisme IP blocking otomatis berdasarkan jumlah strike telah
> berfungsi dengan baik, dengan in-memory cache yang dibersihkan secara
> periodik dan sinkronisasi ke database Appwrite.

6.  **AI Analytics Pipeline**

> Pipeline analisis AI menggunakan OpenAI-compatible API telah berhasil
> menghasilkan laporan keamanan yang komprehensif, meliputi analisis
> pola, tren, penilaian risiko, dan rekomendasi tindakan.

7.  **Dashboard Admin**

> Dashboard monitoring real-time dengan komponen React telah berhasil
> menampilkan statistik insiden, daftar IP yang diblokir, laporan AI,
> dan pengaturan sistem melalui antarmuka yang intuitif. Meskipun
> seluruh fitur utama telah diimplementasikan dan berfungsi dengan baik,
> terdapat beberapa aspek yang masih dapat disempurnakan, antara lain:

- Penambahan kategori serangan baru seperti Remote Code Execution (RCE),
  Command Injection, dan XML External Entity (XXE) untuk cakupan deteksi
  yang lebih luas.

- Optimalisasi performa automaton untuk dataset payload yang sangat
  besar (\>100.000 pola).

- Implementasi mekanisme auto-update payload database dari sumber
  terbuka secara otomatis.

- Penambahan visualisasi grafik interaktif pada dashboard admin untuk
  analisis tren serangan.

- Dengan progres yang telah dicapai, sistem menunjukkan kemajuan
  signifikan baik dari sisi fungsionalitas maupun struktur arsitektur.
  Xpecto Shield telah siap untuk diintegrasikan sebagai library IDPS
  pada aplikasi Next.js produksi untuk meningkatkan keamanan terhadap
  serangan web.

## 4.2 SARAN

Berdasarkan hasil evaluasi pengembangan sistem hingga tahap ini,
terdapat beberapa hal yang direkomendasikan untuk penyempurnaan agar
sistem Xpecto Shield dapat berfungsi secara maksimal dan siap
diimplementasikan di lingkungan produksi. Adapun saran pengembangan dan
perbaikan sistem yang direkomendasikan adalah sebagai berikut:

1.  **Perluasan Cakupan Kategori Serangan**

- Tambahkan dukungan untuk kategori serangan baru seperti Remote Code
  Execution (RCE), Command Injection, XML External Entity (XXE), dan
  Server-Side Template Injection (SSTI).

- Perluas dataset payload untuk setiap kategori dengan sumber terbaru
  dari komunitas keamanan siber.

- Implementasikan mekanisme auto-update untuk mengunduh payload terbaru
  secara otomatis dari repository terpercaya.

2.  **Peningkatan Akurasi Deteksi**

- Kembangkan mekanisme context-aware detection yang mempertimbangkan
  konteks aplikasi target untuk mengurangi false positive.

- Implementasikan machine learning classifier sebagai lapisan validasi
  tambahan di atas Aho-Corasick matching.

- Tambahkan adaptive threshold yang menyesuaikan sensitivity berdasarkan
  tingkat ancaman saat ini.

3.  **Optimalisasi Performa**

- Lakukan benchmark dan profiling untuk mengidentifikasi bottleneck pada
  proses dekoding dan pencocokan pattern.

- Implementasikan lazy loading untuk kategori payload yang jarang
  digunakan.

- Pertimbangkan penggunaan WebAssembly (Wasm) untuk akselerasi
  Aho-Corasick automaton pada Edge Runtime.

4.  **Penyempurnaan Dashboard dan Visualisasi**

- Tambahkan grafik interaktif (line chart, pie chart, heatmap) untuk
  visualisasi tren serangan dan distribusi kategori.

- Implementasikan notifikasi real-time (WebSocket atau Server-Sent
  Events) untuk alert insiden baru.

- Kembangkan fitur export laporan ke format PDF dan Excel.

5.  **Integrasi dan Ekosistem**

- Kembangkan adapter untuk framework web lain selain Next.js, seperti
  Express.js, Fastify, dan Nuxt.js.

- Implementasikan integrasi dengan platform monitoring seperti Grafana,
  Datadog, atau New Relic.

- Tambahkan dukungan untuk webhook notification ke Slack, Discord, atau
  Telegram.

6.  **Pengujian dan Validasi Lanjutan**

- Lakukan pengujian penetrasi (pentest) oleh pihak ketiga untuk
  memvalidasi efektivitas deteksi.

- Adakan benchmark perbandingan dengan solusi WAF komersial seperti
  Cloudflare WAF, AWS WAF, dan ModSecurity.

- Lakukan pengujian beban (load testing) untuk mengevaluasi performa
  sistem di bawah traffic tinggi.

7.  **Dokumentasi dan Komunitas**

- Lengkapi dokumentasi API dengan contoh kode untuk setiap endpoint dan
  konfigurasi.

- Buat panduan deployment step-by-step untuk berbagai platform (Vercel,
  AWS, Google Cloud).

- Publikasikan library ke npm registry untuk memudahkan adopsi oleh
  komunitas developer.

##  

### 

## Daftar Pustaka

\[1\] Hoang Xuan Dau, N. T. T. T. N. T. H. (2022). *A Survey of Tools
and Techniques for*.

\[2\] Hussain, S., Nagar, S., & Shrivastava, A. (2025). *A Survey on
Intrusion Detection System Based on Deep Learning*. *13*, 1.

\[3\] Kannan, M., & Pajasri, P. (2025). AUTOMATIC IP BLOCKING
CYBERSECURITY SYSTEM. *Www.Irjmets.Com \@International Research Journal
of Modernization in Engineering*, *291*. www.irjmets.com

\[4\] Kimanzi, R., Kimanga, P., Cherori, D., & Gikunda, P. K. (2024).
*Deep Learning Algorithms Used in Intrusion Detection Systems \-- A
Review*. http://arxiv.org/abs/2402.17020

\[5\] Mohale, V. Z., & Obagbuwa, I. C. (2025). A systematic review on
the integration of explainable artificial intelligence in intrusion
detection systems to enhancing transparency and interpretability in
cybersecurity. In *Frontiers in Artificial Intelligence* (Vol. 8).
Frontiers Media SA. https://doi.org/10.3389/frai.2025.1526221

\[6\] Wessels, M., Koch, S., Pellegrino, G., & Johns, M. (2024). *Open
access to the Proceedings of the 33rd USENIX Security Symposium is
sponsored by USENIX. SSRF vs. Developers: A Study of SSRF-Defenses in
PHP Applications SSRF vs. Developers: A Study of SSRF-Defenses in PHP
Applications*.
https://www.usenix.org/conference/usenixsecurity24/presentation/wessels
