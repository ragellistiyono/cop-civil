# BAB 4 PENUTUP

> **Catatan**: Teks di bawah ini merupakan versi modifikasi BAB 4 yang telah disesuaikan 100% dengan projek Copcivil Security System. Salin dan tempel ke dokumen Word tesis Anda.

---

## 4.1 KESIMPULAN

Berdasarkan hasil pengembangan dan evaluasi yang telah dilakukan, Copcivil Security System — *AI-Driven Web Intrusion Detection & Prevention System* (IDPS) telah berhasil diimplementasikan sebagai modul keamanan yang terintegrasi dengan aplikasi web CIVIL QTRACK. Sistem berjalan di dua lapisan: *Netlify Edge Function* (Deno *runtime*) sebagai *Layer 1 Security Gateway* dan *Appwrite Functions* (Node.js 18 *runtime*) sebagai *Layer 2 Backend Services*.

Sistem telah dikembangkan dengan arsitektur berlapis yang terdiri dari empat komponen utama: *Client App* (React 19 + Vite 6), *Netlify Edge Function* (*gateway* keamanan), *Appwrite Functions* (pencatatan insiden, manajemen *blocklist*, analitik AI), serta *Appwrite Cloud* (basis data dan autentikasi). Struktur sistem telah berjalan stabil dengan alur pemrosesan data yang berfungsi sesuai rancangan arsitektur awal.

Secara fungsional, hingga tahap ini telah berhasil diimplementasikan beberapa modul inti sebagai berikut:

1. **Aho-Corasick *Multi-Pattern String Matching***

   Sistem telah mengimplementasikan algoritma Aho-Corasick untuk melakukan pencocokan *multi-pattern* secara simultan dengan kompleksitas waktu O(n + m + z). *Automaton* berhasil dibangun dari 115 pola serangan dalam empat kategori (SQLi, XSS, CMDi, *Path Traversal*) dan mampu melakukan pemindaian secara efisien per *request*.

2. ***Pipeline* Normalisasi Input Berlapis**

   *Pipeline* normalisasi berlapis telah berhasil diimplementasikan dengan 6 tahap: penghapusan *null bytes*, *double URL decoding*, *HTML entity decoding*, *case folding*, penghapusan komentar SQL, dan normalisasi *whitespace*. Modul ini efektif dalam mengalahkan berbagai teknik *evasion* yang umum digunakan oleh penyerang.

3. **Mesin Deteksi Hibrid dengan *Severity-Weighted Scoring***

   Mesin deteksi menggabungkan pencocokan *pattern* Aho-Corasick dengan sistem pembobotan berdasarkan tingkat *severity* (*critical*=10, *high*=7, *medium*=4, *low*=1). Skor kumulatif menentukan aksi: `blocked` (≥15), `warned` (≥7), atau `logged` (<7). Sistem berhasil membedakan antara ancaman nyata dan *false positive*.

4. ***Netlify Edge Function* sebagai *Security Gateway***

   *Edge function* `copcivil-edge` telah terintegrasi dengan *Netlify* sebagai *Layer 1* keamanan yang mengintercept setiap HTTP *request* di *Deno runtime*. Sistem berhasil mengekstrak *scan targets* dari URL *path*, *query parameters*, *cookies*, dan *header referer*, kemudian mendeteksi dan memblokir *request* berbahaya secara *real-time*.

5. **Mekanisme *Auto-Block* IP Berbasis Jumlah Insiden**

   Mekanisme *auto-block* berdasarkan jumlah insiden dalam jendela waktu konfigurabel telah berfungsi dengan baik. *Appwrite Function* `copcivil-guard` menghitung insiden per IP dan melakukan pemblokiran otomatis setelah mencapai ambang batas, dengan sinkronisasi ke basis data *Appwrite*.

6. ***AI Analytics Pipeline***

   *Pipeline* analisis AI menggunakan *OpenRouter API* yang bersifat *provider-agnostic* telah berhasil menghasilkan laporan keamanan yang komprehensif. Sistem mengagregasi data insiden, membangun *prompt* terstruktur, dan memanggil LLM untuk menghasilkan analisis pola, penilaian risiko, dan rekomendasi mitigasi.

7. ***Dashboard* Admin**

   *Dashboard monitoring real-time* dengan komponen React telah berhasil menampilkan statistik insiden, log insiden, daftar IP yang diblokir, laporan AI, dan konfigurasi sistem melalui antarmuka yang intuitif.

Meskipun seluruh fitur utama telah diimplementasikan dan berfungsi dengan baik, terdapat beberapa aspek yang masih dapat disempurnakan, antara lain:

- Penambahan kategori serangan baru seperti *Server-Side Request Forgery* (SSRF), *Local File Inclusion* (LFI), dan *XML External Entity* (XXE) untuk cakupan deteksi yang lebih luas.
- Perluasan basis data *payload* dengan pola serangan tambahan dari sumber komunitas keamanan terbuka.
- Implementasi *machine learning classifier* sebagai lapisan validasi tambahan di atas Aho-Corasick *matching*.
- Penambahan visualisasi grafik interaktif (*line chart*, *heatmap*) pada *dashboard* admin untuk analisis tren serangan.

Dengan progres yang telah dicapai, sistem menunjukkan kemajuan signifikan baik dari sisi fungsionalitas maupun struktur arsitektur. Copcivil Security System telah siap untuk digunakan sebagai modul keamanan IDPS pada aplikasi web CIVIL QTRACK untuk meningkatkan keamanan terhadap serangan web.

---

## 4.2 SARAN

Berdasarkan hasil evaluasi pengembangan sistem hingga tahap ini, terdapat beberapa hal yang direkomendasikan untuk penyempurnaan agar Copcivil Security System dapat berfungsi secara maksimal dan siap diimplementasikan di lingkungan produksi skala besar. Adapun saran pengembangan dan perbaikan sistem yang direkomendasikan adalah sebagai berikut:

1. **Perluasan Cakupan Kategori Serangan**

   - Tambahkan dukungan untuk kategori serangan baru seperti *Server-Side Request Forgery* (SSRF), *Local File Inclusion* (LFI), *XML External Entity* (XXE), dan *Server-Side Template Injection* (SSTI).
   - Perluas basis data *payload* untuk setiap kategori dengan sumber terbaru dari komunitas keamanan siber (*SecLists*, *PayloadsAllTheThings*).
   - Implementasikan mekanisme *auto-update* untuk mengunduh *payload* terbaru secara otomatis dari *repository* terpercaya.

2. **Peningkatan Akurasi Deteksi**

   - Kembangkan mekanisme *context-aware detection* yang mempertimbangkan konteks aplikasi target untuk mengurangi *false positive*.
   - Implementasikan *machine learning classifier* sebagai lapisan validasi tambahan di atas Aho-Corasick *matching*.
   - Tambahkan *adaptive threshold* yang menyesuaikan sensitivitas berdasarkan tingkat ancaman saat ini.

3. **Optimalisasi Performa**

   - Lakukan *benchmark* dan *profiling* untuk mengidentifikasi *bottleneck* pada proses normalisasi dan pencocokan *pattern*.
   - Implementasikan *lazy loading* untuk kategori *payload* yang jarang digunakan.
   - Pertimbangkan penggunaan *WebAssembly* (Wasm) untuk akselerasi Aho-Corasick *automaton* pada *Deno runtime*.

4. **Penyempurnaan *Dashboard* dan Visualisasi**

   - Tambahkan grafik interaktif (*line chart*, *pie chart*, *heatmap*) untuk visualisasi tren serangan dan distribusi kategori dari waktu ke waktu.
   - Implementasikan notifikasi *real-time* (*WebSocket* atau *Server-Sent Events*) untuk *alert* insiden baru.
   - Kembangkan fitur *export* laporan ke format PDF dan Excel.

5. **Integrasi dan Ekosistem**

   - Kembangkan *adapter* agar Copcivil dapat digunakan pada *platform hosting* lain selain Netlify, seperti Vercel, Cloudflare Workers, dan AWS Lambda@Edge.
   - Implementasikan integrasi dengan platform *monitoring* seperti Grafana, Datadog, atau New Relic.
   - Tambahkan dukungan untuk *webhook notification* ke Slack, Discord, atau Telegram.

6. **Pengujian dan Validasi Lanjutan**

   - Lakukan pengujian penetrasi (*pentest*) oleh pihak ketiga untuk memvalidasi efektivitas deteksi.
   - Adakan *benchmark* perbandingan dengan solusi WAF komersial seperti Cloudflare WAF, AWS WAF, dan ModSecurity.
   - Lakukan pengujian beban (*load testing*) untuk mengevaluasi performa sistem di bawah *traffic* tinggi.

7. **Dokumentasi dan Komunitas**

   - Lengkapi dokumentasi API dengan contoh kode untuk setiap *endpoint* dan konfigurasi.
   - Buat panduan *deployment step-by-step* untuk berbagai *platform* (Netlify, Vercel, AWS).
   - Publikasikan modul sebagai *package* npm untuk memudahkan adopsi oleh komunitas *developer*.
