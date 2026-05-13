# Common Rules

| Item | Description |
| --- | --- |
| Authentication | JWT. Token issued on login → attach `Authorization: Bearer <token>` header to all subsequent requests |
| No Auth Required | `POST /api/register`, `POST /api/login` |
| Error Response Format | `{ error, errorCode, statusCode }` |
| Error Code Convention | Frontend branching uses `errorCode` (English constant). `error` (Korean) is for user display |
| Language Selection | Managed by frontend constants (no API). javascript, python, java |
| Page Navigation | Handled by React Router (no API) |
| Code Execution Engine | Judge0 CE API |
| Timestamps | `createdAt`, `updatedAt` (ISO 8601) |
| Rate Limiting | Not applied (to be considered later) |
| Token Expiry | 24 hours. Unified 401 handling — no distinction between missing/expired/forged tokens |

---

# Common Error Codes

| errorCode | Description | HTTP |
| --- | --- | --- |
| FIELD_MISSING | Required field missing | 400 |
| INVALID_VALUE | Invalid value | 400 |
| INVALID_EMAIL | Invalid email format | 400 |
| PASSWORD_TOO_SHORT | Password less than 8 characters | 400 |
| NICKNAME_EMPTY | Empty nickname | 400 |
| EMAIL_DUPLICATE | Duplicate email | 409 |
| UNAUTHORIZED | Not authenticated | 401 |
| WRONG_PASSWORD | Incorrect password | 401 |
| FORBIDDEN | No permission | 403 |
| NOT_FOUND | Resource not found | 404 |
| USER_NOT_FOUND | Token valid + user not in DB | 404 |
| SOURCE_MISSING | source field missing | 400 |
| LANGUAGE_MISSING | language field missing | 400 |
| UNSUPPORTED_LANGUAGE | Unsupported language | 400 |
| EXECUTION_FAILED | Judge0 internal error | 502 |
| EXECUTION_TIMEOUT | Execution timed out | 504 |

---

# Endpoints

## 1. Register

`POST /api/register`

- **Request**: `{ email, password, nickname }`
- **Response** (201): `{ message, userId, email, nickname }`
- **Errors**: 400 `FIELD_MISSING` · `INVALID_EMAIL` · `PASSWORD_TOO_SHORT` · `NICKNAME_EMPTY`, 409 `EMAIL_DUPLICATE`

> Email format validation, password min 8 chars, nickname empty check. Password stored as bcrypt hash.
> 

---

## 2. Login

`POST /api/login`

- **Request**: `{ email, password }`
- **Response** (200): `{ message, token }`
- **Errors**: 400 `FIELD_MISSING`, 401 `WRONG_PASSWORD`

> Returns 401 even when email doesn't exist (prevents email enumeration — security intent). User info is fetched separately via `GET /api/auth/me`.
> 

---

## 3. Get My Info

`GET /api/auth/me`

- **Request**: None
- **Response** (200): `{ userId, email, nickname, theme, fontSize }`
- **Errors**: 401 `UNAUTHORIZED`, 404 `USER_NOT_FOUND`

> Used after login and on page refresh to restore user info. Auto-called in useEffect.
> 

---

## 4. Update My Info

`PUT /api/auth/me`

- **Request**: `{ nickname?, theme?, fontSize? }`
- **Response** (200): `{ message, user: { userId, email, nickname, theme, fontSize } }`
- **Errors**: 400 `INVALID_VALUE` · `NICKNAME_EMPTY`, 401 `UNAUTHORIZED`, 404 `USER_NOT_FOUND`

> theme: `"dark"` | `"light"`. fontSize: integer 12–24. Send only changed fields.
> 

---

## 5. Change Password

`PUT /api/auth/password`

- **Request**: `{ oldPassword, newPassword }`
- **Response** (200): `{ message }`
- **Errors**: 400 `FIELD_MISSING` · `PASSWORD_TOO_SHORT`, 401 `UNAUTHORIZED` · `WRONG_PASSWORD`

> Existing token remains valid after change. Never include password in response.
> 

---

## 6. Create Code (First Save)

`POST /api/code`

- **Request**: `{ language, source, title? }`
- **Response** (201): `{ message, codeId, createdAt }`
- **Errors**: 400 `LANGUAGE_MISSING` · `SOURCE_MISSING`, 401 `UNAUTHORIZED`

> If title is omitted, server assigns `"Untitled"`. Code exists only in frontend state until saved.
> 

---

## 7. List Codes

`GET /api/code`

- **Request**: None
- **Response** (200): `{ codes: [{ codeId, title, language, createdAt, updatedAt }], total }`
- **Errors**: 401 `UNAUTHORIZED`

> Returns all codes. Client handles pagination. Auto-called on dashboard entry.
> 

---

## 8. Get Code

`GET /api/code/:codeId`

- **Request**: None
- **Response** (200): `{ codeId, title, language, source, createdAt, updatedAt }`
- **Errors**: 401 `UNAUTHORIZED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`

> Called in useEffect on `/code/:codeId` entry. Returns 403 if not the owner.
> 

---

## 9. Update Code

`PUT /api/code/:codeId`

- **Request**: `{ title?, source, language }`
- **Response** (200): `{ message, updatedAt }`
- **Errors**: 400 `SOURCE_MISSING`, 401 `UNAUTHORIZED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`

> Triggered by Ctrl+S. On success, set hasUnsavedChanges = false.
> 

---

## 10. Delete Code

`DELETE /api/code/:codeId`

- **Request**: None
- **Response** (204): None
- **Errors**: 401 `UNAUTHORIZED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`

> Show confirmation modal before delete (frontend). Refresh list after deletion.
> 

---

## 11. Run Code

`POST /api/code/run`

- **Request**: `{ language, source }`
- **Response** (200): `{ stdout, stderr, exitCode, executionTime }`
- **Errors**: 400 `LANGUAGE_MISSING` · `SOURCE_MISSING` · `UNSUPPORTED_LANGUAGE`, 401 `UNAUTHORIZED`, 502 `EXECUTION_FAILED`, 504 `EXECUTION_TIMEOUT`

> Runs current editor content regardless of save status. No codeId required. Returns 502/504 on Judge0 failure.
>