# Code Editor — Online Code Editor

A browser-based online code editor where you can write and execute code.

## Development Environment

| Item | Version |
|------|---------|
| OS | Windows 10+ (WSL 2 required) |
| WSL | 2.x |
| Ubuntu | 24.04 LTS (Noble) |
| Node.js | 22.x LTS (nvm) |
| npm | 10.9.4 |
| MySQL | 8.4.x LTS |

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js (LTS) | 22.x |
| Frontend | React | 19.2.4 |
| Build Tool | Vite | 8.0.1 |
| Code Editor | @monaco-editor/react | 4.7.0 |
| Routing | react-router-dom | 7.13.1 |
| Backend | Express | 4.22.1 |
| Database | MySQL (LTS) | 8.4.x |
| DB Driver | mysql2 | 3.20.0 |
| Auth | jsonwebtoken (JWT) | 9.0.3 |
| Password Hashing | bcrypt | 6.0.0 |
| HTTP Client | axios | 1.13.6 |
| CORS | cors | 2.8.6 |
| Environment | dotenv | 17.3.1 |
| Code Execution | Judge0 CE API | External API |
| Dev Tool | nodemon | 3.1.14 |
| Test (Server) | Jest, Supertest | 30.x, 7.x |
| Test (Client) | Vitest, React Testing Library | 4.x, 16.x |

## Project Structure

```
opensource-web-azas/
├── .gitignore
├── CONTRIBUTING.md
├── README.md
│
├── client/                                 # Frontend (React + Vite)
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                      # Dev server proxy + Vitest config
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── App.jsx                         # Route definitions
│       ├── index.css                       # Global design tokens (light/dark)
│       ├── main.jsx                        # React entry point with AuthProvider
│       ├── utils/
│       │   ├── api.js                      # API client (fetch wrapper with JWT)
│       │   ├── constants.js                # Language list, Judge0 IDs, default code
│       │   └── languageIcons.jsx           # Per-language official-logo SVG components
│       ├── contexts/
│       │   └── AuthContext.jsx             # Auth state management (login/logout/user)
│       ├── components/
│       │   ├── ConfirmModal.jsx            # Confirmation modal for risky/irreversible actions
│       │   ├── Editor.jsx                  # Monaco Editor wrapper (ajas-light custom theme)
│       │   ├── ExecutionPanel.jsx          # stdout/stderr terminal with exit/time meta
│       │   ├── LanguageSelector.jsx        # Left side panel with language logo buttons
│       │   ├── LoadCodeModal.jsx           # Modal listing saved codes (GET /api/code)
│       │   ├── ProtectedRoute.jsx          # Redirects unauthenticated users to /login
│       │   ├── PublicRoute.jsx             # Redirects authenticated users to /dashboard
│       │   ├── ThemeApplier.jsx            # Apply user.theme to documentElement data-theme
│       │   └── Toolbar.jsx                 # Editor top app bar (brand/file/dashboard/load/save/run)
│       ├── hooks/
│       │   └── useCodeExecution.js         # Code execution hook (Judge0)
│       ├── assets/
│       │   └── landing_image.png           # Landing page hero background image
│       ├── styles/
│       │   ├── Auth.module.css             # Shared Login/Register styles
│       │   ├── ConfirmModal.module.css     # ConfirmModal styles
│       │   ├── Dashboard.module.css        # Dashboard page styles
│       │   ├── Editor.module.css           # Editor page layout (app bar, side, terminal, resizer)
│       │   ├── Landing.module.css          # Landing page styles (sticky hero, scroll steps, nav)
│       │   └── LoadCodeModal.module.css    # LoadCodeModal styles
│       ├── pages/
│       │   ├── CodeEditor.jsx              # Editor page
│       │   ├── Dashboard.jsx               # Saved code list
│       │   ├── Landing.jsx                 # Landing page (sticky scroll interaction, 3 steps)
│       │   ├── Login.jsx                   # Login page
│       │   ├── NotFound.jsx                # 404 page
│       │   └── Register.jsx                # Register page
│       └── __tests__/                      # Client unit tests (Vitest)
│           ├── setup.js
│           ├── AuthContext.test.jsx
│           ├── CodeEditor.test.jsx
│           ├── Dashboard.test.jsx
│           ├── Login.test.jsx
│           ├── Register.test.jsx
│           ├── ProtectedRoute.test.jsx
│           └── PublicRoute.test.jsx
│
└── server/                                 # Backend (Express + MySQL)
    ├── .env                                # Environment variables (git ignored)
    ├── .env.example                        # Environment variable template
    ├── .env.test.example                   # Test environment variable template
    ├── init.sql                            # DB initialization script
    ├── package.json
    └── src/
        ├── app.js                          # Express app (no listen)
        ├── server.js                       # Entry point (app.listen)
        ├── config/
        │   └── db.js                       # MySQL connection pool
        ├── middlewares/
        │   └── auth.js                     # JWT verification middleware
        ├── routes/
        │   ├── auth.js                     # Auth routes
        │   └── code.js                     # Code routes
        ├── controllers/
        │   ├── authController.js           # Auth controller
        │   └── codeController.js           # Code controller
        ├── models/
        │   ├── User.js                     # User model (DB queries)
        │   └── Code.js                     # Code model (DB queries)
        └── __tests__/                      # Server integration tests (Jest + Supertest)
            ├── setup.js
            ├── authController.test.js
            └── codeController.test.js
```

## Getting Started

### 1. Database Setup

```bash
sudo service mysql start
sudo mysql < server/init.sql
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` to match your environment:

```
DB_HOST=localhost
DB_USER=codeuser
DB_PASSWORD=codepass123
DB_NAME=code_editor
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
```

### 3. Frontend Setup

```bash
cd client
npm install
```

### 4. Run

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

Open the URL shown in the client terminal (default: `http://localhost:5173`).

### 5. Run Tests

```bash
# Server tests (requires MySQL)
cd server
cp .env.test.example .env.test  # fill in DB credentials
npm run test

# Client tests
cd client
npm run test
```

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Register |
| POST | `/api/login` | No | Login (returns JWT) |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/me` | Yes | Update profile |
| PUT | `/api/auth/password` | Yes | Change password |

### Code

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/code/run` | Yes | Execute code (Judge0) |
| POST | `/api/code` | Yes | Save new code |
| GET | `/api/code` | Yes | List saved codes |
| GET | `/api/code/:codeId` | Yes | Get single code |
| PUT | `/api/code/:codeId` | Yes | Update code |
| DELETE | `/api/code/:codeId` | Yes | Delete code |
