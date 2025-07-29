@echo off
echo Starting E2E Tests for CodeMentor...
echo.

echo Checking if backend is running...
curl -s http://localhost:8080/api/v1/auth/signin >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend server might not be running on http://localhost:8080
    echo Please make sure your backend server is started before running tests.
    echo.
)

echo Checking if frontend is running...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Frontend server might not be running on http://localhost:5173
    echo The test runner will attempt to start it automatically.
    echo.
)

echo Running E2E tests...
echo.
npx playwright test

echo.
echo E2E tests completed!
pause 