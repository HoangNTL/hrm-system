import { useState, useEffect } from 'react';
import Modal from '@components/ui/Modal';
import DepartmentForm from './DepartmentForm';
import toast from 'react-hot-toast';
import { departmentService } from '@services/departmentService';

export default function DepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  departmentToEdit = null,
  initialFormData = {},
  onFormDataChange,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const isEditMode = !!departmentToEdit;

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

    if (!formData.name?.trim()) {
      errors.name = 'Department name is required';
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
        name: formData.name.trim(),
        code: formData.code?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        status: formData.status,
      };

      if (isEditMode) {
        // Update department
        await departmentService.updateDepartment(departmentToEdit.id, submitData);
        toast.success('Department updated successfully!');
      } else {
        // Create department
        await departmentService.createDepartment(submitData);
        toast.success('Department created successfully!');
      }

      // Clear errors
      setFieldErrors({});
      setGlobalError('');

      // Notify parent to refresh list
      onSuccess?.();
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} department error:`, error);

      if (error.errors) {
        setFieldErrors(error.errors);
      }

      setGlobalError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} department`);
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
      title={isEditMode ? 'Edit Department' : 'Add New Department'}
      size="lg"
    >
      <DepartmentForm
        formData={formData}
        fieldErrors={fieldErrors}
        globalError={globalError}
        loading={formLoading}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={isEditMode}
      />
    </Modal>
  );
}
