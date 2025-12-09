import Icon from "./Icon";

function Input({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="text-label block mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="new-password"
        className={`
          w-full px-4 py-2.5 rounded-lg border
          text-base text-secondary-900 placeholder:text-secondary-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-secondary-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-error bg-error/5"
              : "border-secondary-300 bg-white hover:border-secondary-400"
          }
          ${className}
        `}
        {...props}
      />

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
