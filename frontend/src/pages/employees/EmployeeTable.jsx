import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';
import Icon from '@components/ui/Icon';

export default function EmployeeTable({
  employees = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedEmployees = [],
  onRowSelect,
  onSelectAll,
}) {
  // Calculate row number based on pagination
  const getRowNumber = useCallback(
    (index) => {
      return (pagination.page - 1) * pagination.limit + index + 1;
    },
    [pagination.page, pagination.limit],
  );

  // Helper: check if an employee is selected
  const isSelected = useCallback(
    (employee) => selectedEmployees.some((e) => e.id === employee.id),
    [selectedEmployees],
  );

  // Select-all state
  const allSelected = employees.length > 0 && selectedEmployees.length === employees.length;
  const someSelected = selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  // Handle checkbox changes
  const handleCheckboxChange = useCallback(
    (employee, e) => {
      e.stopPropagation();
      onRowSelect?.(employee);
    },
    [onRowSelect],
  );

  const handleSelectAllChange = useCallback(
    (e) => {
      onSelectAll?.(e.target.checked);
    },
    [onSelectAll],
  );

  const handleRowClick = useCallback(
    (employee) => {
      onRowSelect?.(employee);
    },
    [onRowSelect],
  );

  // Table columns configuration
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(input) => {
            if (input) {
              input.indeterminate = someSelected;
            }
          }}
          onChange={handleSelectAllChange}
          className="w-4 h-4 rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500 dark:bg-secondary-800"
        />
      ),
      render: (_cell, employee) => (
        <input
          type="checkbox"
          checked={isSelected(employee)}
          onChange={(e) => handleCheckboxChange(employee, e)}
          className="w-4 h-4 rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500 dark:bg-secondary-800"
        />
      ),
    },
    {
      key: 'rowNumber',
      label: '#',
      render: (_, __, index) => (
        <span className="font-medium text-secondary-600 dark:text-secondary-400">
          {getRowNumber(index)}
        </span>
      ),
    },
    {
      key: 'full_name',
      label: 'Full Name',
      render: (value) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">{value}</span>
      ),
    },
    {
      key: 'identity_number',
      label: 'Identity Number',
      render: (value) => value || '-',
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || '-',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || '-',
    },
    {
      key: 'department',
      label: 'Department',
      render: (value) => value?.name || '-',
    },
    {
      key: 'position',
      label: 'Position',
      render: (value) => value?.name || '-',
    },
    {
      key: 'user_account',
      label: 'Account',
      render: (value) => (
        <span className="inline-flex items-center gap-1.5">
          {value ? (
            <>
              <Icon name="check-circle" className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Active</span>
            </>
          ) : (
            <>
              <Icon name="x-circle" className="w-4 h-4 text-secondary-400" />
              <span className="text-sm text-secondary-500 font-medium">None</span>
            </>
          )}
        </span>
      ),
    },
    {
      key: 'work_status',
      label: 'Status',
      render: (value) => (
        <span
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${
              value === 'working'
                ? 'bg-success/10 text-success'
                : value === 'probation'
                  ? 'bg-warning/10 text-warning'
                  : value === 'leave'
                    ? 'bg-info/10 text-info'
                    : 'bg-error/10 text-error'
            }
          `}
        >
          {value?.charAt(0).toUpperCase() + value?.slice(1) || 'Unknown'}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={employees}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {!loading && employees.length > 0 && (
        <div className="border-t border-secondary-200 dark:border-secondary-700">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            totalItems={pagination.total}
          />
        </div>
      )}
    </div>
  );
}
