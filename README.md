# Code Editor — 온라인 코드 에디터

브라우저에서 코드를 작성하고 실행할 수 있는 온라인 코드 에디터입니다.

## 개발 환경

| 항목 | 버전 |
|------|------|
| OS | Windows 10 이상 (WSL 2 지원 필요) |
| WSL | 2.x |
| Ubuntu | 24.04 LTS (Noble) |
| Node.js | 22.x LTS (nvm) |
| npm | 10.9.4 |
| MySQL | 8.4.x LTS |

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Runtime | Node.js (LTS) | 22.x |
| Frontend | React | 19.2.4 |
| 빌드 도구 | Vite | 8.0.1 |
| 코드 에디터 | @monaco-editor/react | 4.7.0 |
| 라우팅 | react-router-dom | 7.13.1 |
| Backend | Express | 4.22.1 |
| Database | MySQL (LTS) | 8.4.x |
| DB 드라이버 | mysql2 | 3.20.0 |
| 인증 | jsonwebtoken (JWT) | 9.0.3 |
| 비밀번호 해싱 | bcrypt | 6.0.0 |
| HTTP 클라이언트 | axios | 1.13.6 |
| CORS | cors | 2.8.6 |
| 환경변수 | dotenv | 17.3.1 |
| 코드 실행 | Judge0 CE API(Piston API가 인증이 필요해서 이걸로 바꿈) | 외부 API |
| 개발 도구 | nodemon | 3.1.14 |

## 프로젝트 구조

```
opensource-web-azas/
├── .gitignore
├── CONTRIBUTING.md
├── README.md
│
├── client/                                 # 프론트엔드 (React + Vite)
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js                    # 코드 스타일 검사 (Vite 기본)
│   ├── index.html                          # HTML 껍데기 (Vite 기본)
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js                      # ✅ 프록시 설정 추가됨
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.css                         # 전역 스타일 (Vite 기본)
│       ├── App.jsx                         # ✅ 라우팅 기본 틀로 수정 필요, 지금 vite 기본 내용들어가있음
│       ├── index.css                       # body 기본 스타일 (Vite 기본)
│       ├── main.jsx                        # React 진입점 (Vite 기본)
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       ├── utils/
│       │   ├── api.js                      # ✅ API 클라이언트
│       │   └── constants.js                # ✅ 언어 목록, Judge0 ID, 기본 코드
│       ├── contexts/
│       │   └── AuthContext.jsx             # ✅ 인증 상태 관리
│       ├── components/                     # 📌 빈 파일 
│       │   ├── ConfirmModal.jsx            # 📌 삭제 확인 모달
│       │   ├── Editor.jsx                  # 📌 Monaco Editor 래퍼
│       │   ├── ExecutionPanel.jsx          # 📌 실행 결과 표시
│       │   ├── LanguageBadge.jsx           # 📌언어 뱃지
│       │   ├── LanguageSelector.jsx        # 📌 언어 선택 드롭다운
│       │   ├── ProtectedRoute.jsx          # 📌 비로그인 → /login
│       │   ├── PublicRoute.jsx             # 📌 로그인 시 → /dashboard
│       │   ├── ThemeApplier.jsx            # 📌 테마 전환
│       │   └── Toolbar.jsx                 # 📌 실행/저장 버튼
│       ├── hooks/
│       │   └── useCodeExecution.js         # 📌 코드 실행 훅
│       └── pages/
│           ├── CodeEditor.jsx              # 📌 에디터 페이지
│           ├── Dashboard.jsx               # 📌 대시보드
│           ├── Landing.jsx                 # 📌 랜딩
│           ├── Login.jsx                   # 📌 로그인
│           ├── NotFound.jsx                # 📌 404
│           └── Register.jsx                # 📌 회원가입
│
└── server/                                 # 백엔드 (Express + MySQL)
    ├── .env                                # ✅ 환경변수 (Git 제외)
    ├── .env.example                        # ✅ 환경변수 예시 (Git 포함)
    ├── init.sql                            # ✅ DB 초기화 스크립트
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── app.js                          # ✅ Express 진입점
        ├── config/
        │   └── db.js                       # ✅ MySQL 커넥션 풀
        ├── middlewares/
        │   └── auth.js                     # ✅ JWT 검증 미들웨어
        ├── routes/
        │   ├── auth.js                     # ✅ 인증 라우트 (경로 정의)
        │   └── code.js                     # ✅ 코드 라우트 (경로 정의)
        ├── controllers/
        │   ├── authController.js           # 📌 인증 컨트롤러 (TODO 빈 틀)
        │   └── codeController.js           # 📌 코드 컨트롤러 (TODO 빈 틀)
        └── models/
            ├── User.js                     # 📌 빈 파일 (Users 쿼리)
            └── Code.js                     # 📌 빈 파일 (Codes 쿼리)
```

## 데이터베이스 초기화

```bash
sudo service mysql start
sudo mysql < server/init.sql
```

## 프론트엔드 초기화

```bash
cd client
npm install
```

`package.json`에 포함된 주요 의존성:
- `react`, `react-dom` — UI 프레임워크
- `@monaco-editor/react` — 코드 에디터
- `react-router-dom` — 페이지 라우팅

## 백엔드 초기화

```bash
cd server
npm install
```

`package.json`에 포함된 주요 의존성:
- `express` — 웹 서버 프레임워크
- `mysql2` — MySQL 연결 드라이버
- `jsonwebtoken` — JWT 인증 토큰
- `bcrypt` — 비밀번호 해싱
- `axios` — Judge0 API 호출용 HTTP 클라이언트
- `cors` — 크로스 도메인 요청 허용
- `dotenv` — 환경변수 관리
- `nodemon` (dev) — 코드 변경 시 서버 자동 재시작

## 환경변수 설정

```bash
cd server
cp .env.example .env
```

`server/.env`를 본인 환경에 맞게 수정:

```
DB_HOST=localhost
DB_USER=codeuser
DB_PASSWORD=codepass123
DB_NAME=code_editor
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
```

## 실행

```bash
# 터미널 1 — 서버
cd server
npm run dev

# 터미널 2 — 클라이언트
cd client
npm run dev
```

클라이언트 터미널에 표시되는 URL(기본: `http://localhost:5173`)로 접속합니다.
