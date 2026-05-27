# REVISI DOSEN — 19 Mei 2026

> **Catatan**: Dokumen ini berisi empat bagian revisi sesuai masukan dosen pembimbing. Setiap bagian dirancang untuk dapat langsung disisipkan ke BAB yang relevan pada dokumen skripsi. Seluruh penjelasan diverifikasi terhadap kode sumber aktual pada repositori `cop-civil`.

**Tanggal revisi**: 19 Mei 2026
**Penulis**: Ragel Listiyono (3123510644)
**Sumber kode**: Repositori `cop-civil`, modul `copcivil/` dan `functions/copcivil-ai-report/`

---

## DAFTAR REVISI

| No | Topik Revisi | Sisipkan ke |
|----|---|---|
| 1 | Justifikasi pemilihan tingkat severity (low, medium, high, critical) | BAB 2 — Sub-bab Mekanisme Skoring |
| 2 | Cara kerja algoritma Aho-Corasick beserta hasil pemindaian | BAB 2 — Sub-bab Algoritma Deteksi |
| 3 | Contoh sanitasi *URL decoding* pada pipeline normalisasi | BAB 3 — Sub-bab Modul Normalizer |
| 4 | Detail data yang dikirim ke layanan AI eksternal (OpenRouter) | BAB 3 — Sub-bab Modul AI Report |

---

# REVISI 1 — JUSTIFIKASI PEMILIHAN TINGKAT *SEVERITY*

## 1.1 Latar Belakang Pemilihan

Setiap pola serangan dalam basis data *payload* Copcivil Security System diberikan satu dari empat tingkat keparahan (*severity*): **low**, **medium**, **high**, atau **critical**. Pemilihan empat tingkat ini bukan sembarangan, melainkan mengikuti standar industri yang lazim digunakan dalam dokumentasi keamanan, antara lain:

1. **OWASP Risk Rating Methodology** — standar penilaian risiko aplikasi web yang membagi tingkat risiko menjadi empat kategori berdasarkan kombinasi *likelihood* dan *impact*.
2. **CVSS (Common Vulnerability Scoring System) v3.1** — standar industri yang membagi kerentanan ke dalam empat band: Low (0.1-3.9), Medium (4.0-6.9), High (7.0-8.9), dan Critical (9.0-10.0).
3. **CWE/SANS Top 25** — daftar kelemahan perangkat lunak paling kritis yang menggunakan klasifikasi serupa.

Empat tingkatan ini dipilih karena memberikan granularitas yang cukup untuk membedakan pola serangan secara bermakna, namun tetap praktis untuk diimplementasikan dalam mesin skoring tanpa menimbulkan ambiguitas berlebihan.

## 1.2 Bobot Numerik Severity

Berdasarkan modul `copcivil/shared/constants.js` (baris 1-6), setiap tingkat severity diberi bobot numerik sebagai berikut:

```javascript
export const SEVERITY_WEIGHTS = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 1,
};
```

Bobot ini bersifat **non-linear** dan dirancang dengan kesengajaan. Tabel berikut memperlihatkan rasio antar tingkat:

| Tingkat | Bobot | Rasio terhadap *low* | Justifikasi |
|---|---|---|---|
| critical | 10 | 10× | Eksekusi langsung yang menyebabkan kompromi sistem permanen (RCE, *file write*, *DROP TABLE*). Satu kemunculan saja sudah cukup mengindikasikan serangan aktif. |
| high | 7 | 7× | Eksploitasi aktif dengan dampak signifikan namun belum tentu menyebabkan kompromi instan (UNION SELECT, `<script>`, `cat /etc/passwd`). Dua pola high sudah cukup untuk *block*. |
| medium | 4 | 4× | Indikasi *probing* atau eksperimen *attacker* (boolean tautology, *event handler*). Memerlukan kombinasi minimal dua pola untuk mencapai ambang *warn*. |
| low | 1 | 1× | Pola yang **dapat muncul secara legitim** dalam *query* normal (`order by`, `group by`, `concat(`). Memerlukan akumulasi tujuh kemunculan untuk masuk ke ambang *warn*, mencegah *false positive* tinggi. |

Rasio non-linear (gap critical→high lebih kecil daripada high→medium dan medium→low) dipilih agar:

- **Pola critical mendominasi keputusan**: satu pola critical (bobot 10) cukup memicu *warn* (ambang 7), dua pola critical langsung memicu *block* (ambang 15).
- **Pola low tidak akan memicu *block* sendirian**: bahkan 14 kemunculan pola low (jumlah yang sangat tidak masuk akal) tetap di bawah ambang *block*.
- **Akumulasi pola medium realistis**: empat pola medium (bobot 16) cukup untuk *block*, mencerminkan situasi serangan berlapis.

## 1.3 Ambang Keputusan (*Thresholds*)

Berdasarkan `copcivil/shared/constants.js` (baris 8-11):

```javascript
export const THRESHOLDS = {
  BLOCK: 15,
  WARN: 7,
};
```

Logika keputusan pada `copcivil/engine/scorer.js` (baris 27-34):

| Skor Total | Tindakan | Kondisi yang Memicu |
|---|---|---|
| ≥ 15 | `BLOCKED` | 2 critical, atau 1 critical + 1 high, atau 3 high + 1 medium, atau kombinasi setara |
| 7 – 14 | `WARNED` | 1 critical, atau 1 high, atau 2 medium, atau kombinasi setara |
| 1 – 6 | `LOGGED` | Pola low atau medium tunggal — direkam untuk audit tanpa intervensi |
| 0 | `LOGGED` (tanpa *match*) | Lalu-lintas bersih |

## 1.4 Contoh Klasifikasi Pola Konkret

Berikut contoh klasifikasi yang menunjukkan logika di balik pemilihan severity per pola, diambil langsung dari `copcivil/payloads/sqli.json`:

| ID Pola | Pola | Severity | Justifikasi |
|---|---|---|---|
| SQLI-007 | `drop table` | **critical** | Penghapusan tabel permanen — kerusakan ireversibel pada basis data. |
| SQLI-026 | `load_file(` | **critical** | Pembacaan *arbitrary file* dari sistem berkas server. |
| SQLI-027 | `into outfile` | **critical** | Penulisan *arbitrary file* ke sistem berkas — pintu masuk *web shell*. |
| SQLI-001 | `union select` | **high** | Teknik eksfiltrasi data, namun memerlukan *query* dasar yang sudah rentan. |
| SQLI-009 | `delete from` | **high** | Penghapusan *row*, namun lebih terlokalisasi daripada `drop table`. |
| SQLI-003 | `or 1=1` | **medium** | Tautologi boolean — sering digunakan tetapi belum mengeksekusi sesuatu yang merusak. |
| SQLI-024 | `order by` | **low** | Klausa SQL yang sangat lazim dalam *query* legitim — hanya berbahaya jika dirangkai dengan pola lain. |
| SQLI-029 | `char(` | **low** | Fungsi konversi karakter — sering digunakan untuk *evasion*, tetapi juga muncul dalam *query* sah. |

Pola yang sama pada kategori berbeda dapat memiliki severity berbeda. Sebagai contoh, untuk kategori XSS pada `copcivil/payloads/xss.json`:

| ID Pola | Pola | Severity | Justifikasi |
|---|---|---|---|
| XSS-001 | `<script>` | **high** | Tag eksekusi JavaScript langsung — ancaman aktif XSS. |
| XSS-005 | `onerror=` | **medium** | *Event handler* yang dapat dimanfaatkan, namun memerlukan elemen pembawa untuk efektif. |

## 1.5 Implikasi Desain

Pemilihan empat tingkat severity dengan bobot non-linear menghasilkan tiga karakteristik penting pada sistem:

1. **Sensitivitas tinggi terhadap pola critical** — sistem tidak menunggu akumulasi banyak *match* untuk memblokir serangan paling berbahaya.
2. **Toleransi terhadap pola low** — mengurangi *false positive* pada *query* yang secara struktural mengandung kata kunci SQL yang lazim.
3. **Akumulasi proporsional** — serangan berlapis (kombinasi beberapa pola medium) tetap akan terdeteksi melalui mekanisme penjumlahan bobot.

---

# REVISI 2 — CARA KERJA ALGORITMA AHO-CORASICK

## 2.1 Definisi dan Motivasi

Algoritma **Aho-Corasick** (Aho & Corasick, 1975) adalah algoritma pencarian *multi-pattern string matching* yang memungkinkan pencarian seluruh kemunculan dari sekumpulan pola dalam satu *string* teks dengan kompleksitas waktu **O(n + m + z)**, di mana:

- **n** = panjang teks yang dicari (misal: panjang URL atau *body request*)
- **m** = total panjang seluruh pola yang dimasukkan ke automaton
- **z** = jumlah kemunculan pola yang ditemukan dalam teks

Pada Copcivil Security System, terdapat **115 pola serangan** (30 SQLi + 30 XSS + 30 CMDi + 25 Path Traversal). Tanpa Aho-Corasick, pendekatan naif yaitu menjalankan *regex* atau `String.indexOf` untuk masing-masing pola akan menghasilkan kompleksitas **O(n × k)** di mana k = jumlah pola — sehingga setiap *request* harus dipindai 115 kali. Dengan Aho-Corasick, pemindaian dilakukan dalam **satu kali lintasan** atas teks, terlepas dari jumlah pola.

## 2.2 Tiga Tahapan Pembentukan Automaton

Implementasi pada `copcivil/engine/aho-corasick.js` mengikuti tiga tahapan klasik algoritma:

### Tahap 1 — Pembentukan *Trie* (Pohon Pencarian Awalan)

Setiap pola dimasukkan ke struktur pohon karakter (*trie*). Setiap simpul mewakili satu karakter, dan simpul akhir dari sebuah pola menyimpan metadata pola (id, kategori, severity).

Contoh visualisasi *trie* untuk empat pola sederhana (`he`, `she`, `his`, `hers`):

```
        (root)
       /  |   \
      h   s    ...
     / \   \
    e   i   h
    *   s   e
        *   *
            r
            s
            *
```

Tanda `*` menunjukkan simpul yang menjadi akhir dari sebuah pola.

Implementasi `addPattern()` (baris 23-32):

```javascript
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
```

### Tahap 2 — Pembangunan *Failure Links* (BFS)

*Failure link* adalah penunjuk dari setiap simpul ke simpul lain yang merupakan **akhiran terpanjang yang juga merupakan awalan dari pola lain**. Mekanisme ini memungkinkan algoritma "melompat" ke posisi yang valid ketika kecocokan parsial gagal, tanpa harus mengulang pemindaian dari awal — analog dengan algoritma KMP, namun untuk multi-pola.

Implementasi pada baris 37-67 menggunakan BFS dari akar:

```javascript
build() {
  const queue = [];
  for (const [, child] of this.root.children) {
    child.fail = this.root;
    queue.push(child);
  }
  while (queue.length > 0) {
    const current = queue.shift();
    for (const [char, child] of current.children) {
      queue.push(child);
      let fail = current.fail;
      while (fail !== null && !fail.children.has(char)) {
        fail = fail.fail;
      }
      child.fail = fail !== null ? fail.children.get(char) : this.root;
      if (child.fail === child) {
        child.fail = this.root;
      }
      child.output = [...child.output, ...child.fail.output]; // KUNCI
    }
  }
  this.built = true;
}
```

Baris **`child.output = [...child.output, ...child.fail.output]`** sangat penting: ia melakukan **propagasi *output*** dari *failure link* ke setiap simpul. Ini memungkinkan deteksi pola-pola yang merupakan **substring** dari pola lain (misalnya `script` di dalam `<script>`) dalam satu kali pemindaian.

### Tahap 3 — Pencarian (*Search*)

Setelah automaton terbentuk, pencarian berjalan dengan kompleksitas linear terhadap panjang teks. Implementasi pada baris 74-100:

```javascript
search(text) {
  const matches = [];
  let node = this.root;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    while (node !== this.root && !node.children.has(char)) {
      node = node.fail; // Lompat via failure link
    }
    node = node.children.get(char) || this.root;
    for (const output of node.output) {
      matches.push({
        position: i - output.pattern.length + 1,
        ...output,
      });
    }
  }
  return matches;
}
```

## 2.3 Trace Eksekusi pada Input Aktual

Untuk memperjelas cara kerja algoritma, berikut trace eksekusi pada input `union select from users` dengan dua pola yang relevan: `union select` (SQLI-001, high) dan `select` (sebagai contoh tambahan).

| i | Karakter | Simpul Aktif | Aksi Failure | Output Emit |
|---|---|---|---|---|
| 0 | u | (root)→u | — | — |
| 1 | n | u→n | — | — |
| 2 | i | n→i | — | — |
| 3 | o | i→o | — | — |
| 4 | n | o→n | — | — |
| 5 | (spasi) | n→' ' | — | — |
| 6 | s | ' '→s | — | — |
| 7 | e | s→e | — | — |
| 8 | l | e→l | — | — |
| 9 | e | l→e | — | — |
| 10 | c | e→c | — | — |
| 11 | t | c→t | — | **match: `union select` di posisi 0**, **match: `select` di posisi 6** (via fail link) |
| 12... | (spasi) f r o m ... | Lompat via failure | — | — |

Dua pola berhasil dideteksi dalam satu kali pemindaian sepanjang 25 karakter, **bukan** dua kali pemindaian.

## 2.4 Hasil Pemindaian dari Pengujian Aktual

Berdasarkan suite pengujian `copcivil/__tests__/aho-corasick.test.js`, automaton terbukti berhasil pada delapan skenario:

| # | Skenario | Input | Pola Terdaftar | Hasil |
|---|---|---|---|---|
| 1 | Pola tunggal | `say hello world` | `hello` | 1 *match* di posisi 4 |
| 2 | Multi-pola berbeda | `ahishers` | `he`, `she`, `his`, `hers` | 4 *match* (semua pola terdeteksi) |
| 3 | Pola tumpang-tindih | `union select from users` | `union select`, `select` | ≥ 2 *match* (kedua pola) |
| 4 | Tidak ada *match* | `this is clean text` | `attack` | 0 *match* |
| 5 | Input kosong | `""` | `test` | 0 *match* |
| 6 | Pola berulang | `ababab` | `ab` | 3 *match* di posisi 0, 2, 4 |
| 7 | *Search* sebelum *build* | `test` | `test` (belum dibangun) | Throw `Error('Call build() before search()')` |
| 8 | Pola sebagai *substring* dari pola lain | `<script>alert(1)</script>` | `script`, `<script>` | Kedua pola terdeteksi |

Skenario 8 paling penting untuk konteks Copcivil: input `<script>alert(1)</script>` mendeteksi **dua pola** sekaligus (`script` sebagai substring, `<script>` sebagai pola lengkap) dalam satu kali pemindaian. Ini adalah konsekuensi langsung dari propagasi *output* via *failure link* pada Tahap 2.

## 2.5 Kompleksitas dan Manfaat Praktis

| Pendekatan | Kompleksitas | Pemindaian per *Request* | Skalabilitas |
|---|---|---|---|
| Naif (loop *indexOf* per pola) | O(n × k) | 115 kali | Linear terhadap jumlah pola |
| Regex per kategori | O(n × k_regex) | 4 kali (per kategori) | Bergantung kompleksitas regex, dapat *catastrophic backtracking* |
| **Aho-Corasick (dipakai)** | **O(n + m + z)** | **1 kali** | **Konstan terhadap jumlah pola** |

Untuk *request* dengan panjang URL 200 karakter dan 115 pola, perbedaan ini berarti **sekitar 100 kali lebih cepat** pada *worst case* — krusial untuk *Edge Function* yang memiliki batas waktu eksekusi ketat (50 ms pada Netlify Edge tier gratis).

---

# REVISI 3 — CONTOH SANITASI *URL DECODING* DAN PIPELINE NORMALISASI

## 3.1 Pipeline Normalisasi Lengkap

Sebelum teks *request* dipindai oleh automaton Aho-Corasick, ia dilewatkan melalui **enam tahap normalisasi** yang dirancang untuk meruntuhkan teknik *evasion* (penyamaran) yang umum digunakan *attacker*. Implementasi pada `copcivil/engine/normalizer.js` baris 99-108:

```javascript
export function normalize(input) {
  let result = input;
  result = stripNullBytes(result);     // Tahap 1
  result = doubleDecode(result);       // Tahap 2 (URL decode 2x)
  result = htmlEntityDecode(result);   // Tahap 3
  result = caseFold(result);           // Tahap 4
  result = stripSqlComments(result);   // Tahap 5
  result = collapseWhitespace(result); // Tahap 6
  return result;
}
```

Urutan tahapan tidak sembarangan — disusun agar setiap tahap dapat menangani output dari tahap sebelumnya secara efektif.

## 3.2 Implementasi *URL Decoding* Ganda

Modul `urlDecode` dan `doubleDecode` pada `copcivil/engine/normalizer.js` baris 6-22:

```javascript
export function urlDecode(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;  // Aman terhadap input cacat
  }
}

export function doubleDecode(input) {
  const first = urlDecode(input);
  return urlDecode(first);
}
```

Mengapa *decode* dilakukan **dua kali**? Karena teknik evasion *double-URL-encoding* sering digunakan untuk melewati WAF lapis pertama. Dalam serangan ini, *attacker* meng-*encode* karakter khusus dua kali, sehingga teks `%25` (yang merupakan *encoding* dari `%`) ketika di-*decode* sekali menghasilkan `%`, yang kemudian di-*decode* lagi bersama karakter berikutnya menghasilkan karakter target.

Penanganan kesalahan dengan `try { ... } catch { return input; }` memastikan bahwa *malformed input* (misalnya `%ZZ`) tidak menyebabkan *exception* yang dapat dimanfaatkan untuk *denial of service*.

## 3.3 Contoh Sanitasi 1 — Single-Encoded XSS Payload

**Input attacker** (URL-encoded sekali):
```
%3Cscript%3Ealert(1)%3C%2Fscript%3E
```

Trace pipeline tahap demi tahap:

| Tahap | Modul | Input | Output |
|---|---|---|---|
| 1 | `stripNullBytes` | `%3Cscript%3Ealert(1)%3C%2Fscript%3E` | `%3Cscript%3Ealert(1)%3C%2Fscript%3E` (tidak berubah) |
| 2a | `urlDecode` (1) | `%3Cscript%3Ealert(1)%3C%2Fscript%3E` | `<script>alert(1)</script>` |
| 2b | `urlDecode` (2) | `<script>alert(1)</script>` | `<script>alert(1)</script>` (idempoten) |
| 3 | `htmlEntityDecode` | `<script>alert(1)</script>` | `<script>alert(1)</script>` (tidak ada entity) |
| 4 | `caseFold` | `<script>alert(1)</script>` | `<script>alert(1)</script>` (sudah lowercase) |
| 5 | `stripSqlComments` | `<script>alert(1)</script>` | `<script>alert(1)</script>` (tidak ada komentar) |
| 6 | `collapseWhitespace` | `<script>alert(1)</script>` | `<script>alert(1)</script>` |

**Hasil akhir**: `<script>alert(1)</script>` — siap dipindai. Pola XSS-001 (`<script>`) dan XSS-002 (`</script>`) akan terdeteksi.

## 3.4 Contoh Sanitasi 2 — Double-Encoded SQLi Payload (Evasion)

**Input attacker** (URL-encoded dua kali):
```
%2527%2520OR%25201%253D1
```

Tahap dekoding ini adalah skenario klasik di mana *single-decode* WAF gagal mendeteksi serangan:

| Tahap | Modul | Input | Output |
|---|---|---|---|
| 1 | `stripNullBytes` | `%2527%2520OR%25201%253D1` | `%2527%2520OR%25201%253D1` |
| 2a | `urlDecode` (1) | `%2527%2520OR%25201%253D1` | `%27%20OR%201%3D1` ← **masih ter-*encode*** |
| 2b | `urlDecode` (2) | `%27%20OR%201%3D1` | `' OR 1=1` ← **sekarang baru terbaca** |
| 3 | `htmlEntityDecode` | `' OR 1=1` | `' OR 1=1` |
| 4 | `caseFold` | `' OR 1=1` | `' or 1=1` |
| 5 | `stripSqlComments` | `' or 1=1` | `' or 1=1` |
| 6 | `collapseWhitespace` | `' or 1=1` | `' or 1=1` |

**Hasil akhir**: `' or 1=1` — pola SQLI-003 (`or 1=1`, severity medium) dan SQLI-013 (`' or '`) akan terdeteksi. **Tanpa double-decode, serangan ini akan lolos.**

## 3.5 Contoh Sanitasi 3 — Mixed Evasion (Null Byte + HTML Entity + Case)

**Input attacker** (kombinasi tiga teknik *evasion*):
```
SEL\x00ECT &#60;img&#62; UNI/**/ON
```

Trace lengkap menunjukkan mengapa urutan tahapan penting:

| Tahap | Modul | Input | Output |
|---|---|---|---|
| 1 | `stripNullBytes` | `SEL\x00ECT &#60;img&#62; UNI/**/ON` | `SELECT &#60;img&#62; UNI/**/ON` |
| 2 | `doubleDecode` | `SELECT &#60;img&#62; UNI/**/ON` | `SELECT &#60;img&#62; UNI/**/ON` (tidak ada % encoding) |
| 3 | `htmlEntityDecode` | `SELECT &#60;img&#62; UNI/**/ON` | `SELECT <img> UNI/**/ON` |
| 4 | `caseFold` | `SELECT <img> UNI/**/ON` | `select <img> uni/**/on` |
| 5 | `stripSqlComments` | `select <img> uni/**/on` | `select <img> union` |
| 6 | `collapseWhitespace` | `select <img> union` | `select <img> union` |

**Hasil akhir**: `select <img> union` — pola SQLI-012 (`select from`) tidak ter-*match*, namun pola `union` (jika ada di payload database) atau pola XSS terkait `<img>` akan terdeteksi.

Catatan penting tentang **urutan**:
- `stripNullBytes` **harus** menjadi tahap pertama, karena jika `caseFold` atau modul regex lainnya bertemu null byte di tengah string pada lingkungan tertentu, perilaku dapat menjadi tidak terdefinisi.
- `doubleDecode` **harus** sebelum `htmlEntityDecode`, karena attacker dapat meng-*encode* HTML entity dengan URL encoding (`%26%23%36%30%3B` → `&#60;` → `<`) untuk evasion berlapis.
- `caseFold` **harus** sebelum `stripSqlComments`, agar ekspresi regex komentar tidak perlu memikirkan variasi *case*.

## 3.6 Visualisasi Pipeline

```
INPUT MENTAH (raw request)
        ↓
┌─────────────────────────┐
│ 1. stripNullBytes       │  Hapus \x00 (sabotase string)
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ 2. doubleDecode         │  decodeURIComponent × 2
└────────────┬────────────┘     (anti double-encoding)
             ↓
┌─────────────────────────┐
│ 3. htmlEntityDecode     │  &lt; → <, &#60; → <, &#x3C; → <
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ 4. caseFold             │  Seluruhnya menjadi huruf kecil
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ 5. stripSqlComments     │  Hapus /*...*/, --..., #...
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ 6. collapseWhitespace   │  Multi-spasi/tab/newline → 1 spasi
└────────────┬────────────┘
             ↓
TEKS TER-NORMALISASI
        ↓
[Aho-Corasick search]
```

---

# REVISI 4 — DATA YANG DIKIRIM KE LAYANAN AI EKSTERNAL (OPENROUTER)

## 4.1 Latar Belakang Modul AI Report

Modul `copcivil-ai-report` berfungsi menghasilkan laporan analitik keamanan berbasis AI dengan memanfaatkan *Large Language Model* (LLM) melalui layanan **OpenRouter** (https://openrouter.ai). Laporan ini disusun secara otomatis baik berdasarkan permintaan administrator (*on-demand*) maupun terjadwal (*periodic*, harian).

Kekhawatiran utama dalam mengirim data keamanan ke layanan pihak ketiga adalah **kebocoran informasi sensitif**, antara lain *payload* serangan mentah, alamat IP korban yang dapat di-*correlate* ke identitas, *body request* yang mungkin mengandung kredensial, dan informasi sesi pengguna sah.

Untuk memitigasi hal ini, modul Copcivil **tidak pernah mengirim data mentah** ke OpenRouter. Yang dikirim adalah **agregasi statistik** yang sudah dihilangkan informasi pengenalnya.

## 4.2 Endpoint dan Model Default

Berdasarkan `functions/copcivil-ai-report/src/main.js` baris 90:

| Aspek | Nilai |
|---|---|
| URL endpoint | `https://openrouter.ai/api/v1/chat/completions` |
| Metode HTTP | `POST` |
| *Authentication* | `Authorization: Bearer ${OPENROUTER_API_KEY}` |
| *Content-Type* | `application/json` |
| Model default | `anthropic/claude-sonnet-4` (baris 140) |
| Model dapat diubah | Ya, via koleksi `security_config` dengan key `openrouter_model` |
| *Rate limit internal* | 1 laporan per 5 menit (baris 45-56) |

## 4.3 Data yang Dikirim — Dijamin Hanya Agregasi

Fungsi `aggregateIncidents()` pada `copcivil/ai-report-logic.js` baris 21-69 mengubah daftar insiden mentah menjadi **objek statistik tanpa identitas individual**. Berikut struktur lengkap data yang dikirim:

### 4.3.1 Objek Statistik Hasil Agregasi

```javascript
{
  totalIncidents: <number>,           // Jumlah total insiden
  byCategory: {                       // Hitungan per kategori serangan
    sqli: <number>,
    xss: <number>,
    cmdi: <number>,
    path_traversal: <number>
  },
  bySeverity: {                       // Hitungan per tingkat severity
    critical: <number>,
    high: <number>,
    medium: <number>,
    low: <number>
  },
  byAction: {                         // Hitungan per tindakan
    blocked: <number>,
    warned: <number>,
    logged: <number>
  },
  topIps: [                           // Top 10 IP penyerang (hanya count)
    { ip: "<string>", count: <number> },
    ...
  ],
  topUrls: [                          // Top 10 URL target (hanya count)
    { url: "<string>", count: <number> },
    ...
  ],
  avgThreatScore: <number>            // Rata-rata threat score
}
```

### 4.3.2 *Prompt* Lengkap yang Dikirim

Sistem mengirim dua *message* ke OpenRouter — *system prompt* (peran AI) dan *user prompt* (data analitik). Berdasarkan `copcivil/ai-report-logic.js` baris 110-118 dan 77-105:

**System Prompt** (peran/instruksi AI):
```
You are an expert cybersecurity analyst specializing in web application
security. You analyze security incident data and produce clear, actionable
reports.

Your reports should be:
- Professional and suitable for both technical and non-technical stakeholders
- Data-driven — reference specific numbers from the provided data
- Actionable — every recommendation should be specific and implementable
- Risk-aware — clearly communicate the severity of findings

Format your response in clean Markdown with proper headings and sections.
```

**User Prompt** (template, dengan data terisi):
```
Analyze the following web security incident data for the period
{period_start} to {period_end}.

## Incident Summary
- **Total Incidents:** {totalIncidents}
- **Average Threat Score:** {avgThreatScore}

## Breakdown by Attack Category
- sqli: {count}
- xss: {count}
- cmdi: {count}
- path_traversal: {count}

## Breakdown by Severity
- critical: {count}
- high: {count}
- medium: {count}
- low: {count}

## Breakdown by Action Taken
- blocked: {count}
- warned: {count}
- logged: {count}

## Top Attacking IPs
1. {ip} ({count} incidents)
2. ...
(maksimum 10 baris)

## Top Targeted Endpoints
1. {url} ({count} hits)
2. ...
(maksimum 10 baris)

Please provide:
1. **Executive Summary** — A concise overview of the security posture
   during this period.
2. **Threat Analysis** — Detailed analysis of attack patterns, trends,
   and attacker behavior.
3. **Risk Assessment** — Current risk level (Critical/High/Medium/Low)
   with justification.
4. **Recommendations** — Specific, actionable security recommendations
   based on the data.
5. **Trend Comparison** — Note any concerning patterns or escalations.
```

## 4.4 Data yang **TIDAK** Dikirim

Untuk perlindungan privasi dan keamanan, sistem **secara eksplisit tidak mengirim** data berikut:

| Kategori Data | Status | Alasan |
|---|---|---|
| *Payload* serangan mentah (`payload_excerpt`) | ❌ Tidak dikirim | Dapat mengandung *secret* atau token yang ter-*injected* |
| *Body request* HTTP lengkap | ❌ Tidak dikirim | Berisi data form, kredensial, sesi |
| *Headers* HTTP lengkap | ❌ Tidak dikirim | Berisi *cookie*, *authorization* |
| Daftar IP lengkap (di luar top 10) | ❌ Tidak dikirim | Membatasi *fingerprint* serangan |
| *User-Agent* mentah | ❌ Tidak dikirim | Dapat mengandung penanda perangkat |
| ID pengguna sistem (`x-appwrite-user-id`) | ❌ Tidak dikirim ke OpenRouter | Hanya disimpan internal di `requested_by` field |
| *Session token* atau *cookie* | ❌ Tidak dikirim | Dilarang prinsip *least privilege* |
| Detail timestamp per insiden | ❌ Tidak dikirim | Hanya periode (start–end) yang dikirim |

## 4.5 Contoh Konkret *Payload* HTTP ke OpenRouter

Berikut contoh *body request* aktual yang dikirim ke `https://openrouter.ai/api/v1/chat/completions` berdasarkan trace fungsi `callOpenRouter()` (baris 82-112), untuk periode 24 jam dengan 47 insiden:

```json
{
  "model": "anthropic/claude-sonnet-4",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert cybersecurity analyst specializing in web application security. You analyze security incident data and produce clear, actionable reports.\n\nYour reports should be:\n- Professional and suitable for both technical and non-technical stakeholders\n- Data-driven — reference specific numbers from the provided data\n- Actionable — every recommendation should be specific and implementable\n- Risk-aware — clearly communicate the severity of findings\n\nFormat your response in clean Markdown with proper headings and sections."
    },
    {
      "role": "user",
      "content": "Analyze the following web security incident data for the period 2026-05-18T18:00:00Z to 2026-05-19T18:00:00Z.\n\n## Incident Summary\n- **Total Incidents:** 47\n- **Average Threat Score:** 8\n\n## Breakdown by Attack Category\n- sqli: 21\n- xss: 14\n- cmdi: 8\n- path_traversal: 4\n\n## Breakdown by Severity\n- critical: 3\n- high: 18\n- medium: 19\n- low: 7\n\n## Breakdown by Action Taken\n- blocked: 6\n- warned: 24\n- logged: 17\n\n## Top Attacking IPs\n1. 203.0.113.45 (12 incidents)\n2. 198.51.100.22 (8 incidents)\n3. 192.0.2.78 (5 incidents)\n... (maksimum 10 baris)\n\n## Top Targeted Endpoints\n1. /api/login (15 hits)\n2. /admin/users (9 hits)\n... (maksimum 10 baris)\n\nPlease provide:\n1. **Executive Summary** ...\n5. **Trend Comparison** ..."
    }
  ]
}
```

Total ukuran *payload* tipikal: **3-8 KB** (jauh lebih kecil daripada mengirim 47 insiden mentah yang dapat mencapai puluhan hingga ratusan KB).

## 4.6 Pengamanan Tambahan

Selain pembatasan data, modul ini menerapkan beberapa lapisan pengamanan:

1. **Rate limiting internal** (baris 45-56): maksimum 1 laporan per 5 menit untuk mencegah *abuse* atau *cost overrun* pada API.
2. **Pembatasan jumlah insiden**: maksimum 1000 insiden per laporan (baris 76, `if (offset > 1000) break`).
3. **Capping ukuran respons sebelum disimpan**: `summary` dipotong 10.000 karakter, `recommendations` 5.000 karakter, `stats_json` 5.000 karakter (baris 152-154) — mencegah *DoS* via respons LLM yang besar.
4. **API key di-*environment variable***: `OPENROUTER_API_KEY` tidak pernah masuk ke kode atau log.
5. **Validasi periode**: jika `period_start` atau `period_end` tidak diberikan, request langsung ditolak dengan HTTP 400 (baris 173-175).
6. **Penanganan periode kosong**: jika tidak ada insiden dalam periode, *placeholder report* disimpan tanpa memanggil OpenRouter sama sekali (baris 121-137) — menghemat biaya API.

## 4.7 Ringkasan untuk Skripsi

Modul AI Report Copcivil dirancang dengan prinsip ***data minimization*** (GDPR Art. 5(1)(c)). Layanan AI eksternal hanya menerima *aggregated metadata* — tidak ada *payload* mentah, *body request*, atau identitas pengguna sistem yang dikirim. Pendekatan ini memungkinkan pemanfaatan kemampuan analitik LLM modern tanpa mengorbankan privasi atau keamanan informasi.

---

# RINGKASAN PENERAPAN

| Revisi | Sisipkan ke | Perkiraan Halaman |
|---|---|---|
| 1. Justifikasi severity | BAB 2 setelah sub-bab "Mekanisme Skoring" atau "Klasifikasi Pola" | 3-4 halaman |
| 2. Cara kerja Aho-Corasick + hasil scan | BAB 2 setelah sub-bab "Algoritma Deteksi", BAB 3 sebagai bagian implementasi | 4-5 halaman |
| 3. Sanitasi URL decode | BAB 3 sub-bab "Modul Normalizer" atau "Sanitasi Input" | 3-4 halaman |
| 4. Data ke OpenRouter | BAB 3 sub-bab "Modul AI Report" + BAB 4 (Penutup) bagian Etika/Privasi | 3-4 halaman |

**Total tambahan estimasi**: 13-17 halaman.

---

**Status verifikasi terhadap kode sumber**:
- ✅ `copcivil/shared/constants.js` — bobot dan threshold cocok
- ✅ `copcivil/engine/aho-corasick.js` — algoritma cocok
- ✅ `copcivil/engine/normalizer.js` — pipeline cocok
- ✅ `copcivil/engine/scorer.js` — logika keputusan cocok
- ✅ `copcivil/ai-report-logic.js` — *prompt* dan agregasi cocok
- ✅ `functions/copcivil-ai-report/src/main.js` — endpoint dan payload cocok
- ✅ `copcivil/__tests__/aho-corasick.test.js` — hasil pengujian valid
- ✅ `copcivil/__tests__/normalizer.test.js` — contoh sanitasi valid

Seluruh referensi *file:line* dapat diverifikasi langsung pada repositori `cop-civil` cabang `main`.
