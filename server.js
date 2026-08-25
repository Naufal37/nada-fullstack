const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder Statis
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Memastikan folder upload ada
const uploadDirs = [
  path.join(__dirname, 'uploads/music'),
  path.join(__dirname, 'uploads/covers')
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, path.join(__dirname, 'uploads/music'));
    } else if (file.fieldname === 'cover') {
      cb(null, path.join(__dirname, 'uploads/covers'));
    } else {
      cb(new Error('Field tidak dikenal'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ================= API SONGS =================

// Get semua lagu
app.get('/api/songs', (req, res) => {
  db.all('SELECT * FROM songs ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Upload lagu
app.post('/api/songs', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!req.files || !req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({ error: 'File audio wajib diunggah!' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    const src = `/uploads/music/${audioFile.filename}`;
    const cover = coverFile 
      ? `/uploads/covers/${coverFile.filename}` 
      : '/assets/covers/default.jpg';

    const songTitle = title || path.parse(audioFile.originalname).name;
    const songArtist = artist || 'Unknown Artist';

    const sql = 'INSERT INTO songs (title, artist, src, cover) VALUES (?, ?, ?, ?)';
    db.run(sql, [songTitle, songArtist, src, cover], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        title: songTitle,
        artist: songArtist,
        src: src,
        cover: cover
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// Hapus lagu
app.delete('/api/songs/:id', (req, res) => {
  const songId = req.params.id;
  db.run('DELETE FROM songs WHERE id = ?', [songId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Lagu berhasil dihapus.', id: songId });
  });
});

// ================= API PLAYLIST =================

// Buat playlist baru
app.post('/api/playlists', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama playlist wajib diisi' });

  db.run('INSERT INTO playlists (name) VALUES (?)', [name], function (err) {
    if (err) return res.status(400).json({ error: 'Playlist sudah ada!' });
    res.status(201).json({ id: this.lastID, name });
  });
});

// Ambil semua playlist
app.get('/api/playlists', (req, res) => {
  db.all('SELECT * FROM playlists ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Tambah lagu ke playlist
app.post('/api/playlists/:id/songs', (req, res) => {
  const playlistId = req.params.id;
  const { songId } = req.body;

  if (!songId) return res.status(400).json({ error: 'ID Lagu wajib disertakan' });

  db.run(
    'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)',
    [playlistId, songId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Lagu berhasil ditambahkan ke playlist!' });
    }
  );
});

// Ambil lagu dalam playlist tertentu
app.get('/api/playlists/:id/songs', (req, res) => {
  const playlistId = req.params.id;
  const sql = `
    SELECT songs.* FROM songs
    JOIN playlist_songs ON songs.id = playlist_songs.song_id
    WHERE playlist_songs.playlist_id = ?
    ORDER BY playlist_songs.id DESC
  `;
  db.all(sql, [playlistId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Hapus playlist
app.delete('/api/playlists/:id', (req, res) => {
  const playlistId = req.params.id;
  db.run('DELETE FROM playlists WHERE id = ?', [playlistId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Playlist berhasil dihapus', id: playlistId });
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});