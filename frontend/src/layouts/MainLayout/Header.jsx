import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/Icon";

function Header({ isDarkMode, onToggleTheme, onToggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between px-6">
      {/* Left side - Collapse button and Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        {/* Collapse/Expand Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500">
              <Icon name="search" className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Theme toggle and User avatar */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors relative"
          aria-label="Notifications"
        >
          <Icon name="bell" className="w-6 h-6" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDarkMode ? (
            <Icon name="sun" className="w-6 h-6" />
          ) : (
            <Icon name="moon" className="w-6 h-6" />
          )}
        </button>

        {/* User Avatar & Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            aria-label="User menu"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                John Doe
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                Administrator
              </p>
            </div>
            <Icon
              name="chevron-down"
              className="w-4 h-4 text-secondary-600 dark:text-secondary-400 hidden md:block"
            />
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon name="circle-user-round" className="w-4 h-4" />
                  Profile
                </div>
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon name="settings" className="w-4 h-4" />
                  Settings
                </div>
              </a>
              <hr className="my-2 border-secondary-200 dark:border-secondary-700" />
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-error hover:bg-error/10 dark:hover:bg-error/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon name="log-out" className="w-4 h-4" />
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
