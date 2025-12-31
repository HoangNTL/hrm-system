import { memo, useState, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Icon from '@components/ui/Icon';
import { logoutAsync } from '@/store/slices/authSlice';
import { selectUser, updateUser } from '@/store/slices/userSlice';
import { userService } from '@/services/userService';
import authService from '@/services/authService';

function UserMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

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
    const fullName = user?.employee?.full_name || user?.full_name || 'U';
    if (!fullName) return 'U';
    const names = fullName.split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  }, [user?.employee?.full_name, user?.full_name]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await userService.getMe();
      setProfile(res?.data || res);
      if (res?.employee) {
        dispatch(updateUser({ employee: res.employee }));
      }
    } catch (error) {
      setMessage(error.message || 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenPassword = async () => {
    setMessage('');
    setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setLoadingProfile(true);
    try {
      await loadProfile(); // Load profile data first
    } finally {
      setLoadingProfile(false);
    }
    setShowPassword(true);
  };

  const handleSavePassword = async (e) => {
    e?.preventDefault();
    setMessage('');

    const requiresCurrentPwd = !profile?.must_change_password;

    // Validation
    if (requiresCurrentPwd && !pwdForm.currentPassword) {
      setMessage('Current password is required');
      return;
    }
    if (!pwdForm.newPassword) {
      setMessage('New password is required');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      setPwdLoading(true);
      const currentPwd = requiresCurrentPwd ? pwdForm.currentPassword : null;
      await authService.changePassword(pwdForm.newPassword, currentPwd);
      setMessage('✓ Password updated successfully');
      setTimeout(() => {
        setShowPassword(false);
        dispatch(updateUser({ must_change_password: false }));
      }, 1000);
    } catch (error) {
      setMessage(error.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

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
            {user?.employee?.full_name || user?.full_name || 'User'}
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
              onClick={() => {
                navigate('/my-profile');
                setOpen(false);
              }}
              className="w-full text-left block px-4 py-2 text-sm text-secondary-800 dark:text-secondary-50 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="user" className="w-4 h-4" />
                Personal info
              </div>
            </button>
            <button
              onClick={() => {
                handleOpenPassword();
                setOpen(false);
              }}
              className="w-full text-left block px-4 py-2 text-sm text-secondary-800 dark:text-secondary-50 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon name="lock" className="w-4 h-4" />
                Change password
              </div>
            </button>
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

      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">Change password</h3>
              <button onClick={() => setShowPassword(false)} className="text-secondary-500 hover:text-secondary-800">✕</button>
            </div>

            {profile?.must_change_password && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded text-sm text-amber-800 dark:text-amber-100">
                You are using a temporary password. Please set a new password.
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSavePassword}>
              {!profile?.must_change_password && (
                <div className="space-y-1">
                  <label className="text-sm text-secondary-600 dark:text-secondary-300">Current password *</label>
                  <input
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className="w-full rounded border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-3 py-2 text-sm"
                    placeholder="Enter current password"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-secondary-600 dark:text-secondary-300">New password *</label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full rounded border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-3 py-2 text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-secondary-600 dark:text-secondary-300">Confirm new password *</label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full rounded border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-3 py-2 text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              {message && (
                <p className={`text-xs ${message.includes('✓') ? 'text-green-600' : 'text-error'}`}>
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(false)}
                  className="px-3 py-1.5 rounded border border-secondary-200 text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-3 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(UserMenu);
