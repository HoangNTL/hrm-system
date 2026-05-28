import { useCallback, useEffect, useMemo, useState } from 'react';

import toast from 'react-hot-toast';

import { employeeAPI } from '@/features/employees/api/employee.api';
import { useTableSelection } from '@/hooks/useTableSelection';
import { userAPI } from '../api/user.api';

const initialFormState = {
  role: 'STAFF',
  employee_id: '',
};

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [employeesWithoutUser, setEmployeesWithoutUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [toggleLockLoading, setToggleLockLoading] = useState(false);

  const hasActiveFilters = useMemo(
    () => !!search.trim() || !!roleFilter,
    [search, roleFilter],
  );

  const fetchEmployeesWithoutUser = useCallback(async () => {
    try {
      const response = await employeeAPI.getEmployeesForSelectWithoutUser();
      setEmployeesWithoutUser(response.data?.items || response.items || []);
    } catch (error) {
      console.error('Error fetching employees without user', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userAPI.listUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
        role: roleFilter,
      });
      setUsers(result.data);
      setPagination((previous) => ({
        ...previous,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, search]);

  useEffect(() => {
    fetchEmployeesWithoutUser();
    fetchUsers();
  }, [fetchEmployeesWithoutUser, fetchUsers]);

  const {
    selectedItems: selectedUsers,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(users, (user) => user.id);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const handleRoleFilterChange = useCallback((event) => {
    setRoleFilter(event.target.value);
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('');
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((previous) => ({ ...previous, page: newPage }));
  }, []);

  const resetModalState = useCallback(() => {
    setFormData(initialFormState);
    setFieldErrors({});
    setGlobalError('');
  }, []);

  const handleAdd = useCallback(() => {
    resetModalState();
    setIsModalOpen(true);
  }, [resetModalState]);

  const handleModalClose = useCallback(() => {
    resetModalState();
    setIsModalOpen(false);
  }, [resetModalState]);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => (previous[name] ? { ...previous, [name]: '' } : previous));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    if (!formData.employee_id) {
      errors.employee_id = 'Please select an employee';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleCreateUserSubmit = useCallback(async (event) => {
    event.preventDefault();
    setGlobalError('');

    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    try {
      const selectedEmployee = employeesWithoutUser.find(
        (employee) => String(employee.id) === String(formData.employee_id),
      );

      if (!selectedEmployee?.email) {
        throw new Error('Selected employee has no email.');
      }

      await userAPI.createUser({
        email: selectedEmployee.email,
        role: formData.role,
        employee_id: Number(formData.employee_id),
      });

      toast.success('User created successfully');
      handleModalClose();
      clearSelection();
      fetchUsers();
      fetchEmployeesWithoutUser();
    } catch (error) {
      const message = error?.message || 'Failed to create user';
      setGlobalError(message);
      if (error?.errors) {
        setFieldErrors(error.errors);
      }
    } finally {
      setSaveLoading(false);
    }
  }, [
    clearSelection,
    employeesWithoutUser,
    fetchEmployeesWithoutUser,
    fetchUsers,
    formData,
    handleModalClose,
    validateForm,
  ]);

  const handleResetPassword = useCallback(async () => {
    if (selectedUsers.length !== 1) {
      toast.error('Please select exactly one user to reset password');
      return;
    }

    const user = selectedUsers[0];
    setResetPasswordLoading(true);

    try {
      const result = await userAPI.resetPassword(user.id);
      const payload = result.data || {};

      toast.success(`Password reset for ${user.email}`);

      if (payload.password) {
        toast.success(`New password: ${payload.password}\n(Copied to clipboard)`, {
          duration: 10000,
        });

        try {
          await navigator.clipboard.writeText(payload.password);
        } catch {
          // The password is already visible in the toast.
        }
      }

      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  }, [fetchUsers, selectedUsers]);

  const handleToggleLock = useCallback(async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setToggleLockLoading(true);
    try {
      const lockedCount = selectedUsers.filter((user) => user.is_locked).length;
      const shouldUnlock = lockedCount > selectedUsers.length / 2;
      const usersToToggle = selectedUsers.filter((user) => (
        (shouldUnlock && user.is_locked) || (!shouldUnlock && !user.is_locked)
      ));

      await Promise.all(usersToToggle.map((user) => userAPI.toggleLock(user.id)));

      const action = shouldUnlock ? 'unlocked' : 'locked';
      toast.success(`${selectedUsers.length} user(s) ${action} successfully`);
      clearSelection();
      fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to toggle lock status');
    } finally {
      setToggleLockLoading(false);
    }
  }, [clearSelection, fetchUsers, selectedUsers]);

  const handleRowDoubleClick = useCallback(() => {}, []);

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'HR', label: 'HR' },
    { value: 'STAFF', label: 'Staff' },
  ];

  return {
    users,
    employeesWithoutUser,
    loading,
    search,
    roleFilter,
    pagination,
    selectedUsers,
    isModalOpen,
    formData,
    fieldErrors,
    globalError,
    saveLoading,
    resetPasswordLoading,
    toggleLockLoading,
    hasActiveFilters,
    roleOptions,
    handleSearch,
    handleRoleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleRowSelect,
    handleSelectAll,
    handleRowDoubleClick,
    handleAdd,
    handleModalClose,
    handleFormChange,
    handleCreateUserSubmit,
    handleResetPassword,
    handleToggleLock,
  };
}
