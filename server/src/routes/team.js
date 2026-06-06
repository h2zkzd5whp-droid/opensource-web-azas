const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Public: no auth required
router.get('/', teamController.listMembers);

module.exports = router;
