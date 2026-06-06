const TeamMember = require('../models/TeamMember');

/**
 * GET /api/team
 * Returns all team members. Public endpoint (no auth required).
 */
exports.listMembers = async (req, res, next) => {
  try {
    const members = await TeamMember.findAll();
    res.status(200).json({ members });
  } catch (err) {
    next(err);
  }
};
