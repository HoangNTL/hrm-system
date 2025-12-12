import { useState, useEffect } from 'react';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Select from '@components/ui/Select';
import { departmentService } from '@services/departmentService';
import { positionService } from '@services/positionService';

export default function EmployeeForm({
  formData,
  fieldErrors = {},
  globalError = '',
  loading = false,
  onChange,
  onSubmit,
  onCancel,
  isEditMode = false,
}) {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptResult, posResult] = await Promise.all([
          departmentService.getDepartments({ limit: 100 }),
          positionService.getPositions({ limit: 100 }),
        ]);
        setDepartments(deptResult.data || []);
        setPositions(posResult.data || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
  ];

  const positionOptions = [
    { value: '', label: 'Select Position' },
    ...positions.map((pos) => ({ value: pos.id, label: pos.name })),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Global Error */}
      {globalError && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error font-medium">{globalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          name="full_name"
          placeholder="Enter full name"
          value={formData.full_name}
          onChange={onChange}
          error={fieldErrors.full_name}
          disabled={loading}
          required
        />

        {/* Gender */}
        <Select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={onChange}
          error={fieldErrors.gender}
          disabled={loading}
          required
          options={[
            { value: '', label: 'Select Gender' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
        />

        {/* Date of Birth */}
        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={formData.dob}
          onChange={onChange}
          error={fieldErrors.dob}
          disabled={loading}
          required
        />

        {/* Identity Number (CCCD) */}
        <Input
          label="Identity Number (CCCD)"
          type="text"
          name="cccd"
          placeholder="Enter CCCD number"
          value={formData.cccd}
          onChange={onChange}
          error={fieldErrors.cccd}
          disabled={loading}
          required
        />

        {/* Phone */}
        <Input
          label="Phone"
          type="tel"
          name="phone"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={onChange}
          error={fieldErrors.phone}
          disabled={loading}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={onChange}
          error={fieldErrors.email}
          disabled={loading}
        />

        {/* Department */}
        <Select
          label="Department"
          name="department_id"
          value={formData.department_id}
          onChange={onChange}
          error={fieldErrors.department_id}
          disabled={loading || loadingOptions}
          options={departmentOptions}
        />

        {/* Position */}
        <Select
          label="Position"
          name="position_id"
          value={formData.position_id}
          onChange={onChange}
          error={fieldErrors.position_id}
          disabled={loading || loadingOptions}
          options={positionOptions}
        />
      </div>

      {/* Address */}
      <Input
        label="Address"
        type="text"
        name="address"
        placeholder="Enter full address"
        value={formData.address}
        onChange={onChange}
        error={fieldErrors.address}
        disabled={loading}
      />

      {/* Create Login Account Checkbox - Only show in create mode */}
      {!isEditMode && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="create_login"
              name="create_login"
              checked={formData.create_login}
              onChange={(e) =>
                onChange({ target: { name: 'create_login', value: e.target.checked } })
              }
              disabled={loading}
              className="w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="create_login"
              className="text-sm text-secondary-700 dark:text-secondary-300"
            >
              Create login account for this employee
            </label>
          </div>

          {formData.create_login && !formData.email && (
            <p className="text-sm text-warning">
              Note: Email is required to create a login account
            </p>
          )}
        </>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditMode ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}
