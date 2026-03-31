const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 정규표현식으로 이메일 형식 잡아냄

// 회원가입 구현
exports.register = async (req, res, next) => {
  try{
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) { // null보다 나음
      return res.status(400).json({
        error: '필수 필드가 누락되었습니다',
        errorCode: 'FIELD_MISSING',
        statusCode: 400
      });
    }
    if(password.length < 8) {
      return res.status(400).json({
        error: '패스워드가 너무 짧습니다. 8자 이상으로 작성해주세요.',
        errorCode: 'PASSWORD_TOO_SHORT',
        statusCode: 400
      });
    }
    if(!nickname.trim()) { // 닉네임 필드가 비어있는 것이 아니라 "   "와 같이 공백으로 이루어진 거
      return res.status(400).json({
        error: '닉네임에 공백을 제거해주세요',
        errorCode: 'NICKNAME_EMPTY',
        statusCode: 400
      });
    }
    if(!emailRe.test(email)) {
      return res.status(400).json({
        error: '이메일 형식이 올바르지 않습니다.',
        errorCode: 'INVALID_EMAIL',
        statusCode: 400
      });
    }
    
    const findUser = await User.findByEmail(email);
    
    if (findUser) {
      return res.status(409).json({
        error: '이미 존재하는 이메일입니다.',
        errorCode: 'EMAIL_DUPLICATE',
        statusCode: 409
      });
     }
     
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(email, hashedPassword, nickname);

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      userId, 
      email,
      nickname
    });
  } catch(err) {
    next(err);
  }
};

// 로그인 구현
exports.login = async (req, res, next) => {
  try{
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: '필수 필드가 누락되었습니다.',
        errorCode: 'FIELD_MISSING',
        statusCode: 400
      });
    }

    const findUser = await User.findByEmail(email);
    if (!findUser) {
      return res.status(401).json({
        error: '이메일 혹은 비밀번호가 올바르지 않습니다.',
        errorCode: 'WRONG_PASSWORD',
        statusCode: 401
      });
    }

    const passwordMatch = await bcrypt.compare(password, findUser.password);
    if(!passwordMatch) {
      return res.status(401).json({
        error: '이메일 혹은 비밀번호가 올바르지 않습니다.',
        errorCode: 'WRONG_PASSWORD',
        statusCode: 401
      });
    }

    // jwt.sign(payload, secretOrprivateKey, [option, callback])
    const token = jwt.sign({userId: findUser.userId}, process.env.JWT_SECRET, {expiresIn: '24h'});

    res.status(200).json({
      message: '로그인 성공',
      token
    });
  } catch(err) {
    next(err);
  }
};

// 내 정보 조회 구현
exports.getMe = async (req, res, next) => {
  try{
    const findUser = await User.findById(req.user.userId);

    if (!findUser) {
      return res.status(404).json({
        error: "유저를 찾을 수 없습니다",
        errorCode: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    const {userId, email, nickname, theme, fontSize} = findUser;
    res.status(200).json({
      userId, email, nickname, theme, fontSize
    }) 
  } catch(err) {
    next(err);
  }
};

// 내 정보 수정 구현
exports.updateMe = async (req, res, next) => {
  try{
    const { nickname, theme, fontSize } = req.body;

    const findUser = await User.findById(req.user.userId);
    
    if (!findUser) {
      return res.status(404).json({
        error: "유저를 찾을 수 없습니다",
        errorCode: "USER_NOT_FOUND",
        statusCode: 404
      });
    }

    const finalNickname = nickname !== undefined ? nickname : findUser.nickname;  //삼항연산자
    const finalTheme = theme !== undefined ? theme : findUser.theme;
    const finalFontSize = fontSize !== undefined ? fontSize : findUser.fontSize;

    if (nickname !== undefined) {
      if (!nickname.trim()) {
        return res.status(400).json({
        error: "닉네임이 비어있습니다",
        errorCode: "NICKNAME_EMPTY",
        statusCode: 400
      });
      }
      if (!nickname) {
        return res.status(400).json({
          error: "닉네임이 비어있습니다.",
          errorCode: "NICKNAME_EMPTY",
          statusCode: 400
        });
      }
    }

    if (theme !== undefined && theme !== 'dark' && theme !== 'light') {
      return res.status(400).json({
        error: "테마 값이 잘못되었습니다",
        errorCode: "INVALID_VALUE",
        statusCode: 400
      });
    }

    if (fontSize !== undefined) {
      const size = Number(fontSize);
      if(!Number.isInteger(size) || size < 12 || size > 24) {
        return res.status(400).json({
          error: "폰트 값이 잘못되었습니다",
          errorCode: "INVALID_VALUE",
          statusCode: 400
        });
      }
    }

    const updateUser = await User.update(req.user.userId, finalNickname, finalTheme, finalFontSize);

    res.status(200).json({
      message: "변경 성공",
      user: { userId: findUser.userId, 
        email: findUser.email,
        nickname: finalNickname, 
        theme: finalTheme, 
        fontSize: finalFontSize
      }
    });
    
  } catch(err){
    next(err);
  }
};

// TODO: 비밀번호 변경 구현
exports.changePassword = async (req, res, next) => {
  res.json({ message: 'changePassword - TODO' });
};