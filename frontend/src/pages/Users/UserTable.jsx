import { useCallback } from 'react';
import Table from '@components/ui/Table';
import Pagination from '@components/ui/Pagination';
import Icon from '@components/ui/Icon';
import { format } from 'date-fns';

export default function UserTable({
  users = [],
  loading = false,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  selectedUsers = [],
  onRowSelect,
  onRowDoubleClick,
  onSelectAll,
}) {
  const formatDate = (date) => {
    if (!date) return <span className="text-secondary-500 dark:text-secondary-400 italic">Never</span>;
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: 'shield' },
      HR: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: 'users' },
      STAFF: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: 'user' },
    };
    return badges[role] || badges.STAFF;
  };

  const getStatusBadges = (user) => {
    const badges = [];
    
    if (user.is_locked) {
      badges.push(
        <span key="locked" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <Icon name="lock" className="w-3 h-3" />
          Locked
        </span>
      );
    }
    
    if (!user.last_login_at) {
      badges.push(
        <span key="never-logged-in" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          <Icon name="user-x" className="w-3 h-3" />
          New
        </span>
      );
    }

    if (user.must_change_password) {
      badges.push(
        <span key="must-change" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          <Icon name="key" className="w-3 h-3" />
          Reset Required
        </span>
      );
    }
    
    return badges;
  };

  const handleRowClick = useCallback((user) => {
    onRowSelect?.(user);
  }, [onRowSelect]);

  const handleRowDoubleClickInternal = useCallback((user) => {
    onRowDoubleClick?.(user);
  }, [onRowDoubleClick]);

  const handleCheckboxChange = useCallback((user, e) => {
    e.stopPropagation();
    onRowSelect?.(user);
  }, [onRowSelect]);

  const handleSelectAllChange = useCallback((e) => {
    onSelectAll?.(e.target.checked);
  }, [onSelectAll]);

  const isSelected = useCallback((user) => {
    return selectedUsers.some((u) => u.id === user.id);
  }, [selectedUsers]);

  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const columns = [
    {
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
      key: 'checkbox',
      render: (_cell, user) => (
        <input
          type="checkbox"
          checked={isSelected(user)}
          onChange={(e) => handleCheckboxChange(user, e)}
          className="w-4 h-4 rounded border-secondary-300 dark:border-secondary-600 text-primary-600 focus:ring-primary-500 dark:bg-secondary-800"
        />
      ),
      width: '50px',
    },
    {
      label: '#',
      key: 'index',
      render: (_cell, _user, index) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">
          {(pagination.page - 1) * pagination.limit + index + 1}
        </span>
      ),
      width: '60px',
    },
    {
      label: 'Email',
      key: 'email',
      render: (cell) => (
        <span className="font-medium text-secondary-900 dark:text-secondary-100">{cell}</span>
      ),
    },
    {
      label: 'Role',
      key: 'role',
      render: (cell) => {
        const badge = getRoleBadge(cell);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            <Icon name={badge.icon} className="w-3.5 h-3.5" />
            {cell}
          </span>
        );
      },
    },
    {
      label: 'Employee',
      key: 'employee',
      render: (cell) => cell ? (
        <div>
          <div className="font-medium text-secondary-900 dark:text-secondary-100">{cell.full_name}</div>
          <div className="text-xs text-secondary-600 dark:text-secondary-400">{cell.email}</div>
        </div>
      ) : (
        <span className="text-secondary-500 dark:text-secondary-400 italic text-sm">Not linked</span>
      ),
    },
    {
      label: 'Last Login',
      key: 'last_login_at',
      render: (cell) => (
        <span className="text-sm text-secondary-700 dark:text-secondary-300">
          {formatDate(cell)}
        </span>
      ),
    },
    {
      label: 'Status',
      key: 'status',
      render: (_cell, user) => (
        <div className="flex flex-wrap gap-1">
          {getStatusBadges(user)}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <Table
        columns={columns}
        data={users}
        loading={loading}
        selectedRow={selectedUsers.length === 1 ? selectedUsers[0] : null}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClickInternal}
      />
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        totalItems={pagination.total}
      />
    </div>
  );
}
