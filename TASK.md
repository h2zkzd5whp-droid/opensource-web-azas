# TASK.md

task_type: test

## 작업 목표

프론트엔드 단위 테스트 세팅 및 작성 — Vitest + React Testing Library

## 세부 지시

### 1. 패키지 설치

```bash
cd client
npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### 2. vite.config.js 수정

vitest 설정 추가:

```js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/__tests__/setup.js',
}
```

### 3. package.json 스크립트 추가

```json
"test": "vitest run"
```

### 4. 테스트 파일 구조

```
client/src/__tests__/
  setup.js
  Register.test.jsx
  Login.test.jsx
  AuthContext.test.jsx
  ProtectedRoute.test.jsx
  PublicRoute.test.jsx
```

### 5. setup.js

```js
import '@testing-library/jest-dom'
```

### 6. mock 처리 규칙

모든 테스트 파일에서 공통으로 mock할 것:

- `../utils/api` → `apiRequest`를 `vi.fn()`으로 대체
- `react-router-dom` → `useNavigate`, `Link`, `Navigate` mock 처리
- `../contexts/AuthContext` → `useAuth`를 `vi.fn()`으로 대체 (AuthContext 자체 테스트 제외)

---

### 7. Register.test.jsx

**클라이언트 검증**
- [ ] 비밀번호 불일치 시 "Passwords do not match." 표시
- [ ] 비밀번호 불일치 시 `apiRequest` 호출 안 됨

**서버 에러 분기 (apiRequest mock)**
- [ ] `FIELD_MISSING` → "Please fill in all fields."
- [ ] `INVALID_EMAIL` → "Please enter a valid email address."
- [ ] `PASSWORD_TOO_SHORT` → "Password must be at least 8 characters."
- [ ] `NICKNAME_EMPTY` → "Please enter a nickname."
- [ ] `EMAIL_DUPLICATE` → "This email is already in use."

**성공 흐름**
- [ ] 201 응답 → `navigate('/login')` 호출

**UI**
- [ ] 제출 중 버튼 비활성화
- [ ] "Sign in" 링크가 `/login`으로 연결

---

### 8. Login.test.jsx

**서버 에러 분기**
- [ ] `WRONG_PASSWORD` → "Incorrect email or password."
- [ ] `FIELD_MISSING` → "Please enter your email and password."

**성공 흐름**
- [ ] 로그인 성공 → `navigate('/dashboard')` 호출

**UI**
- [ ] 제출 중 버튼 비활성화
- [ ] "Sign up" 링크가 `/register`로 연결

---

### 9. AuthContext.test.jsx

- [ ] 토큰 없을 때 → `loading: false`, `user: null`
- [ ] 토큰 있을 때 → `apiRequest('/auth/me')` 호출 → user 세팅
- [ ] 토큰 있는데 `/auth/me` 실패 → localStorage에서 토큰 제거
- [ ] `login()` 호출 → token 저장 + user 세팅
- [ ] `logout()` 호출 → token 제거 + user null

---

### 10. ProtectedRoute.test.jsx

- [ ] `loading: true` → "loading..." 표시
- [ ] `user: null` → `/login`으로 redirect
- [ ] `user` 있음 → children 렌더링

---

### 11. PublicRoute.test.jsx

- [ ] `loading: true` → "loading" 표시
- [ ] `user` 있음 → `/dashboard`로 redirect
- [ ] `user: null` → children 렌더링

---

### 12. ci.yml 수정

client 잡에 test 스텝 추가:

```yaml
- name: Test
  run: npm run test
```

## 참고 문서

- `client/src/pages/Register.jsx`
- `client/src/pages/Login.jsx`
- `client/src/contexts/AuthContext.jsx`
- `client/src/components/ProtectedRoute.jsx`
- `client/src/components/PublicRoute.jsx`
- `client/src/utils/api.js`

## 완료 조건

1. `npm run test` 실행 시 전체 테스트 통과
2. CI client 잡에서 테스트 통과
3. 기존 lint, build 스텝 영향 없음

## 주의사항

- 에러 메시지는 현재 한국어 기준으로 테스트 작성 (영어 변환은 별도 작업)
- `apiRequest` 자체 로직은 테스트 대상 아님 (mock으로 대체)
- AuthContext mock은 `vi.fn()` 반환값으로 `user`, `loading`, `login`, `logout` 주입

## 금지 사항

- `vite.config.js` 외 기존 설정 파일 수정 금지
- `AuthContext.jsx`, `api.js` 로직 수정 금지
- E2E 테스트 작성 금지 (요청 시에만)
