require('./setup');
const request = require('supertest');
const app = require('../app');

describe('POST /api/register', () => {
  test('필드 누락 → 400 FIELD_MISSING', async () => {
    const res = await request(app).post('/api/register').send({ email: 'a@a.com' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('FIELD_MISSING');
  });

  test('비밀번호 8자 미만 → 400 PASSWORD_TOO_SHORT', async () => {
    const res = await request(app).post('/api/register').send({
      email: 'a@a.com', password: '123', nickname: 'nick'
    });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('PASSWORD_TOO_SHORT');
  });

  test('닉네임 공백만 → 400 NICKNAME_EMPTY', async () => {
    const res = await request(app).post('/api/register').send({
      email: 'a@a.com', password: 'pass1234', nickname: '   '
    });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('NICKNAME_EMPTY');
  });

  test('이메일 형식 오류 → 400 INVALID_EMAIL', async () => {
    const res = await request(app).post('/api/register').send({
      email: 'notanemail', password: 'pass1234', nickname: 'nick'
    });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_EMAIL');
  });

  test('중복 이메일 → 409 EMAIL_DUPLICATE', async () => {
    await request(app).post('/api/register').send({
      email: 'dup@a.com', password: 'pass1234', nickname: 'nick'
    });
    const res = await request(app).post('/api/register').send({
      email: 'dup@a.com', password: 'pass1234', nickname: 'nick2'
    });
    expect(res.status).toBe(409);
    expect(res.body.errorCode).toBe('EMAIL_DUPLICATE');
  });

  test('정상 가입 → 201', async () => {
    const res = await request(app).post('/api/register').send({
      email: 'new@a.com', password: 'pass1234', nickname: 'nick'
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: 'new@a.com', nickname: 'nick' });
    expect(res.body.userId).toBeDefined();
  });
});

describe('POST /api/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/register').send({
      email: 'user@a.com', password: 'pass1234', nickname: 'nick'
    });
  });

  test('필드 누락 → 400 FIELD_MISSING', async () => {
    const res = await request(app).post('/api/login').send({ email: 'user@a.com' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('FIELD_MISSING');
  });

  test('없는 이메일 → 401 WRONG_PASSWORD', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'none@a.com', password: 'pass1234'
    });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('WRONG_PASSWORD');
  });

  test('비밀번호 틀림 → 401 WRONG_PASSWORD', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'user@a.com', password: 'wrongpass'
    });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('WRONG_PASSWORD');
  });

  test('정상 로그인 → 200 + token', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'user@a.com', password: 'pass1234'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    await request(app).post('/api/register').send({
      email: 'me@a.com', password: 'pass1234', nickname: 'menick'
    });
    const res = await request(app).post('/api/login').send({
      email: 'me@a.com', password: 'pass1234'
    });
    token = res.body.token;
  });

  test('토큰 없음 → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('정상 조회 → 200', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: 'me@a.com', nickname: 'menick' });
    expect(res.body.password).toBeUndefined();
  });
});

describe('PUT /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    await request(app).post('/api/register').send({
      email: 'upd@a.com', password: 'pass1234', nickname: 'upd'
    });
    const res = await request(app).post('/api/login').send({
      email: 'upd@a.com', password: 'pass1234'
    });
    token = res.body.token;
  });

  test('닉네임 공백 → 400 NICKNAME_EMPTY', async () => {
    const res = await request(app).put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nickname: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('NICKNAME_EMPTY');
  });

  test('theme 잘못된 값 → 400 INVALID_VALUE', async () => {
    const res = await request(app).put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'blue' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_VALUE');
  });

  test('fontSize 범위 초과 → 400 INVALID_VALUE', async () => {
    const res = await request(app).put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ fontSize: 30 });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_VALUE');
  });

  test('정상 수정 → 200', async () => {
    const res = await request(app).put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nickname: 'newnick', theme: 'dark', fontSize: 16 });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ nickname: 'newnick', theme: 'dark', fontSize: 16 });
  });
});

describe('PUT /api/auth/password', () => {
  let token;

  beforeEach(async () => {
    await request(app).post('/api/register').send({
      email: 'pw@a.com', password: 'pass1234', nickname: 'pwnick'
    });
    const res = await request(app).post('/api/login').send({
      email: 'pw@a.com', password: 'pass1234'
    });
    token = res.body.token;
  });

  test('oldPassword 누락 → 400 FIELD_MISSING', async () => {
    const res = await request(app).put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'newpass1234' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('FIELD_MISSING');
  });

  test('newPassword 누락 → 400 FIELD_MISSING', async () => {
    const res = await request(app).put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'pass1234' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('FIELD_MISSING');
  });

  test('newPassword 8자 미만 → 400 PASSWORD_TOO_SHORT', async () => {
    const res = await request(app).put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'pass1234', newPassword: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('PASSWORD_TOO_SHORT');
  });

  test('oldPassword 틀림 → 401 WRONG_PASSWORD', async () => {
    const res = await request(app).put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'wrongpass', newPassword: 'newpass1234' });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('WRONG_PASSWORD');
  });

  test('정상 변경 → 200', async () => {
    const res = await request(app).put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'pass1234', newPassword: 'newpass1234' });
    expect(res.status).toBe(200);
  });
});
