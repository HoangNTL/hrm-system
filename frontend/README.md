# HRM System Frontend

Giao diện người dùng cho hệ thống quản lý nhân sự (HRM) được xây dựng với React, Redux Toolkit, và TailwindCSS.

## Công nghệ sử dụng

- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router v7** - Routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Vite** - Build tool & dev server
- **Vitest** - Unit testing
- **date-fns** - Date manipulation
- **react-hot-toast** - Notifications

## Cấu trúc dự án

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                  # API client modules
│   │   ├── axios.js         # Axios instance với interceptors
│   │   ├── attendanceAPI.js # API calls cho chấm công
│   │   ├── authAPI.js       # API calls cho authentication
│   │   ├── contractAPI.js   # API calls cho hợp đồng
│   │   ├── departmentAPI.js # API calls cho phòng ban
│   │   ├── employeeAPI.js   # API calls cho nhân viên
│   │   ├── payrollAPI.js    # API calls cho bảng lương
│   │   ├── positionAPI.js   # API calls cho vị trí
│   │   ├── shiftAPI.js      # API calls cho ca làm việc
│   │   └── userAPI.js       # API calls cho users
│   │
│   ├── assets/              # Images, icons, fonts
│   │   └── icons/          # SVG icons
│   │
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components (Button, Input, Modal, Table, etc.)
│   │   ├── MainLayout/     # Layout components (Header, Sidebar, Footer)
│   │   └── EditAttendanceModal.jsx
│   │
│   ├── constants/           # Constants và configuration
│   │   └── menuItems.js    # Sidebar menu structure
│   │
│   ├── context/             # React Context
│   │   └── AuthContext.jsx # Authentication context (legacy)
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useDarkMode.js  # Dark mode toggle
│   │   └── useTableSelection.js # Table row selection logic
│   │
│   ├── pages/               # Page components
│   │   ├── attendance/     # Trang chấm công (staff + admin)
│   │   ├── dashboard/      # Dashboard (AdminDashboard, StaffDashboard)
│   │   ├── departments/    # Quản lý phòng ban
│   │   ├── Employees/      # Quản lý nhân viên
│   │   ├── Login/          # Trang đăng nhập
│   │   ├── positions/      # Quản lý vị trí công việc
│   │   ├── Users/          # Quản lý users
│   │   └── userProfile/    # Trang profile cá nhân
│   │
│   ├── routes/              # Routing configuration
│   │   ├── AppRoutes.jsx   # Main routes definition
│   │   └── ProtectedRoute.jsx # Route protection wrapper
│   │
│   ├── services/            # Business logic layer
│   │   ├── attendanceService.js
│   │   ├── authService.js
│   │   ├── contractService.js
│   │   ├── departmentService.js
│   │   ├── employeeService.js
│   │   ├── payrollService.js
│   │   ├── positionService.js
│   │   ├── shiftService.js
│   │   └── userService.js
│   │
│   ├── store/               # Redux store
│   │   ├── index.js        # Store configuration
│   │   └── slices/         # Redux slices
│   │       ├── authSlice.js    # Authentication state
│   │       └── userSlice.js    # User profile state
│   │
│   ├── utils/               # Utility functions
│   │   ├── dateUtils.js    # Date formatting helpers
│   │   └── tokenUtils.js   # Token management
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles + Tailwind imports
│
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment variables template
├── index.html               # HTML template
├── package.json             # Dependencies và scripts
├── tailwind.config.js       # TailwindCSS configuration
├── vite.config.js           # Vite configuration
└── vitest.config.mts        # Vitest test configuration
```

## Kiến trúc ứng dụng

### 1. API Layer (`/api`)
- **axios.js**: Cấu hình Axios instance với:
  - Base URL từ environment variables
  - Interceptors để tự động thêm JWT token
  - Interceptors để handle refresh token khi expired
  - Error handling và formatting

- **API modules**: Mỗi module tương ứng với một resource:
  - Export các functions để gọi API endpoints
  - Sử dụng axios instance đã được cấu hình
  - Trả về Promise với response data

### 2. Services Layer (`/services`)
Services là layer trung gian giữa components và API:
- Xử lý business logic trước khi gọi API
- Transform data từ API về format phù hợp cho UI
- Handle pagination, filtering, sorting
- Cung cấp interface đơn giản cho components

### 3. Components

#### UI Components (`/components/ui`)
Các reusable components được styled với TailwindCSS:
- **Button**: Primary, secondary, outline, danger variants
- **Input**: Text, password, email với error states
- **Select**: Dropdown với options
- **Modal**: Dialog component với backdrop
- **Table**: Data table với pagination, sorting, selection
- **SearchBar**: Search input với debounce
- **Icon**: SVG icon wrapper
- **Badge**: Status badges
- **Tooltip**: Hover tooltips

#### Layout Components (`/components/MainLayout`)
- **Header**: Top navigation với user menu, dark mode toggle
- **Sidebar**: Navigation menu với role-based visibility
- **Footer**: Application footer

### 4. Pages (`/pages`)
Mỗi page được tổ chức theo pattern:
```
pages/
  ├── ComponentName/
  │   ├── index.jsx              # Main page component
  │   ├── useComponentPage.js    # Custom hook chứa logic
  │   ├── ComponentTable.jsx     # Table component
  │   ├── ComponentForm.jsx      # Form component
  │   ├── ComponentModal.jsx     # Modal component
  │   └── __tests__/            # Unit tests
```

**Ví dụ - Employees Page**:
- `index.jsx`: Component chính, render UI
- `useEmployeesPage.js`: Hook quản lý state, handlers, API calls
- `EmployeeTable.jsx`: Hiển thị danh sách nhân viên
- `EmployeeForm.jsx`: Form tạo/sửa nhân viên
- `EmployeeModal.jsx`: Modal wrapper cho form

### 5. State Management

#### Redux Store (`/store`)
- **authSlice**: Quản lý authentication state
  - `user`: Thông tin user đăng nhập
  - `accessToken`: JWT access token
  - `isAuthenticated`: Trạng thái đăng nhập
  - Actions: `login`, `logout`, `refreshToken`

- **userSlice**: Quản lý user profile
  - `profile`: Thông tin chi tiết user
  - Actions: `updateUser`, `loadProfile`

#### Local Component State
- Sử dụng `useState` cho UI state (modals, forms)
- Custom hooks để tái sử dụng logic giữa các components

### 6. Routing (`/routes`)

**AppRoutes.jsx**:
- Định nghĩa tất cả routes của ứng dụng
- Public routes: `/login`
- Protected routes: Tất cả routes khác

**ProtectedRoute.jsx**:
- Wrapper component kiểm tra authentication
- Redirect về `/login` nếu chưa đăng nhập
- Kiểm tra role-based access (ADMIN, HR, STAFF)

### 7. Custom Hooks (`/hooks`)

- **useAuth**: Quản lý authentication logic
  - Login/logout
  - Token refresh
  - Auto-redirect khi token expired

- **useDarkMode**: Toggle dark/light theme
  - Lưu preference vào localStorage
  - Apply theme class vào `<html>`

- **useTableSelection**: Row selection logic cho tables
  - Select/deselect rows
  - Select all
  - Get selected items

## Phân quyền (Role-based Access)

### ADMIN
- Truy cập tất cả chức năng
- Quản lý users, employees, departments, positions
- Xem và chỉnh sửa chấm công của mọi người
- Duyệt yêu cầu điều chỉnh chấm công
- Quản lý bảng lương

### HR (Manager)
- Quản lý employees, departments, positions, contracts
- Quản lý ca làm việc (shifts)
- Xem và chỉnh sửa chấm công
- Duyệt yêu cầu điều chỉnh
- Xem bảng lương

### STAFF
- Xem thông tin cá nhân
- Check-in/check-out
- Xem lịch sử chấm công của bản thân
- Gửi yêu cầu điều chỉnh chấm công
- Xem bảng lương cá nhân

## Features chính

### 1. Authentication
- Đăng nhập với email/password
- JWT-based authentication (access + refresh tokens)
- Auto refresh token khi expired
- Đổi mật khẩu
- Bắt buộc đổi mật khẩu lần đầu (temporary password)

### 2. Dashboard
- **Admin/HR Dashboard**:
  - Thống kê tổng quan (tổng nhân viên, đi làm, nghỉ, trễ)
  - Biểu đồ chấm công theo ngày
  - Danh sách nhân viên đi trễ
  - Thông tin ca làm việc

- **Staff Dashboard**:
  - Check-in/check-out nhanh
  - Trạng thái chấm công hôm nay
  - Thống kê chấm công cá nhân
  - Lịch sử gần đây

### 3. Employee Management
- CRUD nhân viên
- Tìm kiếm và filter
- Phân trang
- Upload avatar
- Liên kết với user account
- Quản lý thông tin: phòng ban, vị trí, hợp đồng

### 4. Attendance System
- Check-in/check-out với validation
- Chọn ca làm việc
- Tự động tính trễ/sớm dựa vào shift
- Lịch sử chấm công với filter theo ngày
- Admin/HR có thể chỉnh sửa bản ghi
- Gửi yêu cầu điều chỉnh nếu quên check-in/out

### 5. User Management
- Tạo user từ employee
- Email tự động lấy từ employee
- Reset password (tạo password tạm thời)
- Lock/unlock account
- Phân quyền: ADMIN, HR, STAFF

### 6. Department & Position Management
- CRUD phòng ban và vị trí
- Gán HR manager cho phòng ban
- Phân trang và tìm kiếm

### 7. Profile Management
- Xem và sửa thông tin cá nhân
- Đổi mật khẩu
- Xem thông tin công việc

## Styling

### TailwindCSS
- Utility-first CSS framework
- Custom theme configuration trong `tailwind.config.js`
- Dark mode support với class strategy

### Theme Colors
- **Primary**: Blue shades (primary-50 → primary-950)
- **Secondary**: Gray shades cho text và borders
- **Error**: Red cho errors
- **Success**: Green cho success states
- **Warning**: Yellow/Amber cho warnings

### Dark Mode
- Toggle trong Header
- Sử dụng `dark:` prefix cho dark mode styles
- State lưu trong localStorage

## Development

### Install Dependencies
```powershell
npm install
```

### Development Server
```powershell
npm run dev
```
Server chạy tại `http://localhost:5173`

### Build for Production
```powershell
npm run build
```
Output trong thư mục `dist/`

### Preview Production Build
```powershell
npm run preview
```

### Run Tests
```powershell
npm test
```

### Linting
```powershell
npm run lint          # Check linting
npm run lint:fix      # Auto-fix linting issues
```

### Format Code
```powershell
npm run format
```

## Environment Variables

Tạo file `.env` từ `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Lưu ý**: Vite yêu cầu prefix `VITE_` cho environment variables.

## API Integration

### Axios Configuration
- Base URL: `VITE_API_BASE_URL` từ .env
- Request interceptor: Tự động thêm `Authorization: Bearer <token>`
- Response interceptor: 
  - Auto refresh token khi nhận 401
  - Format error messages
  - Handle network errors

### Error Handling
- Global error handler trong axios interceptors
- Toast notifications cho errors
- Retry logic cho refresh token

## Testing

### Unit Tests với Vitest
- Test components với @testing-library/react
- Mock API calls
- Test custom hooks
- Test utility functions

### Test Structure
```
__tests__/
  ├── ComponentName.test.jsx
  └── useComponentName.test.js
```

## Best Practices

1. **Component Organization**:
   - Tách UI và logic (custom hooks)
   - Reusable components trong `/components/ui`
   - Page-specific components trong page folder

2. **State Management**:
   - Redux cho global state (auth, user)
   - Local state cho UI state
   - Custom hooks cho shared logic

3. **API Calls**:
   - Luôn qua services layer
   - Handle loading và error states
   - Show user feedback (toast)

4. **Styling**:
   - Sử dụng TailwindCSS utilities
   - Consistent spacing và colors
   - Responsive design (mobile-first)

5. **Code Quality**:
   - ESLint để enforce code standards
   - Prettier để format code
   - Vitest để test components và logic

## Roadmap

- [ ] Thêm module quản lý nghỉ phép (Leave Management)
- [ ] Báo cáo và xuất Excel
- [ ] Notifications real-time (WebSocket)
- [ ] Multi-language support (i18n)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] PWA support (offline mode)
- [ ] Mobile app với React Native

## Troubleshooting

### CORS Issues
- Đảm bảo backend đã config CORS cho frontend URL
- Check `FRONTEND_URL` trong backend `.env`

### Token Expired Loop
- Clear localStorage và đăng nhập lại
- Check refresh token logic trong axios interceptors

### Build Errors
- Clear node_modules và reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

MIT
