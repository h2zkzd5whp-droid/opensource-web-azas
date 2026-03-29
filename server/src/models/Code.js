const pool = require('../config/db.js');

exports.create = async ({userId, title, language, source}) => {
    const [result] = await pool.query(
        'INSERT INTO Codes (userId, title, language, source) VALUES (?, ?, ?, ?)', 
        [userId, title, language, source]
    );
    
    // get createdAt
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