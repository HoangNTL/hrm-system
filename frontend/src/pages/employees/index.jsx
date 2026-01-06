import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import EmployeeTable from './EmployeeTable';
import EmployeeModal from './EmployeeModal';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import PasswordDisplayModal from './PasswordDisplayModal';
import { useEmployeesPage } from './useEmployeesPage';

function EmployeesPage() {
  const {
    // state
    employees,
    loading,
    search,
    filters,
    pagination,
    selectedEmployees,
    selectedEmployee,
    isModalOpen,
    isDeleteModalOpen,
    deleteLoading,
    isPasswordModalOpen,
    passwordModalData,
    departments,
    positions,
    loadingOptions,
    modalFormData,
    hasActiveFilters,

    // handlers
    handleSearch,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleRowSelect,
    handleSelectAll,
    handleEdit,
    handleAdd,
    handleModalClose,
    handleModalSuccess,
    handleFormDataChange,
    handleConfirmDelete,
    handleCancelDelete,
    handlePasswordModalClose,
  } = useEmployeesPage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Employees
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage your organization's employees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="inline-flex items-center"
            disabled={selectedEmployees.length !== 1}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search by name, email, phone, or Identity Number..."
              />
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {pagination.total} employee{pagination.total !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <Select
              label="Department"
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
              ]}
            />

            <Select
              label="Gender"
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />

            <Select
              label="Work Status"
              name="work_status"
              value={filters.work_status}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'working', label: 'Working' },
                { value: 'probation', label: 'Probation' },
                { value: 'leave', label: 'Leave' },
                { value: 'resigned', label: 'Resigned' },
              ]}
            />

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                fullWidth
              >
                <Icon name="x" className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedEmployees={selectedEmployees}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Add/Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        employeeToEdit={selectedEmployee}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
        departments={departments}
        positions={positions}
        loadingOptions={loadingOptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={
          selectedEmployees.length === 1
            ? `Are you sure you want to delete ${selectedEmployees[0].full_name}? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedEmployees.length} employees? This action cannot be undone.`
        }
        loading={deleteLoading}
      />

      {/* Password Display Modal */}
      <PasswordDisplayModal
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        employeeName={passwordModalData.employeeName}
        email={passwordModalData.email}
        password={passwordModalData.password}
      />
    </div>
  );
}

export default EmployeesPage;
