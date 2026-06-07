const pool = require('../config/db.js');

/**
 * Fetch all team members from the TeamMembers table.
 * @returns {Promise<Array>} Array of team member objects.
 */
exports.findAll = async () => {
  const [rows] = await pool.query(
    'SELECT memberId, name, role, email, imgKey,githubUrl FROM TeamMembers ORDER BY memberId ASC'
  );
  return rows;
};
