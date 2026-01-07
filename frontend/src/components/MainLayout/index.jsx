import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Sidebar from './SideBar';
import Header from './Header/index';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import { useTheme } from '@hooks/useTheme';
import { selectSidebarCollapsed, toggleSidebar } from '@/store/slices/uiSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessTokenAsync, selectAuthInitialized, selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';

function MainLayout() {
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector(selectSidebarCollapsed);
  const { isDarkMode, toggleTheme } = useTheme();
  const initialized = useSelector(selectAuthInitialized);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        dispatch(refreshAccessTokenAsync());
      } else {
        // Không có accessToken, chuyển hướng về login
        navigate('/login', { replace: true });
      }
    }
  }, [dispatch, initialized, navigate]);

  const handleToggleSidebar = () => dispatch(toggleSidebar());

  // Chỉ render layout khi đã xác thực và đã khởi tạo xong
  if (!initialized || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }
  if (!isAuthenticated) {
    // Không render layout nếu chưa đăng nhập
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900">
        {/* Sidebar */}
        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onToggleSidebar={handleToggleSidebar}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6" role="main">
            <PageErrorBoundary>
              <Outlet />
            </PageErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
