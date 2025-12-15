import { useState, useEffect } from 'react';
import Modal from '@components/ui/Modal';
import ContractForm from './ContractForm';
import toast from 'react-hot-toast';
import { contractService } from '@services/contractService';

export default function ContractModal({
  isOpen,
  onClose,
  onSuccess,
  contractToEdit = null,
  initialFormData = {},
  onFormDataChange,
  employees = [],
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const isEditMode = !!contractToEdit;

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen, initialFormData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onFormDataChange?.(newFormData);
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code?.trim()) errors.code = 'Contract code is required';
    if (!formData.employee_id || Number(formData.employee_id) <= 0) errors.employee_id = 'Valid employee is required';
    if (!formData.contract_type) errors.contract_type = 'Contract type is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      errors.end_date = 'End date must be after start date';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const payload = {
        code: formData.code.trim(),
        employee_id: Number(formData.employee_id),
        contract_type: formData.contract_type,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        salary: formData.salary ? Number(formData.salary) : undefined,
        notes: formData.notes?.trim() || undefined,
        work_location: formData.work_location?.trim() || undefined,
      };

      if (isEditMode) {
        await contractService.updateContract(contractToEdit.id, payload);
        toast.success('Contract updated successfully');
      } else {
        await contractService.createContract(payload);
        toast.success('Contract created successfully');
      }

      setFieldErrors({});
      setGlobalError('');
      onSuccess?.();
    } catch (error) {
      if (error.errors) setFieldErrors(error.errors);
      setGlobalError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} contract`);
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} contract`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setFieldErrors({});
    setGlobalError('');
    onClose();
  };

  const handleClose = () => {
    setFieldErrors({});
    setGlobalError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Contract' : 'Add Contract'}
      size="lg"
    >
      <ContractForm
        formData={formData}
        fieldErrors={fieldErrors}
        globalError={globalError}
        loading={formLoading}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditMode={isEditMode}
        employees={employees}
      />
    </Modal>
  );
}
