function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 [&_img]:brightness-0 [&_img]:invert",
    secondary:
      "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-400 active:bg-secondary-400",
    outline:
      "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100",
    success:
      "bg-success text-white hover:bg-accent-600 focus:ring-success [&_img]:brightness-0 [&_img]:invert",
    danger:
      "bg-error text-white hover:bg-red-600 focus:ring-error [&_img]:brightness-0 [&_img]:invert",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
