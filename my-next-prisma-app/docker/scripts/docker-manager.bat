@echo off
REM QuizMania Docker Management Script for Windows
REM Usage: docker-manager.bat [command]

setlocal enabledelayedexpansion

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Handle commands
if "%1"=="dev:start" goto dev_start
if "%1"=="dev:stop" goto dev_stop
if "%1"=="dev:restart" goto dev_restart
if "%1"=="dev:logs" goto dev_logs
if "%1"=="prod:start" goto prod_start
if "%1"=="prod:stop" goto prod_stop
if "%1"=="prod:restart" goto prod_restart
if "%1"=="prod:logs" goto prod_logs
if "%1"=="db:migrate" goto db_migrate
if "%1"=="db:seed" goto db_seed
if "%1"=="db:reset" goto db_reset
if "%1"=="db:backup" goto db_backup
if "%1"=="status" goto show_status
if "%1"=="health" goto health_check
if "%1"=="logs" goto show_logs
if "%1"=="cleanup" goto cleanup
if "%1"=="help" goto show_help
if "%1"=="" goto show_help
goto unknown_command

:dev_start
echo ℹ️  Starting QuizMania in development mode...
if not exist .env.local (
    echo ⚠️  .env.local not found. Copying from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your actual values before proceeding.
    exit /b 1
)
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build -d
echo ✅ Development environment started!
echo ℹ️  Services available at:
echo   🌐 Web App: http://localhost:3000
echo   🔌 WebSocket: http://localhost:4000
echo   🗄️  Database Admin: http://localhost:8080
echo   📊 Redis Commander: http://localhost:8081
echo   📧 MailHog: http://localhost:8025
goto end

:dev_stop
echo ℹ️  Stopping development environment...
docker-compose -f docker-compose.yml -f docker-compose.override.yml down
echo ✅ Development environment stopped!
goto end

:dev_restart
echo ℹ️  Restarting development environment...
call %0 dev:stop
call %0 dev:start
goto end

:dev_logs
echo ℹ️  Showing development logs...
docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f %2
goto end

:prod_start
echo ℹ️  Starting QuizMania in production mode...
if not exist .env.local (
    echo ❌ .env.local not found. Please create it from .env.example
    exit /b 1
)
docker-compose up --build -d
echo ✅ Production environment started!
echo ℹ️  Services available at:
echo   🌐 Web App: http://localhost (via Nginx)
echo   📊 Monitoring: http://localhost:9090 (Prometheus)
echo   📈 Dashboards: http://localhost:3001 (Grafana)
goto end

:prod_stop
echo ℹ️  Stopping production environment...
docker-compose down
echo ✅ Production environment stopped!
goto end

:prod_restart
echo ℹ️  Restarting production environment...
call %0 prod:stop
call %0 prod:start
goto end

:prod_logs
echo ℹ️  Showing production logs...
docker-compose logs -f %2
goto end

:db_migrate
echo ℹ️  Running database migrations...
docker-compose exec app npx prisma migrate deploy
echo ✅ Database migrations completed!
goto end

:db_seed
echo ℹ️  Seeding database...
docker-compose exec app npm run seed
echo ✅ Database seeded!
goto end

:db_reset
echo ⚠️  This will reset the database and lose all data. Are you sure? (y/N)
set /p response=
if /i "%response%"=="y" (
    echo ℹ️  Resetting database...
    docker-compose exec app npx prisma migrate reset --force
    echo ✅ Database reset completed!
) else (
    echo ℹ️  Database reset cancelled.
)
goto end

:db_backup
echo ℹ️  Creating database backup...
for /f "tokens=1-6 delims=/ :" %%i in ("%date% %time%") do set timestamp=%%l%%j%%k_%%m%%n%%o
docker-compose exec postgres pg_dump -U quizmania quizmania > backup_%timestamp%.sql
echo ✅ Database backup created: backup_%timestamp%.sql
goto end

:cleanup
echo ℹ️  Cleaning up Docker resources...
docker-compose down --rmi local --volumes --remove-orphans
docker system prune -f
echo ✅ Cleanup completed!
goto end

:health_check
echo ℹ️  Checking service health...
for %%s in (app ws-server postgres redis) do (
    docker-compose ps %%s | findstr "Up" >nul
    if !errorlevel! equ 0 (
        echo ✅ %%s is running
    ) else (
        echo ❌ %%s is not running
    )
)
goto end

:show_status
echo ℹ️  Service status:
docker-compose ps
goto end

:show_logs
if "%2"=="" (
    echo ℹ️  Showing all logs...
    docker-compose logs -f
) else (
    echo ℹ️  Showing logs for %2...
    docker-compose logs -f %2
)
goto end

:show_help
echo QuizMania Docker Management Script for Windows
echo.
echo Usage: %0 [command]
echo.
echo Development Commands:
echo   dev:start     Start development environment
echo   dev:stop      Stop development environment
echo   dev:restart   Restart development environment
echo   dev:logs      Show development logs
echo.
echo Production Commands:
echo   prod:start    Start production environment
echo   prod:stop     Stop production environment
echo   prod:restart  Restart production environment
echo   prod:logs     Show production logs
echo.
echo Database Commands:
echo   db:migrate    Run database migrations
echo   db:seed       Seed database with sample data
echo   db:reset      Reset database (destructive)
echo   db:backup     Create database backup
echo.
echo Utility Commands:
echo   status        Show service status
echo   health        Check service health
echo   logs [service] Show logs for all services or specific service
echo   cleanup       Clean up Docker resources
echo   help          Show this help message
echo.
echo Examples:
echo   %0 dev:start
echo   %0 logs app
echo   %0 db:migrate
goto end

:unknown_command
echo ❌ Unknown command: %1
echo.
goto show_help

:end
