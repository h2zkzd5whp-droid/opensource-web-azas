require('./setup');
const request = require('supertest');
const app = require('../app');

async function registerAndLogin(email = 'user@a.com') {
  await request(app).post('/api/register').send({
    email, password: 'pass1234', nickname: 'nick'
  });
  const res = await request(app).post('/api/login').send({
    email, password: 'pass1234'
  });
  return res.body.token;
}

describe('POST /api/code', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  test('토큰 없음 → 401', async () => {
    const res = await request(app).post('/api/code').send({
      language: 'javascript', source: 'console.log(1)'
    });
    expect(res.status).toBe(401);
  });

  test('language 누락 → 400 LANGUAGE_MISSING', async () => {
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'console.log(1)' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('LANGUAGE_MISSING');
  });

  test('source 누락 → 400 SOURCE_MISSING', async () => {
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('SOURCE_MISSING');
  });

  test('title 미입력 시 Untitled 기본값 → 201', async () => {
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript', source: 'console.log(1)' });
    expect(res.status).toBe(201);
    expect(res.body.codeId).toBeDefined();
  });

  test('정상 저장 → 201', async () => {
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', source: 'print(1)', title: 'My Code' });
    expect(res.status).toBe(201);
    expect(res.body.codeId).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });
});

describe('GET /api/code', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  test('빈 목록 → 200 codes: []', async () => {
    const res = await request(app).get('/api/code')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.codes).toEqual([]);
  });

  test('내 코드 목록 조회 → 200', async () => {
    await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript', source: 'console.log(1)', title: 'A' });
    await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'python', source: 'print(1)', title: 'B' });

    const res = await request(app).get('/api/code')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.codes).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });
});

describe('GET /api/code/:codeId', () => {
  let token;
  let codeId;

  beforeEach(async () => {
    token = await registerAndLogin();
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript', source: 'console.log(1)', title: 'T' });
    codeId = res.body.codeId;
  });

  test('없는 codeId → 404 NOT_FOUND', async () => {
    const res = await request(app).get('/api/code/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('NOT_FOUND');
  });

  test('다른 유저 코드 → 403 FORBIDDEN', async () => {
    const otherToken = await registerAndLogin('other@a.com');
    const res = await request(app).get(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN');
  });

  test('정상 조회 → 200', async () => {
    const res = await request(app).get(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.codeId).toBe(codeId);
    expect(res.body.source).toBe('console.log(1)');
  });
});

describe('PUT /api/code/:codeId', () => {
  let token;
  let codeId;

  beforeEach(async () => {
    token = await registerAndLogin();
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript', source: 'console.log(1)', title: 'T' });
    codeId = res.body.codeId;
  });

  test('source 누락 → 400 SOURCE_MISSING', async () => {
    const res = await request(app).put(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Title' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('SOURCE_MISSING');
  });

  test('없는 codeId → 404 NOT_FOUND', async () => {
    const res = await request(app).put('/api/code/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'console.log(2)' });
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('NOT_FOUND');
  });

  test('다른 유저 코드 → 403 FORBIDDEN', async () => {
    const otherToken = await registerAndLogin('other@a.com');
    const res = await request(app).put(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ source: 'console.log(2)' });
    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN');
  });

  test('정상 수정 → 200', async () => {
    const res = await request(app).put(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'console.log(2)', title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/code/:codeId', () => {
  let token;
  let codeId;

  beforeEach(async () => {
    token = await registerAndLogin();
    const res = await request(app).post('/api/code')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'javascript', source: 'console.log(1)', title: 'T' });
    codeId = res.body.codeId;
  });

  test('없는 codeId → 404 NOT_FOUND', async () => {
    const res = await request(app).delete('/api/code/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('NOT_FOUND');
  });

  test('다른 유저 코드 → 403 FORBIDDEN', async () => {
    const otherToken = await registerAndLogin('other@a.com');
    const res = await request(app).delete(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN');
  });

  test('정상 삭제 → 204', async () => {
    const res = await request(app).delete(`/api/code/${codeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
