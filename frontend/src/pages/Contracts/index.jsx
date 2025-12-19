import { useState, useEffect, useCallback } from 'react';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import toast from 'react-hot-toast';

import ContractTable from './ContractTable';
import ContractModal from './ContractModal';
import ContractDetailsModal from './ContractDetailsModal';
import { contractService } from '@services/contractService';
import { employeeAPI } from '@api/employeeAPI';

const statusFilterOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'expired', label: 'Expired' },
];

const typeFilterOptions = [
  { value: '', label: 'All Types' },
  { value: 'indefinite', label: 'Indefinite' },
  { value: 'fixed', label: 'Fixed Term' },
  { value: 'probation', label: 'Probation' },
  { value: 'intern', label: 'Internship' },
];

function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const response = await employeeAPI.getEmployeesForSelect();
      console.log('Employees response:', response);
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
  }, [pagination.page, pagination.limit, search, filters.status, filters.type]);

  useEffect(() => {
    fetchEmployees();
    fetchContracts();
  }, [fetchEmployees, fetchContracts]);

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

  // Clear all filters and search
  const hasActiveFilters = !!(search.trim() || filters.status || filters.type);
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilters({ status: '', type: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRowSelect = useCallback((contract) => {
    setSelectedContract((prev) => (prev?.id === contract.id ? null : contract));
  }, []);

  const handleRowDoubleClick = useCallback((contract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `CT-${currentYear}-${randomNum}`;

    setSelectedContract(null);
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
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedContract) return;
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
  }, [selectedContract]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchContracts();
    setSelectedContract(null);
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
  }, [fetchContracts]);

  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedContract) setIsDeleteModalOpen(true);
  }, [selectedContract]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedContract) return;
    setDeleteLoading(true);
    try {
      await contractService.deleteContract(selectedContract.id);
      toast.success('Contract deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedContract(null);
      fetchContracts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete contract');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedContract, fetchContracts]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleDetailsModalClose = useCallback(() => {
    setIsDetailsModalOpen(false);
  }, []);

  const handleEditFromDetails = useCallback(() => {
    if (!selectedContract) return;
    setIsDetailsModalOpen(false);
    handleEdit();
  }, [selectedContract, handleEdit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Contracts
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage employment contracts and amendments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleEdit} variant="outline" disabled={!selectedContract} className="inline-flex items-center">
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button onClick={handleDelete} variant="danger" disabled={!selectedContract} className="inline-flex items-center">
            <Icon name="trash" className="w-5 h-5 mr-2" />
            Delete
          </Button>
          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add Contract
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search by code, employee name..."
            />
          </div>
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusFilterOptions}
            className="w-full md:w-48"
          />
          <Select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            options={typeFilterOptions}
            className="w-full md:w-52"
          />
          <Button
            onClick={handleClearFilters}
            variant="outline"
            disabled={!hasActiveFilters}
            className="inline-flex items-center whitespace-nowrap"
            title="Clear filters"
          >
            <Icon name="x" className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <div className="text-sm text-secondary-600 dark:text-secondary-400 whitespace-nowrap">
            {pagination.total} contracts
          </div>
        </div>
      </div>

      <ContractTable
        contracts={contracts}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedContract={selectedContract}
        onRowSelect={handleRowSelect}
        onRowDoubleClick={handleRowDoubleClick}
      />

      {/* {!loading && contracts.length === 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-12">
          <div className="text-center">
            <Icon name="file-text" className="w-16 h-16 mx-auto text-secondary-400 dark:text-secondary-600 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No Contracts
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {search ? 'Try adjusting your search criteria' : 'Get started by adding a new contract'}
            </p>
          </div>
        </div>
      )} */}

      <ContractModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        contractToEdit={selectedContract}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
        employees={employees}
        employeesLoading={employeesLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Contract"
        message={`Are you sure you want to delete contract ${selectedContract?.code || ''}? This action cannot be undone.`}
        loading={deleteLoading}
      />

      <ContractDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        contract={selectedContract}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
}

export default ContractsPage;
