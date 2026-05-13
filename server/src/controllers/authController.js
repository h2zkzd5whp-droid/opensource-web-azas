const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      return res.status(400).json({
        error: 'Required fields are missing.',
        errorCode: 'FIELD_MISSING',
        statusCode: 400
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters.',
        errorCode: 'PASSWORD_TOO_SHORT',
        statusCode: 400
      });
    }
    if (!nickname.trim()) {
      return res.status(400).json({
        error: 'Nickname cannot be empty.',
        errorCode: 'NICKNAME_EMPTY',
        statusCode: 400
      });
    }
    if (!emailRe.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format.',
        errorCode: 'INVALID_EMAIL',
        statusCode: 400
      });
    }

    const findUser = await User.findByEmail(email);

    if (findUser) {
      return res.status(409).json({
        error: 'This email is already in use.',
        errorCode: 'EMAIL_DUPLICATE',
        statusCode: 409
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(email, hashedPassword, nickname);

    res.status(201).json({
      message: 'Registration successful.',
      userId,
      email,
      nickname
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Required fields are missing.',
        errorCode: 'FIELD_MISSING',
        statusCode: 400
      });
    }

    const findUser = await User.findByEmail(email);
    if (!findUser) {
      return res.status(401).json({
        error: 'Incorrect email or password.',
        errorCode: 'WRONG_PASSWORD',
        statusCode: 401
      });
    }

    const passwordMatch = await bcrypt.compare(password, findUser.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Incorrect email or password.',
        errorCode: 'WRONG_PASSWORD',
        statusCode: 401
      });
    }

    const token = jwt.sign({ userId: findUser.userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login successful.',
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const findUser = await User.findById(req.user.userId);

    if (!findUser) {
      return res.status(404).json({
        error: 'User not found.',
        errorCode: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    const { userId, email, nickname, theme, fontSize } = findUser;
    res.status(200).json({ userId, email, nickname, theme, fontSize });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { nickname, theme, fontSize } = req.body;

    const findUser = await User.findById(req.user.userId);

    if (!findUser) {
      return res.status(404).json({
        error: 'User not found.',
        errorCode: 'USER_NOT_FOUND',
        statusCode: 404
      });
    }

    const finalNickname = nickname !== undefined ? nickname : findUser.nickname;
    const finalTheme = theme !== undefined ? theme : findUser.theme;
    const finalFontSize = fontSize !== undefined ? fontSize : findUser.fontSize;

    if (nickname !== undefined) {
      if (!nickname.trim()) {
        return res.status(400).json({
          error: 'Nickname cannot be empty.',
          errorCode: 'NICKNAME_EMPTY',
          statusCode: 400
        });
      }
      if (!nickname) {
        return res.status(400).json({
          error: 'Nickname cannot be empty.',
          errorCode: 'NICKNAME_EMPTY',
          statusCode: 400
        });
      }
    }

    if (theme !== undefined && theme !== 'dark' && theme !== 'light') {
      return res.status(400).json({
        error: 'Invalid theme value.',
        errorCode: 'INVALID_VALUE',
        statusCode: 400
      });
    }

    if (fontSize !== undefined) {
      const size = Number(fontSize);
      if (!Number.isInteger(size) || size < 12 || size > 24) {
        return res.status(400).json({
          error: 'Invalid font size value.',
          errorCode: 'INVALID_VALUE',
          statusCode: 400
        });
      }
    }

    await User.update(req.user.userId, finalNickname, finalTheme, finalFontSize);

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        userId: findUser.userId,
        email: findUser.email,
        nickname: finalNickname,
        theme: finalTheme,
        fontSize: finalFontSize
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({
        error: 'Current password is required.',
        errorCode: 'FIELD_MISSING',
        statusCode: 400
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        error: 'New password is required.',
        errorCode: 'FIELD_MISSING',
        statusCode: 400
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters.',
        errorCode: 'PASSWORD_TOO_SHORT',
        statusCode: 400
      });
    }

    const findUser = await User.findById(req.user.userId);
    const passwordMatch = await bcrypt.compare(oldPassword, findUser.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Current password is incorrect.',
        errorCode: 'WRONG_PASSWORD',
        statusCode: 401
      });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.userId, hashedNew);

    res.status(200).json({
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};
