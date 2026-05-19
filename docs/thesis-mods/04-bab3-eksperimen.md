# BAB 3 EKSPERIMEN

> **Catatan**: Teks di bawah ini merupakan versi modifikasi BAB 3 yang telah disesuaikan 100% dengan projek Copcivil Security System. Bagian tabel pengujian fungsional (3.7.2) sudah mencerminkan 4 kategori serangan aktual. Untuk screenshot hasil pengujian, gunakan panduan di testing guide (`docs/superpowers/specs/2026-04-29-copcivil-testing-guide.md`).

---

## 3.1 PROSES PEMBANGUNAN SISTEM

Bagian ini menjelaskan tahapan pembangunan Copcivil Security System secara kronologis, mulai dari persiapan awal hingga sistem siap digunakan. Penjelasan disajikan secara bertahap dan dilengkapi dengan potongan kode sumber serta tangkapan layar agar pembaca dapat memahami bagaimana sistem ini dirancang dan diwujudkan.

Secara garis besar, pembangunan sistem ini dapat dianalogikan seperti membangun sistem keamanan untuk sebuah gedung perkantoran. Gedung tersebut adalah aplikasi web CIVIL QTRACK, dan Copcivil Security System adalah seluruh infrastruktur keamanan yang dipasang di dalamnya — mulai dari pos satpam di pintu masuk, kamera pengawas, gudang arsip rekaman, ruang kontrol pemantauan, hingga konsultan keamanan yang menganalisis pola kejadian.

### 3.1.1 Persiapan Lingkungan Pengembangan

Langkah pertama dalam pembangunan sistem adalah menyiapkan seluruh peralatan dan lingkungan kerja yang dibutuhkan, sebagaimana seorang tukang bangunan perlu menyiapkan meja kerja, perkakas, dan bahan baku sebelum mulai membangun.

Pada tahap ini, dilakukan instalasi dan konfigurasi perangkat lunak dasar yang menjadi fondasi pengembangan:

1. **Node.js** (versi 22) dipasang sebagai *runtime environment*, yaitu program dasar yang memungkinkan kode JavaScript dijalankan di komputer pengembang.

2. **Vite** (versi 6) dipasang sebagai alat pembangunan proyek (*build tool*) yang mengatur dan mengemas seluruh bahan bangunan menjadi satu kesatuan yang siap dipasang.

3. **React** (versi 19) dipilih sebagai *library* untuk membangun antarmuka pengguna yang interaktif dan responsif.

4. **Appwrite Cloud** dikonfigurasi sebagai layanan basis data dan autentikasi yang menyimpan seluruh data sistem. Pada layanan ini dibuat satu basis data (`copcivil_security`) yang terdiri dari empat koleksi penyimpanan data.

5. **Netlify** dikonfigurasi sebagai *platform hosting* yang juga menyediakan fitur *Edge Function* untuk menjalankan kode keamanan di titik terdekat dengan pengguna.

Seluruh dependensi proyek didefinisikan dalam *file* konfigurasi `package.json` sebagai berikut:

```json
{
  "dependencies": {
    "appwrite": "^24.2.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.14.0",
    "recharts": "^3.8.1",
    "lucide-react": "^1.8.0"
  },
  "devDependencies": {
    "vite": "^6.3.5",
    "vitest": "^4.1.5"
  }
}
```

Setelah seluruh peralatan terpasang, struktur proyek dirancang dengan memisahkan kode sumber ke dalam beberapa direktori berdasarkan fungsinya:

```
cop-civil-main/
  copcivil/           ← Logika keamanan inti
    engine/           ← Mesin deteksi (Aho-Corasick, normalizer, scorer)
    payloads/         ← Basis data pola serangan (JSON)
    shared/           ← Konstanta dan tipe data bersama
  src/                ← Antarmuka pengguna (React)
    pages/admin/      ← Halaman dashboard admin
  functions/          ← Layanan backend (Appwrite Functions)
    copcivil-guard/   ← Pencatatan insiden & auto-block
    copcivil-blocklist/ ← Manajemen daftar blokir
    copcivil-ai-report/ ← Analitik AI
  netlify/
    edge-functions/   ← Gerbang keamanan (Edge Function)
```

[SISIPKAN SCREENSHOT: Struktur direktori proyek di Visual Studio Code]

### 3.1.2 Pembangunan Mesin Deteksi Serangan

Tahap kedua adalah membangun komponen paling kritis dalam sistem: mesin deteksi serangan. Komponen ini dapat dianalogikan sebagai "otak" dari seorang penjaga keamanan — kemampuannya untuk mengenali wajah penjahat dari daftar buronan dan memutuskan apakah seseorang boleh masuk atau harus ditolak.

Pembangunan mesin deteksi dilakukan dalam empat langkah berurutan:

**Langkah 1 — Menyusun Daftar Pola Serangan (*Payload Database*)**

Terlebih dahulu disusun daftar pola-pola serangan yang dikenal berbahaya, serupa dengan daftar buronan yang dimiliki oleh pos keamanan. Sebanyak 115 pola serangan dikumpulkan dan disimpan dalam empat *file* JSON berdasarkan jenis ancaman: *SQL Injection* (30 pola), *Cross-Site Scripting* (30 pola), *Command Injection* (30 pola), dan *Path Traversal* (25 pola). Setiap pola memiliki struktur data sebagai berikut:

```json
{
  "id": "SQLI-001",
  "pattern": "' or 1=1",
  "severity": "high",
  "description": "Classic SQL injection tautology"
}
```

Atribut `severity` menunjukkan tingkat keparahan pola tersebut jika ditemukan, dengan empat tingkatan: `critical` (kritis), `high` (tinggi), `medium` (sedang), dan `low` (rendah).

[SISIPKAN SCREENSHOT: Contoh isi file sqli.json di editor kode]

**Langkah 2 — Membangun Algoritma Pencocokan Pola (Aho-Corasick)**

Selanjutnya dibangun algoritma Aho-Corasick, yaitu metode pencarian yang mampu mencocokkan seluruh 115 pola serangan secara bersamaan dalam satu kali pemindaian. Alih-alih membandingkan input dengan setiap pola satu per satu, algoritma ini membangun sebuah "peta pencarian" dari seluruh pola sekaligus. Ketika sebuah input masuk, sistem cukup menelusuri peta tersebut satu kali untuk menemukan seluruh kecocokan.

Inti dari algoritma ini diimplementasikan dalam kelas `AhoCorasick` dengan tiga metode utama:

```javascript
class AhoCorasick {
  // Menambahkan pola ke dalam peta pencarian
  addPattern(pattern, metadata) {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, new AhoCorasickNode());
      }
      node = node.children.get(char);
    }
    node.output.push({ pattern, ...metadata });
  }

  // Membangun failure links menggunakan BFS
  build() { /* ... */ }

  // Memindai teks dan mengembalikan seluruh kecocokan
  search(text) {
    const matches = [];
    let node = this.root;
    for (let i = 0; i < text.length; i++) {
      // Telusuri peta pencarian karakter per karakter
      // Jika ditemukan kecocokan, catat ke dalam daftar
    }
    return matches;
  }
}
```

Metode `addPattern()` membangun struktur *trie* (pohon pencarian) dari setiap pola. Metode `build()` menginisialisasi *failure links* menggunakan BFS (*Breadth-First Search*) agar pencarian dapat melompat secara efisien ketika karakter tidak cocok. Metode `search()` menelusuri input karakter per karakter dan mengumpulkan seluruh kecocokan yang ditemukan.

**Langkah 3 — Membangun *Pipeline* Normalisasi Input**

Penyerang sering menyamarkan serangan mereka agar tidak dikenali, seperti penjahat yang menyamar dengan wig dan kacamata hitam. Untuk mengalahkan penyamaran ini, dibangun sebuah proses normalisasi berlapis yang terdiri dari enam tahap pembersihan. Proses ini ibarat petugas keamanan yang meminta setiap tamu melepas topi, kacamata, dan masker sebelum wajahnya dicocokkan dengan daftar buronan.

Keenam tahap normalisasi diimplementasikan dalam fungsi `normalize()`:

```javascript
function normalize(input) {
  let result = input;
  result = stripNullBytes(result);    // 1. Hapus karakter null
  result = doubleDecode(result);      // 2. Decode URL ganda
  result = htmlEntityDecode(result);  // 3. Decode entitas HTML
  result = caseFold(result);          // 4. Ubah ke huruf kecil
  result = stripSqlComments(result);  // 5. Hapus komentar SQL
  result = collapseWhitespace(result);// 6. Normalkan spasi
  return result;
}
```

Contoh cara kerja normalisasi: jika penyerang mengirimkan input `%2527%2520OR%25201%253D1` (serangan SQL yang di-*encode* ganda), maka setelah melewati *pipeline* normalisasi, input tersebut akan terungkap menjadi `' or 1=1` yang dapat dikenali oleh mesin deteksi.

**Langkah 4 — Membangun Sistem Penilaian Ancaman (*Scoring*)**

Terakhir, dibangun sistem penilaian yang menentukan seberapa serius suatu ancaman. Setiap pola yang cocok memiliki bobot nilai berdasarkan tingkat keparahannya:

```javascript
const SEVERITY_WEIGHTS = {
  critical: 10,  // Sangat berbahaya
  high:     7,   // Berbahaya
  medium:   4,   // Cukup berbahaya
  low:      1,   // Sedikit berbahaya
};

const THRESHOLDS = {
  BLOCK: 15,  // Skor >= 15 → blokir permintaan
  WARN:  7,   // Skor >= 7  → beri peringatan
};
```

Sistem menjumlahkan seluruh bobot dari pola-pola yang terdeteksi, lalu membandingkan total skor dengan ambang batas: jika total skor ≥ 15, permintaan diblokir; jika ≥ 7, diberi peringatan; jika di bawahnya, hanya dicatat. Mekanisme ini memastikan bahwa kecocokan yang bersifat kebetulan (skor rendah) tidak menyebabkan pemblokiran yang keliru.

### 3.1.3 Pembangunan Gerbang Keamanan (*Edge Function*)

Setelah mesin deteksi siap, langkah berikutnya adalah memasang "pos satpam" di pintu masuk aplikasi. Dalam konteks sistem ini, pos satpam tersebut diwujudkan sebagai *Netlify Edge Function* — sebuah program yang berjalan di jaringan *edge* (titik terdekat dengan pengguna) dan mengintercept setiap permintaan yang masuk ke aplikasi web.

Fungsi gerbang keamanan ini bekerja sebagaimana pos pemeriksaan di pintu masuk gedung:

1. **Pemeriksaan awal**: Memeriksa apakah permintaan ditujukan untuk *file* statis (gambar, skrip tampilan, dsb.) yang tidak memerlukan pemindaian keamanan. Jika ya, permintaan langsung diteruskan tanpa pemeriksaan.

2. **Pengecekan daftar hitam**: Memeriksa apakah alamat IP pengirim permintaan sudah masuk dalam daftar blokir. Jika sudah diblokir, permintaan langsung ditolak.

3. **Pemindaian isi permintaan**: Mengekstrak seluruh komponen permintaan (alamat URL, parameter, *cookies*, dan informasi *header*), lalu menyerahkannya ke mesin deteksi.

4. **Pengambilan keputusan**: Berdasarkan hasil analisis, gerbang memutuskan apakah permintaan boleh lewat atau harus ditolak.

5. **Pencatatan**: Jika terdeteksi ancaman, data insiden dikirimkan secara asinkron ke layanan pencatatan di *backend*.

Ketika permintaan terdeteksi berbahaya dan diblokir, gerbang keamanan mengembalikan respons JSON dengan kode status 403 (*Forbidden*):

```json
{
  "blocked": true,
  "reason": "Threat detected",
  "category": "sqli",
  "score": 17,
  "action": "blocked"
}
```

[SISIPKAN SCREENSHOT: Contoh respons blokir di terminal saat mengirim payload serangan menggunakan curl]

### 3.1.4 Penyiapan Basis Data dan Layanan *Backend*

Tahap keempat adalah membangun "gudang arsip" dan "ruang operator" yang bekerja di balik layar. Komponen ini tidak terlihat oleh pengguna, namun sangat krusial untuk menyimpan data dan menjalankan operasi sistem.

**Basis Data (Appwrite Cloud)**

Empat koleksi penyimpanan data dibuat di layanan *Appwrite Cloud*, masing-masing dengan fungsi yang berbeda:

1. **`security_incidents`** — Buku catatan insiden yang merekam setiap serangan yang terdeteksi, termasuk siapa penyerangnya, kapan terjadinya, jenis serangan apa, dan tindakan apa yang diambil.

2. **`ip_blocklist`** — Daftar hitam yang mencatat alamat-alamat IP yang telah diblokir, beserta alasan dan durasi pemblokirannya.

3. **`ai_reports`** — Arsip laporan analisis yang dihasilkan oleh kecerdasan buatan, berisi ringkasan ancaman dan rekomendasi keamanan.

4. **`security_config`** — Buku pengaturan yang menyimpan konfigurasi operasional sistem.

[SISIPKAN SCREENSHOT: Tampilan koleksi basis data di dashboard Appwrite Cloud]

**Tiga Layanan *Backend* (*Appwrite Functions*)**

Selain basis data, dibangun pula tiga layanan *backend* yang masing-masing menangani tugas spesifik. Ketiga layanan ini dapat dianalogikan sebagai tiga orang petugas yang bekerja di ruang belakang gedung:

1. **`copcivil-guard`** (Petugas Pencatat) — Menerima laporan insiden dari gerbang keamanan, mencatatnya ke dalam buku insiden, dan memutuskan apakah alamat IP penyerang perlu diblokir secara otomatis berdasarkan frekuensi serangan.

2. **`copcivil-blocklist`** (Petugas Daftar Hitam) — Mengelola daftar alamat IP yang diblokir. Petugas ini dapat menambahkan, menghapus, dan membersihkan entri yang sudah kedaluwarsa atas perintah administrator.

3. **`copcivil-ai-report`** (Petugas Analisis) — Mengumpulkan data insiden, menyusunnya menjadi ringkasan statistik, lalu mengirimkannya ke layanan kecerdasan buatan eksternal untuk dianalisis dan menghasilkan laporan keamanan.

### 3.1.5 Pembangunan *Dashboard* Admin

Tahap kelima adalah membangun "ruang kontrol" bagi administrator — sebuah *dashboard* berbasis web yang menampilkan seluruh informasi keamanan secara visual dan *real-time*. Jika tahap-tahap sebelumnya membangun infrastruktur yang bekerja di balik layar, tahap ini membangun antarmuka yang dapat dilihat dan dioperasikan langsung oleh manusia.

*Dashboard* admin dibangun menggunakan React dan terdiri dari lima halaman utama:

1. **Halaman Ringkasan** — Menampilkan gambaran umum status keamanan dalam 24 jam terakhir: jumlah serangan terdeteksi, jumlah serangan yang berhasil diblokir, jumlah alamat IP yang sedang diblokir, diagram distribusi kategori, dan daftar insiden terbaru.

2. **Halaman Log Insiden** — Menampilkan catatan lengkap seluruh insiden keamanan yang pernah terdeteksi dengan fitur pencarian dan penyaringan.

3. **Halaman Daftar Blokir** — Menampilkan dan mengelola daftar alamat IP yang sedang diblokir.

4. **Halaman Laporan AI** — Memungkinkan administrator meminta pembuatan laporan analisis keamanan berbasis kecerdasan buatan.

5. **Halaman Konfigurasi** — Memungkinkan administrator mengubah parameter operasional sistem tanpa mengubah kode program.

[SISIPKAN SCREENSHOT: Tampilan halaman Ringkasan dashboard admin]

[SISIPKAN SCREENSHOT: Tampilan halaman Log Insiden dashboard admin]

### 3.1.6 Integrasi Analitik AI

Tahap keenam adalah menambahkan kemampuan analisis berbasis kecerdasan buatan (AI) ke dalam sistem. Komponen ini merupakan bagian yang paling kompleks dan menjadi nilai tambah utama Copcivil Security System. Secara analogi, tahap ini ibarat mempekerjakan seorang konsultan keamanan ahli yang bertugas mempelajari seluruh rekaman kejadian, mengidentifikasi pola-pola ancaman, dan menyusun laporan beserta rekomendasi tindakan pencegahan.

Analitik AI dibangun dengan memanfaatkan layanan *Large Language Model* (LLM) eksternal melalui *OpenRouter API*. Alih-alih membangun dan melatih model kecerdasan buatan sendiri — yang memerlukan sumber daya komputasi dan waktu yang sangat besar — sistem ini memanfaatkan model AI yang sudah tersedia dan terbukti kemampuannya. Pendekatan ini ibarat menyewa jasa konsultan profesional yang sudah berpengalaman, alih-alih melatih karyawan baru dari nol.

Pembangunan *pipeline* analitik AI dilakukan dalam lima langkah detail sebagai berikut:

**Langkah 1 — Pengambilan Data Insiden dari Basis Data**

Ketika administrator meminta pembuatan laporan, sistem terlebih dahulu mengambil seluruh data insiden keamanan dari basis data *Appwrite* dalam rentang waktu yang diminta. Data diambil secara bertahap (*batch*) untuk menghindari pembebanan berlebih pada basis data:

```javascript
async function fetchIncidents(databases, periodStart, periodEnd) {
  const allIncidents = [];
  let offset = 0;

  while (true) {
    const batch = await databases.listDocuments(DB_ID, INCIDENTS_ID, [
      Query.greaterThanEqual('timestamp', periodStart),
      Query.lessThanEqual('timestamp', periodEnd),
      Query.limit(100),
      Query.offset(offset),
    ]);
    allIncidents.push(...batch.documents);
    if (batch.documents.length < 100) break;
    offset += 100;
  }
  return allIncidents;
}
```

Fungsi ini mengambil data insiden secara bertahap per 100 dokumen, dengan filter berdasarkan tanggal awal dan akhir periode analisis. Mekanisme ini memastikan bahwa bahkan jika terdapat ribuan insiden, pengambilan data tetap stabil dan tidak membebani sistem.

**Langkah 2 — Agregasi dan Pengolahan Statistik**

Setelah data insiden terkumpul, langkah selanjutnya adalah mengolah data mentah menjadi ringkasan statistik yang terstruktur. Proses ini ibarat seorang analis yang menghitung dan mengklasifikasikan rekaman kejadian sebelum menyusun laporan.

Fungsi `aggregateIncidents()` menghitung tujuh metrik utama dari seluruh insiden:

```javascript
function aggregateIncidents(incidents) {
  const byCategory = {};   // Jumlah per kategori serangan
  const bySeverity = {};   // Jumlah per tingkat keparahan
  const byAction = {};     // Jumlah per tindakan (blokir/peringatan/catat)
  const ipCounts = {};     // Frekuensi per alamat IP penyerang
  const urlCounts = {};    // Frekuensi per URL yang diserang
  let totalScore = 0;      // Akumulasi skor ancaman

  for (const inc of incidents) {
    byCategory[inc.attack_category] =
      (byCategory[inc.attack_category] || 0) + 1;
    bySeverity[inc.severity] =
      (bySeverity[inc.severity] || 0) + 1;
    // ... hitung metrik lainnya
  }

  return {
    totalIncidents: incidents.length,
    byCategory, bySeverity, byAction,
    topIps:  /* 10 IP penyerang teratas */,
    topUrls: /* 10 URL target teratas */,
    avgThreatScore: Math.round(totalScore / incidents.length),
  };
}
```

Hasil agregasi menghasilkan gambaran menyeluruh: berapa total serangan, kategori apa yang paling dominan, dari alamat IP mana saja serangan berasal, dan halaman web mana yang paling sering menjadi target.

**Langkah 3 — Penyusunan *Prompt* Terstruktur (*Prompt Engineering*)**

Tahap paling penting dalam integrasi AI adalah menyusun pertanyaan (*prompt*) yang tepat agar model AI dapat memberikan analisis yang akurat dan relevan. Sistem menggunakan dua jenis *prompt*:

***System Prompt*** — Memberikan peran dan instruksi kepada model AI:

```javascript
const SECURITY_ANALYST_SYSTEM_PROMPT =
  `You are an expert cybersecurity analyst specializing
   in web application security. You analyze security
   incident data and produce clear, actionable reports.

   Your reports should be:
   - Professional and suitable for both technical and
     non-technical stakeholders
   - Data-driven — reference specific numbers
   - Actionable — every recommendation should be
     specific and implementable
   - Risk-aware — clearly communicate the severity

   Format your response in clean Markdown.`;
```

*System prompt* ini memberikan "kepribadian" kepada model AI — ia diminta berperan sebagai analis keamanan siber profesional yang menghasilkan laporan berbasis data.

***User Prompt*** — Menyajikan data statistik dan meminta analisis spesifik:

```javascript
function buildAnalyticsPrompt(stats, period) {
  return `Analyze the following web security incident data
for the period ${period.start} to ${period.end}.

## Incident Summary
- Total Incidents: ${stats.totalIncidents}
- Average Threat Score: ${stats.avgThreatScore}

## Breakdown by Attack Category
${Object.entries(stats.byCategory)
  .map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

## Top Attacking IPs
${stats.topIps
  .map((item, i) => `${i+1}. ${item.ip} (${item.count} incidents)`)
  .join('\n')}

Please provide:
1. Executive Summary
2. Threat Analysis
3. Risk Assessment (Critical/High/Medium/Low)
4. Recommendations
5. Trend Comparison`;
}
```

*User prompt* menyajikan data dalam format yang mudah dipahami oleh model AI, kemudian meminta lima bagian analisis: ringkasan eksekutif, analisis ancaman, penilaian risiko, rekomendasi, dan perbandingan tren.

**Langkah 4 — Pemanggilan Model AI melalui *OpenRouter API***

Setelah *prompt* tersusun, sistem mengirimkan permintaan ke layanan *OpenRouter API*. *OpenRouter* dipilih karena bersifat *provider-agnostic* — artinya sistem dapat menggunakan berbagai model AI dari penyedia yang berbeda (seperti Anthropic Claude, OpenAI GPT, Google Gemini) melalui satu format API yang sama, tanpa perlu mengubah kode program.

```javascript
async function callOpenRouter(model, systemPrompt, userPrompt) {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,   // contoh: "anthropic/claude-sonnet-4"
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
}
```

Fungsi ini mengirimkan kedua *prompt* (sistem dan pengguna) ke model AI yang dikonfigurasi oleh administrator melalui *dashboard*. Model AI memproses data dan mengembalikan laporan analisis dalam format *Markdown*.

**Langkah 5 — Penyimpanan Laporan dan Mekanisme Keamanan**

Setelah model AI menghasilkan laporan, sistem menyimpan hasilnya ke basis data *Appwrite* pada koleksi `ai_reports` dan menampilkannya di *dashboard* admin. Selain itu, diterapkan mekanisme keamanan berupa *rate limiting* untuk mencegah penyalahgunaan:

```javascript
async function checkRateLimit(databases) {
  const fiveMinAgo = new Date(
    Date.now() - 5 * 60 * 1000
  ).toISOString();

  const recent = await databases.listDocuments(
    DB_ID, REPORTS_ID,
    [Query.greaterThan('generated_at', fiveMinAgo)]
  );

  return recent.total > 0; // true = rate limited
}
```

*Rate limiting* membatasi pembuatan laporan maksimal satu kali setiap lima menit. Mekanisme ini mencegah pemanggilan API yang berlebihan, yang dapat menimbulkan biaya tinggi dan membebani sistem.

Berikut contoh struktur data laporan yang disimpan ke basis data:

```json
{
  "report_type": "on_demand",
  "period_start": "2026-04-28T00:00:00.000Z",
  "period_end": "2026-04-29T00:00:00.000Z",
  "summary": "## Executive Summary\nDuring the analyzed period...",
  "recommendations": "1. Implement stricter input validation...",
  "stats_json": "{\"totalIncidents\":42,\"byCategory\":{...}}",
  "model_used": "anthropic/claude-sonnet-4",
  "generated_at": "2026-04-29T10:30:00.000Z",
  "requested_by": "admin-user-id"
}
```

[SISIPKAN SCREENSHOT: Halaman Laporan AI di dashboard — tampilkan formulir pembuatan laporan]

[SISIPKAN SCREENSHOT: Contoh hasil laporan AI yang ditampilkan di dashboard]

**Alur Lengkap *Pipeline* AI**

Secara keseluruhan, alur kerja *pipeline* analitik AI dari awal hingga akhir dapat dirangkum sebagai berikut:

1. Administrator membuka halaman Laporan AI di *dashboard* dan memilih rentang waktu analisis.
2. *Dashboard* mengirimkan permintaan ke *Appwrite Function* `copcivil-ai-report`.
3. Fungsi memeriksa *rate limit* — jika laporan dibuat kurang dari 5 menit yang lalu, permintaan ditolak.
4. Fungsi mengambil seluruh data insiden dari basis data dalam periode yang diminta.
5. Data insiden diagregasi menjadi statistik terstruktur (total insiden, distribusi per kategori, per *severity*, per aksi, 10 IP teratas, 10 URL teratas, rata-rata skor).
6. Statistik disusun menjadi *prompt* terstruktur yang meminta 5 bagian analisis.
7. *Prompt* dikirimkan ke model AI melalui *OpenRouter API* bersama dengan *system prompt* yang mendefinisikan peran analis keamanan.
8. Model AI menganalisis data dan menghasilkan laporan dalam format *Markdown*.
9. Laporan disimpan ke koleksi `ai_reports` di basis data *Appwrite*.
10. *Dashboard* menampilkan laporan kepada administrator dalam format yang mudah dibaca.

### 3.1.7 Integrasi dan Pengujian Menyeluruh

Tahap terakhir dalam proses pembangunan adalah mengintegrasikan seluruh komponen yang telah dibangun secara terpisah menjadi satu kesatuan sistem yang utuh, kemudian mengujinya secara menyeluruh. Tahap ini ibarat melakukan simulasi kebakaran di sebuah gedung untuk memastikan bahwa alarm, *sprinkler*, pintu darurat, dan petugas keamanan semuanya bekerja dengan baik secara bersamaan.

Integrasi dilakukan secara bertahap:

1. **Pengujian unit** — Setiap komponen diuji secara individu menggunakan *Vitest* sebagai *test runner*. Mesin deteksi diuji dengan berbagai pola serangan, normalisasi diuji dengan berbagai teknik penyamaran, dan sistem penilaian diuji dengan berbagai kombinasi skor.

2. **Pengujian integrasi** — Komponen-komponen yang telah lolos pengujian unit kemudian dihubungkan satu sama lain dan diuji sebagai satu kesatuan. Misalnya, memastikan bahwa ketika gerbang keamanan mendeteksi serangan, data insiden berhasil tersimpan di basis data dan muncul di *dashboard* admin.

3. **Pengujian *end-to-end*** — Seluruh sistem diuji dari ujung ke ujung dengan mengirimkan permintaan HTTP berisi *payload* serangan sesungguhnya ke aplikasi yang sudah di-*deploy*. Contoh perintah pengujian:

```bash
curl -v "https://app-domain.netlify.app/search?q=%27+OR+1%3D1+--"
```

Perintah di atas mengirimkan *payload* SQL Injection melalui parameter URL. Sistem diharapkan mendeteksi pola `' OR 1=1 --`, menghitung skor ancaman, dan mengembalikan respons blokir (HTTP 403).

[SISIPKAN SCREENSHOT: Hasil pengujian end-to-end di terminal menunjukkan respons blokir]

Setelah seluruh pengujian berhasil dilalui, sistem dinyatakan siap untuk digunakan sebagai modul keamanan pada aplikasi web CIVIL QTRACK.

---

## 3.2 PARAMETER EKSPERIMEN

Pengujian sistem dilakukan berdasarkan parameter yang terbagi menjadi dua kategori utama, yaitu parameter fungsional dan parameter non-fungsional.

### 3.2.1 Parameter Fungsional

Parameter fungsional adalah parameter yang berkaitan langsung dengan fitur dan fungsi utama sistem. Parameter-parameter berikut diuji untuk memvalidasi bahwa setiap komponen sistem berjalan sesuai spesifikasi:

1. **Aho-Corasick *Automaton***: Kemampuan membangun *automaton* dari 115 pola serangan dalam empat kategori (SQLi, XSS, CMDi, *Path Traversal*) dan melakukan *multi-pattern search* dalam satu kali pemindaian.

2. **Normalisasi Input Berlapis**: Efektivitas *pipeline* normalisasi 6 tahap (penghapusan *null bytes*, *double URL decoding*, *HTML entity decoding*, *case folding*, penghapusan komentar SQL, normalisasi *whitespace*) dalam mengungkap *payload* yang di-*encode*.

3. **Mesin Deteksi Hibrid**: Kemampuan mendeteksi serangan menggunakan kombinasi Aho-Corasick *pattern matching* dan *severity-weighted scoring* untuk menghasilkan skor ancaman yang akurat.

4. ***Severity-Weighted Scoring***: Keakuratan perhitungan skor dengan bobot *critical*=10, *high*=7, *medium*=4, *low*=1, serta ketepatan penentuan aksi berdasarkan ambang batas (*block* ≥ 15, *warn* ≥ 7).

5. ***Request Analyzer***: Kemampuan mengekstrak input dari seluruh titik masuk HTTP *request* (URL *path*, *query parameters*, *cookies*, *referer*) untuk dianalisis.

6. ***Netlify Edge Function* (*Security Gateway*)**: Integrasi *Netlify Edge Function* sebagai *Layer 1* keamanan yang mengintercept, menganalisis, dan memblokir *request* berbahaya sebelum mencapai aplikasi.

7. **Mekanisme *IP Blocking***: Fungsi *auto-block* berdasarkan jumlah insiden dalam jendela waktu, manajemen blokir/unblok manual, dan pembersihan IP kedaluwarsa.

8. ***Dashboard* Admin**: Fungsionalitas *dashboard* dalam menampilkan statistik *real-time*, log insiden, daftar blokir IP, laporan AI, dan konfigurasi sistem.

9. ***AI Analytics Pipeline***: Kemampuan mengagregasi data insiden, membangun *prompt*, memanggil LLM melalui *OpenRouter API*, dan menyimpan laporan AI.

10. ***Appwrite Functions***: Fungsionalitas tiga *serverless function* (`copcivil-guard`, `copcivil-ai-report`, `copcivil-blocklist`) dalam memproses insiden, menghasilkan laporan, dan mengelola *blocklist*.

### 3.2.2 Parameter Non-Fungsional

Parameter non-fungsional mengevaluasi aspek kualitas sistem di luar fungsionalitas langsung:

1. **Performa**: Waktu respons deteksi pada *edge function* (target: < 50 ms untuk pemindaian *pattern*).

2. **Keandalan**: Kemampuan sistem menangani *payload* yang rusak (*malformed*) atau *request* berukuran besar tanpa *crash*.

3. **Keamanan**: Sanitasi dan pemotongan data sebelum penyimpanan ke basis data untuk mencegah *injection* tingkat kedua.

4. **Konfigurabilitas**: Kemampuan mengubah parameter operasional (ambang batas, durasi *auto-block*, model AI) tanpa mengubah kode sumber melalui koleksi `security_config`.

---

## 3.3 KARAKTERISTIK DATA

### 3.3.1 Kategori dan Jumlah *Payload*

Data *payload* serangan disimpan dalam empat *file* JSON terpisah berdasarkan kategori. Setiap *file* berisi *array* objek *pattern* dengan metadata terstruktur:

**Tabel 3.1: Karakteristik *Payload* Serangan**

| No | Kategori | File Sumber | Jumlah *Pattern* | Distribusi *Severity* |
|---|---|---|---|---|
| 1 | *SQL Injection* (SQLi) | `sqli.json` | 30 | Critical: 7, High: 11, Medium: 8, Low: 4 |
| 2 | *Cross-Site Scripting* (XSS) | `xss.json` | 30 | Critical: 2, High: 16, Medium: 11, Low: 1 |
| 3 | *Command Injection* (CMDi) | `cmdi.json` | 30 | Critical: 9, High: 17, Medium: 4 |
| 4 | *Directory Traversal* | `path-traversal.json` | 25 | Critical: 5, High: 15, Medium: 5 |
| | **Total** | **4 file** | **115** | |

Setiap *pattern* memiliki struktur data sebagai berikut:

```json
{
  "id": "SQLI-001",
  "pattern": "' or 1=1",
  "severity": "high",
  "description": "Classic SQL injection tautology"
}
```

### 3.3.2 Struktur Data Insiden

Setiap insiden keamanan yang terdeteksi disimpan ke koleksi `security_incidents` di *Appwrite Cloud* dengan 15 atribut yang mencakup informasi lengkap mengenai serangan.

### 3.3.3 Struktur Data *Blocklist*

Setiap IP yang diblokir disimpan ke koleksi `ip_blocklist` dengan 7 atribut yang mencakup informasi pemblokiran, termasuk jenis blokir (otomatis atau manual), jumlah insiden, dan waktu kedaluwarsa.

### 3.3.4 Struktur Data Laporan AI

Setiap laporan AI disimpan ke koleksi `ai_reports` dengan 9 atribut yang mencakup ringkasan analisis, rekomendasi mitigasi, statistik insiden, model AI yang digunakan, dan metadata pembuatan.

### 3.3.5 Struktur Data Konfigurasi

Konfigurasi sistem disimpan sebagai pasangan *key-value* di koleksi `security_config`, meliputi:

| Kunci Konfigurasi | Nilai Default | Deskripsi |
|---|---|---|
| `block_threshold` | `15` | Skor minimum untuk memblokir *request* |
| `warn_threshold` | `7` | Skor minimum untuk peringatan |
| `auto_block_incident_count` | `5` | Jumlah insiden sebelum *auto-block* |
| `auto_block_window_minutes` | `10` | Jendela waktu penghitungan insiden (menit) |
| `auto_block_duration_hours` | `24` | Durasi pemblokiran otomatis (jam) |
| `openrouter_model` | `anthropic/claude-sonnet-4` | Model LLM untuk analisis AI |
| `admin_whitelist_ips` | `[]` | Daftar IP yang dikecualikan dari *auto-block* |

---

## 3.4 TEMPAT UJICOBA

Uji coba dilakukan di dua lingkungan utama, yaitu:

1. ***Local Environment* (*Developer Testing*)**

   Sistem dijalankan secara lokal di perangkat pengembang untuk memastikan seluruh fungsi utama berjalan dengan baik. Pengujian dilakukan menggunakan *Vite development server* dengan perintah `npm run dev`, dimana *Netlify Edge Function* dijalankan menggunakan *Netlify CLI* (`netlify dev`). Pengujian unit menggunakan *Vitest* sebagai *test runner* untuk menguji setiap modul secara individual, termasuk Aho-Corasick *automaton*, normalisasi input, *detection engine*, dan *scorer*.

2. ***Development Application* (*Dev App*)**

   Selain *local environment*, pengujian juga dilakukan menggunakan aplikasi pengembangan CIVIL QTRACK yang di-*deploy* ke *Netlify*. Aplikasi ini menyediakan antarmuka *dashboard* admin untuk melihat *monitoring* keamanan dan melakukan pengujian *end-to-end* yang memvalidasi alur lengkap dari deteksi hingga pencatatan insiden. Pengujian *end-to-end* menggunakan perintah `curl` untuk mengirimkan HTTP *request* berisi *payload* serangan ke *endpoint* aplikasi dan memverifikasi bahwa *edge function* mendeteksi dan memblokir serangan secara *real-time*. Pada tahap saat ini, pengujian dilakukan secara lengkap di kedua lingkungan. Sistem telah teruji dan siap untuk digunakan sebagai modul keamanan pada aplikasi web CIVIL QTRACK di lingkungan produksi.

---

## 3.5 WAKTU UJICOBA

Uji coba sistem dilaksanakan dalam beberapa tahap, yang terbagi menjadi dua fase utama:

1. **Tahap Pengembangan dan Pengujian Unit**

   Dilakukan selama proses pengembangan, dimana setiap modul diuji secara individual menggunakan *Vitest* sebagai *test runner*. Pengujian ini mencakup *unit testing* terhadap Aho-Corasick *automaton*, normalisasi input, *detection engine*, *scorer*, dan *logic module* untuk memastikan setiap komponen berfungsi secara mandiri dengan benar.

2. **Tahap Pengujian Integrasi**

   Dilakukan setelah seluruh modul terintegrasi, dimana sistem diuji secara menyeluruh menggunakan *development application*. Pengujian ini mencakup pengiriman *payload* serangan dari empat kategori melalui HTTP *request* (menggunakan `curl`) dan memvalidasi bahwa *Netlify Edge Function* berhasil mendeteksi dan memblokir serangan dengan tepat. Selain itu, dilakukan pengujian terhadap mekanisme *auto-block* IP, pencatatan insiden ke *Appwrite*, dan fungsionalitas *dashboard* admin.

---

## 3.6 SPESIFIKASI PERALATAN UJICOBA

Uji coba sistem dilakukan menggunakan perangkat keras dan perangkat lunak yang mendukung pengembangan serta implementasi modul keamanan berbasis JavaScript dan *edge computing*. Spesifikasi yang digunakan dijelaskan sebagai berikut.

### 3.6.1 Perangkat Keras (*Hardware*)

Perangkat keras yang digunakan dalam proses pengujian meliputi:

**Tabel 3.2: Spesifikasi Perangkat Keras**

| Komponen | Spesifikasi |
|---|---|
| Perangkat | Laptop Lenovo LOQ |
| Prosesor | Intel® Core™ i5-12450HX (12th Gen) |
| RAM | 12 GB |
| Penyimpanan (*Storage*) | SSD 512 GB |
| Sistem Jaringan | Wi-Fi (*Wireless Connection*) |

Laptop ini berfungsi sebagai *server* lokal dan *client* untuk menjalankan *Vite development server*, *Netlify CLI*, *Vitest test runner*, serta seluruh komponen sistem selama pengujian berlangsung.

### 3.6.2 Perangkat Lunak (*Software*)

Perangkat lunak utama yang digunakan dalam pengembangan dan pengujian sistem adalah sebagai berikut:

**Tabel 3.3: Perangkat Lunak**

| Kategori | Nama / Versi |
|---|---|
| Sistem Operasi | Linux (Ubuntu/Debian Based) |
| *Runtime* | Node.js 22.x |
| *Build Tool* / *Dev Server* | Vite 6.x |
| *Library* Antarmuka | React 19.x |
| Bahasa Pemrograman | JavaScript (ES2022+) |
| *Edge Runtime* | Deno (*Netlify Edge Functions*) |
| *Test Runner* | Vitest 4.x |
| Basis Data (*Backend*) | Appwrite Cloud |
| *Hosting Platform* | Netlify |
| AI/LLM *Provider* | OpenRouter API (OpenAI-compatible) |
| *Text Editor* / IDE | Visual Studio Code |
| *Web Browser* | Google Chrome / Firefox |
| *CLI Tools* | curl, Netlify CLI |

---

## 3.7 HASIL EKSPERIMEN

Pada tahap ini, sistem telah melewati fase pengujian internal secara menyeluruh. Pengujian dilakukan untuk memastikan setiap modul utama telah berjalan dengan baik, dapat mendeteksi serangan secara akurat, dan mengambil tindakan pencegahan yang tepat.

### 3.7.1 Implementasi Fitur

Pada tahap ini, fitur yang telah diimplementasikan mencakup:

1. **Aho-Corasick *Automaton*** untuk *multi-pattern string matching* dengan kompleksitas waktu O(n + m + z). *Automaton* dibangun dari 115 pola serangan dan mampu melakukan pemindaian secara efisien.

2. ***Pipeline* Normalisasi Input Berlapis** dengan 6 tahap normalisasi (penghapusan *null bytes*, *double URL decoding*, *HTML entity decoding*, *case folding*, penghapusan komentar SQL, dan normalisasi *whitespace*).

3. **Mesin Deteksi Hibrid** yang menggabungkan Aho-Corasick *pattern matching* dengan *severity-weighted scoring* untuk menentukan tingkat ancaman dan aksi respons.

4. ***Netlify Edge Function*** (`copcivil-edge`) sebagai *Layer 1 Security Gateway* yang mengintercept setiap HTTP *request* di *Deno runtime* pada *edge network*.

5. ***Request Analyzer*** yang mengekstrak input dari URL *path*, *query parameters*, *cookies*, dan *header referer* untuk analisis komprehensif.

6. **Sistem *Auto-Block* IP** dengan penghitungan insiden per IP dalam jendela waktu konfigurabel dan sinkronisasi ke basis data *Appwrite*.

7. **Respons Blokir** berformat JSON dengan status 403 Forbidden dan *header* `X-Copcivil-Blocked: true`.

8. ***Dashboard* Admin** dengan komponen React untuk *monitoring real-time* mencakup statistik keamanan, log insiden, manajemen *blocklist*, laporan AI, dan konfigurasi.

9. ***AI Analytics Pipeline*** menggunakan *OpenRouter API* (*provider-agnostic*) untuk generasi laporan keamanan komprehensif dari data insiden teragregasi.

10. **Tiga *Appwrite Functions*** (`copcivil-guard`, `copcivil-ai-report`, `copcivil-blocklist`) sebagai *Layer 2* *backend services* untuk pencatatan insiden, analitik AI, dan manajemen *blocklist*.

### 3.7.2 Pengujian Fungsional Sistem

Pengujian dilakukan dengan metode *Black Box Testing*, dengan cara memberikan input berupa *payload* serangan ke berbagai titik masuk HTTP *request*. Setiap hasil pengujian didokumentasikan dan diverifikasi terhadap respons sistem.

#### 3.7.2.1 Modul *Detection Engine*

*Detection engine* merupakan inti dari Copcivil Security System. Modul ini menggunakan algoritma Aho-Corasick untuk melakukan pencocokan *multi-pattern* secara simultan terhadap input yang telah melalui proses normalisasi. *Engine* dibangun dengan membuat *trie* dari seluruh *payload*, kemudian *failure links* diinisialisasi menggunakan BFS (*Breadth-First Search*) untuk memungkinkan pencarian yang efisien. Setiap input yang masuk akan melalui proses normalisasi 6 tahap, kemudian dicari kecocokan menggunakan *automaton*. Skor ancaman kumulatif dihitung berdasarkan bobot *severity* setiap kecocokan.

Berfungsi dengan baik. *Engine* berhasil membangun *automaton* dari 115 pola serangan dan mampu melakukan pemindaian secara efisien. Sistem *severity-weighted scoring* berhasil membedakan antara ancaman nyata dan *false positive*.

#### 3.7.2.2 Modul Normalisasi Input Berlapis

Modul normalisasi berfungsi untuk menormalisasi seluruh input sebelum dilakukan pemindaian oleh *detection engine*. Modul ini menerapkan *pipeline* normalisasi berlapis untuk mengalahkan teknik *evasion* yang umum digunakan oleh penyerang, meliputi:

1. **Penghapusan *Null Bytes***: menghapus karakter `\x00` yang digunakan untuk memotong validasi.
2. ***Double URL Decoding***: mengonversi %25XX menjadi %XX kemudian menjadi karakter asli.
3. ***HTML Entity Decoding***: mengonversi entitas HTML bernama (`&lt;`, `&amp;`), desimal (`&#39;`), dan heksadesimal (`&#x27;`) menjadi karakter.
4. ***Case Folding***: mengonversi seluruh karakter ke *lowercase*.
5. **Penghapusan Komentar SQL**: menghapus komentar *block* (`/* */`), *line* (`--`), dan *hash* (`#`).
6. **Normalisasi *Whitespace***: menggabungkan urutan *whitespace* menjadi satu spasi tunggal.

Seluruh tahap normalisasi berfungsi dengan baik. Pengujian menunjukkan bahwa modul ini berhasil menangani berbagai teknik *evasion*, termasuk kombinasi *encoding* berlapis yang sering digunakan untuk melewati WAF tradisional.

#### 3.7.2.3 Modul *Netlify Edge Function* (*Security Gateway*)

*Edge function* `copcivil-edge` terintegrasi dengan *Netlify* sebagai fungsi yang mengintercept setiap HTTP *request* masuk. Fungsi ini melakukan langkah-langkah berikut:

1. Memeriksa apakah *path* termasuk *static asset* (`.js`, `.css`, `.png`, `.jpg`, dll). Jika ya, *request* langsung diteruskan tanpa pemindaian.
2. Me-*refresh cache blocklist* dari *Appwrite* setiap 5 menit.
3. Mengekstrak alamat IP klien dari *header* `x-nf-client-connection-ip` atau `x-forwarded-for`.
4. Memeriksa *cached blocklist* untuk menentukan apakah IP telah diblokir.
5. Mengekstrak *scan targets* dari URL *path*, *query params*, *cookies*, dan *referer*.
6. Menjalankan deteksi menggunakan *detection engine* (normalisasi + Aho-Corasick + *scoring*).
7. Jika aksi `blocked` atau `warned`, membangun *log payload* dan mengirimkan secara asinkron ke `copcivil-guard`.
8. Mengembalikan respons blokir (JSON 403) atau meneruskan *request* bersih.

*Edge function* berfungsi dengan baik pada *Deno runtime*. Sistem berhasil mengintercept, menganalisis, dan memblokir *request* yang mengandung *payload* serangan. Respons blokir mengembalikan JSON terstruktur dengan informasi alasan pemblokiran.

#### 3.7.2.4 Mekanisme *IP Blocking*

Sistem *IP blocking* menggunakan pendekatan berbasis jumlah insiden. *Appwrite Function* `copcivil-guard` menghitung insiden dari IP yang sama dalam jendela waktu yang dapat dikonfigurasi (default: 10 menit). Ketika jumlah insiden mencapai ambang batas (default: 5 insiden), IP secara otomatis dimasukkan ke dalam koleksi `ip_blocklist` dengan durasi kedaluwarsa yang dikonfigurasi (default: 24 jam). *Edge function* menyimpan *cache blocklist* di memori *isolate* yang di-*refresh* setiap 5 menit untuk menghindari *overhead query* basis data pada setiap *request*. IP yang terdaftar di *whitelist* dikecualikan dari mekanisme *auto-block*.

Mekanisme *IP blocking* berfungsi dengan baik. Sistem berhasil menghitung insiden secara akurat, melakukan *auto-blocking* setelah mencapai ambang batas, dan membersihkan *cache* sesuai konfigurasi yang ditentukan.

#### 3.7.2.5 *Dashboard* Admin dan *API Layer*

*Dashboard* admin dibangun menggunakan React sebagai komponen yang menampilkan informasi keamanan secara *real-time*. *Dashboard* berinteraksi langsung dengan *Appwrite SDK* untuk membaca data insiden dan *blocklist*, serta memanggil *Appwrite Functions* untuk operasi yang memerlukan logika *backend*. Halaman keamanan terdiri dari lima sub-halaman:

1. **Ringkasan** (`SecurityDashboardPage`): Kartu statistik, *pie chart* kategori, tabel insiden terbaru.
2. **Log Insiden** (`IncidentLogPage`): Daftar lengkap insiden dengan filter.
3. **Daftar Blokir** (`BlocklistPage`): Manajemen IP yang diblokir.
4. **Laporan AI** (`AiReportPage`): Pembuatan dan tampilan laporan AI.
5. **Konfigurasi** (`SecurityConfigPage`): Pengaturan parameter sistem.

*Dashboard* dan API layer berfungsi dengan baik. Seluruh komponen menampilkan data *monitoring* secara akurat.

#### 3.7.2.6 *AI Analytics Pipeline*

*AI analytics pipeline* menggunakan *OpenRouter API* (*OpenAI-compatible chat completions*) untuk menghasilkan laporan analisis keamanan yang komprehensif. *Pipeline* ini menerima data insiden, mengagregasi statistik (total insiden, distribusi per kategori, per *severity*, per aksi, 10 IP teratas, 10 URL teratas, rata-rata skor ancaman), kemudian membangun *prompt* terstruktur dan mengirimkannya ke model LLM untuk dianalisis. Sistem dilengkapi mekanisme *rate limiting* (maksimal 1 laporan per 5 menit) untuk mencegah penyalahgunaan. Sistem dirancang *provider-agnostic*, sehingga dapat bekerja dengan berbagai penyedia AI melalui format API yang kompatibel.

*AI analytics pipeline* berfungsi dengan baik. Laporan yang dihasilkan informatif dan *actionable*, dengan format *Markdown* yang mencakup ringkasan eksekutif, analisis pola, penilaian risiko, dan rekomendasi mitigasi.

### 3.7.3 Tabel Hasil Pengujian Fungsional

Dari hasil pengujian, seluruh fitur utama telah berjalan dengan baik dan terintegrasi secara menyeluruh. Tabel berikut menunjukkan hasil pengujian dari masing-masing modul.

**Tabel 3.4: Hasil Pengujian Fungsional Sistem**

| No | Modul / Fitur | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 1 | Aho-Corasick *Automaton* | *Build automaton* dari 115 pola; lakukan *multi-pattern search*. | *Automaton* terbangun; pencarian mengembalikan kecocokan yang tepat. | Selesai & Berfungsi |
| 2 | Normalisasi Input Berlapis | Kirim input dengan *double URL encoding*, *HTML entities*, komentar SQL, *null bytes*, *case manipulation*. | Seluruh tahap normalisasi menghasilkan *string* asli yang benar. | Selesai & Berfungsi |
| 3 | *Detection Engine* | Analisis input berisi *payload* SQLi, XSS, CMDi, *Path Traversal*. | Serangan terdeteksi dengan skor ancaman sesuai bobot *severity*. | Selesai & Berfungsi |
| 4 | *Severity-Weighted Scoring* | Analisis input dengan berbagai kombinasi *pattern*; verifikasi skor kumulatif. | Skor dihitung sesuai bobot (*critical*=10, *high*=7, *medium*=4, *low*=1); aksi sesuai *threshold*. | Selesai & Berfungsi |
| 5 | *Request Analyzer* | Kirim *request* dengan *payload* di *query*, *cookies*, *referer*, URL *path*. | Seluruh titik masuk input terekstrak dan dapat dianalisis. | Selesai & Berfungsi |
| 6 | *Netlify Edge Function* | Integrasi *edge function* dengan Netlify; kirim *payload* serangan. | *Request* berbahaya terblokir; *request* bersih diloloskan. | Selesai & Berfungsi |
| 7 | *Static Asset Bypass* | Kirim *request* ke *path* `.js`, `.css`, `.png`, `.jpg`. | *Request* langsung diteruskan tanpa pemindaian. | Selesai & Berfungsi |
| 8 | *IP Blocking* (Auto) | Kirim 5+ *request* berbahaya dari IP yang sama dalam 10 menit. | IP otomatis diblokir setelah mencapai ambang batas; *request* selanjutnya langsung diblokir. | Selesai & Berfungsi |
| 9 | Respons Blokir | Kirim *request* yang terblokir. | *Request* menerima JSON 403 dengan *header* `X-Copcivil-Blocked: true`. | Selesai & Berfungsi |
| 10 | Pencatatan Insiden | *Trigger* deteksi serangan; verifikasi log disimpan. | Log insiden tersimpan di *Appwrite* dengan 15 field data lengkap. | Selesai & Berfungsi |
| 11 | *Dashboard* Admin | Akses *dashboard*; tampilkan statistik dan daftar insiden. | *Dashboard* menampilkan data *real-time* dengan visualisasi yang tepat (kartu statistik, *pie chart*, tabel). | Selesai & Berfungsi |
| 12 | Manajemen *Blocklist* | Blokir IP manual, unblok IP, *cleanup* IP kedaluwarsa. | Operasi CRUD berhasil; status IP berubah sesuai aksi. | Selesai & Berfungsi |
| 13 | *AI Report Generation* | *Generate* laporan keamanan dari data insiden. | Laporan AI ter-*generate* dengan analisis pola, tren, risiko, dan rekomendasi. | Selesai & Berfungsi |
| 14 | Konfigurasi Sistem | Ubah parameter sistem melalui *dashboard*. | Parameter tersimpan dan efektif pada operasi berikutnya. | Selesai & Berfungsi |
