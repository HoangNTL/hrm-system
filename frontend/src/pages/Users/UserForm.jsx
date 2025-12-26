import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'HR', label: 'HR' },
  { value: 'STAFF', label: 'Staff' },
];

export default function UserForm({
  formData,
  fieldErrors = {},
  globalError = '',
  loading = false,
  onChange,
  onSubmit,
  onCancel,
  employees = [],
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {globalError && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{globalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="user@company.com"
          value={formData.email}
          onChange={onChange}
          error={fieldErrors.email}
          disabled={loading}
          required
        />

        <Select
          label="Role"
          name="role"
          value={formData.role}
          onChange={onChange}
          error={fieldErrors.role}
          disabled={loading}
          options={roleOptions}
          required
        />

        <Select
          label="Employee (optional)"
          name="employee_id"
          value={formData.employee_id}
          onChange={onChange}
          error={fieldErrors.employee_id}
          disabled={loading}
          options={[
            { value: '', label: 'None' },
            ...employees
              .filter((emp) => emp.email)
              .map((emp) => ({ value: String(emp.id), label: `${emp.email} - ${emp.full_name}` })),
          ]}
        />
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Password will be auto-generated.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} type="button" disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add'}
        </Button>
      </div>
    </form>
  );
}
