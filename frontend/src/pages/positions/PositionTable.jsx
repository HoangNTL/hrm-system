import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';
import Icon from '@components/ui/Icon';

export default function PositionTable({
  positions = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedPosition = null,
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
      label: 'Position Name',
      render: (value) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">{value}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <span className="text-secondary-600 dark:text-secondary-400 truncate max-w-xs block" title={value}>
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
              value === true
                ? 'bg-success/10 text-success'
                : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400'
            }
          `}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (value) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  // Handle row click
  const handleRowClick = useCallback(
    (position) => {
      onRowSelect?.(position);
    },
    [onRowSelect],
  );

  // Check if row is selected
  const isRowSelected = useCallback(
    (position) => {
      return selectedPosition?.id === position.id;
    },
    [selectedPosition],
  );

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={positions}
        loading={loading}
        onRowClick={handleRowClick}
        selectedRow={selectedPosition}
        isRowSelected={isRowSelected}
      />

      {/* Pagination */}
      {!loading && positions.length > 0 && (
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