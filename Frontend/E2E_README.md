# End-to-End Testing with Playwright

This project includes E2E tests using Playwright to test the application's functionality in a real browser environment.

## What the Tests Do

The E2E tests are designed to be **safe** and only perform operations that **add data** to your database, never delete or modify existing data. The current tests focus on:

1. **Simple Navigation Tests** (`simple-navigation.spec.ts`): Basic page loading and navigation
   - Tests that home page loads correctly
   - Tests that auth page loads correctly
   - Tests basic navigation elements

2. **Article Read Functionality** (`article-read.spec.ts`): Tests the "Mark as Read" feature for articles
   - Navigates to study materials page
   - Clicks on a subtopic to view articles
   - Marks an article as read (adds data to database)
   - Verifies the UI updates correctly

3. **Authenticated Article Read Functionality** (`auth-article-read.spec.ts`): Tests the complete flow with authentication
   - Logs in with test credentials
   - Navigates to study materials
   - Marks an article as read
   - Verifies the read status is properly updated

4. **User Registration and Article Creation** (`user-registration-article-creation.spec.ts`): Tests the complete user lifecycle
   - Registers a new user with unique credentials
   - Signs in with the newly created account
   - Navigates to study materials
   - Creates a new article with proper form validation
   - Verifies article creation success

5. **Company Questions Flow** (`company-questions-flow.spec.ts`): Tests the company questions workflow
   - Navigates to companies page
   - Selects a company to view questions
   - Views answers for questions that have "See Answer" button
   - Navigates to coding page for questions that have "Solve This" button
   - Verifies proper page navigation and element interactions

## Running the Tests

### Prerequisites
- Make sure your backend server is running on `http://localhost:8080`
- Make sure your frontend development server is running on `http://localhost:5173`

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run only simple navigation tests
npx playwright test simple-navigation.spec.ts

# Run only user registration and article creation tests
npx playwright test user-registration-article-creation.spec.ts

# Run only company questions flow tests
npx playwright test company-questions-flow.spec.ts
```

### Test Configuration

- **Browser**: Chrome only (for simplicity)
- **Base URL**: `http://localhost:5173`
- **Auto-start**: The test runner will automatically start the dev server if needed
- **Screenshots**: Taken on test failures
- **Traces**: Generated on first retry

## Test Structure

```
e2e/
├── simple-navigation.spec.ts                    # Basic navigation tests (most reliable)
├── article-read.spec.ts                        # Basic article read functionality (no auth)
├── auth-article-read.spec.ts                   # Authenticated article read functionality
├── user-registration-article-creation.spec.ts # Complete user lifecycle with article creation
└── company-questions-flow.spec.ts             # Company questions workflow and coding navigation
```

## Safety Features

- Tests only perform **additive operations** (marking articles as read)
- No destructive operations (delete, update, etc.)
- Tests skip gracefully if required elements don't exist
- Uses `test.skip()` for scenarios that can't be tested
- Authentication tests use test credentials (you'll need to update these)

## Test Credentials

For the authenticated tests to work, you'll need to update the test credentials in `e2e/auth-article-read.spec.ts`:

```typescript
await emailInput.fill('your-test-email@gmail.com');
await passwordInput.fill('your-test-password');
```

Replace these with actual test user credentials from your database.

## Troubleshooting

### Common Issues

1. **Tests fail with timeout**: Make sure both backend and frontend servers are running
2. **Authentication fails**: Update the test credentials in the auth test file
3. **Elements not found**: The tests use defensive programming and will skip gracefully

### Debug Tips

- Use `npm run test:e2e:headed` to see what's happening in the browser
- Use `npm run test:e2e:debug` to step through tests interactively
- Check the generated HTML report for detailed failure information
- Start with `simple-navigation.spec.ts` to verify the basic setup works

## Adding New Tests

When adding new E2E tests:

1. **Only test additive operations** that add data to the database
2. **Avoid destructive operations** like delete, update, or modify existing data
3. **Use defensive programming** - check if elements exist before interacting
4. **Add proper waits** for network requests and page loads
5. **Include meaningful assertions** to verify the expected behavior
6. **Start simple** - test basic navigation before complex interactions 