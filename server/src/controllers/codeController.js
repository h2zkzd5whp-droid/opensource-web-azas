const Code = require('../models/Code');

/*
  ****required install docker****

  API details
    [POST] /api/run
    Header: Content-Type: application/json
    JSON
    {
        "language": "python",
        "source": "print('Hello, World!')"
    }

    response JSON(example)
    {
        "stdout": "Hello, World!\n",
        "stderr": "",
        "exitCode": 0,
        "executionTime": "300ms"
    }

  For some languages, such as Java, warning messages may be displayed in `stderr` 
  during the compilation process depending on the environment settings. 
  If `exitCode` is 0, it means the execution was successful, so you can rest assured.
*/

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const languageConfig = {
    python: { 
        image: 'python:3.12-slim', 
        cmd: 'python -u /app/script.py', 
        ext: 'py' 
    },
    javascript: { 
        image: 'node:20-slim', 
        cmd: 'node /app/script.js', 
        ext: 'js' 
    },
    typescript: { 
        image: 'node:20-slim', 
        cmd: 'npx -p typescript tsc /app/script.ts --target es6 --module commonjs && node /app/script.js && rm /app/script.js', 
        ext: 'ts' 
    },
    java: { 
        image: 'eclipse-temurin:17-jdk-jammy', 
        cmd: 'cp /app/script.java /app/Main.java && javac /app/Main.java && java -cp /app Main && rm /app/Main.java /app/Main.class /app/script.java', 
        ext: 'java' 
    },
    cpp: { 
        image: 'gcc:latest', 
        cmd: 'g++ -o /app/app /app/script.cpp && /app/app && rm /app/app', 
        ext: 'cpp' 
    },
    go: { 
        image: 'golang:1.21-alpine', 
        cmd: 'go build -o /app/app /app/script.go && /app/app; rm -f /app/app', 
        ext: 'go' 
    },
    ruby: { 
        image: 'ruby:3.2-slim', 
        cmd: 'ruby /app/script.rb', 
        ext: 'rb' 
    }
};

exports.runCode = async (req, res, next) => {
    const { language, source } = req.body;

    if (!language) return res.status(400).json({ error: 'LANGUAGE_MISSING' });
    if (!source) return res.status(400).json({ error: 'SOURCE_MISSING' });
    if (!languageConfig[language]) return res.status(400).json({ error: 'UNSUPPORTED_LANGUAGE' });

    const tempDir = path.join(__dirname, 'temp');
    const config = languageConfig[language];
    const filePath = path.join(tempDir, `script.${config.ext}`);

    try {
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(filePath, source);

        const absoluteTempDir = path.resolve(tempDir).replace(/\\/g, '/');
        const cmd = `docker run --rm -v "${absoluteTempDir}:/app" -w /app ${config.image} sh -c "${config.cmd}"`;
        const startTime = Date.now();
        //timeout = 10ms
        exec(cmd, { timeout: 10000 }, async (error, stdout, stderr) => {
            try { await fs.unlink(filePath); } catch (e) { }

            if (error && error.killed) return res.status(504).json({ error: 'EXECUTION_TIMEOUT' });
            
            const exitCode = error ? error.code : 0;
            if (exitCode !== 0) {
                return res.status(502).json({ error: 'EXECUTION_FAILED', stderr });
            }

            res.status(200).json({
                stdout: stdout || "",
                stderr: stderr || "",
                exitCode: 0,
                executionTime: `${Date.now() - startTime}ms`
            });
        });
    } catch (err) {
        next(err);
    }
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
