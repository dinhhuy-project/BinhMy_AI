# Google Drive Integration - Hướng dẫn Sử dụng

## Tính năng

Ứng dụng này đã được tích hợp với Google Drive để tự động tải ảnh từ thư mục "Schedule" thay vì phải tải ảnh lên thủ công.

## Yêu cầu

1. **Google Cloud Project với Drive API đã được kích hoạt**
2. **Credentials.json** - File này đã được cấu hình trong dự án
3. **Thư mục "Schedule"** trong Google Drive của bạn chứa các ảnh

## Cách sử dụng

### Bước 1: Chuẩn bị Google Drive

1. Đăng nhập vào Google Drive của bạn
2. Tạo một thư mục có tên chính xác là **"Schedule"** (phân biệt chữ hoa chữ thường)
3. Đặt tất cả các ảnh bạn muốn tìm kiếm vào thư mục này

### Bước 2: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:3000/

### Bước 3: Đăng nhập Google Drive

1. Mở trình duyệt và truy cập http://localhost:3000/
2. Trong giao diện, bạn sẽ thấy phần **"Google Drive - Thư mục Schedule"**
3. Nhấp vào nút **"Đăng nhập Google Drive"**
4. Một cửa sổ popup sẽ xuất hiện để bạn chọn tài khoản Google
5. Cho phép ứng dụng truy cập Google Drive của bạn (chỉ đọc - Read Only)

### Bước 4: Tải ảnh từ Google Drive

1. Sau khi đăng nhập thành công, nhấp vào nút **"Tải ảnh từ thư mục Schedule"**
2. Ứng dụng sẽ tự động:
   - Tìm thư mục "Schedule" trong Drive của bạn
   - Tải tất cả các ảnh trong thư mục đó
   - Hiển thị tiến trình tải
3. Các ảnh sẽ xuất hiện trong phần "Kho ảnh" bên dưới

### Bước 5: Tìm kiếm ảnh bằng AI

1. Sau khi ảnh đã được tải, sử dụng thanh tìm kiếm để mô tả ảnh bạn muốn tìm
2. Ví dụ: "tấm ảnh có người đang cười", "ảnh phong cảnh biển", "ảnh họp nhóm"
3. Bạn cũng có thể dùng giọng nói để tìm kiếm
4. AI sẽ phân tích và tìm ảnh phù hợp nhất

## Các tính năng chính

### 1. Đăng nhập tự động
- Hệ thống lưu trạng thái đăng nhập
- Không cần đăng nhập lại mỗi lần sử dụng (cho đến khi token hết hạn)

### 2. Tải ảnh tự động
- Tự động tìm thư mục "Schedule"
- Tải tất cả ảnh trong thư mục
- Hiển thị tiến trình tải chi tiết

### 3. Kết hợp với tải ảnh thủ công
- Bạn vẫn có thể tải ảnh lên thủ công qua phần "Kho ảnh"
- Có thể kết hợp cả ảnh từ Drive và ảnh tải lên

### 4. Bảo mật
- Chỉ yêu cầu quyền đọc (Read Only)
- Không thể chỉnh sửa hoặc xóa ảnh trong Drive
- Sử dụng OAuth 2.0 của Google

## Cấu trúc File

```
ai-drive-image-finder/
├── public/
│   └── credentials.json          # Google OAuth credentials
├── services/
│   ├── driveService.ts           # Dịch vụ Google Drive API
│   └── geminiService.ts          # Dịch vụ AI tìm kiếm
├── components/
│   ├── DriveImageLoader.tsx      # Component đăng nhập Drive
│   ├── ImageUploader.tsx         # Component tải ảnh thủ công
│   └── ...
└── App.tsx                       # Component chính
```

## API được sử dụng

- **Google Drive API v3**: Để truy cập và tải ảnh từ Drive
- **Google Identity Services**: Để xác thực OAuth 2.0
- **Google Gemini AI**: Để phân tích và tìm kiếm ảnh

## Xử lý lỗi phổ biến

### 1. "Không tìm thấy thư mục Schedule"
- Đảm bảo bạn đã tạo thư mục tên chính xác là "Schedule"
- Thư mục phải ở thư mục gốc của Drive (My Drive)

### 2. "Đăng nhập thất bại"
- Kiểm tra kết nối internet
- Đảm bảo bạn đang dùng đúng tài khoản Google
- Thử xóa cache trình duyệt và đăng nhập lại

### 3. "Không thể tải ảnh"
- Kiểm tra xem file trong Drive có phải là ảnh không
- Đảm bảo bạn có quyền truy cập vào các file đó

### 4. Popup bị chặn
- Cho phép popup từ localhost:3000 trong trình duyệt
- Hoặc nhấp vào biểu tượng popup bị chặn trên thanh địa chỉ

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: 
- File `credentials.json` chứa thông tin nhạy cảm
- **KHÔNG** commit file này lên Git repository công khai
- File `.gitignore` đã được cấu hình để bỏ qua file này
- Chỉ chia sẻ credentials với người được ủy quyền

## Giới hạn

- Tối đa 100 ảnh mỗi lần tải (có thể tăng trong code nếu cần)
- Chỉ tải ảnh từ thư mục "Schedule" cấp 1 (không tải từ thư mục con)
- Yêu cầu kết nối internet để truy cập Drive

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console của trình duyệt (F12) để xem lỗi chi tiết
2. Network tab để xem các request API
3. Đảm bảo credentials.json được cấu hình đúng
