import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Sidebar from './SideBar';
import Header from './Header/index';
import { useTheme } from '@hooks/useTheme';
import { selectSidebarCollapsed, toggleSidebar } from '@/store/slices/uiSlice';
import { useEffect } from 'react';
import {
  refreshAccessTokenAsync,
  selectAuthInitialized,
} from '@/store/slices/authSlice';

function MainLayout() {
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector(selectSidebarCollapsed);
  const { isDarkMode, toggleTheme } = useTheme();
  const initialized = useSelector(selectAuthInitialized);

  useEffect(() => {
    // On first mount of protected layout, if auth not initialized, try refresh
    if (!initialized) {
      dispatch(refreshAccessTokenAsync());
    }
  }, [dispatch, initialized]);

  const handleToggleSidebar = () => dispatch(toggleSidebar());

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
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
