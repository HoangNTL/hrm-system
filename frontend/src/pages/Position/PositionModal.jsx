import { useState, useEffect } from 'react';
import Modal from '@components/ui/Modal';
import PositionForm from './PositionForm';
import toast from 'react-hot-toast';
import { positionAPI } from '@api/positionAPI'; // Import API bạn đã cung cấp

export default function PositionModal({
  isOpen,
  onClose,
  onSuccess,
  positionToEdit = null,
  initialFormData = {},
  onFormDataChange,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const isEditMode = !!positionToEdit;

  // Sync formData with initialFormData when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen, initialFormData]);

  // Notify parent of form data changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
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
      errors.name = 'Position name is required';
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
        description: formData.description?.trim() || undefined,
        status: formData.status, // Boolean logic handled in Form
      };

      let response;
      if (isEditMode) {
        // Update position
        response = await positionAPI.updatePosition(positionToEdit.id, submitData);
        toast.success('Position updated successfully!');
      } else {
        // Create position
        response = await positionAPI.createPosition(submitData);
        toast.success('Position created successfully!');
      }

      // Clear errors
      setFieldErrors({});
      setGlobalError('');

      // Notify parent to refresh list
      onSuccess?.(response);
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} position error:`, error);

      // Xử lý lỗi từ backend nếu có format errors
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
      } else {
        const message =
          error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} position`;
        setGlobalError(message);
        toast.error(message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFieldErrors({});
    setGlobalError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditMode ? 'Edit Position' : 'Add New Position'}
      size="md" // Position form nhỏ hơn Employee form
    >
      <PositionForm
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
