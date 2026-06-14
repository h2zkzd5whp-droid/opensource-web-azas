const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const aiController = require('../controllers/aiController');
const auth = require('../middlewares/auth');

// 모두 인증 필요
router.post('/run', auth, codeController.runCode);
router.post('/', auth, codeController.createCode);
router.get('/', auth, codeController.listCodes);
router.get('/:codeId', auth, codeController.getCode);
router.put('/:codeId', auth, codeController.updateCode);
router.delete('/:codeId', auth, codeController.deleteCode);
router.post('/ai/explain-error',auth, aiController.explainer);
router.post('/ai/analyze-style',auth, aiController.reviewer);

module.exports = router;