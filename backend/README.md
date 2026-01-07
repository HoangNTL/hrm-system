# HRM System Backend

API backend cho hệ thống quản lý nhân sự (HRM) được xây dựng với Node.js, Express, và Prisma ORM.

## Cấu trúc dự án

```
backend/
├── prisma/                    # Prisma schema và migrations
│   ├── schema.prisma         # Database schema definitions
│   ├── seed.js               # Database seeding script
│   └── migrations/           # Database migration files
├── src/
│   ├── config/               # Cấu hình ứng dụng
│   │   └── db.js            # Prisma client initialization
│   ├── controllers/          # Request handlers
│   │   ├── attendance.controller.js        # Xử lý chấm công
│   │   ├── attendanceRequest.controller.js # Xử lý yêu cầu điều chỉnh chấm công
│   │   ├── auth.controller.js              # Xử lý authentication
│   │   ├── contract.controller.js          # Quản lý hợp đồng
│   │   ├── department.controller.js        # Quản lý phòng ban
│   │   ├── employee.controller.js          # Quản lý nhân viên
│   │   ├── payroll.controller.js           # Xử lý bảng lương
│   │   ├── position.controller.js          # Quản lý vị trí công việc
│   │   ├── shift.controller.js             # Quản lý ca làm việc
│   │   └── user.controller.js              # Quản lý user accounts
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.js          # JWT authentication & authorization
│   │   └── errorHandler.js  # Global error handling
│   ├── routes/               # API route definitions
│   │   ├── attendance.routes.js
│   │   ├── attendanceRequest.routes.js
│   │   ├── auth.routes.js
│   │   ├── contract.routes.js
│   │   ├── department.routes.js
│   │   ├── employee.routes.js
│   │   ├── payroll.routes.js
│   │   ├── position.routes.js
│   │   ├── shift.routes.js
│   │   └── user.routes.js
│   ├── services/             # Business logic layer
│   │   ├── attendance.service.js
│   │   ├── auth.service.js
│   │   ├── contract.service.js
│   │   ├── department.service.js
│   │   ├── employee.service.js
│   │   ├── payroll.service.js
│   │   ├── position.service.js
│   │   ├── shift.service.js
│   │   └── user.service.js
│   ├── utils/                # Helper functions
│   │   ├── ApiError.js      # Custom error class
│   │   ├── errorCodes.js    # Error code constants
│   │   ├── errorMessages.js # Error message templates
│   │   ├── response.js      # Standardized API responses
│   │   └── sanitizeQuery.js # Query parameter validation
│   ├── app.js               # Express app configuration
│   └── index.js             # Server entry point
├── tests/                    # Test files
│   ├── setup.js             # Test configuration
│   ├── controllers/         # Controller tests
│   ├── middlewares/         # Middleware tests
│   ├── services/            # Service tests
│   └── utils/               # Utility tests
├── .env                      # Environment variables (not in git)
├── package.json             # Dependencies và scripts
└── vitest.config.js         # Test configuration
```

## Chức năng các thành phần chính

### Controllers
Controllers xử lý HTTP requests và gọi services tương ứng:
- **auth.controller.js**: Đăng nhập, đăng xuất, refresh token, đổi mật khẩu
- **user.controller.js**: CRUD users, reset password, toggle lock/unlock
- **employee.controller.js**: CRUD nhân viên, tìm kiếm, phân trang
- **department.controller.js**: Quản lý phòng ban và cấu trúc tổ chức
- **position.controller.js**: Quản lý vị trí công việc/chức danh
- **contract.controller.js**: Quản lý hợp đồng lao động
- **shift.controller.js**: Quản lý ca làm việc (giờ vào/ra)
- **attendance.controller.js**: Check-in/out, xem lịch sử chấm công, thống kê
- **attendanceRequest.controller.js**: Tạo và duyệt yêu cầu điều chỉnh chấm công
- **payroll.controller.js**: Tính lương, xuất báo cáo lương

### Services
Services chứa business logic và tương tác với database:
- Validate dữ liệu đầu vào
- Thực hiện các nghiệp vụ phức tạp
- Gọi Prisma để truy vấn database
- Xử lý transactions khi cần

### Middlewares
- **auth.js**: 
  - `authenticateToken`: Xác thực JWT token
  - `authorizeRoles`: Kiểm tra quyền truy cập theo role (ADMIN, HR, STAFF)
- **errorHandler.js**: Xử lý và format lỗi trả về client

### Routes
Định nghĩa các API endpoints và ánh xạ đến controllers:
- Áp dụng middlewares (auth, validation)
- Phân quyền truy cập cho từng route
- Gom nhóm các endpoint liên quan

### Utils
- **ApiError.js**: Class tùy chỉnh cho lỗi API
- **errorCodes.js**: Constants cho các mã lỗi
- **response.js**: Helper để trả về response chuẩn hóa
- **sanitizeQuery.js**: Validate và parse query parameters (pagination, search)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Đổi mật khẩu

### Users
- `GET /api/users` - Danh sách users (có phân trang, search, filter)
- `POST /api/users` - Tạo user mới
- `POST /api/users/:id/reset-password` - Reset password
- `PATCH /api/users/:id/toggle-lock` - Khóa/mở khóa user
- `GET /api/users/me` - Thông tin user hiện tại
- `PUT /api/users/me` - Cập nhật thông tin cá nhân

### Employees
- `GET /api/employees` - Danh sách nhân viên
- `GET /api/employees/:id` - Chi tiết nhân viên
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/:id` - Cập nhật thông tin
- `DELETE /api/employees/:id` - Xóa nhân viên

### Departments
- `GET /api/departments` - Danh sách phòng ban
- `POST /api/departments` - Tạo phòng ban
- `PUT /api/departments/:id` - Cập nhật phòng ban
- `DELETE /api/departments/:id` - Xóa phòng ban

### Positions
- `GET /api/positions` - Danh sách vị trí
- `POST /api/positions` - Tạo vị trí mới
- `PUT /api/positions/:id` - Cập nhật vị trí
- `DELETE /api/positions/:id` - Xóa vị trí

### Contracts
- `GET /api/contracts` - Danh sách hợp đồng
- `GET /api/contracts/:id` - Chi tiết hợp đồng
- `POST /api/contracts` - Tạo hợp đồng mới
- `PUT /api/contracts/:id` - Cập nhật hợp đồng
- `DELETE /api/contracts/:id` - Xóa hợp đồng

### Shifts
- `GET /api/shifts` - Danh sách ca làm việc
- `POST /api/shifts` - Tạo ca mới
- `PUT /api/shifts/:id` - Cập nhật ca
- `DELETE /api/shifts/:id` - Xóa ca

### Attendance
- `POST /api/attendance/check-in` - Check-in
- `POST /api/attendance/check-out` - Check-out
- `GET /api/attendance/today` - Trạng thái chấm công hôm nay
- `GET /api/attendance/history` - Lịch sử chấm công
- `GET /api/attendance/stats` - Thống kê chấm công
- `PUT /api/attendance/:id` - Chỉnh sửa bản ghi (ADMIN/HR)

### Attendance Requests
- `GET /api/attendance-requests` - Danh sách yêu cầu
- `POST /api/attendance-requests` - Tạo yêu cầu điều chỉnh
- `PATCH /api/attendance-requests/:id/approve` - Duyệt yêu cầu
- `PATCH /api/attendance-requests/:id/reject` - Từ chối yêu cầu

### Payroll
- `GET /api/payroll` - Danh sách bảng lương
- `POST /api/payroll/calculate` - Tính lương cho kỳ
- `GET /api/payroll/:id` - Chi tiết bảng lương

## Tests

This project uses Vitest for unit tests and Supertest for simple integration tests.

### Install

Dependencies are already listed. If needed, install with:

```powershell
npm install
```

### Run

- Run all tests (once):

```powershell
npm test
```

- Watch mode:

```powershell
npm run test:watch
```

### Environment variables

Tests provide safe defaults via `tests/setup.js`:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `PORT`

Unit tests mock database (`prisma`), `bcrypt`, `jsonwebtoken`, and the token service—no real DB is used.

### Notes

- The Express app is exported from `src/app.js` so tests can import it without starting the server.
- The server bootstrap remains in `src/index.js`.
