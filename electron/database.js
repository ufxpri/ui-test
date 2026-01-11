// electron/database.js - SQLite Database Module
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

/**
 * Initialize the database connection
 */
function initDatabase() {
  if (db) return db;

  // Store database in user data directory
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'cctv_app.db');

  console.log('Database path:', dbPath);

  db = new Database(dbPath, { verbose: console.log });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  createTables();

  return db;
}

/**
 * Create database tables
 */
function createTables() {
  // Cameras table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cameras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      src TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camera_id INTEGER,
      alert_type TEXT NOT NULL,
      description TEXT,
      severity TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
    )
  `);

  // Recordings table (for future use)
  db.exec(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camera_id INTEGER,
      file_path TEXT NOT NULL,
      duration INTEGER,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
    )
  `);

  // Insert sample data if cameras table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM cameras').get();
  if (count.count === 0) {
    insertSampleData();
  }
}

/**
 * Insert sample data
 */
function insertSampleData() {
  const insert = db.prepare(`
    INSERT INTO cameras (title, src, location, status)
    VALUES (?, ?, ?, ?)
  `);

  const sampleCameras = [
    ['CCTV Feed #1', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Entrance', 'active'],
    ['CCTV Feed #2', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Lobby', 'active'],
    ['CCTV Feed #3', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Parking Lot', 'active'],
    ['CCTV Feed #4', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Hallway 1', 'active'],
    ['CCTV Feed #5', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Hallway 2', 'active'],
    ['CCTV Feed #6', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Office', 'active'],
    ['CCTV Feed #7', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Warehouse', 'active'],
    ['CCTV Feed #8', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Back Door', 'active'],
    ['CCTV Feed #9', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Loading Dock', 'active'],
    ['CCTV Feed #10', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Storage Room', 'active'],
  ];

  const insertMany = db.transaction((cameras) => {
    for (const camera of cameras) {
      insert.run(...camera);
    }
  });

  insertMany(sampleCameras);
  console.log('Sample data inserted');
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Camera operations
const cameraOperations = {
  getAll: () => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM cameras ORDER BY id').all();
  },

  getById: (id) => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM cameras WHERE id = ?').get(id);
  },

  create: (camera) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO cameras (title, src, location, status)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(camera.title, camera.src, camera.location || null, camera.status || 'active');
    return { id: result.lastInsertRowid, ...camera };
  },

  update: (id, camera) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE cameras
      SET title = ?, src = ?, location = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(camera.title, camera.src, camera.location, camera.status, id);
    return cameraOperations.getById(id);
  },

  delete: (id) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM cameras WHERE id = ?');
    const result = stmt.run(id);
    return { deleted: result.changes > 0 };
  }
};

// Alert operations
const alertOperations = {
  getAll: () => {
    const db = getDatabase();
    return db.prepare(`
      SELECT a.*, c.title as camera_title
      FROM alerts a
      LEFT JOIN cameras c ON a.camera_id = c.id
      ORDER BY a.created_at DESC
    `).all();
  },

  getById: (id) => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
  },

  create: (alert) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO alerts (camera_id, alert_type, description, severity, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      alert.camera_id || null,
      alert.alert_type,
      alert.description || null,
      alert.severity || 'medium',
      alert.status || 'new'
    );
    return { id: result.lastInsertRowid, ...alert };
  },

  updateStatus: (id, status) => {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE alerts SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return alertOperations.getById(id);
  },

  delete: (id) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM alerts WHERE id = ?');
    const result = stmt.run(id);
    return { deleted: result.changes > 0 };
  }
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  cameraOperations,
  alertOperations
};
