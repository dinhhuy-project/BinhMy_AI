# API Key Fallback System - Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống này cho phép ứng dụng tự động chuyển sang API Key khác khi:
- API Key hiện tại **hết token/quota**
- API Key **lỗi xác thực (401/403)**
- API Key **vượt quá rate limit**

## Cấu Hình

### 1. Thiết Lập API Keys trong `.env`

```env
# API Key chính
GEMINI_API_KEY=your-primary-api-key

# Backup API Keys (tùy chọn)
GEMINI_API_KEY_BACKUP_1=your-backup-api-key-1
GEMINI_API_KEY_BACKUP_2=your-backup-api-key-2
GEMINI_API_KEY_BACKUP_3=your-backup-api-key-3
```

### 2. Cách Hoạt Động

#### Tự Động Fallback
Khi gọi `rateBatchImageMatch()` hoặc `rateImageMatch()`:
1. Hệ thống sẽ cố gắng gọi API với API Key hiện tại
2. Nếu gặp lỗi quota/auth, nó sẽ tự động:
   - Đánh dấu API Key hiện tại là failed
   - Chuyển sang API Key tiếp theo
   - Thử lại yêu cầu với API Key mới
3. Nếu vẫn thất bại, tiếp tục chuyển sang API Key kế tiếp
4. Nếu tất cả API Keys đều hết hạn, trả về lỗi

```typescript
// Code tự động fallback
const results = await rateBatchImageMatch(images, "tìm kiếm");
// Nếu API Key 1 hết token, sẽ tự động thử API Key 2, 3, ...
```

## API Endpoints

### 1. Kiểm Tra Trạng Thái API Keys

**Endpoint:** `GET /api/api-key/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "currentKeyIndex": 0,
    "totalKeys": 2,
    "allKeysFailed": false,
    "activeKeyStatus": {
      "key": "AIza...",
      "index": 0,
      "isActive": true,
      "failureCount": 0,
      "lastUsed": "2025-01-15T10:30:00.000Z"
    },
    "backupKeys": [
      {
        "key": "AIza...",
        "index": 1,
        "isActive": false,
        "failureCount": 2,
        "lastError": "quota exceeded"
      }
    ]
  }
}
```

### 2. Lấy Chi Tiết Tất Cả API Keys

**Endpoint:** `GET /api/api-key/status`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "AIza... (masked)",
      "index": 0,
      "isActive": true,
      "failureCount": 0,
      "lastUsed": "2025-01-15T10:30:00.000Z"
    },
    {
      "key": "AIza... (masked)",
      "index": 1,
      "isActive": false,
      "failureCount": 3,
      "lastError": "RESOURCE_EXHAUSTED"
    }
  ]
}
```

### 3. Chuyển Sang API Key Tiếp Theo

**Endpoint:** `POST /api/api-key/switch`

**Response:**
```json
{
  "success": true,
  "message": "Switched to next API key",
  "data": {
    "currentKeyIndex": 1,
    "totalKeys": 2,
    "allKeysFailed": false,
    "activeKeyStatus": { ... }
  }
}
```

### 4. Reset Lại Bộ Đếm Lỗi

**Endpoint:** `POST /api/api-key/reset`

Cái này hữu ích khi:
- Bạn đã cập nhật quota cho một API Key
- Bạn muốn reset lại trạng thái

**Response:**
```json
{
  "success": true,
  "message": "API key failure counters reset",
  "data": { ... }
}
```

## Cấu Hình Advanced

### Thay Đổi Ngưỡng Lỗi

File `services/apiKeyManager.ts`:
```typescript
const maxFailuresBeforeFallback = 3; // Số lỗi tối đa trước khi switch

// Thay đổi:
apiKeyManager.setMaxFailuresBeforeFallback(5); // 5 lỗi trước khi switch
```

## Logs & Monitoring

Hệ thống ghi log tất cả hoạt động:

```
[ApiKeyManager] Initialized with 2 API key(s)
[GeminiService] Initialized with API Key #0
[ApiKeyManager] API Key #0 failed (1/3): quota exceeded
[ApiKeyManager] Switched from API Key #0 to #1
[GeminiService] Switched from API Key #0 to #1. Attempting to switch to next key...
```

## Ví Dụ Sử Dụng

### Frontend - Kiểm Tra Trạng Thái

```typescript
// Kiểm tra trạng thái API Keys
const response = await fetch('/api/api-key/health');
const health = await response.json();

if (health.data.allKeysFailed) {
  console.error('Tất cả API Keys đã hết');
} else {
  console.log(`Đang sử dụng API Key #${health.data.currentKeyIndex}`);
}
```

### Backend - Xử Lý Trong Code

```typescript
import { 
  rateBatchImageMatch, 
  getApiKeyHealthStatus,
  switchToNextApiKey,
  resetApiKeyFailureCounts 
} from './services/geminiService';

// Gọi API - tự động fallback nếu cần
const results = await rateBatchImageMatch(images, query);

// Nếu muốn biết tình trạng hiện tại
const health = getApiKeyHealthStatus();
console.log(`Hiện tại dùng API Key #${health.currentKeyIndex}`);

// Nếu muốn chủ động chuyển sang API Key khác
await switchToNextApiKey();

// Reset lại counter (sau khi update quota)
resetApiKeyFailureCounts();
```

## Lỗi Được Nhận Dạng

Hệ thống tự động nhận dạng các loại lỗi sau:

### Quota/Rate Limit Errors:
- `quota exceeded`
- `rate limit`
- `429`
- `exceed`
- `RESOURCE_EXHAUSTED`
- `ERR_RATE_LIMITED`

### Authentication Errors:
- `invalid`
- `unauthorized`
- `401`
- `403`
- `UNAUTHENTICATED`
- `PERMISSION_DENIED`

## Troubleshooting

### Vấn đề: Không có API Keys
```
Error: No API keys found in environment variables
```
**Giải pháp:** Kiểm tra file `.env` và đảm bảo `GEMINI_API_KEY` đã được thiết lập

### Vấn đề: Tất cả API Keys đã hết
```
[ApiKeyManager] All API keys have exceeded failure threshold
```
**Giải pháp:** 
1. Cập nhật quota cho các API Keys
2. Gọi `POST /api/api-key/reset` để reset counters
3. Thêm API Keys mới vào `.env`

### Vấn đề: API Key không tự động switch
**Kiểm tra:**
1. Lỗi có phải là quota/auth không? (Xem phần "Lỗi Được Nhận Dạng")
2. Có backup API Keys không? (Kiểm tra `.env`)
3. Xem logs để biết error message chi tiết

## Best Practices

1. **Luôn có Backup Keys**: Cấu hình ít nhất 2 API Keys
2. **Monitoring**: Kiểm tra `/api/api-key/health` định kỳ
3. **Auto Reset**: Tạo cron job reset failure counters hàng ngày
4. **Logging**: Giám sát logs để phát hiện vấn đề sớm
5. **Update Quota**: Nâng cấp quota khi sắp hết

## Diagram Luồng Fallback

```
┌─────────────────────┐
│ Gọi API (Image)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Sử dụng API Key #0  │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Thành công?  │
    └──┬───────┬──┘
       │ Yes   │ No
       │       ▼
       │  ┌───────────────────┐
       │  │ Là Quota/Auth     │
       │  │ Error?            │
       │  └──┬────────────┬──┘
       │     │ Yes        │ No
       │     ▼            │
       │  ┌───────────────┴──┐
       │  │ Mark Key Failed   │
       │  │ & Switch to Key #1│
       │  └──────┬───────────┘
       │         │
       │         ▼
       │  ┌──────────────────┐
       │  │ Có Key #1?       │
       │  └──┬────────┬──────┘
       │     │ Yes    │ No
       │     ▼        │
       │  ┌──────────┐│
       │  │ Retry    ││
       │  │ Request  ││
       │  └────┬─────┘│
       │       │      ▼
       ▼       │   ┌────────────┐
    ┌──┐      │   │ Return     │
    │✓ │      │   │ Error      │
    └──┘      │   └────────────┘
              │
              ▼
           ┌──────────┐
           │ Lặp lại  │
           │ cho      │
           │ Key #2   │
           └──────────┘
```
