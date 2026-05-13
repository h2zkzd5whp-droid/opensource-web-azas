# CLAUDE.md — 단일 에이전트

`TASK.md`를 먼저 읽고 작업을 시작합니다.

작업 시 필요한 문서를 읽고 시작하세요.

## 작업 시작 전

1. GitHub 이슈 생성
   ```bash
   gh issue create --title "<title>" --body "<body>" --label "<label>" --assignee h2zkzd5whp-droid
   ```
   라벨 목록: `test` `backend` `bug` `documentation` `duplicate` `enhancement` `fix` `frontend` `good first issue` `help wanted` `invalid` `question` `wontfix`

2. 브랜치 생성 (`git checkout -b feature/<feature-name>`)
---

## 문서 위치

| 문서 | 경로 |
|------|------|
| 페이지 정의 | `docs/shared/pages.md` |
| DB 스키마 | `docs/server/db_schema.md` |
| API 명세 | `docs/server/api_spec.md` |
| 컴포넌트 구조 | `docs/client/component_structure.md` |
| 디자인 | `docs/client/design.html` |
| Export 함수명 | `docs/shared/export_functions.md` |
| 아키텍처 | `docs/shared/architecture.md` |
| 검증 절차 | `docs/agent/runbook.md` |
| 완료 조건 | `docs/agent/done_condition.md` |

---

## 언어 규칙

모든 텍스트는 영어로 작성한다.

- **코드 주석**: 영어
- **코드 내 문자열**: 영어 (에러 메시지, 콘솔 로그, 서버 응답 `message`/`error` 필드 등)
- **UI 텍스트**: 영어 (버튼 라벨, 플레이스홀더, 에러 배너, 안내 문구 등)
- **커밋 메시지**: 영어
- **GitHub 이슈 제목·본문**: 영어
- **PR 제목·본문**: 영어
- **변수명·함수명**: 영어 (기존 규칙과 동일)

**예외 — 한국어로 작성:**
- `CLAUDE.md`, `TASK.md`
- `docs/` 하위 모든 문서

---

## 네이밍 규칙

- 함수명: camelCase
- 컴포넌트명: PascalCase
- DB 컬럼명: snake_case
- API 라우트: kebab-case
- 파일명: 컴포넌트·페이지·컨텍스트 → PascalCase (`Login.jsx`, `AuthContext.jsx`) / hooks → camelCase (`useCodeExecution.js`) / 유틸·스타일 → camelCase (`api.js`, `languageIcons.js`) / CSS Module → 컴포넌트명과 동일 PascalCase (`Login.module.css`)

---

