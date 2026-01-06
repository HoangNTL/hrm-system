import { useState, useEffect } from 'react';
import Modal from '@components/ui/Modal';
import EmployeeForm from './EmployeeForm';
import toast from 'react-hot-toast';
import { employeeService } from '@services/employeeService';

export default function EmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  employeeToEdit = null,
  initialFormData = {},
  onFormDataChange,
  departments = [],
  positions = [],
  loadingOptions = false,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const isEditMode = !!employeeToEdit;

  // Sync formData with initialFormData when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen, initialFormData]);

  // Notify parent of form data changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFormData(newFormData);

    // Update parent's state
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }

    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }
    if (!formData.cccd?.trim()) {
      errors.cccd = 'CCCD is required';
    }
    if (!isEditMode && formData.create_login && !formData.email?.trim()) {
      errors.email = 'Email is required for login account';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    try {
      // Prepare data
      const submitData = {
        full_name: formData.full_name.trim(),
        gender: formData.gender,
        dob: formData.dob,
        cccd: formData.cccd.trim(),
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        position_id: formData.position_id ? Number(formData.position_id) : undefined,
      };

      let response;
      if (isEditMode) {
        // Update employee
        response = await employeeService.updateEmployee(employeeToEdit.id, submitData);
        toast.success('Employee updated successfully!');
      } else {
        // Create employee
        submitData.create_login = formData.create_login;
        response = await employeeService.createEmployee(submitData);
        toast.success('Employee created successfully!');
      }

      // Clear errors
      setFieldErrors({});
      setGlobalError('');

      // Notify parent to refresh list and pass response data
      onSuccess?.(response);
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} employee error:`, error);

      if (error.errors) {
        setFieldErrors(error.errors);
      }

      setGlobalError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} employee`);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle cancel - close and keep form data
  const handleCancel = () => {
    // Only clear errors, keep form data
    setFieldErrors({});
    setGlobalError('');
    onClose();
  };

  // Handle modal close (X button) - keep form data
  const handleClose = () => {
    // Only clear errors, keep form data
    setFieldErrors({});
    setGlobalError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
      size="lg"
    >
      <EmployeeForm
        formData={formData}
        fieldErrors={fieldErrors}
        globalError={globalError}
        loading={formLoading}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={isEditMode}
        departments={departments}
        positions={positions}
        loadingOptions={loadingOptions}
      />
    </Modal>
  );
}
