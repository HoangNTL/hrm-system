import { Button, Icon, Modal, SearchBar, Select } from '@/shared/components';

import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import { useUsers } from '../hooks/useUsers';

function UsersPage() {
  const {
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
  } = useUsers();

  return (
    <div className="space-y-6">
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
            {selectedUsers.length > 0 ? (() => {
              const lockedCount = selectedUsers.filter((user) => user.is_locked).length;
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
            })() : (
              <>
                <Icon name="lock" className="w-5 h-5 mr-2" />
                Lock
              </>
            )}
          </Button>

          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

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

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Add New User" size="md">
        <UserForm
          formData={formData}
          fieldErrors={fieldErrors}
          globalError={globalError}
          loading={saveLoading}
          onChange={handleFormChange}
          onSubmit={handleCreateUserSubmit}
          onCancel={handleModalClose}
          employees={employeesWithoutUser}
        />
      </Modal>
    </div>
  );
}

export default UsersPage;
