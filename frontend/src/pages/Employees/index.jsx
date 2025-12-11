import { useState, useEffect } from "react";

import { employeeService } from "@services/employeeService";
import { departmentService } from "@services/departmentService";
import { positionService } from "@services/positionService";
import { userAPI } from "@api/userAPI";
import { handleAPIError } from "@utils/api";
import Modal from "@components/ui/Modal";
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
    gender: "male",
    dob: "",
    cccd: "",
    phone: "",
    email: "",
    address: "",
    department_id: "",
    position_id: "",
    auto_create_account: false,
  });
  const [creating, setCreating] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [creatingAccount, setCreatingAccount] = useState(null);

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

  // Handle create account for existing employee
  const handleCreateAccount = async (employee) => {
    if (!employee.email) {
      setError('Employee does not have email address');
      return;
    }

    try {
      setCreatingAccount(employee.employee_id);
      const response = await userAPI.createAccountForEmployee(employee.employee_id);
      setAccountInfo(response.data);
      setSelectedEmployee(null);

      // Refresh employee list to update account status
      await fetchEmployees();
    } catch (err) {
      console.error('Create account error:', err);
      setError(handleAPIError(err));
    } finally {
      setCreatingAccount(null);
    }
  };

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
            value === "male"
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
    {
      key: "account_status",
      label: "Account Status",
      render: (value, item) => {
        // Check if employee has account by looking at user_account relationship
        // If not provided by API, we'll show based on if email exists and is marked as having account
        const hasAccount = item.has_account || value === "active";

        if (hasAccount) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              ✓ Active
            </span>
          );
        } else if (item.email) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
              ⚠ No Account
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400">
              — N/A
            </span>
          );
        }
      },
    },
  ];

  // Row actions render function
  const renderRowActions = (item) => {
    const hasAccount = item.has_account;

    if (hasAccount) {
      return (
        <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          Already has account
        </span>
      );
    }

    if (!hasAccount && item.email) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedEmployee(item)}
          disabled={creatingAccount === item.employee_id}
          className="text-xs"
        >
          {creatingAccount === item.employee_id ? 'Creating...' : 'Create Account'}
        </Button>
      );
    }

    return null;
  };

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

      <Modal open={showAddForm} title="Add Employee" onClose={() => setShowAddForm(false)} size="lg">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setCreating(true);
              const payload = { ...formData };
              if (!payload.department_id) delete payload.department_id;
              if (!payload.position_id) delete payload.position_id;

              const response = await employeeService.createEmployee(payload);

              // Show account info if created
              if (response.accountInfo && !response.accountInfo.error) {
                setAccountInfo(response.accountInfo);
              }

              setShowAddForm(false);
              setFormData({ full_name: "", gender: "male", dob: "", cccd: "", phone: "", email: "", address: "", department_id: "", position_id: "", auto_create_account: false });
              setPagination((prev) => ({ ...prev, page: 1 }));
              await fetchEmployees();
            } catch (err) {
              console.error('Create employee error', err);
              setError(handleAPIError(err));
            } finally {
              setCreating(false);
            }
          }}
          className="space-y-4"
        >
          {/* A. Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">A. Personal Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
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
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData((s) => ({ ...s, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
              <div className="col-span-2">
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
              <div className="col-span-2">
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
            <div className="grid grid-cols-2 gap-4">
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

          {/* C. Account Settings */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">C. Account Settings</h4>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_create_account"
                checked={formData.auto_create_account}
                onChange={(e) => setFormData((s) => ({ ...s, auto_create_account: e.target.checked }))}
                disabled={!formData.email}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <label htmlFor="auto_create_account" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 cursor-pointer">
                Auto-create login account (Email required)
              </label>
            </div>
            {formData.auto_create_account && formData.email && (
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                ✓ Login account will be created with email as username and auto-generated secure password
              </p>
            )}
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

      {/* Create Account Confirmation Modal */}
      <Modal
        open={!!selectedEmployee}
        title="Create Login Account"
        onClose={() => setSelectedEmployee(null)}
        size="md"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                Create login account for <span className="font-semibold">{selectedEmployee.full_name}</span>?
              </p>
              <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-2">
                Email: <span className="font-mono">{selectedEmployee.email}</span>
              </p>
              <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                A secure password will be auto-generated and displayed after creation.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedEmployee(null)}
                disabled={creatingAccount === selectedEmployee.employee_id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleCreateAccount(selectedEmployee)}
                disabled={creatingAccount === selectedEmployee.employee_id}
              >
                {creatingAccount === selectedEmployee.employee_id ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Account Info Modal */}
      <Modal open={!!accountInfo} title="Login Credentials" onClose={() => setAccountInfo(null)} size="md">
        {accountInfo && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-3">
                📧 Account created successfully! Share these credentials with the employee:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Email (Username):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 rounded bg-white dark:bg-secondary-800 text-sm font-mono border border-secondary-200 dark:border-secondary-700">
                      {accountInfo.email}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(accountInfo.email);
                        alert('Copied!');
                      }}
                      className="px-3 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Password:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 rounded bg-white dark:bg-secondary-800 text-sm font-mono border border-secondary-200 dark:border-secondary-700 break-all">
                      {accountInfo.password}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(accountInfo.password);
                        alert('Copied!');
                      }}
                      className="px-3 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Role:</label>
                  <p className="text-sm text-secondary-900 dark:text-secondary-100 mt-1 capitalize">{accountInfo.role}</p>
                </div>
              </div>

              <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-4">
                💡 Save these credentials. The password won't be displayed again.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${accountInfo.email}\nPassword: ${accountInfo.password}`);
                  alert('All credentials copied to clipboard!');
                }}
              >
                Copy All
              </Button>
              <Button type="button" variant="primary" onClick={() => setAccountInfo(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
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
        actions={renderRowActions}
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
