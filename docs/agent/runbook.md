# runbook.md

## Validation Commands

**Run E2E tests only when explicitly requested.**

| Step | Command | Description |
|------|---------|-------------|
| lint | `npm run lint` | Code style check |
| unit/integration test | `npm run test` | Run all tests |
| build | `npm run build` | Build |
| E2E | `npm run test:e2e` | E2E tests |

## Running a Single Test

```bash
# Run a specific file
npm run test -- <filepath>

# Run a specific test by name
npm run test -- --testNamePattern="<test name>"
```

## Git Workflow

All validation must pass before proceeding. Do not commit without passing validation.

1. Check changes with `git status` / `git diff --cached --stat`
2. Commit & push (`git push -u origin <branch>`)
3. If additional changes are requested, commit & push again
4. Create PR — include `closes #<issue-number>` in the body
   ```bash
   gh pr create --title "<title>" --body "<body>" --label "<label>" --assignee h2zkzd5whp-droid
   ```
5. Wait for CI to pass (`gh pr checks <number> --watch`)
6. Merge & delete remote branch (`gh pr merge <number> --merge --delete-branch`)
7. Clean up local branch (`git checkout main && git pull origin main && git branch -d <branch>`)

---

## Notes

- (Add any project-specific commands or environment notes here)
