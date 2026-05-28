import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { handleAPIError } from '@utils/api';
import { validateLoginForm } from '@utils/validation';

import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error: authError, login, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (globalError) {
      setGlobalError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateLoginForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login({ email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (error) {
      if (error.errors) {
        setFieldErrors(error.errors);
      }

      setGlobalError(handleAPIError(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50 mb-2">
              Welcome Back
            </h1>
            <p className="text-body text-secondary-600 dark:text-secondary-400">
              Sign in to your HRM account
            </p>
          </div>

          <LoginForm
            formData={formData}
            fieldErrors={fieldErrors}
            globalError={globalError || (authError ? handleAPIError(authError) : '')}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Don't have an account?{' '}
              <a
                href="#"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Contact your administrator
              </a>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-caption text-secondary-500 dark:text-secondary-400">
          © 2025 HRM System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
