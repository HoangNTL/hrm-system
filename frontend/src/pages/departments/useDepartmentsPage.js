import { useState, useEffect, useCallback } from 'react';
import { useTableSelection } from '@hooks/useTableSelection';
import { departmentService } from '@services/departmentService';
import toast from 'react-hot-toast';

/**
 * Hook quản lý toàn bộ state + logic cho trang Departments
 */
export function useDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
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
    code: '',
    description: '',
    status: true,
  });

  // Fetch departments với search + pagination
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await departmentService.getDepartments({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
      });

      setDepartments(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to fetch departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  // Gọi fetchDepartments khi mount / dependency đổi
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // --- Handlers chính ---

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Sử dụng hook dùng chung cho selection bảng
  const {
    selectedItems: selectedDepartments,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(departments, (d) => d.id);

  const handleEdit = useCallback(() => {
    if (selectedDepartments.length === 1) {
      const selectedDepartment = selectedDepartments[0];
      setModalFormData({
        name: selectedDepartment.name || '',
        code: selectedDepartment.code || '',
        description: selectedDepartment.description || '',
        status:
          selectedDepartment.status !== undefined ? selectedDepartment.status : true,
      });
      setIsModalOpen(true);
    }
  }, [selectedDepartments]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchDepartments();
    clearSelection();
    setIsModalOpen(false);
    toast.success('Department saved successfully');

    setModalFormData({
      name: '',
      code: '',
      description: '',
      status: true,
    });
  }, [fetchDepartments, clearSelection]);

  const handleAdd = useCallback(() => {
    clearSelection();
    setModalFormData({
      name: '',
      code: '',
      description: '',
      status: true,
    });
    setIsModalOpen(true);
  }, [clearSelection]);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedDepartments.length > 0) {
      setIsDeleteModalOpen(true);
    }
  }, [selectedDepartments]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedDepartments.length === 0) return;

    setDeleteLoading(true);
    try {
      const ids = selectedDepartments.map((d) => d.id);

      await Promise.all(ids.map((id) => departmentService.deleteDepartment(id)));

      toast.success(`${ids.length} department(s) deleted successfully`);
      setIsDeleteModalOpen(false);
  clearSelection();
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.message || 'Failed to delete department');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedDepartments, fetchDepartments, clearSelection]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const selectedDepartment = selectedDepartments.length === 1 ? selectedDepartments[0] : null;

  return {
    // state
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

    // handlers
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
  };
}
