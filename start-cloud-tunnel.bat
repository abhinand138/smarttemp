@echo off
title SmartTemp - Instant Cloudflare Public Tunnel
color 0B

echo =====================================================================
echo       SmartTemp - Instant Cloudflare Public Tunnel
echo =====================================================================
echo.
echo [1/2] Verifying local SmartTemp Flask backend on port 5000...
netstat -ano | findstr /R /C:":5000.*LISTENING" >nul
if %errorlevel% neq 0 (
    echo [WARNING] Flask backend is NOT detected on port 5000!
    echo           Please make sure "python app.py" is running in your backend terminal.
    echo.
) else (
    echo [OK] Flask backend is active on http://127.0.0.1:5000
    echo.
)

echo [2/2] Generating instant, secure HTTPS public tunnel...
echo.
echo ---------------------------------------------------------------------
echo  INSTRUCTIONS:
echo  1. Look for the line below that says:
echo     "Your quick Tunnel has been created! Visit it at: https://xxxx.trycloudflare.com"
echo.
echo  2. Copy that HTTPS URL.
echo.
echo  3. Update "SERVER_URL" in your esp32/src/config.h:
echo     #define SERVER_URL "https://xxxx.trycloudflare.com/api/readings"
echo.
echo  4. Flash your ESP32! It will now transmit data from ANY Wi-Fi network
echo     directly to your SmartTemp dashboard!
echo ---------------------------------------------------------------------
echo.

"%~dp0tools\cloudflared.exe" tunnel --url http://127.0.0.1:5000

pause
