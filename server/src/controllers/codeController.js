const Code = require('../models/Code');

// TODO: implement code execution (Judge0 CE API)
exports.runCode = async (req, res, _next) => {
  res.json({ message: 'runCode - TODO' });
};

exports.createCode = async (req, res, next) => {
  try {
    const { language, source, title = 'Untitled' } = req.body;
    const userId = req.user.userId;

    if (!language) {
      return res.status(400).json({
        error: 'Language is required.',
        errorCode: 'LANGUAGE_MISSING',
        statusCode: 400
      });
    }
    if (!source) {
      return res.status(400).json({
        error: 'Source code is required.',
        errorCode: 'SOURCE_MISSING',
        statusCode: 400
      });
    }

    const result = await Code.create({ userId, title, language, source });

    res.status(201).json({
      message: 'Code saved successfully.',
      codeId: result.codeId,
      createdAt: result.createdAt
    });
  } catch (err) {
    next(err);
  }
};

exports.listCodes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const codes = await Code.findAllByUserId(userId);

    res.status(200).json({
      codes,
      total: codes.length
    });
  } catch (err) {
    next(err);
  }
};

exports.getCode = async (req, res, next) => {
  try {
    const { codeId } = req.params;
    const userId = req.user.userId;

    const code = await Code.findById(codeId);

    if (!code) {
      return res.status(404).json({
        error: 'Code not found.',
        errorCode: 'NOT_FOUND',
        statusCode: 404
      });
    }
    if (code.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied.',
        errorCode: 'FORBIDDEN',
        statusCode: 403
      });
    }

    res.status(200).json({
      codeId: code.codeId,
      title: code.title,
      language: code.language,
      source: code.source,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCode = async (req, res, next) => {
  try {
    const { codeId } = req.params;
    const { title, source, language } = req.body;
    const userId = req.user.userId;

    if (!source) {
      return res.status(400).json({
        error: 'Source code is required.',
        errorCode: 'SOURCE_MISSING',
        statusCode: 400
      });
    }

    const existingCode = await Code.findById(codeId);

    if (!existingCode) {
      return res.status(404).json({
        error: 'Code not found.',
        errorCode: 'NOT_FOUND',
        statusCode: 404
      });
    }
    if (existingCode.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied.',
        errorCode: 'FORBIDDEN',
        statusCode: 403
      });
    }

    const updatedData = {
      title: (title !== undefined && title.trim() !== '') ? title : existingCode.title,
      language: language || existingCode.language,
      source
    };

    const isUpdated = await Code.update(codeId, updatedData);
    if (isUpdated) {
      res.status(200).json({
        message: 'Code updated successfully.',
        updatedAt: new Date()
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteCode = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { codeId } = req.params;
    const code = await Code.findById(codeId);

    if (!code) {
      return res.status(404).json({
        error: 'Code not found.',
        errorCode: 'NOT_FOUND',
        statusCode: 404
      });
    }
    if (code.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied.',
        errorCode: 'FORBIDDEN',
        statusCode: 403
      });
    }

    const deleted = await Code.delete(codeId);
    if (deleted) {
      return res.status(204).json();
    }
  } catch (err) {
    next(err);
  }
};
