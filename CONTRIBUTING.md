# 협업 규칙 (Contributing Guidelines)

## 브랜치 전략

- `main` 브랜치에 직접 푸시는 금지입니다.
- 작업 시작 시 `main`에서 새 브랜치를 생성합니다.
- 브랜치 네이밍 규칙: `feature/기능이름` (예: `feature/login-page`, `feature/main-api`)
- 머지 완료된 브랜치는 삭제합니다.

## 작업 흐름

1. `git pull origin main`으로 최신 코드를 받습니다.
2. `git checkout -b feature/기능이름(ex: feature/login-page)`로 브랜치를 생성합니다.
3. 작업 후 커밋합니다.
4. `git push -u origin feature/기능이름`으로 푸시합니다.
5. GitHub에서 Pull Request를 생성합니다.
6. 팀원 1명 이상의 리뷰 승인을 받습니다.
7. 승인 후 Merge합니다.
8. 머지된 브랜치를 삭제합니다.

### 커밋 타입

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 | (예: feat: 로그인 페이지 UI 구현)
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |  (예: docs: README 업데이트)
| `style` | 코드 포맷팅 (기능 변경 없음) |  (예: style: 들여쓰기 정리)
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드, 설정 파일 수정 |

## Pull Request 규칙

- PR 제목은 작업 내용을 명확하게 작성합니다.
- 관련 이슈가 있으면 PR 본문에 `closes #이슈번호`를 포함합니다.
- 최소 1명의 리뷰 승인이 필요합니다.

## 마일스톤 (Milestones)

GitHub Milestones를 활용하여 프로젝트 진행 상황을 관리합니다.

- 마일스톤은 프로젝트의 주요 단계별로 생성합니다.
- 각 마일스톤에는 마감일(Due date)을 설정합니다.
- 관련 이슈를 해당 마일스톤에 연결합니다.
- 마일스톤 진행률(%)을 통해 전체 진척도를 확인할 수 있습니다.
- 마일스톤 내 모든 이슈가 닫히면 마일스톤을 Close합니다.

## 이슈 관리

- 작업 시작 전 GitHub Issues에 이슈를 등록합니다.
- 이슈 제목은 작업 단위로 명확하게 작성합니다.
  - 예: `로그인 페이지 UI 구현`, `로그인 API 개발`
- 담당자(Assignee)를 지정합니다.
- 라벨을 활용합니다: `feature`, `bug`, `frontend`, `backend`

## 브랜치 보호 규칙 (main)

- PR 없이 직접 푸시 불가
- 1명 이상 리뷰 승인 필수
- force push 금지
- main 브랜치 삭제 금지

## 디스코드 알림

- GitHub 웹훅이 연동되어 있습니다.
- 🔔깃허브-알림 채널에서 push, PR, 이슈 알림을 확인할 수 있습니다.
- 해당 채널에서는 채팅을 자제해주세요.