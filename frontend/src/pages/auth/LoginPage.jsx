import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import LoginForm from './LoginForm';
import { validateLoginForm } from '@utils/validation';
import { handleAPIError } from '@utils/api';

import {
  loginAsync,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '@/store/slices/authSlice';

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on unmount
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Clear global error if any
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLoginForm(formData);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await dispatch(loginAsync({ email: formData.email, password: formData.password })).unwrap();

      // Success → redirect
      navigate('/dashboard');
    } catch (error) {
      // Handle field errors from API
      if (error.errors) {
        setFieldErrors(error.errors);
      }

      // Handle global error message
      const message = handleAPIError(error);
      setGlobalError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-secondary-900 dark:text-secondary-50 mb-2">
              Welcome Back
            </h1>
            <p className="text-body text-secondary-600 dark:text-secondary-400">
              Sign in to your HRM account
            </p>
          </div>

          {/* Form */}
          <LoginForm
            formData={formData}
            fieldErrors={fieldErrors}
            globalError={globalError || authError ? handleAPIError(authError) : ''}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {/* Footer */}
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

        {/* Copyright */}
        <p className="text-center mt-6 text-caption text-secondary-500 dark:text-secondary-400">
          © 2025 HRM System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
