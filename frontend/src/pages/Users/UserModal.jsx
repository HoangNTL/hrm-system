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
    email: '',
    role: 'STAFF',
    employee_id: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      setFieldErrors({});
      setGlobalError('');
      if (userToEdit) {
        setFormData({
          email: userToEdit.email || '',
          role: userToEdit.role || 'STAFF',
          employee_id: userToEdit.employee?.id ? String(userToEdit.employee.id) : '',
        });
      } else {
        setFormData({ email: '', role: 'STAFF', employee_id: '' });
      }
    }
  }, [isOpen, userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If selecting an employee, auto-fill email using employee record
    if (name === 'employee_id') {
      const selected = employees.find((emp) => String(emp.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        employee_id: value,
        email: selected?.email || prev.email,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email?.trim()) errors.email = 'Email is required';
    if (!formData.role) errors.role = 'Role is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        email: formData.email.trim(),
        role: formData.role,
        employee_id: formData.employee_id ? Number(formData.employee_id) : null,
      };

      const response = await userAPI.createUser(payload);
      toast.success('User created successfully');
      if (response.data?.password) {
        toast.success(`Generated password: ${response.data.password}`, { duration: 8000 });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      if (error?.errors) setFieldErrors(error.errors);
      setGlobalError(error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Add New User'}
      size="lg"
    >
      <UserForm
        formData={formData}
        fieldErrors={fieldErrors}
        globalError={globalError}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={onClose}
        employees={employees}
      />
    </Modal>
  );
}
