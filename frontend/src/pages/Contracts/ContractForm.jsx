import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
];

const typeOptions = [
  { value: 'indefinite', label: 'Indefinite' },
  { value: 'fixed', label: 'Fixed Term' },
  { value: 'probation', label: 'Probation' },
  { value: 'intern', label: 'Internship' },
];

export default function ContractForm({
  formData,
  fieldErrors = {},
  globalError = '',
  loading = false,
  onChange,
  onSubmit,
  onCancel,
  isEditMode = false,
  employees = [],
}) {
  console.log('ContractForm - employees:', employees, 'length:', employees.length);
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {globalError && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{globalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Contract Code"
          name="code"
          placeholder="E.g: CT-2025-001"
          value={formData.code}
          onChange={onChange}
          error={fieldErrors.code}
          disabled={loading}
          required
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={onChange}
          error={fieldErrors.status}
          disabled={loading}
          options={statusOptions}
          required
        />

        <Select
          label="Employee"
          name="employee_id"
          value={formData.employee_id}
          onChange={onChange}
          error={fieldErrors.employee_id}
          disabled={loading}
          options={[
            { value: '', label: 'Select an employee...' },
            ...employees
              .filter((emp) => emp.email)
              .map((emp) => ({
                value: emp.id,
                label: emp.email,
              })),
          ]}
          required
        />

        <Select
          label="Contract Type"
          name="contract_type"
          value={formData.contract_type}
          onChange={onChange}
          error={fieldErrors.contract_type}
          disabled={loading}
          options={typeOptions}
          required
        />

        <Input
          label="Start Date"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={onChange}
          error={fieldErrors.start_date}
          disabled={loading}
          required
        />

        <Input
          label="End Date"
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={onChange}
          error={fieldErrors.end_date}
          disabled={loading}
        />

        <Input
          label="Salary (Optional)"
          name="salary"
          type="number"
          placeholder="E.g: 15000000"
          value={formData.salary}
          onChange={onChange}
          error={fieldErrors.salary}
          disabled={loading}
        />

        <Input
          label="Work Location"
          name="work_location"
          placeholder="Branch/Location"
          value={formData.work_location}
          onChange={onChange}
          error={fieldErrors.work_location}
          disabled={loading}
        />
      </div>

      <Textarea
        label="Notes/Additional Terms"
        name="notes"
        placeholder="Additional contract information..."
        value={formData.notes}
        onChange={onChange}
        error={fieldErrors.notes}
        disabled={loading}
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
