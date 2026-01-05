import React from 'react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';

export default function ChangePasswordModal({
  isOpen,
  profile,
  pwdForm,
  onClose,
  onSubmit,
  onPasswordFormChange,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="md">
      {profile?.must_change_password && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded text-sm text-amber-800 dark:text-amber-100">
          You are using a temporary password. Please set a new password.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {!profile?.must_change_password && (
          <Input
            type="password"
            name="currentPassword"
            label="Current Password"
            required
            placeholder="Enter current password"
            value={pwdForm.currentPassword}
            onChange={(e) => onPasswordFormChange('currentPassword', e.target.value)}
          />
        )}

        <Input
          type="password"
          name="newPassword"
          label="New Password"
          required
          placeholder="Enter new password"
          value={pwdForm.newPassword}
          onChange={(e) => onPasswordFormChange('newPassword', e.target.value)}
        />

        <Input
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          required
          placeholder="Confirm new password"
          value={pwdForm.confirmPassword}
          onChange={(e) => onPasswordFormChange('confirmPassword', e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
