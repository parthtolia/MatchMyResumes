# MatchMyResumes — Playwright E2E Tests

## Prerequisites

1. **Node.js** 18+ installed
2. **Playwright browsers** installed:
   ```bash
   npx playwright install chromium
   ```
3. **Frontend dev server** running on port 3000:
   ```bash
   cd frontend && npm run dev
   ```
4. **Backend server** running on port 8000:
   ```bash
   cd backend && venv/Scripts/python.exe -m uvicorn app.main:app --port 8000
   ```

## Environment Variables

Create a `.env.test` or set these in your shell before running tests:

```bash
# Required for auth tests (Clerk test user credentials)
TEST_USER_EMAIL=test@matchmyresumes.ai
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_FIRST_NAME=Test

# Optional: override base URL (defaults to http://localhost:3000)
BASE_URL=http://localhost:3000
```

> **Dev mode**: If your Clerk keys are placeholder (not real `pk_*`), auth
> tests will be skipped automatically. All other tests (navigation, upload,
> error scenarios) will work with the dev-mode auth bypass.

## Running Tests

```bash
# Run all tests
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run a specific test file
npx playwright test tests/e2e/auth.noauth.spec.ts

# Run tests matching a name
npx playwright test -g "should upload a valid PDF"

# Run only no-auth tests (no Clerk login needed)
npx playwright test --project=no-auth

# Run only mobile viewport tests
npx playwright test --project=mobile

# Interactive debug mode
npx playwright test --debug

# Open the HTML report after run
npx playwright show-report
```

## Test Structure

```
tests/
├── .auth/                    # Saved auth state (gitignored)
│   └── user.json
├── e2e/
│   ├── auth.setup.ts         # Auth setup — runs first, saves login state
│   ├── auth.noauth.spec.ts   # Login, signup, redirect tests (no pre-auth)
│   ├── logout.spec.ts        # Logout flow
│   ├── resume-upload.spec.ts # Upload valid/invalid/large/corrupt files
│   ├── ats-scoring.spec.ts   # CV Analysis + JD Match scoring flows
│   ├── error-scenarios.spec.ts # API failures, timeouts, refreshes
│   ├── navigation.spec.ts    # All dashboard page navigation
│   └── navigation.mobile.spec.ts # Mobile viewport navigation
├── fixtures/
│   ├── sample-resume.pdf     # Valid small PDF
│   ├── sample-resume.docx    # Valid small DOCX
│   ├── large-file-15mb.pdf   # 15MB file (exceeds 10MB limit)
│   ├── script.js             # Unsupported file type
│   ├── corrupted.pdf         # Corrupted PDF (garbage data)
│   └── empty.pdf             # 0-byte file
├── utils/
│   └── test-helpers.ts       # Reusable helpers, selectors, mock utils
└── README.md                 # This file
```

## Test Categories

| File | Tests | Auth Required | Description |
|------|-------|---------------|-------------|
| `auth.noauth.spec.ts` | 6 | No | Signup/login UI, invalid login, redirect |
| `logout.spec.ts` | 1 | Yes | Logout flow |
| `resume-upload.spec.ts` | 8 | Yes | PDF/DOCX upload, rejection, duplicates |
| `ats-scoring.spec.ts` | 11 | Yes | CV scoring, JD match, error handling |
| `error-scenarios.spec.ts` | 10 | Yes | API failures, 429, timeouts, navigation |
| `navigation.spec.ts` | 11 | Yes | All dashboard routes + quick actions |
| `navigation.mobile.spec.ts` | 4 | Yes | Mobile menu, no-overflow check |

**Total: 51 tests**

## Adding New Tests

1. Place test files in `tests/e2e/` with `.spec.ts` extension
2. Use `*.noauth.spec.ts` for tests that should run without saved auth state
3. Use `*.mobile.spec.ts` for tests that should run in mobile viewport
4. Import helpers from `../utils/test-helpers`
5. Use `mockApiError()` / `mockApiTimeout()` for error scenario testing

## CI Integration

Set `CI=true` to enable retries and single-worker mode:

```bash
CI=true npx playwright test
```

The config enables:
- 2 retries on failure
- Single worker (sequential execution)
- Traces and videos on first retry
- Screenshots on failure
