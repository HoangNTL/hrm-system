import { useState, useEffect } from "react";
import { employeeService } from "@services/employeeService";
import { departmentService } from "@services/departmentService";
import { positionService } from "@services/positionService";
import Modal from "@components/ui/Modal";
import { handleAPIError } from "@api";
import Table from "@components/ui/Table";
import Pagination from "@components/ui/Pagination";
import Button from "@components/ui/Button";
import Icon from "@components/ui/Icon";


function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    cccd: "",
    phone: "",
    email: "",
    address: "",
    department_id: "",
    position_id: "",
  });
  const [creating, setCreating] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      });

      setEmployees(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          departmentService.getDepartments({ limit: 100 }),
          positionService.getPositions({ limit: 100 }),
        ]);
        setDepartments(deptRes.data || []);
        setPositions(posRes.data || []);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchDropdownData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle row click
  const handleRowClick = (employee) => {
    console.log("Employee clicked:", employee);
    // TODO: Navigate to employee detail page or open modal
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Table columns
  const columns = [
    {
      key: "employee_id",
      label: "No.",
      render: (value, item, index) => (
        <span className="font-medium text-primary-600 dark:text-primary-400">
          {index + 1 + (pagination.page - 1) * pagination.limit}
        </span>
      ),
    },
    {
      key: "full_name",
      label: "Full Name",
      render: (value) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">
          {value}
        </span>
      ),
    },
    {
      key: "gender",
      label: "Gender",
      render: (value) => (
        <span
          className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${
            value === "Male"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
          }
        `}
        >
          {value}
        </span>
      ),
    },
    {
      key: "dob",
      label: "Date of Birth",
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-secondary-900 dark:text-secondary-100">
            {formatDate(value)}
          </span>
          <span className="text-xs text-secondary-500 dark:text-secondary-400">
            {calculateAge(value)} years old
          </span>
        </div>
      ),
    },
    {
      key: "cccd",
      label: "CCCD/Passport",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "email",
      label: "Email",
      render: (value) => (
        <a
          href={`mailto:${value}`}
          className="text-primary-600 dark:text-primary-400 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
  ];

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
        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          <Icon name="plus" className="w-5 h-5" />
          Add Employee
        </Button>
      </div>

      <Modal open={showAddForm} title="Add Employee" onClose={() => setShowAddForm(false)} size="md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setCreating(true);
              const payload = { ...formData };
              if (!payload.department_id) delete payload.department_id;
              if (!payload.position_id) delete payload.position_id;
              await employeeService.createEmployee(payload);
              setShowAddForm(false);
              setFormData({ full_name: "", gender: "Male", dob: "", cccd: "", phone: "", email: "", address: "", department_id: "", position_id: "" });
              setPagination((prev) => ({ ...prev, page: 1 }));
              await fetchEmployees();
            } catch (err) {
              console.error('Create employee error', err);
              setError(handleAPIError(err));
            } finally {
              setCreating(false);
            }
          }}
          className="space-y-5"
        >
          {/* A. Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">A. Personal Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData((s) => ({ ...s, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData((s) => ({ ...s, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Date of Birth</label>
                  <input
                    required
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData((s) => ({ ...s, dob: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  CCCD/Passport <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="Enter CCCD/Passport number"
                  value={formData.cccd}
                  onChange={(e) => setFormData((s) => ({ ...s, cccd: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Phone</label>
                  <input
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
                  <input
                    placeholder="Enter email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Address</label>
                <input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData((s) => ({ ...s, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* B. Work Information */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">B. Work Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData((s) => ({ ...s, department_id: e.target.value ? parseInt(e.target.value) : "" }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Position</label>
                <select
                  value={formData.position_id}
                  onChange={(e) => setFormData((s) => ({ ...s, position_id: e.target.value ? parseInt(e.target.value) : "" }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">-- Select Position --</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="danger" onClick={() => setShowAddForm(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployees}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ID, name, email, phone, or CCCD..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 pl-10 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500">
                <Icon name="search" className="w-5 h-5" />
              </div>
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={loading}>
            Search
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setSearchTerm("");
                setSearchInput("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Results Info */}
      {!error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Showing{" "}
            <span className="font-medium text-secondary-900 dark:text-secondary-100">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-secondary-900 dark:text-secondary-100">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-secondary-900 dark:text-secondary-100">
              {pagination.total}
            </span>{" "}
            employees
          </p>
          <select
            value={pagination.limit}
            onChange={(e) => {
              setPagination((prev) => ({
                ...prev,
                limit: parseInt(e.target.value),
                page: 1,
              }));
            }}
            disabled={loading}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      )}

      {/* Employees Table */}
      <Table
        columns={columns}
        data={employees}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default EmployeesPage;
