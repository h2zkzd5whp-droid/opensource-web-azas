require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.test') });

const pool = require('../config/db');

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      userId    INTEGER PRIMARY KEY AUTO_INCREMENT,
      email     VARCHAR(255) UNIQUE NOT NULL,
      password  VARCHAR(255) NOT NULL,
      nickname  VARCHAR(50) NOT NULL,
      theme     VARCHAR(10) DEFAULT 'light',
      fontSize  INTEGER DEFAULT 14,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Codes (
      codeId    INTEGER PRIMARY KEY AUTO_INCREMENT,
      userId    INTEGER NOT NULL,
      title     VARCHAR(255) DEFAULT 'Untitled',
      language  VARCHAR(20) NOT NULL,
      source    TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES Users(userId)
    )
  `);
});

afterEach(async () => {
  await pool.query('DELETE FROM Codes');
  await pool.query('DELETE FROM Users');
});

afterAll(async () => {
  await pool.end();
});
