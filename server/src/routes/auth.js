const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// 인증 불필요
router.post('/register', authController.register);
router.post('/login', authController.login);

// 인증 필요
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/me', auth, authController.updateMe);
router.put('/auth/password', auth, authController.changePassword);

module.exports = router;