import Modal from '@components/ui/Modal';
import Icon from '@components/ui/Icon';
import Button from '@components/ui/Button';
import { format } from 'date-fns';

export default function UserQuickViewModal({ isOpen, onClose, user }) {
  if (!user) return null;

  const formatDate = (date) => {
    if (!date) return 'Never';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      HR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      STAFF: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return badges[role] || badges.STAFF;
  };

  const getRoleIcon = (role) => {
    const icons = {
      ADMIN: 'shield',
      HR: 'users',
      STAFF: 'user',
    };
    return icons[role] || 'user';
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="md">
      <div className="space-y-6">
        {/* Email with Copy Button */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={user.email}
              readOnly
              className="flex-1 px-3 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-secondary-100"
            />
            <Button variant="outline" onClick={copyEmail} className="inline-flex items-center">
              <Icon name="copy" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Role
          </label>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleBadge(user.role)}`}>
              <Icon name={getRoleIcon(user.role)} className="w-4 h-4" />
              {user.role}
            </span>
          </div>
        </div>

        {/* Employee Info */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Linked Employee
          </label>
          {user.employee ? (
            <div className="px-3 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg">
              <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {user.employee.full_name}
              </p>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                {user.employee.email}
              </p>
            </div>
          ) : (
            <p className="text-sm text-secondary-500 dark:text-secondary-400 italic">
              No employee linked
            </p>
          )}
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Account Status
            </label>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              user.is_locked 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              <Icon name={user.is_locked ? 'lock' : 'unlock'} className="w-3 h-3" />
              {user.is_locked ? 'Locked' : 'Active'}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Last Login
            </label>
            <p className="text-sm text-secondary-900 dark:text-secondary-100">
              {formatDate(user.last_login_at)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Created
            </label>
            <p className="text-sm text-secondary-900 dark:text-secondary-100">
              {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        {user.must_change_password && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <Icon name="alert-triangle" className="w-4 h-4" />
              User must change password on next login
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
