import { useState, useEffect, useCallback } from 'react';
import Button from '@components/ui/Button';
import Icon from '@components/ui/Icon';
import EmployeeTable from './EmployeeTable';
import EmployeeModal from './EmployeeModal';
import SearchBar from '@components/ui/SearchBar';
import Select from '@components/ui/Select';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import PasswordDisplayModal from './PasswordDisplayModal';
import { employeeService } from '@services/employeeService';
import { departmentService } from '@services/departmentService';
import { positionService } from '@services/positionService';
import toast from 'react-hot-toast';

function EmployeesPage() {
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
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Add state for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add state for password display modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalData, setPasswordModalData] = useState({
    employeeName: '',
    email: '',
    password: '',
  });

  // Add state for departments and positions
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Add state for filters
  const [filters, setFilters] = useState({
    department_id: '',
    gender: '',
    work_status: '',
  });

  // Keep form data state in parent to preserve it when modal closes
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

  // Fetch employees on mount and when dependencies change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle search (trả lại behavior cũ: bind trực tiếp SearchBar -> search)
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      department_id: '',
      gender: '',
      work_status: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((employee) => {
    setSelectedEmployees((prev) => {
      const exists = prev.some((e) => e.id === employee.id);
      return exists ? prev.filter((e) => e.id !== employee.id) : [...prev, employee];
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked) => {
      setSelectedEmployees(checked ? employees : []);
    },
    [employees],
  );

  // Handle edit employee
  const handleEdit = useCallback(() => {
    if (selectedEmployees.length === 1) {
      const selectedEmployee = selectedEmployees[0];
      // Populate form data when editing
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

  // Handle modal close (just close, don't clear data)
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle modal success (employee created/updated)
  const handleModalSuccess = useCallback(
    (data) => {
      fetchEmployees();
      setSelectedEmployees([]);
      setIsModalOpen(false);
      toast.success('Employee saved successfully');

      // Show password modal if account was created
      if (data?.generated_password) {
        setPasswordModalData({
          employeeName: data.employee?.full_name || 'Employee',
          email: data.user_account?.email || data.employee?.email || '',
          password: data.generated_password,
        });
        setIsPasswordModalOpen(true);
      }

      // Clear form data after successful submission
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
    [fetchEmployees],
  );

  // Handle add new employee
  const handleAdd = useCallback(() => {
    setSelectedEmployees([]);
    // Clear form data when adding new employee
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
  }, []);

  // Handle form data change
  const handleFormDataChange = useCallback((newFormData) => {
    setModalFormData(newFormData);
  }, []);

  // Delete employee is currently not supported (no UI button)
  // const handleDelete = useCallback(() => {
  //   if (selectedEmployees.length > 0) {
  //     setIsDeleteModalOpen(true);
  //   }
  // }, [selectedEmployees]);

  // Handle confirm delete (multi-delete)
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
      setSelectedEmployees([]);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.message || 'Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedEmployees, fetchEmployees]);

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  // Handle password modal close
  const handlePasswordModalClose = useCallback(() => {
    setIsPasswordModalOpen(false);
    setPasswordModalData({
      employeeName: '',
      email: '',
      password: '',
    });
  }, []);

  // Check if any filters or search are active
  const hasActiveFilters = filters.department_id || filters.gender || filters.work_status;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50">
            Employees
          </h1>
          <p className="text-body text-secondary-600 dark:text-secondary-400 mt-2">
            Manage your organization's employees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="inline-flex items-center"
            disabled={selectedEmployees.length !== 1}
          >
            <Icon name="pencil" className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button onClick={handleAdd} variant="primary" className="inline-flex items-center">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search by name, email, phone, or Identity Number..."
              />
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              {pagination.total} employee{pagination.total !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <Select
              label="Department"
              name="department_id"
              value={filters.department_id}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
              ]}
            />

            <Select
              label="Gender"
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />

            <Select
              label="Work Status"
              name="work_status"
              value={filters.work_status}
              onChange={handleFilterChange}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'working', label: 'Working' },
                { value: 'probation', label: 'Probation' },
                { value: 'leave', label: 'Leave' },
                { value: 'resigned', label: 'Resigned' },
              ]}
            />

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                fullWidth
              >
                <Icon name="x" className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        selectedEmployees={selectedEmployees}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Add/Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        employeeToEdit={selectedEmployees.length === 1 ? selectedEmployees[0] : null}
        initialFormData={modalFormData}
        onFormDataChange={handleFormDataChange}
        departments={departments}
        positions={positions}
        loadingOptions={loadingOptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={
          selectedEmployees.length === 1
            ? `Are you sure you want to delete ${selectedEmployees[0].full_name}? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedEmployees.length} employees? This action cannot be undone.`
        }
        loading={deleteLoading}
      />

      {/* Password Display Modal */}
      <PasswordDisplayModal
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        employeeName={passwordModalData.employeeName}
        email={passwordModalData.email}
        password={passwordModalData.password}
      />
    </div>
  );
}

export default EmployeesPage;
