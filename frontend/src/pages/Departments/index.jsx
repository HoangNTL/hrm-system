import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import DepartmentTable from './DepartmentTable';
import DepartmentModal from './DepartmentModal';
import SearchBar from '@components/ui/SearchBar';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { useDepartmentsPage } from './useDepartmentsPage';

function DepartmentsPage() {
  const {
    departments,
    loading,
    search,
    pagination,
    isModalOpen,
    selectedDepartments,
    isDeleteModalOpen,
    deleteLoading,
    modalFormData,
    selectedDepartment,
    handleSearch,
    handlePageChange,
    handleRowSelect,
    handleSelectAll,
    handleEdit,
    handleAdd,
    handleModalClose,
    handleModalSuccess,
    handleFormDataChange,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDepartmentsPage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Departments
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage your organization's departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="inline-flex items-center"
            disabled={selectedDepartments.length !== 1}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            className="inline-flex items-center"
            disabled={selectedDepartments.length === 0}
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

      {/* Search */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search by department name or code..."
            />
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {pagination.total} department{pagination.total !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <DepartmentTable
        departments={departments}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedDepartments={selectedDepartments}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Add/Edit Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        departmentToEdit={selectedDepartment}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={
          selectedDepartments.length === 1
            ? `Are you sure you want to delete ${selectedDepartments[0].name}? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedDepartments.length} departments? This action cannot be undone.`
        }
        loading={deleteLoading}
      />
    </div>
  );
}

export default DepartmentsPage;
