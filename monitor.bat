@echo off
echo ==========================================
echo Starting ESP32 Serial Monitor on COM3 (115200 baud)
echo Press Ctrl+C to exit
echo ==========================================
.\esp32\tools\arduino-cli.exe monitor -p COM3 -c baudrate=115200
