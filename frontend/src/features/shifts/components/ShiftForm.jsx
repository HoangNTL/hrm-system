import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function ShiftForm({
  formData,
  fieldErrors = {},
  globalError = '',
  loading = false,
  onChange,
  onSubmit,
  onCancel,
  isEditMode = false,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {globalError && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{globalError}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Shift Name"
          type="text"
          name="shift_name"
          placeholder="e.g. Morning Shift"
          value={formData.shift_name}
          onChange={onChange}
          error={fieldErrors.shift_name}
          disabled={loading}
          required
        />

        <Input
          label="Start Time"
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={onChange}
          error={fieldErrors.start_time}
          disabled={loading}
          required
        />

        <Input
          label="End Time"
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={onChange}
          error={fieldErrors.end_time}
          disabled={loading}
          required
        />

        <Input
          label="Early Check-in (minutes)"
          type="number"
          name="early_check_in_minutes"
          value={formData.early_check_in_minutes}
          onChange={onChange}
          error={fieldErrors.early_check_in_minutes}
          disabled={loading}
        />

        <Input
          label="Late Checkout (minutes)"
          type="number"
          name="late_checkout_minutes"
          value={formData.late_checkout_minutes}
          onChange={onChange}
          error={fieldErrors.late_checkout_minutes}
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? 'Save Changes' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
