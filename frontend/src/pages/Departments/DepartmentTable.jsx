import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';
import Icon from '@components/ui/Icon';

export default function DepartmentTable({
  departments = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedDepartment = null,
  onRowSelect,
}) {
  // Calculate row number based on pagination
  const getRowNumber = useCallback(
    (index) => {
      return (pagination.page - 1) * pagination.limit + index + 1;
    },
    [pagination.page, pagination.limit],
  );

  // Table columns configuration
  const columns = [
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
      key: 'name',
      label: 'Department Name',
      render: (value) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">{value}</span>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      render: (value) => (
        <span className="font-mono text-sm text-secondary-700 dark:text-secondary-300">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <span className="text-secondary-700 dark:text-secondary-300">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${
              value
                ? 'bg-success/10 text-success'
                : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
            }
          `}
        >
          {value ? (
            <>
              <Icon name="check-circle" className="w-3.5 h-3.5 mr-1" />
              Active
            </>
          ) : (
            <>
              <Icon name="x-circle" className="w-3.5 h-3.5 mr-1" />
              Inactive
            </>
          )}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <span className="text-sm text-secondary-600 dark:text-secondary-400">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  // Handle row click
  const handleRowClick = useCallback(
    (department) => {
      onRowSelect?.(department);
    },
    [onRowSelect],
  );

  // Check if row is selected
  const isRowSelected = useCallback(
    (department) => {
      return selectedDepartment?.id === department.id;
    },
    [selectedDepartment],
  );

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={departments}
        loading={loading}
        onRowClick={handleRowClick}
        selectedRow={selectedDepartment}
        isRowSelected={isRowSelected}
      />

      {/* Pagination */}
      {!loading && departments.length > 0 && (
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
