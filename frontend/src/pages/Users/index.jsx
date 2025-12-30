import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';

import UserTable from './UserTable';
import UserModal from './UserModal';
import UserQuickViewModal from './UserQuickViewModal';
import { useUsersPage } from './useUsersPage';

function UsersPage() {
  const {
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
  } = useUsersPage();

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
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        userToEdit={null}
        employees={employeesWithoutUser}
      />

      <UserQuickViewModal
        isOpen={isQuickViewOpen}
        onClose={handleQuickViewClose}
        user={quickViewUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}

export default UsersPage;
