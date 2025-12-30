import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import toast from 'react-hot-toast';
import { userService } from '@services/userService';
import { employeeAPI } from '@api/employeeAPI';
import { useTableSelection } from '@hooks/useTableSelection';

/**
 * Hook quản lý toàn bộ state + logic cho trang Users
 */
export function useUsersPage() {
  const [users, setUsers] = useState([]);
  const [employeesWithoutUser, setEmployeesWithoutUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewUser, setQuickViewUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [toggleLockLoading, setToggleLockLoading] = useState(false);

  const hasActiveFilters = useMemo(
    () => !!search.trim() || !!roleFilter || !!statusFilter,
    [search, roleFilter, statusFilter],
  );

  const fetchEmployeesWithoutUser = useCallback(async () => {
    try {
      const resp = await employeeAPI.getEmployeesForSelectWithoutUser();
      setEmployeesWithoutUser(resp.data?.items || resp.items || []);
    } catch (error) {
      console.error('Error fetching employees without user', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchEmployeesWithoutUser();
    fetchUsers();
  }, [fetchEmployeesWithoutUser, fetchUsers]);

  // --- Filters & search ---
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRoleFilterChange = useCallback((e) => {
    setRoleFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // --- Selection dùng hook dùng chung ---
  const {
    selectedItems: selectedUsers,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(users, (u) => u.id);

  const handleRowDoubleClick = useCallback((user) => {
    setQuickViewUser(user);
    setIsQuickViewOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedUsers.length > 0) setIsDeleteModalOpen(true);
  }, [selectedUsers]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedUsers.length === 0) return;
    setDeleteLoading(true);
    try {
      const ids = selectedUsers.map((u) => u.id);
      await userService.bulkDelete(ids);
      toast.success(`${selectedUsers.length} user(s) deleted successfully`);
      clearSelection();
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete users');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedUsers, fetchUsers, clearSelection]);

  const handleResetPassword = useCallback(async () => {
    if (selectedUsers.length !== 1) {
      toast.error('Please select exactly one user to reset password');
      return;
    }

    const user = selectedUsers[0];
    setResetPasswordLoading(true);
    try {
      const result = await userService.resetPassword(user.id);

      toast.success(`Password reset for ${user.email}`);

      if (result && result.password) {
        const password = result.password;

          // Use a simple toast to avoid JSX in .js file causing Vite import-analysis issues
          toast.success(`New password: ${password}\n(Copied to clipboard)`, {
            duration: 10000,
          });

          try {
            await navigator.clipboard.writeText(password);
          } catch {
            // If unable to copy, the user still sees the password in the toast
          }
      }

      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  }, [selectedUsers, fetchUsers]);

  const handleToggleLock = useCallback(async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setToggleLockLoading(true);
    try {
      const lockedCount = selectedUsers.filter((u) => u.is_locked).length;
      const shouldUnlock = lockedCount > selectedUsers.length / 2;

      for (const user of selectedUsers) {
        if ((shouldUnlock && user.is_locked) || (!shouldUnlock && !user.is_locked)) {
          await userService.toggleLock(user.id);
        }
      }

      const action = shouldUnlock ? 'unlocked' : 'locked';
      toast.success(`${selectedUsers.length} user(s) ${action} successfully`);
      clearSelection();
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to toggle lock status');
    } finally {
      setToggleLockLoading(false);
    }
  }, [selectedUsers, fetchUsers, clearSelection]);

  const handleModalSuccess = useCallback(() => {
    fetchUsers();
    fetchEmployeesWithoutUser();
    clearSelection();
  }, [fetchUsers, fetchEmployeesWithoutUser, clearSelection]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleQuickViewClose = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewUser(null);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'HR', label: 'HR' },
    { value: 'STAFF', label: 'Staff' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'locked', label: 'Locked' },
    { value: 'never_logged_in', label: 'Never Logged In' },
  ];

  return {
    // state
    users,
    employeesWithoutUser,
    loading,
    search,
    roleFilter,
    statusFilter,
    pagination,
    selectedUsers,
    isModalOpen,
    isQuickViewOpen,
    quickViewUser,
    isDeleteModalOpen,
    deleteLoading,
    resetPasswordLoading,
    toggleLockLoading,
    hasActiveFilters,
    roleOptions,
    statusOptions,

    // handlers
    handleSearch,
    handleRoleFilterChange,
    handleStatusFilterChange,
    handleClearFilters,
    handlePageChange,
    handleRowSelect,
    handleSelectAll,
    handleRowDoubleClick,
    handleAdd,
    handleDelete,
    handleConfirmDelete,
    handleResetPassword,
    handleToggleLock,
    handleModalSuccess,
    handleModalClose,
    handleQuickViewClose,
    handleDeleteModalClose,
  };
}
