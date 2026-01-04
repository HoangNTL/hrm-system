import { useState } from 'react';
import Icon from './Icon';

function Input({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="text-label block mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={
            props.autoComplete ?? (isPassword ? 'new-password' : undefined)
          }
          className={`
            w-full px-4 py-2.5 rounded-lg border
            text-base text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed
            ${
              error
                ? 'border-error bg-error/5 dark:bg-error/10'
                : 'border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 hover:border-secondary-400 dark:hover:border-secondary-500'
            }
            ${isPassword ? 'pr-11' : ''}
            ${className}
          `}
          {...props}
        />

        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 px-1 flex items-center text-secondary-400 dark:text-secondary-300 focus:outline-none"
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              className="w-5 h-5"
            />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-error mt-1.5 flex items-center gap-1">
          <Icon name="alert-circle" className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
