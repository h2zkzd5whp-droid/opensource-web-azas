# component_structure.md

## 컴포넌트 트리

```
main.jsx
└── AuthProvider (contexts/AuthContext)
    └── App
        └── BrowserRouter
            └── Routes
                ├── /                → Landing
                ├── /login           → PublicRoute → Login
                ├── /register        → PublicRoute → Register
                ├── /dashboard       → ProtectedRoute → Dashboard
                │                        └── (TODO) ConfirmModal
                ├── /code            → ProtectedRoute → CodeEditor
                ├── /code/:codeId    → ProtectedRoute → CodeEditor
                │                        ├── (TODO) Toolbar
                │                        ├── (TODO) LanguageSelector
                │                        ├── (TODO) LanguageBadge
                │                        ├── (TODO) Editor
                │                        └── (TODO) ExecutionPanel
                └── *                → NotFound
```

---

## 컴포넌트 상세

### AuthProvider

- 위치: `contexts/AuthContext.jsx`
- 역할: 전역 인증 상태 관리. `user`, `loading`, `login`, `logout` 제공
- 사용하는 API: `GET /api/auth/me`, `POST /api/login`

---

### ProtectedRoute

- 위치: `components/ProtectedRoute.jsx`
- 역할: 비로그인 상태면 `/login`으로 리다이렉트

| prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| children | ReactNode | ✓ | 보호할 페이지 컴포넌트 |

---

### PublicRoute

- 위치: `components/PublicRoute.jsx`
- 역할: 로그인 상태면 `/dashboard`로 리다이렉트 (로그인/회원가입 페이지 접근 차단)

| prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| children | ReactNode | ✓ | 보호할 페이지 컴포넌트 |

---

### Login ✅

- 위치: `pages/Login.jsx`
- 역할: 이메일/비밀번호 로그인 폼. 성공 시 `/dashboard`로 이동
- 사용하는 API: `AuthContext.login` → `POST /api/login`

---

### Register ✅

- 위치: `pages/Register.jsx`
- 역할: 이메일/비밀번호/닉네임 회원가입 폼. 성공 시 `/login`으로 이동
- 사용하는 API: `POST /api/register`

---

### Landing

- 위치: `pages/Landing.jsx`
- 역할: 서비스 소개 랜딩 페이지 (TODO)

---

### Dashboard

- 위치: `pages/Dashboard.jsx`
- 역할: 저장된 코드 목록 조회 및 관리 (TODO)
- 사용하는 API: `GET /api/code`

---

### CodeEditor

- 위치: `pages/CodeEditor.jsx`
- 역할: 코드 작성, 실행, 저장 (TODO)
- 사용하는 API: `GET /api/code/:id`, `POST /api/code`, `PUT /api/code/:id`, `POST /api/code/:id/run`

---

### Editor

- 위치: `components/Editor.jsx`
- 역할: Monaco Editor 래퍼 (TODO)

---

### Toolbar

- 위치: `components/Toolbar.jsx`
- 역할: 저장·실행 등 액션 버튼 모음 (TODO)

---

### LanguageSelector

- 위치: `components/LanguageSelector.jsx`
- 역할: 언어 선택 드롭다운 (TODO)

---

### LanguageBadge

- 위치: `components/LanguageBadge.jsx`
- 역할: 현재 선택된 언어 표시 배지 (TODO)

---

### ExecutionPanel

- 위치: `components/ExecutionPanel.jsx`
- 역할: 코드 실행 결과 출력 패널 (TODO)

---

### ConfirmModal

- 위치: `components/ConfirmModal.jsx`
- 역할: 삭제 등 위험 액션 재확인 모달 (TODO)

---

### ThemeApplier

- 위치: `components/ThemeApplier.jsx`
- 역할: 에디터 테마 적용 (TODO)

---

### NotFound

- 위치: `pages/NotFound.jsx`
- 역할: 404 페이지 (TODO)
