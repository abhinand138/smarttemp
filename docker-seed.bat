@echo off
echo ==========================================
echo Seeding Demo Sensor Data in SmartTemp Backend
echo ==========================================
docker compose exec backend python seed_data.py
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [+] Successfully generated sample telemetry!
    echo Refresh http://localhost:5173 to see the graphs and stats.
) else (
    echo.
    echo [-] Failed to run seed script. Ensure backend container is running: docker compose ps
)
