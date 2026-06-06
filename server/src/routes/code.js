const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const aiController = require('../controllers/aiController');
const auth = require('../middlewares/auth');

// 모두 인증 필요
router.post('/run', codeController.runCode);
router.post('/', auth, codeController.createCode);
router.get('/', auth, codeController.listCodes);
router.get('/:codeId', auth, codeController.getCode);
router.put('/:codeId', auth, codeController.updateCode);
router.delete('/:codeId', auth, codeController.deleteCode);
//auth기능 잠시 꺼둠
router.post('/ai/explain-error',aiController.explainer);
router.post('/ai/analyze-style',aiController.reviewer);
router.post('/ai/optimize',aiController.optimizer);

module.exports = router;