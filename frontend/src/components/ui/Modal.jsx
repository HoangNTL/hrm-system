import { useEffect } from 'react';
import Icon from './Icon';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative w-full ${sizeClasses[size]}
            bg-white dark:bg-secondary-800
            rounded-lg shadow-xl
            transform transition-all
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
            <h3 className="text-xl font-heading font-semibold text-secondary-900 dark:text-secondary-50">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
            >
              <Icon name="x" className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
