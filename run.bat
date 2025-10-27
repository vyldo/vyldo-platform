@echo off
echo ========================================
echo Vyldo Platform - Starting...
echo Created by Aftab Irshad
echo ========================================
echo.

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo Checking if .env exists...
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo Please edit .env file with your configuration!
    pause
)

echo.
echo Starting MongoDB...
net start MongoDB

echo.
echo Starting Vyldo Platform...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.

npm run dev
