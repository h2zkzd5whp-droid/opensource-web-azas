const pool = require('../config/db.js');

exports.create = async ({ userId, title, language, source }) => {
  const [result] = await pool.query(
    'INSERT INTO Codes (userId, title, language, source) VALUES (?, ?, ?, ?)',
    [userId, title, language, source]
  );

  const [rows] = await pool.query(
    'SELECT codeId, createdAt FROM Codes WHERE codeId = ?',
    [result.insertId]
  );

  return rows[0];
};

exports.findAllByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT codeId, title, language, createdAt, updatedAt
     FROM Codes WHERE userId = ? ORDER BY createdAt DESC`,
    [userId]
  );
  return rows;
};

exports.findById = async (codeId) => {
  const [rows] = await pool.query(
    `SELECT codeId, userId, title, language, source, createdAt, updatedAt
     FROM Codes WHERE codeId = ?`,
    [codeId]
  );
  return rows.length > 0 ? rows[0] : null;
};

exports.update = async (codeId, { title, language, source }) => {
  const [rows] = await pool.query(
    `UPDATE Codes SET title = ?, language = ?, source = ?, updatedAt = NOW()
     WHERE codeId = ?`,
    [title, language, source, codeId]
  );
  return rows.affectedRows > 0;
};

exports.delete = async (codeId) => {
  const [rows] = await pool.query(
    'DELETE FROM Codes WHERE codeId = ?',
    [codeId]
  );
  return rows.affectedRows > 0;
};
