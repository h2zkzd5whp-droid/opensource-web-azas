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

exports.findById = async (codeId) => {
    const [rows] = await pool.query(
        `SELECT codeId, userId, title, language, source, createdAt, updatedAt 
        FROM Codes WHERE codeId = ?`, [codeId]
    );
    //데이터 유효성 검증
    return rows.length > 0 ? rows[0] : null;
};