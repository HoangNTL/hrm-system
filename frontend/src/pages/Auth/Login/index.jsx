import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { handleAPIError } from "@api";
import {
  loginAsync,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from "@store/slices/auth/authSlice";
import LoginForm from "./LoginForm";
import APIErrorMessage from "@/components/ui/APIErrorMessage";
import { validateLoginForm } from "@utils/validation";



function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear auth error
    if (authError) {
      dispatch(clearError());
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateLoginForm(formData);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Dispatch login action
        await dispatch(
          loginAsync({
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();

        // Navigate to dashboard on success
        navigate("/dashboard");
      } catch (error) {
        console.error("Login error:", error);

        // Handle field-specific errors if returned by API
        if (error.errors) {
          setErrors(error.errors);
        }
      }
    } else {
      setErrors(newErrors);
    }
  };

  // Get error message
  const errorMessage = authError ? handleAPIError(authError) : "";

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

          {/* API Error Message */}
          <APIErrorMessage message={errorMessage} />

          {/* Form */}
          <LoginForm
            formData={formData}
            errors={errors}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Contact your administrator
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center mt-6 text-caption text-secondary-500 dark:text-secondary-400">
          © 2025 HRM System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
