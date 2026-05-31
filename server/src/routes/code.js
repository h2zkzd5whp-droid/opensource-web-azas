const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const auth = require('../middlewares/auth');

// 모두 인증 필요
router.post('/run', codeController.runCode);
router.post('/', auth, codeController.createCode);
router.get('/', auth, codeController.listCodes);
router.get('/:codeId', auth, codeController.getCode);
router.put('/:codeId', auth, codeController.updateCode);
router.delete('/:codeId', auth, codeController.deleteCode);

module.exports = router;