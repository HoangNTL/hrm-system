import React from 'react';
import Button from '@components/ui/Button';
import { getStatusLabel } from './RequestUtils';

export default function StatusFilter({ statusFilter, onFilterChange }) {
  const statuses = ['', 'pending', 'approved', 'rejected'];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {statuses.map((status) => {
        const isActive = statusFilter === status;

        return (
          <Button
            key={status || 'all'}
            type="button"
            size="sm"
            variant={isActive ? 'primary' : 'secondary'}
            onClick={() => onFilterChange(status)}
            className={!isActive ? 'bg-white dark:bg-secondary-800' : ''}
          >
            {status === '' ? 'All' : getStatusLabel(status)}
          </Button>
        );
      })}
    </div>
  );
}
