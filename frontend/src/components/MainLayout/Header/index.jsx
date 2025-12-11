import { memo, useCallback } from 'react';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import Notifications from './Notifications';
import Icon from '@components/ui/Icon';

function Header({ isDarkMode, onToggleTheme, onToggleSidebar }) {
  // useCallback to memoize the handlers
  const handleToggleSidebar = useCallback(() => {
    onToggleSidebar?.();
  }, [onToggleSidebar]);

  const handleToggleTheme = useCallback(() => {
    onToggleTheme?.();
  }, [onToggleTheme]);

  return (
    <header className="h-16 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between px-6">
      {/* Left side: Sidebar toggle + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={handleToggleSidebar}
          className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <SearchBar />
      </div>

      {/* Right side: Notifications + Theme toggle + User menu */}
      <div className="flex items-center gap-4">
        <Notifications />
        <ThemeToggle isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />
        <UserMenu />
      </div>
    </header>
  );
}

export default memo(Header);
