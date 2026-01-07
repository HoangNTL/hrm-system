import { useEffect, useState } from 'react';
import Modal from '@components/ui/Modal';
import toast from 'react-hot-toast';
import UserForm from './UserForm';
import { userAPI } from '@api/userAPI';

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  userToEdit = null,
  employees = [],
}) {
  const [formData, setFormData] = useState({
    role: 'STAFF',
    employee_id: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          role: userToEdit.role || 'STAFF',
          employee_id: userToEdit.employee?.id ? String(userToEdit.employee.id) : '',
        });
      } else {
        setFormData({ role: 'STAFF', employee_id: '' });
      }
      setFieldErrors({});
      setGlobalError('');
    }
  }, [isOpen, userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.role) errors.role = 'Role is required';
    if (!formData.employee_id) errors.employee_id = 'Please select an employee';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    try {
      // Derive email from the selected employee
      const selectedEmployee = employees.find(e => String(e.id) === String(formData.employee_id));
      if (!selectedEmployee?.email) {
        throw { message: 'Selected employee has no email.' };
      }

      const payload = {
        email: selectedEmployee.email,
        role: formData.role,
        employee_id: Number(formData.employee_id),
      };

      const resp = await userAPI.createUser(payload);
      toast.success('User created successfully');
      onSuccess?.(resp);
      onClose?.();
    } catch (error) {
      const message = error?.message || 'Failed to create user';
      setGlobalError(message);
      if (error?.errors) setFieldErrors(error.errors);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFieldErrors({});
    setGlobalError('');
    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={userToEdit ? 'Edit User' : 'Add New User'} size="md">
      <UserForm
        formData={formData}
        fieldErrors={fieldErrors}
        globalError={globalError}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        employees={employees}
      />
    </Modal>
  );
}
