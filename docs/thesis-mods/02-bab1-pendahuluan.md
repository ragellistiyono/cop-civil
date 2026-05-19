# BAB 1 PENDAHULUAN

> **Catatan**: Teks di bawah ini merupakan versi modifikasi BAB 1 yang telah disesuaikan 100% dengan projek Copcivil Security System yang sesungguhnya. Salin dan tempel ke dokumen Word tesis Anda, lalu sesuaikan formatting (heading, font, spasi) sesuai pedoman tesis PENS.

---

## 1.1 LATAR BELAKANG

Perkembangan pesat teknologi informasi mendorong organisasi untuk memanfaatkan aplikasi web sebagai aset digital utama dalam menyebarkan informasi dan menjalankan layanan. Peningkatan ketergantungan terhadap aplikasi web ini secara langsung turut memperbesar permukaan serangan dan potensi ancaman keamanan siber yang membahayakan integritas data serta reputasi organisasi.

Aplikasi web modern, termasuk sistem informasi pemerintahan seperti CIVIL QTRACK yang digunakan untuk manajemen inspeksi dan kontrak pada UPT Malang, memiliki arsitektur yang semakin kompleks dengan *frontend* berbasis *Single Page Application* (SPA), layanan *Backend-as-a-Service* (BaaS), dan *edge computing*. Kompleksitas ini menciptakan celah kerentanan baru, terutama pada titik-titik masuk *input* pengguna seperti URL *path*, *query parameters*, *header* HTTP, *cookies*, dan *request body*. Celah ini membuka pintu bagi berbagai vektor serangan siber, seperti *SQL Injection*, *Cross-Site Scripting* (XSS), *Command Injection* (CMDi), dan *Directory Traversal* (*Path Traversal*) yang dapat mengakibatkan pencurian data sensitif, perusakan tampilan (*defacement*), hingga eksekusi perintah berbahaya di sisi server (Hoang Xuan Dau, 2022) [1].

Kondisi tersebut diperparah oleh fakta bahwa administrator atau pengelola aplikasi web seringkali tidak memiliki keahlian teknis mendalam di bidang keamanan siber. Keterbatasan ini menyebabkan mereka kesulitan untuk mendeteksi dan merespons ancaman secara efektif dan tepat waktu. Hal ini menciptakan sebuah kesenjangan krusial: ketiadaan sebuah sistem yang mampu memantau, mendeteksi, dan mencegah serangan secara otomatis dan *real-time*, sekaligus memberikan peringatan yang mudah dipahami.

Selain itu, penyerang semakin mahir menggunakan teknik *evasion* untuk melewati sistem deteksi tradisional. Teknik seperti *double URL encoding*, *HTML entity encoding*, penyisipan komentar SQL, *null byte injection*, dan *case manipulation* digunakan untuk menyamarkan *payload* serangan agar tidak terdeteksi oleh *Web Application Firewall* (WAF) konvensional. Hal ini menuntut sistem deteksi yang tidak hanya mencocokkan *pattern*, tetapi juga mampu normalisasi input melalui proses dekoding berlapis sebelum melakukan analisis.

Kebutuhan akan sistem deteksi dan pencegahan serangan yang otomatis menjadi sangat mendesak untuk mengatasi kesenjangan pengetahuan administrator aplikasi web tersebut. **Copcivil Security System** — *AI-Driven Web Intrusion Detection & Prevention System* (IDPS) — dapat menjadi solusi efektif dengan kemampuan mendeteksi *payload* serangan secara *real-time* menggunakan algoritma Aho-Corasick *multi-pattern matching*, melakukan mitigasi otomatis melalui *IP blocking* berbasis *strike count*, dan memberikan analisis cerdas berbasis *Large Language Model* (LLM) untuk meningkatkan pemahaman administrator tentang ancaman yang dihadapi. Integrasi AI dalam sistem keamanan siber memungkinkan analisis pola serangan yang lebih akurat dan rekomendasi mitigasi yang adaptif sesuai dengan karakteristik ancaman yang berkembang (Kannan & Pajasri, 2025) [3].

---

## 1.2 IDENTIFIKASI PERMASALAHAN

Berdasarkan latar belakang yang telah diuraikan, terdapat beberapa permasalahan utama yang perlu mendapat perhatian serius dalam konteks keamanan aplikasi web. Dari penjabaran tersebut, maka permasalahan utama dapat diidentifikasi sebagai berikut:

1. Bagaimana merancang dan mengimplementasikan sistem deteksi serangan web berbasis algoritma Aho-Corasick yang mampu mencocokkan pola serangan secara simultan dengan performa *real-time* pada *edge computing layer*?

2. Bagaimana mengimplementasikan mekanisme normalisasi input berlapis yang efektif dalam mengalahkan berbagai teknik *evasion* (*double URL encoding*, *HTML entities*, *SQL comment injection*, *null byte insertion*, *case manipulation*) yang digunakan penyerang untuk melewati sistem deteksi?

3. Bagaimana membangun sistem pencegahan otomatis (*IP blocking*) berbasis akumulasi skor ancaman yang mampu merespons ancaman yang terdeteksi secara *real-time* dan terintegrasi dengan basis data *cloud*?

4. Bagaimana mengintegrasikan analitik berbasis *Large Language Model* (LLM) yang bersifat *provider-agnostic* untuk menghasilkan laporan analisis keamanan yang komprehensif dari data insiden serangan?

5. Bagaimana mengimplementasikan seluruh sistem sebagai modul keamanan yang terintegrasi dengan aplikasi web berbasis React dan Vite, serta kompatibel dengan *Netlify Edge Functions* dan *Appwrite Cloud*?

---

## 1.3 BATASAN MASALAH

Agar penelitian tetap terarah dan fokus, berikut ruang lingkup yang menjadi batasan dalam penelitian ini:

1. Sistem dikembangkan sebagai modul keamanan bernama Copcivil Security System yang terintegrasi dengan aplikasi web CIVIL QTRACK. Aplikasi *frontend* dibangun menggunakan React 19 dan Vite 6 dengan bahasa pemrograman JavaScript.

2. Teknologi yang digunakan meliputi JavaScript sebagai bahasa pemrograman utama, React sebagai *library* antarmuka pengguna, Vite sebagai *build tool* dan *development server*, *Appwrite Cloud* sebagai *Backend-as-a-Service* (basis data dan autentikasi), *Netlify* sebagai *hosting platform* dengan dukungan *Edge Functions* (Deno *runtime*), *Appwrite Functions* (Node.js 18 *runtime*) sebagai *serverless backend*, dan *OpenRouter API* sebagai penyedia layanan AI/*LLM*.

3. Deteksi serangan dibatasi pada empat kategori teknik eksploitasi utama: *SQL Injection* (SQLi), *Cross-Site Scripting* (XSS), *Command Injection* (CMDi), dan *Directory Traversal* (*Path Traversal*).

4. Algoritma deteksi menggunakan Aho-Corasick *multi-pattern string matching* dengan *severity-weighted scoring*, bukan *machine learning classifier*. Sistem menggunakan 115 pola serangan yang dikategorikan dalam empat *file* JSON.

5. Analitik AI menggunakan *Large Language Model* (LLM) eksternal melalui *OpenRouter API* yang bersifat *provider-agnostic*. Sistem tidak melatih model sendiri, melainkan memanfaatkan model yang tersedia melalui *API chat completions*.

6. Arsitektur keamanan terdiri dari dua lapisan (*layer*): *Netlify Edge Function* sebagai *Layer 1* (*gateway* keamanan di *edge*) dan *Appwrite Functions* sebagai *Layer 2* (pencatatan insiden, manajemen *blocklist*, dan analitik AI).

---

## 1.4 TUJUAN

Penelitian proyek akhir ini bertujuan untuk mengembangkan Copcivil Security System, sebuah *AI-Driven Web Intrusion Detection & Prevention System* (IDPS) yang diimplementasikan sebagai modul keamanan terintegrasi pada aplikasi web CIVIL QTRACK. Sistem ini mengimplementasikan algoritma Aho-Corasick untuk mencocokkan pola serangan web secara simultan dengan performa *real-time*, dilengkapi *pipeline* normalisasi input berlapis untuk mengalahkan teknik *evasion*, serta *severity-weighted scoring* untuk mengklasifikasikan tingkat ancaman. Sistem dirancang untuk mendeteksi empat kategori teknik eksploitasi utama — *SQL Injection*, *XSS*, *Command Injection*, dan *Path Traversal* — kemudian merespons ancaman secara otomatis melalui mekanisme *IP blocking* berbasis akumulasi skor dan jumlah insiden. Setiap insiden serangan yang terdeteksi dicatat secara komprehensif ke basis data *Appwrite Cloud* dan dapat dianalisis menggunakan analitik AI berbasis LLM untuk menghasilkan laporan keamanan yang mencakup ringkasan eksekutif, analisis pola, penilaian risiko, dan rekomendasi mitigasi kontekstual. Seluruh hasil deteksi dan analisis ditampilkan melalui *dashboard* admin berbasis React yang menyediakan *monitoring real-time*, sehingga administrator dapat mengambil keputusan keamanan berdasarkan data yang akurat dan terkini. Sistem ini bertujuan untuk memberikan solusi keamanan yang komprehensif, mudah diintegrasikan, dan berdaya guna tinggi bagi pengembang dan administrator aplikasi web.

---

## 1.5 MANFAAT

Copcivil Security System sebagai *AI-Driven Web IDPS* dengan pendekatan *Aho-Corasick multi-pattern matching* merupakan solusi dalam upaya peningkatan keamanan aplikasi web terhadap ancaman eksploitasi kerentanan. Pendekatan ini menyajikan deteksi *real-time* yang memudahkan identifikasi dan pencegahan serangan berdasarkan empat kategori teknik eksploitasi utama. Manfaat dari penelitian ini adalah sebagai berikut:

1. **Bagi Organisasi dan Perusahaan**

   Penelitian ini menyediakan sistem perlindungan proaktif yang memberikan keamanan berlapis terhadap serangan siber dengan cakupan deteksi *SQL Injection*, *XSS*, *Command Injection*, dan *Path Traversal*. Hal ini memberikan dukungan perlindungan aset digital berbasis data dalam pencegahan kerugian finansial dan reputasi, serta memudahkan *monitoring* ancaman keamanan secara kontinu. Sistem ini mengurangi *downtime* aplikasi web dan memastikan kontinuitas bisnis dengan biaya yang optimal dibandingkan potensi kerugian dari serangan siber yang berhasil.

2. **Bagi Pengembang dan Administrator Aplikasi Web**

   Pengembang memperoleh manfaat berupa modul keamanan yang mudah diintegrasikan ke dalam proyek aplikasi web dengan konfigurasi minimal. Administrator aplikasi web mendapatkan *dashboard* intuitif yang memungkinkan *monitoring real-time* tanpa memerlukan keahlian mendalam dalam keamanan siber. Integrasi analitik AI memberikan wawasan mendalam mengenai lanskap ancaman melalui laporan keamanan yang komprehensif, sehingga mendorong waktu respons yang lebih cepat dan pengambilan keputusan yang berbasis data.
