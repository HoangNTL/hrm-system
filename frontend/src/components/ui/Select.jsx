import Icon from './Icon';

export default function Select({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  options = [],
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          block w-full px-4 py-2.5 border rounded-lg
          bg-white dark:bg-secondary-700
          text-base text-secondary-900 dark:text-secondary-100
          border-secondary-300 dark:border-secondary-600
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          focus:outline-none
          disabled:bg-secondary-100 dark:disabled:bg-secondary-800
          disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-error focus:ring-error' : ''}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-error mt-1.5 flex items-center gap-1">
          <Icon name="alert-circle" className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
