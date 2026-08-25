// Mock Database aman untuk Vercel Serverless
let songs = [];
let playlists = [];
let playlistSongs = [];

module.exports = {
  all: (sql, params, callback) => {
    if (sql.includes('playlists')) return callback(null, playlists);
    callback(null, songs);
  },
  run: (sql, params, callback) => {
    if (sql.includes('INSERT INTO songs')) {
      const newSong = { id: Date.now(), title: params[0], artist: params[1], src: params[2], cover: params[3] };
      songs.push(newSong);
      if (callback) callback.call({ lastID: newSong.id }, null);
    } else if (sql.includes('INSERT INTO playlists')) {
      const newPlaylist = { id: Date.now(), name: params[0] };
      playlists.push(newPlaylist);
      if (callback) callback.call({ lastID: newPlaylist.id }, null);
    } else {
      if (callback) callback(null);
    }
  }
};
