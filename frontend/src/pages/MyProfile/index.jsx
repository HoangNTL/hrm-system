import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '@components/ui/Icon';
import { selectUser, updateUser } from '@/store/slices/userSlice';
import { userService } from '@/services/userService';
import authService from '@/services/authService';
import toast from 'react-hot-toast';

export default function MyProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  });

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getMe();
      const data = res?.data || res;
      console.log('Profile data:', data); // Debug
      console.log('Employee data:', data?.employee); // Debug chi tiết
      console.log('Gender:', data?.employee?.gender); // Debug gender
      console.log('DOB:', data?.employee?.dob); // Debug dob
      setProfile(data);
      setEditData({
        full_name: data?.employee?.full_name || '',
        phone: data?.employee?.phone || '',
        address: data?.employee?.address || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateMe(editData);
      await loadProfile();
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (!pwdForm.newPassword || !pwdForm.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!profile?.must_change_password && !pwdForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    try {
      const currentPwd = profile?.must_change_password ? null : pwdForm.currentPassword;
      await authService.changePassword(pwdForm.newPassword, currentPwd);
      setShowPassword(false);
      setPwdForm({ newPassword: '', confirmPassword: '', currentPassword: '' });
      dispatch(updateUser({ must_change_password: false }));
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary-500">Loading profile...</p>
      </div>
    );
  }

  const initials = profile?.employee?.full_name
    ? profile.employee.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="flex gap-6">
      {/* Sidebar - Left Panel */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {initials}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 text-center">
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Full Name</p>
              <p className="font-semibold text-secondary-900 dark:text-secondary-50">
                {profile?.employee?.full_name || 'User'}
              </p>
            </div>

            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Gender</p>
              <p className="font-semibold text-secondary-900 dark:text-secondary-50 capitalize">
                {profile?.employee?.gender || '—'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
              {editing ? (
                <div className="space-y-2">
                  <button
                    onClick={handleSaveProfile}
                    className="w-full px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      loadProfile();
                    }}
                    className="w-full px-4 py-2 rounded border border-secondary-200 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Right Panel */}
      <div className="flex-1">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700">
          {/* Header with Title */}
          <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
              Employee Information
            </h1>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              {user?.role} • {profile?.employee?.department?.name || 'N/A'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-secondary-200 dark:border-secondary-700 px-6">
            {['personal', 'work', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 font-medium transition-colors border-b-2 capitalize ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
                }`}
              >
                {tab === 'personal' ? 'Personal Information' : tab === 'work' ? 'Work Information' : 'Security'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Personal Tab */}
            {activeTab === 'personal' && (
          <div className="space-y-1">
            {/* Full Name */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Full Name</div>
              <div className="col-span-2">
                {editing ? (
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
                  />
                ) : (
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                    {profile?.employee?.full_name || '—'}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Email</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.email || user?.email || '—'}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Phone</div>
              <div className="col-span-2">
                {editing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
                  />
                ) : (
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                    {profile?.employee?.phone || '—'}
                  </p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Gender</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50 capitalize">
                  {profile?.employee?.gender || '—'}
                </p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Date of Birth</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.dob
                    ? new Date(profile.employee.dob).toLocaleDateString('vi-VN')
                    : '—'}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-3 gap-4 py-3">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Address</div>
              <div className="col-span-2">
                {editing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-1.5 text-sm text-secondary-900 dark:text-secondary-50"
                    rows="2"
                  />
                ) : (
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                    {profile?.employee?.address || '—'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

            {/* Work Tab */}
            {activeTab === 'work' && (
          <div className="space-y-1">
            {/* Department */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Department</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.department?.name || '—'}
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Position</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.position?.name || '—'}
                </p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Hire Date</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                  {profile?.employee?.hire_date
                    ? new Date(profile.employee.hire_date).toLocaleDateString('vi-VN')
                    : '—'}
                </p>
              </div>
            </div>

            {/* Work Status */}
            <div className="grid grid-cols-3 gap-4 py-3">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Work Status</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50 capitalize">
                  {profile?.employee?.work_status || '—'}
                </p>
              </div>
            </div>
          </div>
        )}

            {/* Security Tab */}
            {activeTab === 'security' && (
          <div className="space-y-1">
            {/* Password */}
            <div className="grid grid-cols-3 gap-4 py-3">
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Password</div>
              <div className="col-span-2 flex items-center justify-between">
                <p className="text-sm font-medium text-secondary-900 dark:text-secondary-50">
                  {profile?.must_change_password ? '⚠ Change required' : 'Strong password'}
                </p>
                <button
                  onClick={() => setShowPassword(true)}
                  className="px-4 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
                Change Password
              </h3>
              <button
                onClick={() => setShowPassword(false)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                ✕
              </button>
            </div>

            {profile?.must_change_password && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded text-sm text-amber-800 dark:text-amber-100">
                You are using a temporary password. Please set a new password.
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {!profile?.must_change_password && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 text-sm"
                    placeholder="Enter current password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPassword(false)}
                  className="px-4 py-2 rounded border border-secondary-200 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
