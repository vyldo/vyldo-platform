@echo off
color 0A
title Vyldo Platform - Public Server Setup

echo ========================================
echo    VYLDO PLATFORM - PUBLIC ACCESS
echo    Created by Aftab Irshad
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ngrok is not installed!
    echo.
    echo Please install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract ngrok.exe to a folder
    echo 3. Add that folder to your PATH
    echo 4. Run: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo [1/4] Starting MongoDB...
echo.
net start MongoDB 2>nul
if %ERRORLEVEL% EQU 0 (
    echo MongoDB started successfully!
) else (
    echo MongoDB already running or failed to start
)
echo.

echo [2/4] Starting Vyldo Platform...
echo.
start "Vyldo Server" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 10

echo [3/4] Starting Ngrok Tunnels...
echo.
echo Opening Backend Tunnel (Port 5000)...
start "Ngrok Backend" cmd /k "ngrok http 5000 --log=stdout"
timeout /t 3

echo Opening Frontend Tunnel (Port 5173)...
start "Ngrok Frontend" cmd /k "ngrok http 5173 --log=stdout"
timeout /t 3

echo.
echo [4/4] Setup Complete!
echo.
echo ========================================
echo   PUBLIC URLS (Check Ngrok windows):
echo ========================================
echo.
echo Backend:  https://XXXX.ngrok.io
echo Frontend: https://YYYY.ngrok.io
echo.
echo IMPORTANT:
echo 1. Copy the ngrok URLs from the opened windows
echo 2. Update your .env file with these URLs
echo 3. Share these URLs with your team
echo.
echo Press any key to open Ngrok dashboard...
pause >nul
start https://dashboard.ngrok.com/endpoints

echo.
echo Server is running! Keep this window open.
echo Press Ctrl+C to stop all services.
pause
