import { useState, useEffect, useCallback } from 'react';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import DepartmentTable from './DepartmentTable';
import DepartmentModal from './DepartmentModal';
import SearchBar from '@components/ui/SearchBar';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { departmentService } from '@services/departmentService';
import toast from 'react-hot-toast';

function DepartmentsPage() {
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
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // Add state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Keep form data state in parent to preserve it when modal closes
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: true,
  });

  // Fetch departments with search and pagination
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

  // Fetch departments on mount and when dependencies change
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Handle row selection (multi-select via checkbox)
  const handleRowSelect = useCallback((department) => {
    setSelectedDepartments((prev) => {
      const exists = prev.some((d) => d.id === department.id);
      return exists ? prev.filter((d) => d.id !== department.id) : [...prev, department];
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked) => {
      setSelectedDepartments(checked ? departments : []);
    },
    [departments],
  );

  // Handle edit department
  const handleEdit = useCallback(() => {
    if (selectedDepartments.length === 1) {
      const selectedDepartment = selectedDepartments[0];
      // Populate form data when editing
      setModalFormData({
        name: selectedDepartment.name || '',
        code: selectedDepartment.code || '',
        description: selectedDepartment.description || '',
        status: selectedDepartment.status !== undefined ? selectedDepartment.status : true,
      });
      setIsModalOpen(true);
    }
  }, [selectedDepartments]);

  // Handle modal close (just close, don't clear data)
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle modal success (department created/updated)
  const handleModalSuccess = useCallback(() => {
    fetchDepartments();
    setSelectedDepartments([]);
    setIsModalOpen(false);
    toast.success('Department saved successfully');

    // Clear form data after successful submission
    setModalFormData({
      name: '',
      code: '',
      description: '',
      status: true,
    });
  }, [fetchDepartments]);

  // Handle add new department
  const handleAdd = useCallback(() => {
    setSelectedDepartments([]);
    // Clear form data when adding new department
    setModalFormData({
      name: '',
      code: '',
      description: '',
      status: true,
    });
    setIsModalOpen(true);
  }, []);

  // Handle form data change
  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  // Handle delete department
  const handleDelete = useCallback(() => {
    if (selectedDepartments.length > 0) {
      setIsDeleteModalOpen(true);
    }
  }, [selectedDepartments]);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (selectedDepartments.length === 0) return;

    setDeleteLoading(true);
    try {
      const ids = selectedDepartments.map((d) => d.id);

      for (const id of ids) {
        await departmentService.deleteDepartment(id);
      }

      toast.success(`${ids.length} department(s) deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedDepartments([]);
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.message || 'Failed to delete department');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedDepartments, fetchDepartments]);

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Departments
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage your organization's departments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="inline-flex items-center"
            disabled={selectedDepartments.length !== 1}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            className="inline-flex items-center"
            disabled={selectedDepartments.length === 0}
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

      {/* Search */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search by department name or code..."
            />
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            {pagination.total} department{pagination.total !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <DepartmentTable
        departments={departments}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedDepartments={selectedDepartments}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Add/Edit Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        departmentToEdit={selectedDepartments.length === 1 ? selectedDepartments[0] : null}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={
          selectedDepartments.length === 1
            ? `Are you sure you want to delete ${selectedDepartments[0].name}? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedDepartments.length} departments? This action cannot be undone.`
        }
        loading={deleteLoading}
      />
    </div>
  );
}

export default DepartmentsPage;
