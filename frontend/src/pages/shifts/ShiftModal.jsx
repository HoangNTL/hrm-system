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
    setFormData((prev) => ({
      ...prev,
      ...initialFormData,
    }));
  }, [initialFormData]);

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

      // convert time-only values to ISO date-time (backend expects Date)
      // User inputs local VN time, we need to convert to UTC (subtract 7 hours)
      const toIso = (timeStr) => {
        if (!timeStr) return `1970-01-01T00:00:00Z`;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const localDate = new Date(1970, 0, 1, hours, minutes, 0);
        return localDate.toISOString();
      };

      payload.start_time = toIso(formData.start_time);
      payload.end_time = toIso(formData.end_time);

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
      } else {
        setGlobalError(error.message || 'Failed to save shift');
        toast.error(error.message || 'Failed to save shift');
      }
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
