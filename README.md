# Praktikum 4 — Camera, Projection & 3D dengan WebGL

**Mata Kuliah:** EF234504 — Grafika Komputer  
**Pertemuan:** 4  
**Topik:** Camera, Projection & 3D  
**Dosen:** Dr. Darlis Herumurti  
**Departemen:** Teknik Informatika  

---

## Identitas Mahasiswa
- **Nama:** Aji Zaenul Musthofa
- **NRP:** 5025241065

---

## 1. Deskripsi Aplikasi
Aplikasi **Rotating 3D Cube Camera Playground** adalah visualisasi 3D interaktif berbasis WebGL2 yang mendemonstrasikan implementasi lengkap pipeline transformasi 3D:
$$\text{Local Space} \xrightarrow{M} \text{World Space} \xrightarrow{V} \text{View Space} \xrightarrow{P} \text{Clip Space} \to \text{NDC} \to \text{Screen}$$

### Struktur Proyek:
```text
praktikum-04/
├── index.html
├── style.css
├── main.js
├── math3d.js
└── README.md
```

Fitur yang diimplementasikan:
- Geometry Cube 3D tersusun atas 12 segitiga (36 vertex `vec3`) dengan pewarnaan unik tiap sisi (per-face colors).
- Model Matrix 4×4 dengan rotasi otomatis pada sumbu X dan Y.
- View Matrix berbasis Camera (`lookAt`) dengan parameter Position, Target, dan Up Vector.
- Dua jenis proyeksi: **Perspective Projection** (FOV dinamis dan aspect ratio otomatis) dan **Orthographic Projection**.
- Pengaturan Near Plane dan Far Plane menggunakan preset siklis.
- Depth Buffer dan Depth Test (`gl.DEPTH_TEST`) yang dapat dinyalakan/dimatikan secara real-time.
- HUD (Heads-Up Display) informatif menampilkan status proyeksi, koordinat kamera, nilai FOV, nilai near/far, dan status depth test.

---

## 2. Kontrol Aplikasi

| Tombol / Tombol Kombinasi | Fungsi | Keterangan |
|---|---|---|
| **Arrow Left / Right** | Camera X | Menggeser posisi kamera secara horizontal |
| **Arrow Up / Down** | Camera Y | Menggeser posisi kamera secara vertikal |
| **W / S** | Camera Z | Menggeser posisi kamera maju / mundur (kedalaman) |
| **P** | Projection Toggle | Beralih antara *Perspective* dan *Orthographic* |
| **[ / ]** | FOV Control | Mengurangi / menambah FOV (30° – 100°) secara halus |
| **N** | Near/Far Preset | Mengganti preset clipping plane secara berurutan |
| **D** | Depth Test Toggle | Mengaktifkan / menonaktifkan `gl.DEPTH_TEST` |
| **R** | Reset Scene | Mengembalikan kamera dan proyeksi ke kondisi awal |
| **O** *(Challenge A)* | Orbit Camera Toggle | Kamera berputar mengelilingi target secara otomatis |
| **PageUp / PageDown** *(Challenge B)* | Camera Height | Kontrol elevasi ketinggian kamera |
| **1 / 2 / 3** *(Challenge F)* | FOV Presets | Langsung mengatur FOV ke 35° (1), 60° (2), atau 90° (3) |

---

## 3. Detail Proyeksi & Parameter Default

### Proyeksi yang Tersedia
1. **Perspective Projection**:
   - Menghasilkan efek kedalaman alami (objek yang jauh terlihat lebih kecil).
   - Dihitung menggunakan formula matriks perspektif:
     $$f = \frac{1}{\tan(\text{fovRad} / 2)},\quad \text{rangeInv} = \frac{1}{\text{near} - \text{far}}$$
2. **Orthographic Projection**:
   - Menjaga ukuran visual objek konstan tanpa memandang jarak/kedalaman (cocok untuk visualisasi teknis/CAD).
   - Mempertahankan aspect ratio viewport canvas agar kubus tidak mengalami distorsi stretching.

### Parameter Default
- **FOV Default:** 60.0°
- **Camera Position Awal:** `(0.0, 1.5, 4.0)`
- **Camera Target:** `(0.0, 0.0, 0.0)`
- **Camera Up Vector:** `(0.0, 1.0, 0.0)`
- **Near / Far Preset:**
  1. Preset 1: `near = 0.1`, `far = 100.0` (Default)
  2. Preset 2: `near = 1.0`, `far = 20.0`
  3. Preset 3: `near = 2.5`, `far = 8.0` (Menunjukkan efek near & far clipping secara jelas)
- **Depth Test:** Aktif (`ON`) secara default

---

## 4. Challenge yang Dikerjakan
Aplikasi ini melampaui requirement minimum dengan mengimplementasikan 3 tantangan sekaligus:

1. **Challenge A — Orbit Camera:**
   - Tombol **O** menyalakan/mematikan mode orbit otomatis.
   - Posisi kamera dihitung secara parametrik:
     $$x = \cos(\theta) \cdot r, \quad z = \sin(\theta) \cdot r$$
     dengan target tetap mengarah ke `(0, 0, 0)`.
2. **Challenge B — Camera Height Control:**
   - Tombol **PageUp** dan **PageDown** mengontrol ketinggian kamera ($Y$) secara langsung.
3. **Challenge F — FOV Presets:**
   - Tombol **1** mengatur FOV ke 35° (*zoom / telephoto*).
   - Tombol **2** mengatur FOV ke 60° (*normal / standard*).
   - Tombol **3** mengatur FOV ke 90° (*wide angle*).

---

## 5. Cara Menjalankan

Aplikasi menggunakan modul JavaScript ES6 (`type="module"`), sehingga harus dijalankan melalui web server lokal:

### Menggunakan Python (Built-in)
Jalankan salah satu perintah berikut di direktori proyek:
```bash
# Python 3
python -m http.server 8080
```
Buka browser dan navigasi ke: `http://localhost:8080`

### Menggunakan Node.js / npx
```bash
npx serve .
# atau
npx live-server
```

### Menggunakan VS Code Live Server
Klik kanan pada `index.html` dan pilih **Open with Live Server**.

---

## 6. Catatan Debugging
1. **WebGL2 Context & Shaders**:
   - Memastikan `#version 300 es` diletakkan persis pada baris pertama string shader tanpa spasi atau karakter sebelumnya.
   - Pengecekan kompilasi shader dengan `gl.getShaderParameter(shader, gl.COMPILE_STATUS)` dan link status program untuk menangkap error sintaks secara detail.
2. **Urutan Matrix Multiplication**:
   - Transformasi pada vertex shader mengikuti konvensi:
     $$\text{gl\_Position} = \text{u\_projection} \times \text{u\_view} \times \text{u\_model} \times \text{vec4}(a\_position, 1.0)$$
   - Menghindari pertukaran urutan perkalian pada CPU maupun GPU agar orientasi dan transformasi koordinat berada pada ruang yang tepat.
3. **Depth Buffer Truncation & Cleansing**:
   - Jika `gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)` tidak menyertakan `gl.DEPTH_BUFFER_BIT`, frame sebelumnya akan mengunci depth buffer sehingga permukaan kubus baru tertolak.
   - Memastikan `near > 0` pada matriks perspektif untuk menghindari pembagian dengan nol atau degradasi presisi z-buffer.

---

## 7. Refleksi Praktikum
Konsep kamera yang paling mudah dipahami adalah translasi posisi kamera dan pengamatan bahwa menggerakkan kamera ke kanan memberikan ilusi bahwa seluruh dunia bergerak ke kiri. Sebaliknya, konsep Look-At / View Matrix merupakan bagian paling menantang karena memerlukan pembentukan sistem koordinat ortonormal baru dari perkalian silang (cross product) vektor forward dan up, serta inversi matriks kamera agar kamera berada di origin pada View Space. Perbedaan utama proyeksi terlihat nyata saat beralih mode: perspektif memberikan sensasi kedalaman visual dengan konvergensi garis paralel dan FOV dinamis, sedangkan ortografis mempertahankan skala ukuran objek terlepas dari jaraknya. Fungsi depth test terbukti sangat esensial karena tanpa uji kedalaman, urutan penggambaran (draw order) membuat sisi belakang kubus menimpa sisi depan saat kubus berotasi. Masalah utama yang sempat diperhatikan saat debugging adalah perlunya memastikan pembersihan depth buffer di setiap awal frame agar tidak terjadi artifak visual.

