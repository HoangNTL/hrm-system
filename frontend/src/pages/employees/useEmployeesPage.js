import { useState, useEffect, useCallback } from 'react';
import { useTableSelection } from '@hooks/useTableSelection';
import { employeeService } from '@services/employeeService';
import { departmentService } from '@services/departmentService';
import { positionService } from '@services/positionService';
import toast from 'react-hot-toast';

/**
 * Hook quản lý toàn bộ state + logic cho trang Employees
 */
export function useEmployeesPage() {
  const [employees, setEmployees] = useState([]);
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

  // Password display modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalData, setPasswordModalData] = useState({
    employeeName: '',
    email: '',
    password: '',
  });

  // Departments & positions options
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    department_id: '',
    gender: '',
    work_status: '',
  });

  // Selection using reusable hook
  const {
    selectedItems: selectedEmployees,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(employees, (e) => e.id);

  // Form data for Add/Edit modal
  const [modalFormData, setModalFormData] = useState({
    full_name: '',
    gender: '',
    dob: '',
    cccd: '',
    phone: '',
    email: '',
    address: '',
    department_id: '',
    position_id: '',
    create_login: false,
  });

  // Fetch departments and positions once on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptResult, posResult] = await Promise.all([
          departmentService.getDepartments({ limit: 100 }),
          positionService.getPositions({ limit: 100 }),
        ]);
        setDepartments(deptResult.data || []);
        setPositions(posResult.data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
        toast.error('Failed to load departments and positions');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Fetch employees with search, pagination, and filters
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const result = await employeeService.getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
        department_id: filters.department_id,
        gender: filters.gender,
        work_status: filters.work_status,
      });

      setEmployees(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // --- Handlers ---

  // Search (bind trực tiếp SearchBar -> search)
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      department_id: '',
      gender: '',
      work_status: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedEmployees.length === 1) {
      const selectedEmployee = selectedEmployees[0];
      setModalFormData({
        full_name: selectedEmployee.full_name || '',
        gender: selectedEmployee.gender || '',
        dob: selectedEmployee.dob ? selectedEmployee.dob.split('T')[0] : '',
        cccd: selectedEmployee.identity_number || '',
        phone: selectedEmployee.phone || '',
        email: selectedEmployee.email || '',
        address: selectedEmployee.address || '',
        department_id: selectedEmployee.department?.id || '',
        position_id: selectedEmployee.position?.id || '',
        create_login: false,
      });
      setIsModalOpen(true);
    }
  }, [selectedEmployees]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(
    (data) => {
      fetchEmployees();
      clearSelection();
      setIsModalOpen(false);
      toast.success('Employee saved successfully');

      if (data?.generated_password) {
        setPasswordModalData({
          employeeName: data.employee?.full_name || 'Employee',
          email: data.user_account?.email || data.employee?.email || '',
          password: data.generated_password,
        });
        setIsPasswordModalOpen(true);
      }

      setModalFormData({
        full_name: '',
        gender: '',
        dob: '',
        cccd: '',
        phone: '',
        email: '',
        address: '',
        department_id: '',
        position_id: '',
        create_login: false,
      });
    },
    [fetchEmployees, clearSelection],
  );

  const handleAdd = useCallback(() => {
    clearSelection();
    setModalFormData({
      full_name: '',
      gender: '',
      dob: '',
      cccd: '',
      phone: '',
      email: '',
      address: '',
      department_id: '',
      position_id: '',
      create_login: false,
    });
    setIsModalOpen(true);
  }, [clearSelection]);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedEmployees.length === 0) return;

    setDeleteLoading(true);
    try {
      const ids = selectedEmployees.map((e) => e.id);

      for (const id of ids) {
        await employeeService.deleteEmployee(id);
      }

      toast.success(`${ids.length} employee(s) deleted successfully`);
      setIsDeleteModalOpen(false);
      clearSelection();
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedEmployees, fetchEmployees, clearSelection]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handlePasswordModalClose = useCallback(() => {
    setIsPasswordModalOpen(false);
    setPasswordModalData({
      employeeName: '',
      email: '',
      password: '',
    });
  }, []);

  const hasActiveFilters =
    !!(filters.department_id || filters.gender || filters.work_status);

  const selectedEmployee =
    selectedEmployees.length === 1 ? selectedEmployees[0] : null;

  return {
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
  };
}
