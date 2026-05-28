import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import toast from 'react-hot-toast';

import { authAPI } from '@/features/auth/api/auth.api';
import { userAPI } from '@/features/users/api/user.api';
import { selectUser, updateUser } from '@/store/slices/userSlice';

export function useUserProfile() {
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
      const data = await userAPI.getCurrentUserProfile();
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
      await userAPI.updateCurrentUserProfile(editData);
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
      await authAPI.changePassword({
        newPassword: pwdForm.newPassword,
        ...(currentPwd && { currentPassword: currentPwd }),
      });
      setShowPassword(false);
      setPwdForm({ newPassword: '', confirmPassword: '', currentPassword: '' });
      dispatch(updateUser({ must_change_password: false }));
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  }, [dispatch, profile?.must_change_password, pwdForm]);

  const handlePasswordFormChange = useCallback((field, value) => {
    setPwdForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    if (field === 'current') setShowCurrentPassword((prev) => !prev);
    if (field === 'new') setShowNewPassword((prev) => !prev);
    if (field === 'confirm') setShowConfirmPassword((prev) => !prev);
  }, []);

  const getInitials = useCallback(() => (
    profile?.employee?.full_name
      ? profile.employee.full_name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
      : 'U'
  ), [profile]);

  return {
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
