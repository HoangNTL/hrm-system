import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';

export default function ShiftTable({
  shifts = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedShift = null,
  onRowSelect,
}) {
  const getRowNumber = useCallback(
    (index) => (pagination.page - 1) * pagination.limit + index + 1,
    [pagination.page, pagination.limit],
  );

  const formatTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
      key: 'shift_name',
      label: 'Shift Name',
      render: (value) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">
          {value}
        </span>
      ),
    },
    {
      key: 'start_time',
      label: 'Start Time',
      render: (value) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {formatTime(value)}
        </span>
      ),
    },
    {
      key: 'end_time',
      label: 'End Time',
      render: (value) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {formatTime(value)}
        </span>
      ),
    },
    {
      key: 'early_check_in_minutes',
      label: 'Early Check-in',
      render: (value) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {value} min
        </span>
      ),
    },
    {
      key: 'late_checkout_minutes',
      label: 'Late Checkout',
      render: (value) => (
        <span className="text-secondary-600 dark:text-secondary-400">
          {value} min
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

  const handleRowClick = useCallback(
    (shift) => {
      onRowSelect?.(shift);
    },
    [onRowSelect],
  );

  const isRowSelected = useCallback(
    (shift) => selectedShift?.id === shift.id,
    [selectedShift],
  );

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={shifts}
        loading={loading}
        onRowClick={handleRowClick}
        selectedRow={selectedShift}
        isRowSelected={isRowSelected}
      />

      {!loading && shifts.length > 0 && (
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
