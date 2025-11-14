#!/bin/bash

# Script để chạy cả Frontend và Backend cùng lúc trên macOS/Linux

echo ""
echo "========================================"
echo "   AI Image Finder - Start Script"
echo "========================================"
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "✗ Node.js không được cài đặt!"
    echo "  Tải từ: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Kiểm tra MongoDB
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠ MongoDB không phát hiện trên port 27017"
    echo "  Khởi động MongoDB:"
    echo "  - macOS: brew services start mongodb-community"
    echo "  - Linux: sudo systemctl start mongod"
    echo ""
fi

# Kiểm tra .env file
if [ ! -f ".env" ]; then
    echo "⚠ File .env không tìm thấy"
    echo "  Copy từ .env.example..."
    cp .env.example .env
    echo "  ✓ .env được tạo từ .env.example"
    echo "  ⚠ HÃYHÃY CẬP NHẬT CÁC GIẢI PHÁP CẤU HÌNH TRONG .env!"
    echo ""
fi

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt dependencies..."
    npm install
    echo ""
fi

# Khởi động servers
echo "🚀 Khởi động services..."
echo ""
echo "Terminal 1: Backend Server (Port 5000)"
echo "Terminal 2: Frontend Dev Server (Port 5173)"
echo ""

# Chạy backend trong background
npm run dev:server &
BACKEND_PID=$!

# Chờ 3 giây
sleep 3

# Chạy frontend
npm run dev

# Khi user dừng frontend, dừng backend
kill $BACKEND_PID 2>/dev/null

echo ""
echo "✓ Services đã dừng"
