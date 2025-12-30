import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import SearchBar from '@components/ui/SearchBar';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';

import ShiftTable from './ShiftTable';
import ShiftModal from './ShiftModal';
import { useShiftsPage } from './useShiftsPage';

function ShiftsPage() {
  const {
    // state
    shifts,
    loading,
    search,
    pagination,
    selectedShifts,
    isModalOpen,
    isDeleteModalOpen,
    deleteLoading,
    modalFormData,

    // handlers
    handleSearch,
    handlePageChange,
    handleRowSelect,
    handleSelectAll,
    handleEdit,
    handleAdd,
    handleFormDataChange,
    handleModalSuccess,
    handleModalClose,
    handleDelete,
    handleConfirmDelete,
  } = useShiftsPage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Shifts
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage working shifts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="inline-flex items-center"
            disabled={selectedShifts.length !== 1}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            className="inline-flex items-center"
            disabled={selectedShifts.length === 0}
          >
            <Icon name="trash" className="w-5 h-5 mr-2" />
            Delete
          </Button>
          <Button
            onClick={handleAdd}
            variant="primary"
            className="inline-flex items-center"
          >
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
              placeholder="Search shifts..."
            />
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {pagination.total} record{pagination.total !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Table */}
      <ShiftTable
        shifts={shifts}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedShifts={selectedShifts}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Modal */}
      <ShiftModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        shiftToEdit={selectedShifts.length === 1 ? selectedShifts[0] : null}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
      />

      {/* Delete Confirm */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmDelete}
        title="Delete Shift"
        message={
          selectedShifts.length === 1
            ? `Are you sure you want to delete "${selectedShifts[0]?.shift_name}"? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedShifts.length} shifts? This action cannot be undone.`
        }
        loading={deleteLoading}
      />
    </div>
  );
}

export default ShiftsPage;
