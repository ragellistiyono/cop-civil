# 3.1 PROSES PEMBANGUNAN SISTEM (Versi Detail + Kode)

> **Catatan**: Versi ini menggantikan sub-bab 3.1 di `04-bab3-eksperimen.md`. Salin seluruh isi file ini untuk menggantikan bagian 3.1 pada file tersebut (baris 7–137). Bagian AI (3.1.6) diperluas secara signifikan sesuai permintaan dosen.

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

Terlebih dahulu disusun daftar pola-pola serangan yang dikenal berbahaya, serupa dengan daftar buronan yang dimiliki oleh pos keamanan. Sebanyak 115 pola serangan dikumpulkan dan disimpan dalam empat *file* JSON berdasarkan jenis ancaman. Setiap pola memiliki struktur data sebagai berikut:

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
    byAction[inc.action_taken] =
      (byAction[inc.action_taken] || 0) + 1;
    ipCounts[inc.ip_address] =
      (ipCounts[inc.ip_address] || 0) + 1;
    urlCounts[inc.request_url] =
      (urlCounts[inc.request_url] || 0) + 1;
    totalScore += inc.threat_score || 0;
  }

  return {
    totalIncidents: incidents.length,
    byCategory,
    bySeverity,
    byAction,
    topIps: /* 10 IP penyerang teratas */,
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
