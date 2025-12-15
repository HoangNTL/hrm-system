import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';
import Icon from '@components/ui/Icon';

const statusMap = {
  active: { label: 'Active', className: 'bg-success/10 text-success' },
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning-600' },
  // Match neutral badge styling from Departments table for dark mode compatibility
  draft: {
    label: 'Draft',
    className:
      'bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300',
  },
  expired: { label: 'Expired', className: 'bg-error/10 text-error' },
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString();
};

export default function ContractTable({
  contracts = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedContract = null,
  onRowSelect,
  onRowDoubleClick,
}) {
  const getRowNumber = useCallback(
    (index) => (pagination.page - 1) * pagination.limit + index + 1,
    [pagination.page, pagination.limit],
  );

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
      key: 'code',
      label: 'Code',
      render: (value) => (
        <span className="font-semibold text-secondary-900 dark:text-secondary-100">{value}</span>
      ),
    },
    {
      key: 'employee_name',
      label: 'Employee',
      render: (value) => (
        <span className="text-secondary-700 dark:text-secondary-300">{value}</span>
      ),
    },
    {
      key: 'contract_type',
      label: 'Type',
      render: (value) => (
        <span className="text-secondary-700 dark:text-secondary-300">{value || '-'} </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const mapping = statusMap[value] || statusMap.draft;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mapping.className}`}>
            <Icon name="circle" className="w-3 h-3 mr-1" />
            {mapping.label}
          </span>
        );
      },
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (value) => (
        <span className="text-secondary-700 dark:text-secondary-300">{formatDate(value)}</span>
      ),
    },
    {
      key: 'end_date',
      label: 'End Date',
      render: (value) => (
        <span className="text-secondary-700 dark:text-secondary-300">{formatDate(value)}</span>
      ),
    },
  ];

  const handleRowClick = useCallback((contract) => {
    onRowSelect?.(contract);
  }, [onRowSelect]);

  const isRowSelected = useCallback((contract) => selectedContract?.id === contract.id, [selectedContract]);

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={contracts}
        loading={loading}
        onRowClick={handleRowClick}
        onRowDoubleClick={onRowDoubleClick}
        selectedRow={selectedContract}
        isRowSelected={isRowSelected}
      />

      {!loading && contracts.length > 0 && (
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
