import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { shiftService } from '@services/shiftService';
import { useTableSelection } from '@hooks/useTableSelection';

/**
 * Hook quản lý toàn bộ state + logic cho trang Shifts
 */
export function useShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [modalFormData, setModalFormData] = useState({
    shift_name: '',
    start_time: '',
    end_time: '',
    early_check_in_minutes: 15,
    late_checkout_minutes: 15,
  });

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await shiftService.getShifts({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
      });

      setShifts(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to fetch shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Selection dùng hook dùng chung
  const {
    selectedItems: selectedShifts,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(shifts, (s) => s.id);

  const handleEdit = useCallback(() => {
    if (selectedShifts.length === 1) {
      const selectedShift = selectedShifts[0];

      // Dùng cùng logic hiển thị thời gian như ShiftTable (local time, HH:MM)
      const toLocalTimeString = (value) => {
        if (!value) return '';
        const d = new Date(value);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      setModalFormData({
        shift_name: selectedShift.shift_name || '',
        start_time: toLocalTimeString(selectedShift.start_time),
        end_time: toLocalTimeString(selectedShift.end_time),
        early_check_in_minutes: selectedShift.early_check_in_minutes ?? 15,
        late_checkout_minutes: selectedShift.late_checkout_minutes ?? 15,
      });
      setIsModalOpen(true);
    }
  }, [selectedShifts]);

  const handleAdd = useCallback(() => {
    clearSelection();
    setModalFormData({
      shift_name: '',
      start_time: '',
      end_time: '',
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    });
    setIsModalOpen(true);
  }, [clearSelection]);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchShifts();
    clearSelection();
    setIsModalOpen(false);
  }, [fetchShifts, clearSelection]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedShifts.length > 0) {
      setIsDeleteModalOpen(true);
    }
  }, [selectedShifts]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedShifts.length === 0) return;

    setDeleteLoading(true);
    try {
      for (const shift of selectedShifts) {
        await shiftService.deleteShift(shift.id);
      }
      toast.success(
        selectedShifts.length === 1
          ? 'Shift deleted successfully'
          : `${selectedShifts.length} shifts deleted successfully`,
      );
      setIsDeleteModalOpen(false);
      clearSelection();
      fetchShifts();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error(error.message || 'Failed to delete shift');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedShifts, fetchShifts, clearSelection]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const selectedShift = selectedShifts.length === 1 ? selectedShifts[0] : null;

  return {
    // state
    shifts,
    loading,
    search,
    pagination,
    selectedShifts,
    selectedShift,
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
    handleCancelDelete,
  };
}
