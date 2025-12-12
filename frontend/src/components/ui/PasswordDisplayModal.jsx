import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

function PasswordDisplayModal({ isOpen, onClose, employeeName, email, password }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login Account Created" size="md">
      <div className="space-y-4">
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm text-success font-medium">
            <Icon name="check-circle" className="w-5 h-5 inline mr-2" />
            Login account created successfully for {employeeName}!
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Email
            </label>
            <div className="p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
              <code className="text-sm text-secondary-900 dark:text-secondary-100">{email}</code>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Generated Password
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg font-mono">
                <code className="text-sm text-secondary-900 dark:text-secondary-100 break-all">
                  {password}
                </code>
              </div>
              <Button variant="outline" onClick={handleCopy} className="flex-shrink-0">
                <Icon name={copied ? 'check' : 'clipboard'} className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning-700 dark:text-warning-300">
            <Icon name="triangle-alert" className="w-4 h-4 inline mr-2" />
            <strong>Important:</strong> Please save this password securely. It will not be shown
            again.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            I've Saved the Password
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PasswordDisplayModal;
