import { useState, useEffect } from 'react';
import Modal from '@components/ui/Modal';
import ShiftForm from './ShiftForm';
import toast from 'react-hot-toast';
import { shiftService } from '@services/shiftService';

export default function ShiftModal({
  isOpen,
  onClose,
  onSuccess,
  shiftToEdit = null,
  initialFormData = {},
  onFormDataChange,
}) {
  const isEditMode = !!shiftToEdit;

  const [formData, setFormData] = useState({
    shift_name: '',
    start_time: '',
    end_time: '',
    early_check_in_minutes: 15,
    late_checkout_minutes: 15,
    ...initialFormData,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      shift_name: initialFormData.shift_name ?? '',
      start_time: initialFormData.start_time ?? '',
      end_time: initialFormData.end_time ?? '',
      early_check_in_minutes: initialFormData.early_check_in_minutes ?? 15,
      late_checkout_minutes: initialFormData.late_checkout_minutes ?? 15,
    });
  }, [isOpen]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value,
    };
    setFormData(updated);
    onFormDataChange?.(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setGlobalError('');
    setFieldErrors({});

    try {
      const payload = {
        ...formData,
      };

      // Convert time input (HH:mm) to HH:mm:ss format for database
      const formatTime = (timeStr) => {
        if (!timeStr) return null;
        // timeStr is already in HH:mm format from input[type="time"]
        return `${timeStr}:00`; // Just add seconds
      };

      payload.start_time = formatTime(formData.start_time);
      payload.end_time = formatTime(formData.end_time);

      let response;
      if (isEditMode) {
        response = await shiftService.updateShift(shiftToEdit.id, payload);
        toast.success('Shift updated successfully!');
      } else {
        response = await shiftService.createShift(payload);
        toast.success('Shift created successfully!');
      }

      setFieldErrors({});
      setGlobalError('');
      onSuccess?.(response);
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} shift error:`, error);
      if (error.errors) {
        setFieldErrors(error.errors);
      }
      setGlobalError(error.message || 'Failed to save shift');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setFieldErrors({});
    setGlobalError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditMode ? 'Edit Shift' : 'Add New Shift'}
      size="md"
    >
      <ShiftForm
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
