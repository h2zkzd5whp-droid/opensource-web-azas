const Code = require('../models/Code');

// TODO: 코드 실행 구현 (Judge0 CE API)
exports.runCode = async (req, res, _next) => {
  res.json({ message: 'runCode - TODO' });
};

// TODO: 코드 저장 (신규) 구현
exports.createCode = async (req, res, next) => {
  try {
        const { language, source, title = 'Untitled'} = req.body;
        const userId = req.user.userId; 

        //데이터 검증
        if (!language) {
            return res.status(400).json({ 
                error: '언어는 필수입니다.' ,
                errorCode: 'LANGUAGE_MISSING',
                statusCode: 400
            });
        }
        if(!source){
            return res.status(400).json({ 
                error: '소스 코드는 필수입니다.' ,
                errorCode: 'SOURCE_MISSING',
                statusCode: 400
            });
        }

        //DB 저장
        const result = await Code.create({
            userId,
            title,
            language,
            source
        });

        res.status(201).json({
            message: '코드가 성공적으로 저장되었습니다.',
            codeId: result.codeId,
            createdAt :result.createdAt
        });

      }catch(err) {
      next(err);
      }
};

// TODO: 코드 목록 구현
exports.listCodes = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const codes = await Code.findAllByUserId(userId);

        res.status(200).json({
            codes: codes,
            total: codes.length
        });
    } catch (err) {
        next(err);
    }
};

// TODO: 코드 불러오기 구현
exports.getCode = async (req, res, next) => {
  try {
        const { codeId } = req.params;
        const userId = req.user.userId;

        const code = await Code.findById(codeId);

        //received null from models
        if (!code) {
            return res.status(404).json({
                error: '해당 소스코드를 찾을 수 없습니다.',
                errorCode: 'NOT_FOUND',
                statusCode: 404
            });
        }
        if (code.userId !== userId) {
            return res.status(403).json({
                error: '접근 권한이 없습니다.',
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

// TODO: 코드 수정 구현
exports.updateCode = async (req, res, next) => {
    try {
        const { codeId } = req.params;
        const { title, source, language } = req.body;
        const userId = req.user.userId;

        if (!source) {
            return res.status(400).json({
                error: '소스코드는 필수 항목입니다.',
                errorCode: 'SOURCE_MISSING',
                statusCode: 400
            });
        }

        const existingCode = await Code.findById(codeId);
        
        if (!existingCode) {
            return res.status(404).json({
                error: '해당 코드를 찾을 수 없습니다.',
                errorCode: 'NOT_FOUND',
                statusCode: 404
            });
        }

        if (existingCode.userId !== userId) {
            return res.status(403).json({
                error: '본인의 페이지만 수정할 수 있습니다.',
                errorCode: 'FORBIDDEN',
                statusCode: 403
            });
        }

        const updatedData = {
            // title이 들어오면 새 값, 없으면 기존 값 유지
            title: (title !== undefined && title.trim() !== "") ? title : existingCode.title,
            language: language || existingCode.language,
            source: source
        };

        const isUpdated = await Code.update(codeId, updatedData);
        if (isUpdated) {
            res.status(200).json({
                message: '코드가 성공적으로 수정되었습니다.',
                updatedAt: new Date()
            });
        }
    } catch (err) {
        next(err);
    }
};

// TODO: 코드 삭제 구현
exports.deleteCode = async (req, res, next) => {
  try{
        const userId = req.user.userId;
        const { codeId } =req.params;
        const code = await Code.findById(codeId);

        if (!code) {
            return res.status(404).json({
                error: '해당 소스코드를 찾을 수 없습니다.',
                errorCode: 'NOT_FOUND',
                statusCode: 404
            });
        }

        if (code.userId !== userId) {
            return res.status(403).json({
                error: '접근 권한이 없습니다.',
                errorCode: 'FORBIDDEN',
                statusCode: 403
            });
        }

        const deleted = await Code.delete(codeId);
        if(deleted){
            return res.status(204).json();
        }
    } catch(err){
        next(err);
    }
};