import { useState, useEffect, useCallback } from 'react';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import SearchBar from '@components/ui/SearchBar';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import toast from 'react-hot-toast';

import ShiftTable from './ShiftTable';
import ShiftModal from './ShiftModal';
import { shiftService } from '@services/shiftService';

function ShiftsPage() {
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
  const [selectedShifts, setSelectedShifts] = useState([]);

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

  const handleRowSelect = useCallback((shift) => {
    setSelectedShifts((prev) => {
      const exists = prev.some((s) => s.id === shift.id);
      if (exists) {
        return prev.filter((s) => s.id !== shift.id);
      }
      return [...prev, shift];
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        setSelectedShifts(shifts);
      } else {
        setSelectedShifts([]);
      }
    },
    [shifts],
  );

  const handleEdit = useCallback(() => {
    if (selectedShifts.length === 1) {
      const selectedShift = selectedShifts[0];
      const start = new Date(selectedShift.start_time);
      const end = new Date(selectedShift.end_time);
      const toTimeStr = (d) =>
        d.toISOString().substring(11, 16); // HH:MM

      setModalFormData({
        shift_name: selectedShift.shift_name || '',
        start_time: toTimeStr(start),
        end_time: toTimeStr(end),
        early_check_in_minutes: selectedShift.early_check_in_minutes ?? 15,
        late_checkout_minutes: selectedShift.late_checkout_minutes ?? 15,
      });
      setIsModalOpen(true);
    }
  }, [selectedShifts]);

  const handleAdd = useCallback(() => {
    setSelectedShifts([]);
    setModalFormData({
      shift_name: '',
      start_time: '',
      end_time: '',
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    });
    setIsModalOpen(true);
  }, []);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchShifts();
    setSelectedShifts([]);
    setIsModalOpen(false);
  }, [fetchShifts]);

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
      setSelectedShifts([]);
      fetchShifts();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error(error.message || 'Failed to delete shift');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedShifts, fetchShifts]);

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
        onClose={() => setIsDeleteModalOpen(false)}
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
