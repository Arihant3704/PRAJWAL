import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const db = new Database('database.sqlite');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subject TEXT,
    content TEXT,
    is_spam BOOLEAN,
    spam_score REAL,
    matched_keywords TEXT,
    execution_time REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add default users if not exists
const checkUser = db.prepare('SELECT id FROM users WHERE email = ?');
const insertUser = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');

const admin = checkUser.get('prajwal@gmail.com');
if (!admin) {
  const hashedPassword = bcrypt.hashSync('12345678', 10);
  insertUser.run('prajwal@gmail.com', hashedPassword, 'Administrator');
}

const user = checkUser.get('user@spamshield.com');
if (!user) {
  const hashedPassword = bcrypt.hashSync('user123', 10);
  insertUser.run('user@spamshield.com', hashedPassword, 'Demo User');
}

export default db;
