import { memo, useState, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Icon from '@components/ui/Icon';
import { logoutAsync } from '@/store/slices/authSlice';
import { selectUser } from '@/store/slices/userSlice';

function UserMenuComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    console.log('Logging out user...');
    try {
      await dispatch(logoutAsync()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const initials = useMemo(() => {
    if (!user?.full_name) return 'U';
    const names = user.full_name.split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  }, [user]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
            {user?.full_name || 'User'}
          </p>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            {user?.role || 'Employee'}
          </p>
        </div>
        <Icon
          name="chevron-down"
          className="w-4 h-4 text-secondary-600 dark:text-secondary-400 hidden md:block"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-50">
          <div className="py-2">
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
      )}
    </div>
  );
}

export default memo(UserMenuComponent);
