# Pages

| Page | URL | Description |
| --- | --- | --- |
| Landing | `/` | Service name + tagline, "Get Started" button (navigate to editor), Login/Register buttons, feature intro section |
| Login | `/login` | Email input, password input, login button, "Don't have an account? Register" link |
| Register | `/register` | Email input, password input, confirm password input, nickname input, register button, "Already have an account? Sign in" link |
| New Editor | `/code` | Monaco Editor (code editing area), run button, execution result display (terminal), file name display, save (Ctrl+S) |
| Saved Project | `/code/:codeId` | Same layout as new editor, but loads the project by ID on entry |
| Dashboard / Settings | `/dashboard` | "New Project" button, project list (cards: project name, language, last modified), click card to navigate to `/code/:codeId`, delete button. Theme toggle (dark/light), editor font size control, password change, logout button |
| Not Found | `/*` | 404 page |

---

# Auth Routing (Screen by State)

| Page | Not Logged In | Logged In |
| --- | --- | --- |
| `/` | Landing | Landing |
| `/login` | Login | → `/dashboard` redirect |
| `/register` | Register | → `/dashboard` redirect |
| `/code` | → `/login` redirect | Editor |
| `/code/:codeId` | → `/login` redirect | Project |
| `/dashboard` | → `/login` redirect | Dashboard |
| `/*` | 404 | 404 |

`ProtectedRoute` — redirects unauthenticated users to `/login`

`PublicRoute` — redirects authenticated users to `/dashboard`