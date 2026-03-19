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
├── client/                         # 프론트엔드 (React + Vite)
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── assets/
│           ├── hero.png
│           ├── react.svg
│           └── vite.svg
│
└── server/                         # 백엔드 (Node.js + Express + MySQL)
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── config/                 # DB 연결 설정
        ├── controllers/            # 라우트 핸들러
        ├── middlewares/            # JWT 검증 등 미들웨어
        ├── models/                 # DB 쿼리 함수
        └── routes/                 # Express 라우트 정의
```

## 데이터베이스 생성

```bash
sudo mysql
```

```sql
CREATE DATABASE code_editor;
CREATE USER 'codeuser'@'localhost' IDENTIFIED BY 'codepass123';
GRANT ALL PRIVILEGES ON code_editor.* TO 'codeuser'@'localhost';
FLUSH PRIVILEGES;
USE code_editor;

CREATE TABLE Users (
  userId      INTEGER PRIMARY KEY AUTO_INCREMENT,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  nickname    VARCHAR(50) NOT NULL,
  theme       VARCHAR(10) DEFAULT 'light',
  fontSize    INTEGER DEFAULT 14,
  createdAt   DATETIME NOT NULL,
  updatedAt   DATETIME NOT NULL
);

CREATE TABLE Codes (
  codeId      INTEGER PRIMARY KEY AUTO_INCREMENT,
  userId      INTEGER NOT NULL,
  title       VARCHAR(255) DEFAULT 'Untitled',
  language    VARCHAR(20) NOT NULL,
  source      TEXT NOT NULL,
  createdAt   DATETIME NOT NULL,
  updatedAt   DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(userId)
);

exit;
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
