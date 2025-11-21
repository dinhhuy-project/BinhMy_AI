# 📸 Hướng Dẫn Sử Dụng Tìm Kiếm Ảnh Thông Minh

## 🎯 Tính Năng Mới

**AI hiện có thể đọc tên file ảnh để đưa ra kết quả tìm kiếm chính xác hơn!**

### ✨ Điều Gì Đã Thay Đổi?

Trước đây, AI chỉ xem nội dung hình ảnh. Giờ đây, AI sẽ xem xét:
1. **Tên file của ảnh** (ví dụ: "dog_playing.jpg")
2. **Nội dung trực quan** (những gì AI thấy trong ảnh)
3. **Yêu cầu tìm kiếm** của bạn

## 📝 Ví Dụ Thực Tế

### Ví Dụ 1: Tìm Kiếm "Chó"

**Ảnh 1:**
- Tên file: `my_dog_photo.jpg` ✅
- Nội dung: Hình ảnh một con chó
- **Kết quả:** Điểm rất cao (95-100) vì tên file + nội dung đều khớp

**Ảnh 2:**
- Tên file: `IMG_001.jpg` ❌ (tên không có ý nghĩa)
- Nội dung: Hình ảnh một con chó
- **Kết quả:** Điểm trung bình (60-70) vì chỉ nội dung khớp

### Ví Dụ 2: Tìm Kiếm "Biển"

**Ảnh 1:**
- Tên file: `vacation_beach.jpg` ✅
- Nội dung: Ảnh bãi biển đẹp
- **Kết quả:** Điểm rất cao (90-100)

**Ảnh 2:**
- Tên file: `photo_2024.jpg` ❌
- Nội dung: Ảnh bãi biển đẹp
- **Kết quả:** Điểm thấp hơn (50-70)

## 💡 Mẹo Để Kết Quả Tốt Nhất

### 1️⃣ Đặt Tên File Có Ý Nghĩa

**Tên file TỐT:**
```
dog_playing.jpg
sunset_landscape.png
family_photo_2024.jpg
beach_vacation.jpg
birthday_cake.jpg
mountain_hiking.jpg
```

**Tên file XẤU:**
```
IMG_001.jpg
photo1.jpg
image.jpg
DCP_1234.jpg
20240101_123456.jpg
```

### 2️⃣ Sử Dụng Từ Khóa Rõ Ràng

Khi đặt tên file, sử dụng từ khóa liên quan:
- Chủ đề chính (ví dụ: "dog", "beach", "sunset")
- Hoạt động (ví dụ: "playing", "running", "swimming")
- Địa điểm (ví dụ: "park", "beach", "mountains")

### 3️⃣ Tìm Kiếm Với Các Từ Khóa Cụ Thể

**Tìm kiếm TỐT:**
```
"chó đang chơi"
"bãi biển lúc hoàng hôn"
"cuộc họp họ gia đình"
```

**Tìm kiếm XẤU:**
```
"ảnh"
"hình"
"ảnh cũ"
```

## 🔄 Luồng Hoạt Động

```
1. Bạn upload/tải ảnh từ Google Drive
   ↓
2. Tên file được lưu tự động
   ↓
3. Bạn nhập từ khóa tìm kiếm
   ↓
4. AI phân tích:
   - Tên file
   - Nội dung ảnh
   - Từ khóa tìm kiếm
   ↓
5. AI đưa ra điểm khớp (0-100)
   ↓
6. Ảnh có điểm cao nhất được chọn
   ↓
7. Kết quả được lưu vào MongoDB
```

## 📊 Cách Điểm Được Tính

Điểm khớp (0-100) dựa trên:

| Yếu Tố | Trọng Số | Chi Tiết |
|--------|----------|---------|
| **Tên file khớp** | 30% | Tên file chứa từ khóa tìm kiếm |
| **Nội dung ảnh** | 60% | Hình ảnh hiển thị đối tượng tìm kiếm |
| **Ngữ cảnh tổng quát** | 10% | Màu sắc, ánh sáng, cảnh tương tự |

### Công Thức Điểm:
```
Điểm = (Tên file × 0.3) + (Nội dung × 0.6) + (Ngữ cảnh × 0.1)
```

## ❓ Câu Hỏi Thường Gặp

### Q: Nếu tôi đặt tên file sai, có sao không?
**A:** Không sao! AI vẫn sẽ phân tích nội dung ảnh. Tên file chỉ là một yếu tố bổ trợ.

### Q: Tôi có thể sửa lại tên file không?
**A:** Hiện tại không thể sửa sau khi upload. Hãy đặt tên file tốt trước khi upload.

### Q: Tôi nên đặt tên file tiếng Việt hay tiếng Anh?
**A:** Cả hai đều được! AI có thể hiểu tiếng Việt và tiếng Anh.

### Q: Có giới hạn độ dài tên file không?
**A:** Nên giữ dưới 50 ký tự để dễ quản lý.

## 🎓 Ví Dụ Chi Tiết

### Tìm Kiếm: "Người bạn vui vẻ tại công viên"

**Ảnh A:**
- Tên: `friends_happy_park.jpg`
- Nội dung: 3 người cười vui vẻ ở công viên
- **Điểm: 98/100** ⭐⭐⭐⭐⭐

**Ảnh B:**
- Tên: `IMG_20240101.jpg`
- Nội dung: 3 người cười vui vẻ ở công viên
- **Điểm: 75/100** ⭐⭐⭐

**Ảnh C:**
- Tên: `office_meeting.jpg`
- Nội dung: Một người một mình
- **Điểm: 5/100** ❌

## 🚀 Bắt Đầu Sử Dụng

1. ✅ Upload ảnh với **tên file có ý nghĩa**
2. ✅ Nhập **từ khóa tìm kiếm cụ thể**
3. ✅ Hệ thống sẽ tìm ảnh **chính xác nhất** cho bạn
4. ✅ Kết quả được **lưu tự động**

---

**Mẹo Cuối Cùng:** Hãy đặt tên file như thể bạn đang mô tả nó cho một người bạn! 😊
