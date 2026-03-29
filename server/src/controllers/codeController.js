const Code = require('../models/Code');

// TODO: 코드 실행 구현 (Judge0 CE API)
exports.runCode = async (req, res, next) => {
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
  res.json({ message: 'getCode - TODO' });
};

// TODO: 코드 수정 구현
exports.updateCode = async (req, res, next) => {
  res.json({ message: 'updateCode - TODO' });
};

// TODO: 코드 삭제 구현
exports.deleteCode = async (req, res, next) => {
  res.json({ message: 'deleteCode - TODO' });
};