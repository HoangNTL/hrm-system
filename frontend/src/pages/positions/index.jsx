import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import PositionTable from './PositionTable';
import PositionModal from './PositionModal';
import SearchBar from '@components/ui/SearchBar';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { usePositionsPage } from './usePositionsPage';

function PositionsPage() {
  const {
    // state
    positions,
    loading,
    search,
    pagination,
    selectedPositions,
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
    handleModalSuccess,
    handleModalClose,
    handleFormDataChange,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = usePositionsPage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Positions
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage job positions and roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="inline-flex items-center"
            disabled={selectedPositions.length !== 1}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            className="inline-flex items-center"
            disabled={selectedPositions.length === 0}
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

      {/* Search Bar Container */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar value={search} onChange={handleSearch} placeholder="Search positions..." />
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {pagination.total} record{pagination.total !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Position Table */}
      <PositionTable
        positions={positions}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedPositions={selectedPositions}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Add/Edit Modal */}
      <PositionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        positionToEdit={selectedPositions.length === 1 ? selectedPositions[0] : null}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Position"
        message={
          selectedPositions.length === 1
            ? `Are you sure you want to delete "${selectedPositions[0].name}"? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedPositions.length} positions? This action cannot be undone.`
        }
        loading={deleteLoading}
      />
    </div>
  );
}

export default PositionsPage;
