@echo off
echo.
echo ========================================
echo   API Test - Kiểm Tra API Hoạt Động
echo ========================================
echo.

echo Đang chạy server trong 10 giây...
start npm run dev:all
timeout /t 3

echo.
echo Kiểm tra Health Check...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -Method GET | ConvertTo-Json"

echo.
echo Chạy test suite...
node api-test.js

echo.
pause
