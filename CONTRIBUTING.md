# Contributing Guidelines

## Branch Strategy

- Direct push to `main` is prohibited.
- Create a new branch from `main` before starting work.
- Branch naming: `feature/<feature-name>` (e.g., `feature/login-page`, `feature/code-api`)
- Delete branches after merge.

## Workflow

1. `git pull origin main` to get the latest code.
2. `git checkout -b feature/<feature-name>` to create a branch.
3. Commit your changes.
4. `git push -u origin feature/<feature-name>` to push.
5. Create a Pull Request on GitHub.
6. Get at least 1 review approval.
7. Merge after approval.
8. Delete the merged branch.

## Commit Convention

```
<type>: <description>
```

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: implement login page UI` |
| `fix` | Bug fix | `fix: resolve token expiration handling` |
| `docs` | Documentation | `docs: update README` |
| `style` | Code formatting (no logic change) | `style: fix indentation` |
| `refactor` | Code refactoring | `refactor: extract auth logic into hook` |
| `test` | Add/update tests | `test: add login API tests` |
| `chore` | Build, config changes | `chore: update vite config` |

## Pull Request Rules

- PR title should clearly describe the work done.
- Link related issues with `closes #<issue-number>` in the PR body.
- Minimum 1 review approval required.

## Milestones

We use GitHub Milestones to track project progress.

- Create milestones for each major project phase.
- Set a due date for each milestone.
- Link related issues to the milestone.
- Track progress via milestone completion percentage.
- Close the milestone when all linked issues are resolved.

## Issue Management

- Create a GitHub Issue before starting work.
- Issue titles should be clear and task-scoped.
  - e.g., `Implement login page UI`, `Build login API`
- Assign a responsible team member.
- Use labels: `feature`, `bug`, `frontend`, `backend`

## Branch Protection Rules (main)

- No direct push without PR
- Minimum 1 review approval required
- Force push prohibited
- Branch deletion prohibited