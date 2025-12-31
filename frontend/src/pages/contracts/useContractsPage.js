import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { contractService } from '@services/contractService';
import { employeeAPI } from '@api/employeeAPI';
import { useTableSelection } from '@hooks/useTableSelection';

const initialFilters = { status: '', type: '', employeeId: '' };

/**
 * Quản lý toàn bộ state + logic cho ContractsPage
 */
export function useContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const location = useLocation();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [modalFormData, setModalFormData] = useState({
    code: '',
    employee_id: '',
    contract_type: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    salary: '',
    notes: '',
    work_location: '',
  });

  // --- Fetch helpers ---
  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const response = await employeeAPI.getEmployeesForSelect();
      setEmployees(response.data?.items || response.items || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await contractService.getContracts({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim(),
        status: filters.status,
        type: filters.type,
        employeeId: filters.employeeId,
      });

      setContracts(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters.status, filters.type, filters.employeeId]);

  useEffect(() => {
    fetchEmployees();
    fetchContracts();
  }, [fetchEmployees, fetchContracts]);

  // --- Handlers ---
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const hasActiveFilters = !!(search.trim() || filters.status || filters.type || filters.employeeId);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilters(initialFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Init filters from query string (employeeId for "My Contract")
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('employeeId') || '';
    if (employeeId) {
      setFilters((prev) => ({ ...prev, employeeId }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [location.search]);

  // Selection cho bảng contracts dùng hook dùng chung
  const {
    selectedItems: selectedContracts,
    toggleRow: handleRowSelect,
    toggleAll: handleSelectAll,
    clearSelection,
  } = useTableSelection(contracts, (c) => c.id);

  const handleRowDoubleClick = useCallback(
    (contract) => {
      handleSelectAll(false); // clear trước để đảm bảo chỉ có 1 selected khi double click
      handleRowSelect(contract);
      setIsDetailsModalOpen(true);
    },
    [handleRowSelect, handleSelectAll],
  );

  const generateContractCode = () => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CT-${currentYear}-${randomNum}`;
  };

  const handleAdd = useCallback(() => {
    const generatedCode = generateContractCode();
    clearSelection();
    setModalFormData({
      code: generatedCode,
      employee_id: '',
      contract_type: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      salary: '',
      notes: '',
      work_location: '',
    });
    setIsModalOpen(true);
  }, [clearSelection]);

  const handleEdit = useCallback(() => {
    if (selectedContracts.length !== 1) return;
    const selectedContract = selectedContracts[0];
    setModalFormData({
      code: selectedContract.code || '',
      employee_id: selectedContract.employee_id || '',
      contract_type: selectedContract.contract_type || '',
      status: selectedContract.status || 'draft',
      start_date: selectedContract.start_date || '',
      end_date: selectedContract.end_date || '',
      salary: selectedContract.salary || '',
      notes: selectedContract.notes || '',
      work_location: selectedContract.work_location || '',
    });
    setIsModalOpen(true);
  }, [selectedContracts]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchContracts();
    clearSelection();
    setIsModalOpen(false);
    toast.success('Contract saved successfully');
    setModalFormData({
      code: '',
      employee_id: '',
      contract_type: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      salary: '',
      notes: '',
      work_location: '',
    });
  }, [fetchContracts, clearSelection]);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleDetailsModalClose = useCallback(() => {
    setIsDetailsModalOpen(false);
  }, []);

  const handleEditFromDetails = useCallback(() => {
    if (selectedContracts.length !== 1) return;
    setIsDetailsModalOpen(false);
    handleEdit();
  }, [selectedContracts, handleEdit]);

  const selectedContract = selectedContracts.length === 1 ? selectedContracts[0] : null;

  return {
    // state
    contracts,
    employees,
    loading,
    employeesLoading,
    search,
    filters,
    pagination,
    selectedContracts,
    selectedContract,
    isModalOpen,
    isDetailsModalOpen,
    modalFormData,
    hasActiveFilters,

    // handlers
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleClearFilters,
    handleRowSelect,
    handleSelectAll,
    handleRowDoubleClick,
    handleAdd,
    handleEdit,
    handleModalClose,
    handleModalSuccess,
    handleFormDataChange,
    handleDetailsModalClose,
    handleEditFromDetails,
  };
}
