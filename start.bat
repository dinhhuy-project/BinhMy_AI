@echo off
REM Script để chạy cả Frontend và Backend cùng lúc trên Windows

echo.
echo ========================================
echo   AI Image Finder - Start Script
echo ========================================
echo.

REM Kiểm tra xem Node.js đã cài đặt chưa
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js không được cài đặt!
    echo   Tải từ: https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js detected
echo.

REM Kiểm tra xem MongoDB đang chạy chưa
netstat -an | find "27017" >nul 2>&1
if errorlevel 1 (
    echo ⚠ MongoDB không phát hiện trên port 27017
    echo   Khởi động MongoDB:
    echo   - Windows: net start MongoDB
    echo   - macOS: brew services start mongodb-community
    echo   - Linux: sudo systemctl start mongod
    echo.
)

REM Kiểm tra .env file
if not exist ".env" (
    echo ⚠ File .env không tìm thấy
    echo   Copy từ .env.example:
    copy .env.example .env
    echo   ✓ .env được tạo từ .env.example
    echo   ⚠ HÃYHÃY CẬP NHẬT CÁC GIẢI PHÁP CẤU HÌNH TRONG .env!
    echo.
)

REM Kiểm tra node_modules
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies...
    call npm install
    echo.
)

REM Mở 2 terminal để chạy server và dev
echo 🚀 Khởi động services...
echo.
echo Terminal 1: Backend Server (Port 5000)
echo Terminal 2: Frontend Dev Server (Port 5173)
echo.

start cmd /k "npm run dev:server"
timeout /t 3
start cmd /k "npm run dev"

echo.
echo ✓ Cả hai services đã khởi động!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo.
echo Nhấn Ctrl+C trong mỗi terminal để dừng server
pause
