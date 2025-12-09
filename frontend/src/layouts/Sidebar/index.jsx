import { NavLink } from "react-router-dom";
import Icon from "@components/ui/Icon";
import reactLogo from "@assets/react.svg";
import { sidebarMenuItems } from "@constants/menuItems";

function Sidebar({ isCollapsed }) {
  const menuItems = sidebarMenuItems;
  
  return (
    <aside
      className={`
        bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        flex flex-col
      `}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center gap-3">
          {/* React Icon from assets */}
          <img
            src={reactLogo}
            alt="React Logo"
            className="w-8 h-8"
          />

          {!isCollapsed && (
            <h1 className="text-xl font-heading font-bold text-secondary-900 dark:text-secondary-100">
              HRM
            </h1>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                      : "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 hover:text-secondary-900 dark:hover:text-secondary-200"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : ""}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
