import Input from '@components/ui/Input';
import Button from '@components/ui/Button';

export default function DepartmentForm({
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Name */}
        <Input
          label="Department Name"
          type="text"
          name="name"
          placeholder="Enter department name"
          value={formData.name}
          onChange={onChange}
          error={fieldErrors.name}
          disabled={loading}
          required
        />

        {/* Department Code */}
        <Input
          label="Department Code"
          type="text"
          name="code"
          placeholder="Enter department code (optional)"
          value={formData.code}
          onChange={onChange}
          error={fieldErrors.code}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Enter department description (optional)"
          value={formData.description}
          onChange={onChange}
          disabled={loading}
          rows={4}
          className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg shadow-sm 
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     disabled:bg-secondary-100 dark:disabled:bg-secondary-700 disabled:cursor-not-allowed
                     dark:bg-secondary-800 dark:text-secondary-100"
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-error">{fieldErrors.description}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="status"
          name="status"
          checked={formData.status}
          onChange={(e) => onChange({ target: { name: 'status', value: e.target.checked } })}
          disabled={loading}
          className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="status" className="text-sm text-secondary-700 dark:text-secondary-300">
          Active status
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? 'Update' : 'Create'} Department
        </Button>
      </div>
    </form>
  );
}
