import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Select from '@components/ui/Select';
import Textarea from '@components/ui/Textarea';

export default function PositionForm({
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
      {/* Global Error */}
      {globalError && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{globalError}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <Input
          label="Position Name"
          type="text"
          name="name"
          placeholder="e.g. Software Engineer"
          value={formData.name}
          onChange={onChange}
          error={fieldErrors.name}
          disabled={loading}
          required
        />

        {/* Status */}
        <Select
          label="Status"
          name="status"
          value={formData.status.toString()} // Convert boolean to string for Select
          onChange={(e) => {
            // Convert string back to boolean for parent state
            onChange({
              target: {
                name: 'status',
                value: e.target.value === 'true',
              },
            });
          }}
          error={fieldErrors.status}
          disabled={loading}
          required
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
        />

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          placeholder="Enter position description..."
          value={formData.description}
          onChange={onChange}
          error={fieldErrors.description}
          disabled={loading}
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700 mt-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? 'Update Position' : 'Create Position'}
        </Button>
      </div>
    </form>
  );
}
