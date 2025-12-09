import Input from "@components/ui/Input";
import Button from "@components/ui/Button";

export default function LoginForm({
  formData,
  errors,
  loading,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" autoComplete="off">
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="you@company.com"
        value={formData.email}
        onChange={onChange}
        error={errors.email}
        disabled={loading}
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={onChange}
        error={errors.password}
        disabled={loading}
        required
      />
      <div className="flex items-center justify-end">
        <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Forgot password?
        </a>
      </div>
      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}