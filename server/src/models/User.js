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

// TODO: findById - getMe용
// TODO: update - updateMe용
// TODO: updatePassword - changePassword용

