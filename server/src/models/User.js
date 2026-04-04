const pool = require('../config/db.js');

exports.findByEmail = async function(email) {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0];
}

exports.create = async (email, hashedPassword, nickname) => {
    const[result] = await pool.query('INSERT INTO Users (email, password, nickname, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())', 
        [email, hashedPassword, nickname]);
    return result.insertId;
}

// findById - getMe용
exports.findById = async (userId) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE UserId = ?', [userId]);
    return rows[0];
}

// update - updateMe용
exports.update = async (userId, nickname, theme, fontSize) => {
    const[result] = await pool.query('UPDATE Users SET nickname=?, theme=?, fontSize=? WHERE userId=?',
        [nickname, theme, fontSize, userId]);
}

// updatePassword - changePassword용
exports.updatePassword = async (userId, password) => {
    const[result] = await pool.query('UPDATE Users SET password=? WHERE userId=?',
        [password, userId]);
}
