import { useState, useEffect, useCallback } from 'react';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import PositionTable from './PositionTable';
import PositionModal from './PositionModal';
import SearchBar from '@components/ui/SearchBar';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { positionService } from '@services/positionService';
import toast from 'react-hot-toast';

function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Add state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Keep form data state in parent
  const [modalFormData, setModalFormData] = useState({
    name: '',
    description: '',
    status: true,
  });

  // Fetch positions with search and pagination
  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await positionService.getPositions({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
      });

      // result.data chính là mảng items do service trả về
      setPositions(result.data || []);

      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch {
      toast.error('Failed to fetch positions');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  // Fetch on mount and changes
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((position) => {
    setSelectedPosition((prev) => (prev?.id === position.id ? null : position));
  }, []);

  // Handle edit position
  const handleEdit = useCallback(() => {
    if (selectedPosition) {
      setModalFormData({
        name: selectedPosition.name || '',
        description: selectedPosition.description || '',
        status: selectedPosition.status ?? true,
      });
      setIsModalOpen(true);
    }
  }, [selectedPosition]);

  // Handle add new position
  const handleAdd = useCallback(() => {
    setSelectedPosition(null);
    setModalFormData({
      name: '',
      description: '',
      status: true,
    });
    setIsModalOpen(true);
  }, []);

  // Handle modal success
  const handleModalSuccess = useCallback(() => {
    fetchPositions();
    setSelectedPosition(null);
    setIsModalOpen(false);
  }, [fetchPositions]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle form data change (kept in parent)
  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  // Handle delete position
  const handleDelete = useCallback(() => {
    if (selectedPosition) {
      setIsDeleteModalOpen(true);
    }
  }, [selectedPosition]);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPosition) return;

    setDeleteLoading(true);
    try {
      await positionService.deletePosition(selectedPosition.id);
      toast.success('Position deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedPosition(null);
      fetchPositions();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error(error.response?.data?.message || 'Failed to delete position');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedPosition, fetchPositions]);

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
            disabled={!selectedPosition}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit Position
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            className="inline-flex items-center"
            disabled={!selectedPosition}
          >
            <Icon name="trash" className="w-5 h-5 mr-2" />
            Delete Position
          </Button>
          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add Position
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
        selectedPosition={selectedPosition}
        onRowSelect={handleRowSelect}
      />

      {/* Empty State */}
      {!loading && positions.length === 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-12">
          <div className="text-center">
            <Icon
              name="briefcase"
              className="w-16 h-16 mx-auto text-secondary-400 dark:text-secondary-600 mb-4"
            />
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No positions found
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {search
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first position'}
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <PositionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        positionToEdit={selectedPosition}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Position"
        message={`Are you sure you want to delete "${selectedPosition?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}

export default PositionsPage;
