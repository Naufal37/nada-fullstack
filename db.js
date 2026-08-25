const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Memastikan folder data sudah ada
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Menghubungkan ke file database SQLite
const dbPath = path.join(dataDir, 'music.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal menghubungkan ke database SQLite:', err.message);
  } else {
    console.log('Terhubung ke database SQLite.');
  }
});

// Inisialisasi struktur tabel
db.serialize(() => {
  // 1. Tabel Lagu
  db.run(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      src TEXT NOT NULL,
      cover TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Tabel Playlist
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Tabel Pivot (Menghubungkan Playlist & Lagu)
  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;