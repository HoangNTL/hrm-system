import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { positionService } from '@services/positionService';
import { useTableSelection } from '@hooks/useTableSelection';

/**
 * Hook quản lý toàn bộ state + logic cho trang Positions
 */
export function usePositionsPage() {
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

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form data cho modal Add/Edit
  const [modalFormData, setModalFormData] = useState({
    name: '',
    description: '',
    status: true,
  });

  // Fetch positions với search + pagination
  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await positionService.getPositions({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
      });

      setPositions(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to fetch positions');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // --- Handlers ---

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Selection dùng hook dùng chung
  const {
    selectedItems: selectedPositions,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(positions, (p) => p.id);

  const handleEdit = useCallback(() => {
    if (selectedPositions.length === 1) {
      const selectedPosition = selectedPositions[0];
      setModalFormData({
        name: selectedPosition.name || '',
        description: selectedPosition.description || '',
        status: selectedPosition.status ?? true,
      });
      setIsModalOpen(true);
    }
  }, [selectedPositions]);

  const handleAdd = useCallback(() => {
    clearSelection();
    setModalFormData({
      name: '',
      description: '',
      status: true,
    });
    setIsModalOpen(true);
  }, [clearSelection]);

  const handleModalSuccess = useCallback(() => {
    fetchPositions();
    clearSelection();
    setIsModalOpen(false);
  }, [fetchPositions, clearSelection]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedPositions.length > 0) {
      setIsDeleteModalOpen(true);
    }
  }, [selectedPositions]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedPositions.length === 0) return;

    setDeleteLoading(true);
    try {
      const ids = selectedPositions.map((p) => p.id);

      for (const id of ids) {
        await positionService.deletePosition(id);
      }

      toast.success(`${ids.length} position(s) deleted successfully`);
      setIsDeleteModalOpen(false);
      clearSelection();
      fetchPositions();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error(error.response?.data?.message || 'Failed to delete position');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedPositions, fetchPositions, clearSelection]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const selectedPosition =
    selectedPositions.length === 1 ? selectedPositions[0] : null;

  return {
    // state
    positions,
    loading,
    search,
    pagination,
    selectedPositions,
    selectedPosition,
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
  };
}
