import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import toast from 'react-hot-toast';

import UserTable from './UserTable';
import UserModal from './UserModal';
import UserQuickViewModal from './UserQuickViewModal';
import { userService } from '@services/userService';
import { employeeAPI } from '@api/employeeAPI';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [employeesWithoutUser, setEmployeesWithoutUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewUser, setQuickViewUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [toggleLockLoading, setToggleLockLoading] = useState(false);

  const hasActiveFilters = useMemo(
    () => !!search.trim() || !!roleFilter || !!statusFilter,
    [search, roleFilter, statusFilter]
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

  const handleRowSelect = useCallback((user) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.some((u) => u.id === user.id);
      if (isAlreadySelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedUsers(users);
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

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
  setSelectedUsers([]);
  setIsDeleteModalOpen(false);
  fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete users');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedUsers, fetchUsers]);

  const handleResetPassword = useCallback(async () => {
    if (selectedUsers.length !== 1) {
      toast.error('Please select exactly one user to reset password');
      return;
    }

    const user = selectedUsers[0];
    setResetPasswordLoading(true);
    try {
      console.log('Starting reset password for user:', user.id);
      const result = await userService.resetPassword(user.id);
      console.log('Reset password result:', result);
      console.log('Has password?', !!result.password);

      toast.success(`Password reset for ${user.email}`);

      if (result && result.password) {
        console.log('Showing password toast with password:', result.password);
        const password = result.password;

        toast((t) => (
          <div className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                New Password
              </p>
              <p className="text-sm font-mono bg-secondary-100 dark:bg-secondary-700 px-3 py-2 rounded text-secondary-900 dark:text-secondary-100">
                {password}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(password);
                toast.dismiss(t.id);
                toast.success('Copied!', { duration: 2000 });
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        ), { duration: 10000 });
      } else {
        console.log('No password in result, result object:', result);
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
      // Count locked users to determine collective action
      const lockedCount = selectedUsers.filter(u => u.is_locked).length;
      const shouldUnlock = lockedCount > selectedUsers.length / 2; // If majority locked, unlock all

      // Toggle each selected user
      for (const user of selectedUsers) {
        // Only toggle if state needs to change
        if ((shouldUnlock && user.is_locked) || (!shouldUnlock && !user.is_locked)) {
          await userService.toggleLock(user.id);
        }
      }

      const action = shouldUnlock ? 'unlocked' : 'locked';
      toast.success(`${selectedUsers.length} user(s) ${action} successfully`);
  setSelectedUsers([]);
  fetchUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to toggle lock status');
    } finally {
      setToggleLockLoading(false);
    }
  }, [selectedUsers, fetchUsers]);

  const handleModalSuccess = useCallback(() => {
    fetchUsers();
    fetchEmployeesWithoutUser();
    setSelectedUsers([]);
  }, [fetchUsers, fetchEmployeesWithoutUser]);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Users
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage user accounts, roles, and security settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleResetPassword}
            variant="outline"
            disabled={selectedUsers.length !== 1 || resetPasswordLoading}
            className="inline-flex items-center"
          >
            <Icon name="key" className="w-5 h-5 mr-2" />
            {resetPasswordLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button
            onClick={handleToggleLock}
            variant="outline"
            disabled={selectedUsers.length === 0 || toggleLockLoading}
            className="inline-flex items-center"
          >
            {selectedUsers.length > 0 && (() => {
              const lockedCount = selectedUsers.filter(u => u.is_locked).length;
              const shouldUnlock = lockedCount > selectedUsers.length / 2;
              return (
                <>
                  <Icon
                    name={shouldUnlock ? 'unlock' : 'lock'}
                    className="w-5 h-5 mr-2"
                  />
                  {toggleLockLoading ? 'Processing...' : (
                    shouldUnlock
                      ? `Unlock${selectedUsers.length > 1 ? ' All' : ''}`
                      : `Lock${selectedUsers.length > 1 ? ' All' : ''}`
                  )}
                </>
              );
            })()}
            {selectedUsers.length === 0 && (
              <>
                <Icon name="lock" className="w-5 h-5 mr-2" />
                Lock
              </>
            )}
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={selectedUsers.length === 0}
            className="inline-flex items-center"
          >
            <Icon name="trash" className="w-5 h-5 mr-2" />
            Delete
          </Button>
          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search by email..."
            />
          </div>
          <div className="w-full md:w-40">
            <Select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              options={roleOptions}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={statusOptions}
            />
          </div>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            disabled={!hasActiveFilters}
            className="inline-flex items-center whitespace-nowrap"
          >
            <Icon name="x" className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 whitespace-nowrap">
            {pagination.total} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedUsers={selectedUsers}
        onRowSelect={handleRowSelect}
        onRowDoubleClick={handleRowDoubleClick}
        onSelectAll={handleSelectAll}
      />

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-12">
          <div className="text-center">
            <Icon name="circle-user-round" className="w-16 h-16 mx-auto text-secondary-400 dark:text-secondary-600 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No Users
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start by adding a new user'}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        userToEdit={null}
        employees={employeesWithoutUser}
      />

      <UserQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        user={quickViewUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}

export default UsersPage;
