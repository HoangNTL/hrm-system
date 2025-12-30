import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';
import Icon from '@components/ui/Icon';

export default function PositionTable({
  positions = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedPositions = [],
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

  // Selection helpers
  const isSelected = useCallback(
    (position) => selectedPositions.some((p) => p.id === position.id),
    [selectedPositions],
  );

  const allSelected = positions.length > 0 && selectedPositions.length === positions.length;
  const someSelected = selectedPositions.length > 0 && selectedPositions.length < positions.length;

  const handleCheckboxChange = useCallback(
    (position, e) => {
      e.stopPropagation();
      onRowSelect?.(position);
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
    (position) => {
      onRowSelect?.(position);
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
      render: (_cell, position) => (
        <input
          type="checkbox"
          checked={isSelected(position)}
          onChange={(e) => handleCheckboxChange(position, e)}
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
  ];

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={positions}
        loading={loading}
        onRowClick={handleRowClick}
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
