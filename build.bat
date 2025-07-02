 @echo off
setlocal enabledelayedexpansion

REM CodeMentor Docker Build Script for Windows

REM Colors for output (Windows 10+)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker and try again."
    exit /b 1
)
goto :eof

REM Function to build and start development environment
:build_dev
call :print_status "Building and starting development environment..."
call :print_status "Building Docker images..."
docker-compose build
if errorlevel 1 (
    call :print_error "Failed to build Docker images"
    exit /b 1
)

call :print_status "Starting services..."
docker-compose up -d
if errorlevel 1 (
    call :print_error "Failed to start services"
    exit /b 1
)

call :print_status "Development environment is ready!"
call :print_status "Frontend: http://localhost:3000"
call :print_status "Backend: http://localhost:8080/api/v1"
call :print_status "Database: localhost:5432"
goto :eof

REM Function to build and start production environment
:build_prod
call :print_status "Building and starting production environment..."

REM Check if .env file exists
if not exist .env (
    call :print_warning ".env file not found. Creating from template..."
    copy env.example .env
    call :print_warning "Please edit .env file with your production values before continuing."
    exit /b 1
)

call :print_status "Building Docker images..."
docker-compose -f docker-compose.prod.yml build
if errorlevel 1 (
    call :print_error "Failed to build Docker images"
    exit /b 1
)

call :print_status "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d
if errorlevel 1 (
    call :print_error "Failed to start production services"
    exit /b 1
)

call :print_status "Production environment is ready!"
call :print_status "Application: http://localhost"
call :print_status "Health check: http://localhost/health"
goto :eof

REM Function to stop services
:stop_services
call :print_status "Stopping services..."
docker-compose down
docker-compose -f docker-compose.prod.yml down
call :print_status "Services stopped."
goto :eof

REM Function to clean up
:cleanup
call :print_status "Cleaning up Docker resources..."
docker-compose down -v --remove-orphans
docker-compose -f docker-compose.prod.yml down -v --remove-orphans
docker system prune -f
call :print_status "Cleanup completed."
goto :eof

REM Function to show logs
:show_logs
if "%1"=="prod" (
    docker-compose -f docker-compose.prod.yml logs -f
) else (
    docker-compose logs -f
)
goto :eof

REM Function to rebuild specific service
:rebuild_service
if "%1"=="" (
    call :print_error "Please specify a service to rebuild (frontend, backend, or postgres)"
    exit /b 1
)

call :print_status "Rebuilding service: %1"
docker-compose build --no-cache %1
docker-compose up -d %1
call :print_status "Service %1 rebuilt and restarted."
goto :eof

REM Function to show help
:show_help
echo CodeMentor Docker Build Script for Windows
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   dev          Build and start development environment
echo   prod         Build and start production environment
echo   stop         Stop all services
echo   cleanup      Stop services and clean up Docker resources
echo   logs [env]   Show logs (dev or prod)
echo   rebuild ^<service^>  Rebuild specific service
echo   help         Show this help message
echo.
echo Examples:
echo   %0 dev                    # Start development environment
echo   %0 prod                   # Start production environment
echo   %0 logs prod              # Show production logs
echo   %0 rebuild frontend       # Rebuild frontend service
goto :eof

REM Main script logic
call :check_docker
if errorlevel 1 exit /b 1

if "%1"=="" goto show_help
if "%1"=="dev" goto build_dev
if "%1"=="prod" goto build_prod
if "%1"=="stop" goto stop_services
if "%1"=="cleanup" goto cleanup
if "%1"=="logs" goto show_logs
if "%1"=="rebuild" goto rebuild_service
if "%1"=="help" goto show_help

REM If we get here, unknown command
call :print_error "Unknown command: %1"
call :show_help
exit /b 1 