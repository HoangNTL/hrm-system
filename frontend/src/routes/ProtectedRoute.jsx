import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthInitialized,
} from '@/store/slices/authSlice';
import { selectUser } from '@/store/slices/userSlice';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const initialized = useSelector(selectAuthInitialized);
  const currentUser = useSelector(selectUser);
  const location = useLocation();

  // Chỉ block khi đang có 1 request auth (login / logout / refresh) đang chạy
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Nếu đã init xong mà vẫn chưa login → đá về /login
  if (initialized && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Nếu có truyền allowedRoles thì kiểm tra quyền từ user trong Redux
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser?.role?.toUpperCase();

    // Nếu đã đăng nhập nhưng không có role phù hợp → chặn truy cập
    if (userRole && !allowedRoles.includes(userRole)) {
      // Nếu đã có route /access-denied thì điều hướng sang đó,
      // còn không thì đá về dashboard (hoặc trang chủ tuỳ bạn cấu hình router)
      return (
        <Navigate
          to="/access-denied"
          replace
          state={{ from: location, requiredRoles: allowedRoles }}
        />
      );
    }
  }

  // Nếu chưa initialized (F5 lần đầu), vẫn cho render children (MainLayout),
  // MainLayout sẽ tự gọi refreshAccessTokenAsync.
  return children;
}

export default ProtectedRoute;
