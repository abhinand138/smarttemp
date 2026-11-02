@echo off
echo ==========================================
echo Starting SmartTemp Stack via Docker Compose
echo ==========================================
docker compose up -d --build
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [+] SmartTemp is up and running!
    echo   - React Web Dashboard: http://localhost:5173
    echo   - Flask REST API:      http://localhost:5000
    echo   - PostgreSQL Database: localhost:5432
    echo.
    echo To view logs:  docker compose logs -f
    echo To stop:      docker compose down
) else (
    echo.
    echo [-] Docker Compose failed to start. Ensure Docker Desktop is running!
)
