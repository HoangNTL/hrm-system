import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '@/store/slices/userSlice';
import { userService } from '@/services/userService';
import authService from '@/services/authService';
import toast from 'react-hot-toast';

/**
 * Hook quản lý toàn bộ state + logic cho trang MyProfile
 */
export function useMyProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getMe();
      const data = res?.data || res;
      console.log('Profile data:', data);
      setProfile(data);
      setEditData({
        full_name: data?.employee?.full_name || '',
        phone: data?.employee?.phone || '',
        address: data?.employee?.address || '',
        gender: data?.employee?.gender || '',
        dob: data?.employee?.dob ? new Date(data.employee.dob).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = useCallback(async () => {
    try {
      await userService.updateMe(editData);
      await loadProfile();
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  }, [editData, loadProfile]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    loadProfile();
  }, [loadProfile]);

  const handleEditDataChange = useCallback((field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleChangePassword = useCallback(async (e) => {
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
  }, [pwdForm, profile?.must_change_password, dispatch]);

  const handlePasswordFormChange = useCallback((field, value) => {
    setPwdForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    if (field === 'current') setShowCurrentPassword((prev) => !prev);
    if (field === 'new') setShowNewPassword((prev) => !prev);
    if (field === 'confirm') setShowConfirmPassword((prev) => !prev);
  }, []);

  const getInitials = useCallback(() => {
    return profile?.employee?.full_name
      ? profile.employee.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U';
  }, [profile]);

  return {
    // state
    user,
    profile,
    loading,
    activeTab,
    editing,
    editData,
    showPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    pwdForm,

    // handlers
    setActiveTab,
    setEditing,
    setShowPassword,
    handleSaveProfile,
    handleCancelEdit,
    handleEditDataChange,
    handleChangePassword,
    handlePasswordFormChange,
    togglePasswordVisibility,
    getInitials,
  };
}
