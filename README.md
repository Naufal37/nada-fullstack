# Nada — Music Player (versi Database + API)

Versi ini beda dari sebelumnya: sekarang ada **server (backend)** dan **database**,
jadi kamu bisa tambah/hapus lagu langsung lewat form di website — nggak perlu edit kode lagi.

## Cara kerjanya (singkat)

```
Browser (frontend)  <-- fetch() -->  Express server (server.js)  <-->  SQLite (data/nada.db)
   public/index.html                      + Multer (upload file)         uploads/music/
   public/style.css                                                       uploads/covers/
   public/script.js
```

- **Frontend** (`public/`): tampilan yang kamu lihat di browser. Sekarang dia manggil API,
  bukan baca array lagu yang di-hardcode kayak sebelumnya.
- **Backend** (`server.js` + `db.js`): server Node.js/Express yang nyediain endpoint API,
  nyimpen file yang diupload ke folder `uploads/`, dan nyimpen data lagu ke database SQLite.
- **Database** (`data/nada.db`): file database SQLite, otomatis dibuat pas server pertama
  kali dijalankan.

## 1. Persiapan (sekali aja)

1. Install **Node.js** dulu kalau belum ada: https://nodejs.org (pilih versi LTS).
   Cek sudah kepasang dengan buka CMD lalu ketik:
   ```
   node -v
   npm -v
   ```
2. Extract folder ini, buka CMD/terminal di dalam folder `nada-fullstack`.
3. Install semua dependency:
   ```
   npm install
   ```
   (ini bakal download Express, Multer, dan better-sqlite3 — sekali install aja, nanti kepakai terus)

## 2. Menjalankan website

```
npm start
```

Kalau berhasil, muncul tulisan `Nada jalan di http://localhost:3000`.
Buka browser, akses **http://localhost:3000** — websitenya jalan dari situ.

Biarkan jendela terminal itu tetap terbuka selama kamu pakai websitenya (itu server-nya jalan).
Untuk mematikan server, tekan `Ctrl + C` di terminal.

## 3. Cara menambahkan lagu (sekarang lewat website, bukan edit kode!)

1. Buka website, klik menu **"+ Tambah Lagu"** di navbar.
2. Isi judul, nama artis, pilih file MP3 (wajib), dan cover gambar (opsional).
3. Klik **Upload Lagu**.
4. Lagu otomatis kesimpen ke database dan langsung muncul di Beranda / Rekomendasi.

File yang kamu upload otomatis disalin server ke:
- `uploads/music/` untuk file MP3
- `uploads/covers/` untuk cover

## 4. Fitur yang tersedia

- Upload lagu baru lewat form (tersimpan ke database SQLite)
- Hapus lagu (hover di kartu lagu → klik ikon tempat sampah — otomatis hapus data + filenya juga)
- Play/pause, next/previous, shuffle, repeat
- Progress bar (seek) + durasi real-time, volume control
- Pencarian lagu (judul & artis)
- Favorit — sekarang tersimpan di database, bukan cuma di browser, jadi tetap ada
  meskipun kamu buka dari browser lain
- Playlist — bisa buat playlist baru, tambah/keluarin lagu dari playlist, hapus playlist
- Music player tetap nempel di bawah di semua halaman
- Responsive: desktop, tablet, HP

## 5. Daftar API (kalau mau dikembangin sendiri)

| Method | Endpoint                              | Fungsi                          |
|--------|----------------------------------------|----------------------------------|
| GET    | `/api/songs`                           | Ambil semua lagu                |
| POST   | `/api/songs`                           | Upload lagu baru (form-data)    |
| PUT    | `/api/songs/:id`                       | Edit judul/artis lagu           |
| PATCH  | `/api/songs/:id/favorite`              | Toggle status favorit           |
| DELETE | `/api/songs/:id`                       | Hapus lagu (+ file-nya)         |
| GET    | `/api/playlists`                       | Ambil semua playlist            |
| POST   | `/api/playlists`                       | Buat playlist baru              |
| POST   | `/api/playlists/:id/songs`             | Tambah lagu ke playlist         |
| DELETE | `/api/playlists/:id/songs/:songId`     | Keluarkan lagu dari playlist    |
| DELETE | `/api/playlists/:id`                   | Hapus playlist                  |

## 6. Reset data dari awal

Kalau mau kosongin semua data (lagu, playlist, favorit) dan mulai dari nol:

1. Matikan server (`Ctrl + C`)
2. Hapus file `data/nada.db` (dan `data/nada.db-wal`, `data/nada.db-shm` kalau ada)
3. Hapus semua file di dalam `uploads/music/` dan `uploads/covers/`
4. Jalankan `npm start` lagi — database kosong otomatis dibuat ulang

## 7. Ganti nama website

Buka `public/index.html`, cari `<div class="logo">`, ubah teks di dalam `<span>Nada</span>`.
Judul tab browser ada di tag `<title>` pada bagian `<head>`.

## Catatan

Website ini jalan **lokal di komputer kamu** (localhost). Kalau mau bisa diakses dari HP
atau perangkat lain di jaringan yang sama, kamu perlu cari tahu IP lokal komputermu
(`ipconfig` di CMD) dan akses `http://IP-KAMU:3000` dari perangkat lain — pastikan
firewall Windows mengizinkan koneksi ke port 3000.
