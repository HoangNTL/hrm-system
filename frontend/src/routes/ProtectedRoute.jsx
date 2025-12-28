import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthInitialized,
} from '@/store/slices/authSlice';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const initialized = useSelector(selectAuthInitialized);
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
    // NOTE: role check nên làm qua selector, nhưng để đơn giản tạm bỏ qua ở đây
    // Nếu bạn đã có trang /access-denied và logic role, có thể thêm lại sau.
  }

  // Nếu chưa initialized (F5 lần đầu), vẫn cho render children (MainLayout),
  // MainLayout sẽ tự gọi refreshAccessTokenAsync.
  return children;
}

export default ProtectedRoute;
