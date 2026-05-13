## Server — Controller Func

| file | name | API |
| --- | --- | --- |
| `authController.js` | `register` | POST /api/register |
| `authController.js` | `login` | POST /api/login |
| `authController.js` | `getMe` | GET /api/auth/me |
| `authController.js` | `updateMe` | PUT /api/auth/me |
| `authController.js` | `changePassword` | PUT /api/auth/password |
| `codeController.js` | `runCode` | POST /api/code/run |
| `codeController.js` | `createCode` | POST /api/code |
| `codeController.js` | `listCodes` | GET /api/code |
| `codeController.js` | `getCode` | GET /api/code/:codeId |
| `codeController.js` | `updateCode` | PUT /api/code/:codeId |
| `codeController.js` | `deleteCode` | DELETE /api/code/:codeId |

---

## Client — Page component names

| File | Export name | URL |
| --- | --- | --- |
| `pages/Landing.jsx` | `Landing` | `/` |
| `pages/Login.jsx` | `Login` | `/login` |
| `pages/Register.jsx` | `Register` | `/register` |
| `pages/CodeEditor.jsx` | `CodeEditor` | `/code`, `/code/:codeId` |
| `pages/Dashboard.jsx` | `Dashboard` | `/dashboard` |
| `pages/NotFound.jsx` | `NotFound` | `/*` |

## Client — Utils / Context / Shared components

| File | Export name | Type | Description |
| --- | --- | --- | --- |
| `utils/api.js` | `apiRequest` | named | API request handler |
| `utils/constants.js` | `SUPPORTED_LANGUAGES` | named | Language list array |
| `utils/constants.js` | `DEFAULT_CODE` | named | Default code per language |
| `contexts/AuthContext.jsx` | `AuthProvider` | named | Auth state provider |
| `contexts/AuthContext.jsx` | `useAuth` | named | Auth state hook |
| `components/ProtectedRoute.jsx` | `ProtectedRoute` | default | Redirect to /login if not authenticated |
| `components/PublicRoute.jsx` | `PublicRoute` | default | Redirect to /dashboard if authenticated |

---

> **Note:** Import syntax differs by type
> 

> - **default**: `import ProtectedRoute from '...'`
> 

> - **named**: `import { useAuth } from '...'`
> 

> Update this page when adding new components.
> 

---

## example

### server

```jsx
// routes/auth.js
const authController = require('../controllers/authController');
router.post('/register', authController.register);
router.post('/login', authController.login);
```

### client

```jsx
// App.jsx
import Login from './pages/Login';
import Register from './pages/Register';
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```