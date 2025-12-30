import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function LoginForm({
  formData,
  fieldErrors = {},
  globalError = '',
  loading = false,
  onChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm mx-auto space-y-6 p-6 bg-white dark:bg-secondary-800 rounded-lg"
      autoComplete="off"
      noValidate
    >
      {/* Global Error */}
      {globalError && (
        <div className="text-error text-sm text-center mb-4 font-medium">{globalError}</div>
      )}

      {/* Email */}
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@company.com"
        value={formData.email}
        onChange={onChange}
        error={fieldErrors.email}
        disabled={loading}
        required
        autoComplete="email"
      />

      {/* Password */}
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={onChange}
        error={fieldErrors.password}
        disabled={loading}
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-end">
        <a
          href="#"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button with spinner */}
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Sign In
      </Button>
    </form>
  );
}
