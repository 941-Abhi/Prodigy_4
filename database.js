const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'chat_app.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists');
    }
  });

  // Create chat_rooms table
  db.run(`CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating chat_rooms table:', err.message);
    } else {
      console.log('Chat rooms table created or already exists');
      // Insert default rooms
      insertDefaultRooms();
    }
  });

  // Create messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating messages table:', err.message);
    } else {
      console.log('Messages table created or already exists');
    }
  });
}

// Insert default chat rooms
function insertDefaultRooms() {
  const defaultRooms = [
    { id: 'general', name: 'General' },
    { id: 'random', name: 'Random' }
  ];

  defaultRooms.forEach(room => {
    db.run(`INSERT OR IGNORE INTO chat_rooms (id, name) VALUES (?, ?)`, 
      [room.id, room.name], 
      (err) => {
        if (err) {
          console.error('Error inserting default room:', err.message);
        }
      }
    );
  });
}

// Database operations
const dbOperations = {
  // User operations
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
        [userData.id, userData.username, userData.email, userData.password],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        }
      );
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Chat room operations
  getRooms: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM chat_rooms', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Message operations
  saveMessage: (messageData) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO messages (id, room_id, user_id, username, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [messageData.id, messageData.roomId, messageData.userId, messageData.username, messageData.message, messageData.timestamp],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...messageData });
          }
        }
      );
    });
  },

  getRoomMessages: (roomId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, room_id, user_id, username, message, created_at as timestamp FROM messages WHERE room_id = ? ORDER BY created_at ASC',
        [roomId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  getAllMessages: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT m.id, m.room_id, m.user_id, m.username, m.message, m.created_at as timestamp, u.username as sender_name, r.name as room_name 
        FROM messages m 
        JOIN users u ON m.user_id = u.id 
        JOIN chat_rooms r ON m.room_id = r.id 
        ORDER BY m.created_at DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = { db, dbOperations }; 