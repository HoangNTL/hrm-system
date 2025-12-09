function Modal({ open, title, children, onClose, size = 'md', footer = null }) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'w-full max-w-none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className={`relative bg-white dark:bg-secondary-800 rounded-lg shadow-lg w-full ${sizes[size]} p-6 z-10`}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{title}</h3>
          <button 
            onClick={onClose} 
            aria-label="Close modal" 
            className="text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 transition-colors text-2xl leading-none font-bold -mt-1"
          >
            ×
          </button>
        </div>

        <div className="mb-4">{children}</div>

        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
