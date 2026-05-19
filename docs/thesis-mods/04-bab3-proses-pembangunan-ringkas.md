# 3.1 PROSES PEMBANGUNAN SISTEM (Versi Ringkas)

> **Catatan**: Ini adalah versi ringkas (1-2 halaman) dari sub-bab 3.1. Gunakan versi ini **atau** versi naratif di `04-bab3-eksperimen.md`, bukan keduanya.

---

Copcivil Security System dibangun secara bertahap melalui tujuh tahapan utama. Secara keseluruhan, proses ini dapat dianalogikan seperti membangun sistem keamanan gedung — mulai dari menyiapkan peralatan, melatih penjaga, memasang pos pemeriksaan, membangun gudang arsip, hingga menyediakan ruang kontrol bagi pengelola.

**Tahap 1 — Persiapan Lingkungan Pengembangan.** Seluruh peralatan dasar disiapkan terlebih dahulu: Node.js (versi 22) sebagai mesin utama, Vite (versi 6) sebagai alat pembangun proyek, dan React (versi 19) sebagai *library* antarmuka pengguna. Selain itu, dikonfigurasi pula Appwrite Cloud sebagai layanan basis data dan Netlify sebagai *platform hosting*. Struktur proyek kemudian dirancang dengan memisahkan kode ke dalam empat direktori utama berdasarkan fungsinya.

**Tahap 2 — Pembangunan Mesin Deteksi Serangan.** Inti dari sistem ini adalah mesin deteksi yang mampu mengenali pola-pola serangan — ibarat penjaga keamanan yang dilatih mengenali wajah penjahat dari daftar buronan. Mesin ini dibangun dari empat komponen: (1) basis data berisi 115 pola serangan dalam empat kategori, (2) algoritma Aho-Corasick yang mampu mencocokkan seluruh pola secara bersamaan dalam satu kali pemindaian, (3) *pipeline* normalisasi berlapis enam tahap yang berfungsi membongkar penyamaran serangan, dan (4) sistem penilaian berbasis bobot keparahan yang menentukan apakah suatu permintaan harus diblokir, diberi peringatan, atau hanya dicatat.

**Tahap 3 — Pembangunan Gerbang Keamanan.** Setelah mesin deteksi siap, dipasang *Netlify Edge Function* sebagai "pos satpam" di pintu masuk aplikasi. Setiap permintaan yang masuk diperiksa: apakah pengirimnya sudah masuk daftar hitam, dan apakah isi permintaannya mengandung pola serangan. Permintaan yang terdeteksi berbahaya langsung ditolak, sementara permintaan yang aman diteruskan ke aplikasi.

**Tahap 4 — Penyiapan Basis Data dan Layanan *Backend*.** Empat koleksi basis data dibuat di Appwrite Cloud untuk menyimpan catatan insiden, daftar IP yang diblokir, laporan AI, dan konfigurasi sistem. Selain itu, dibangun tiga layanan *backend* yang masing-masing menangani tugas spesifik: `copcivil-guard` untuk pencatatan insiden dan pemblokiran otomatis, `copcivil-blocklist` untuk pengelolaan daftar hitam, dan `copcivil-ai-report` untuk pembuatan laporan analisis AI.

**Tahap 5 — Pembangunan *Dashboard* Admin.** Dibangun antarmuka *dashboard* berbasis React sebagai "ruang kontrol" bagi administrator. *Dashboard* terdiri dari lima halaman: ringkasan keamanan, log insiden, daftar blokir IP, laporan AI, dan konfigurasi sistem. Melalui *dashboard* ini, administrator dapat memantau dan mengelola keamanan aplikasi secara *real-time*.

**Tahap 6 — Integrasi Analitik AI.** Ditambahkan kemampuan analisis berbasis kecerdasan buatan melalui *OpenRouter API*. Sistem mengumpulkan data insiden, menyusun statistik, lalu mengirimkannya ke model AI untuk dianalisis. Hasilnya berupa laporan komprehensif yang mencakup ringkasan, analisis pola, penilaian risiko, dan rekomendasi mitigasi.

**Tahap 7 — Integrasi dan Pengujian Menyeluruh.** Seluruh komponen yang telah dibangun secara terpisah diintegrasikan dan diuji secara bertahap: pengujian unit untuk setiap komponen individual, pengujian integrasi untuk memastikan antar-komponen bekerja bersama, dan pengujian *end-to-end* dengan mengirimkan serangan sesungguhnya ke aplikasi yang sudah di-*deploy*. Setelah seluruh pengujian berhasil dilalui, sistem dinyatakan siap digunakan.
